import hashlib
import io
import json
import os
import zipfile
import qrcode
import os
import io
import base64
from django.conf import settings
import mimetypes
from django.utils.encoding import escape_uri_path


from cryptography.fernet import Fernet
from django.conf import settings  # IMPORT SOZLAMALAR
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password  # Buni yuqorida import qiling
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.base import ContentFile
from django.db import transaction
from django.http import Http404, HttpResponse, HttpResponseForbidden, JsonResponse

# Create your views here.
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone

from .models import ChunkedUpload, FileBatch, SharedFile,Feedback
from .utils import calculate_file_hash 
from .tasks import encrypt_files_background_task

def generate_qr_code_base64(url, uuid=None):
    """QR-kodni yaratadi va Base64 formatida qaytaradi."""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    # Tarix uchun media/qr_codes/ papkasida jismoniy saqlash
    if uuid:
        qr_dir = os.path.join(settings.MEDIA_ROOT, "qr_codes")
        os.makedirs(qr_dir, exist_ok=True)
        img.save(os.path.join(qr_dir, f"qr_{uuid}.png"))

    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"



def main_page_views(request):
    # So'rovdan kodni olamiz
    code = request.GET.get("code", "").strip().upper()

    if code:
        batch = FileBatch.objects.filter(short_code=code).first()

        if batch:
            # Agar faylda parol MAVJUD bo'lsa
            if (
                batch.password
            ):  # Modelingizdagi maydon nomini tekshiring (password_hash bo'lishi mumkin)
                # Parol kiritish sahifasini ko'rsatamiz, UUID ni uzatamiz
                return render(
                    request,
                    "main/password_form.html",
                    {"url_uuid": batch.url_uuid, "code": code},
                )

            # Agar parol BO'LMASA — to'g'ridan-to'g'ri yuklab olish sahifasiga
            return redirect("download_page", url_uuid=batch.url_uuid)
        else:
            messages.error(request, f"{code} kodi topilmadi.")
            return redirect("main")

    return render(request, "main/main_page.html")


def verify_password_view(request):
    if request.method == "POST":
        url_uuid = request.POST.get("url_uuid")
        password = request.POST.get("password")

        try:
            batch = FileBatch.objects.get(url_uuid=url_uuid)

            # Agar parolni oddiy matn sifatida saqlasangiz:
            # if batch.password == password:

            # Agar parolni check_password orqali saqlasangiz (xavfsiz):
            if batch.check_batch_password(password):  # Model metodini chaqiramiz
                # Har safar yuklab olishda parol so'ramasligi uchun sessiyaga saqlaymiz
                request.session[f"unlocked_{url_uuid}"] = True
                return redirect("download_page", url_uuid=batch.url_uuid)
            else:
                messages.error(request, "Noto'g'ri parol! Qaytadan urinib ko'ring.")
                return render(request, "main/ask_password.html", {"url_uuid": url_uuid})

        except FileBatch.DoesNotExist:
            return redirect("main")

    return redirect("main")


  # Import to'g'riligiga ishonch hosil qiling

def chunked_upload_view(request):
    # 1. LIMITLAR QOLDIG'INI HISOBLASH (KO'RSATISH VA TEKSHIRISH UCHUN)
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    user_ip = request.META.get('REMOTE_ADDR')
    
    if request.user.is_authenticated:
        max_allowed = 10
        used = FileBatch.objects.filter(owner=request.user, created_at__gte=start_of_month).count()
        current_limit_size = settings.TEZSHARE_USER_MAX_SIZE
        limit_mb_text = settings.TEZSHARE_USER_LIMIT_MB
    else:
        max_allowed = 5
        used = FileBatch.objects.filter(owner__isnull=True, ip_address=user_ip, created_at__gte=start_of_month).count()
        current_limit_size = settings.TEZSHARE_GUEST_MAX_SIZE
        limit_mb_text = settings.TEZSHARE_GUEST_LIMIT_MB
    
    remains = max_allowed - used

    if request.method == "POST":
        # 2. YUKLASHLAR SONINI DARHOL TEKSHIRISH
        if remains <= 0:
            return JsonResponse({
                "status": "error", 
                "message": f"Sizning oylik yuklash limitingiz ({max_allowed}) tugadi. Keyingi oyda urinib ko'ring!"
            }, status=403)

        try:
            total_size = int(request.POST.get("total_size", 0))
        except (ValueError, TypeError):
            return JsonResponse({"status": "error", "message": "Noto'g'ri fayl hajmi"}, status=400)

        # 3. FAYL HAJMINI TEKSHIRISH
        if total_size > current_limit_size:
            msg = f"Fayl juda katta. Sizning limitingiz: {limit_mb_text}."
            if not request.user.is_authenticated:
                msg += " Limitni 500 MB gacha oshirish uchun tizimga kiring."
            return JsonResponse({"status": "error", "message": msg}, status=400)

        # 4. CHUNK NI QAYTA ISHLASH
        upload_id = request.POST.get("upload_id")
        file_chunk = request.FILES.get("chunk")
        offset = int(request.POST.get("offset", 0))
        filename = request.POST.get("filename")

        temp_upload, _ = ChunkedUpload.objects.get_or_create(
            upload_id=upload_id,
            defaults={
                "filename": filename,
                "total_size": total_size,
                "temp_file_path": os.path.join(settings.MEDIA_ROOT, "temp_uploads", upload_id),
            },
        )

        os.makedirs(os.path.dirname(temp_upload.temp_file_path), exist_ok=True)
        with open(temp_upload.temp_file_path, "ab") as f:
            f.seek(offset)
            f.write(file_chunk.read())

        temp_upload.offset = offset + file_chunk.size
        temp_upload.save()

        return JsonResponse({"status": "continue", "progress": temp_upload.offset})

    # GET so'rovi uchun hisoblangan limitlar bilan sahifani beramiz
    return render(request, "main/upload.html", {
        "remains": remains, 
        "max_allowed": max_allowed,
        "used": used
    })

from django.utils.html import strip_tags, escape # Tozalash vositalarini import qilamiz


# @transaction.atomic ni funksiyaning o'zidan OLIB TASHLAYMIZ
def finalize_batch_view(request):
    if request.method == "POST":
        try:
            # 1. LIMITLARNI TEKSHIRISH
            now = timezone.now()
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            user_ip = request.META.get('REMOTE_ADDR')
            
            # ... (sizning limitlarni tekshirish kodingiz) ...

            # transaction.atomic blokini faqat ma'lumotlar bazasiga yozuvlar yaratish uchun ishlatamiz
            with transaction.atomic():
                # 2. MA'LUMOTLARNI OLISH
                data = json.loads(request.body)
                upload_ids = data.get("upload_ids", [])
                raw_password = data.get("password", "")

                # 3. BATCH YARATISH
                batch = FileBatch.objects.create(
                    owner=request.user if request.user.is_authenticated else None,
                    ip_address=user_ip,
                    encryption_key=Fernet.generate_key(),
                    comment=escape(strip_tags(data.get("comment", "")))[:300],
                    expires_at=timezone.now() + timezone.timedelta(days=1),
                )
                
                batch.short_code = str(batch.url_uuid)[:6].upper()
                if raw_password:
                    batch.set_batch_password(raw_password)
                batch.save()

                # 4. CELERY UCHUN MA'LUMOTLARNI TAYYORLASH
                # Haqiqiy fayl nomlarini HOZIR, tranzaksiya ichida yig'amiz
                upload_ids_data = []
                for up_id in upload_ids:
                    # Muhim: aniq upload_id bo'yicha olamiz
                    temp_upload = ChunkedUpload.objects.filter(upload_id=up_id).first()
                    
                    if temp_upload:
                        # Agar chunklarda yozuv topsak, asl nomni olamiz (masalan "referat.docx")
                        real_name = temp_upload.filename
                    else:
                        # Agar topilmasa, boricha qoldiramiz
                        real_name = up_id
                        
                    upload_ids_data.append({
                        'up_id': up_id,
                        'real_name': real_name
                    })

            # <--- TRANZAKSIYA SHU YERDA TUGADI. Ma'lumotlar bazada tasdiqlangan. --->

            # ENDI Celery ni ishga tushiramiz. Endi u batch.id va to'g'ri nomlarni ko'radi.
            encrypt_files_background_task.delay(batch.id, upload_ids_data)

            # 5. JAVOB (DARHOL sodir bo'ladi)
            download_url = request.build_absolute_uri(reverse("download_page", args=[batch.url_uuid]))
            qr_base64 = generate_qr_code_base64(download_url, batch.url_uuid)

            return JsonResponse({
                "status": "success", 
                "download_url": download_url, 
                "qr_code": qr_base64,
                "short_code": batch.short_code,
                "info": "Fayllar fonda qayta ishlanmoqda" 
            })
            
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)


# ----------------------------------------------------------------------------------
def download_page_view(request, url_uuid):
    batch = get_object_or_404(FileBatch, url_uuid=url_uuid)

    # --- QO'SHILDI: XATONI TUZATISH UCHUN LIMITLARNI HISOBLASH ---
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    user_ip = request.META.get('REMOTE_ADDR')

    if request.user.is_authenticated:
        used = FileBatch.objects.filter(owner=request.user, created_at__gte=start_of_month).count()
        remains = 10 - used
    else:
        used = FileBatch.objects.filter(owner__isnull=True, ip_address=user_ip, created_at__gte=start_of_month).count()
        remains = 5 - used
    # -----------------------------------------------------

    # 1. Amal qilish muddatini tekshirish
    if batch.expires_at < now:
        return HttpResponse("Havola muddati tugadi", status=410)

    session_key = f"auth_batch_{batch.id}"

    # 2. Agar parol mavjud bo'lsa va sessiyada hali tasdiqlanmagan bo'lsa
    if batch.password and not request.session.get(session_key):
        if request.method == "POST":
            cache_key = f"brute_force_{user_ip}_{batch.id}"
            attempts = cache.get(cache_key, 0)

            if attempts >= 5:
                return HttpResponseForbidden("Juda ko'p urinishlar. 1 daqiqa kuting.")

            input_pass = request.POST.get("password")

            if batch.check_batch_password(input_pass):
                cache.delete(cache_key)
                request.session[session_key] = True
                request.session.modified = True
                return redirect("download_page", url_uuid=url_uuid)
            else:
                attempts += 1
                cache.set(cache_key, attempts, 60)
                return render(
                    request,
                    "main/password_form.html",
                    {
                        "batch": batch,
                        "remains": remains, # Har ehtimolga qarshi bu yerga ham qo'shamiz
                        "error": f"Noto'g'ri parol. Qolgan urinishlar: {5 - attempts}",
                    },
                )

        return render(request, "main/password_form.html", {"batch": batch, "remains": remains})

    # 3. Agar parol bo'lmasa yoki allaqachon kiritilgan bo'lsa — fayllarni ko'rsatamiz
    # ENDI BU YERDA remains MAVJUD VA XATO BO'LMAYDI
    return render(request, "main/download.html", {
        "batch": batch, 
        "remains": remains
    })

# -----------------------------------------------------------------------------


def decrypt_file_view(request, file_id):
    shared_file = get_object_or_404(SharedFile, id=file_id)
    batch = shared_file.batch

    if batch.password and not request.session.get(f"auth_batch_{batch.id}"):
        return HttpResponse("Kirish taqiqlangan. Parolni kiriting.", status=403)

    cipher = Fernet(batch.encryption_key)
    
    # --- MUHIM: O'qishdan oldin faylni binary rejimda ochamiz ---
    try:
        with shared_file.file.open('rb') as f:
            encrypted_data = f.read()
    except Exception as e:
        return HttpResponse(f"Faylni o'qishda xatolik: {e}", status=500)

    # Shifrni ochamiz
    try:
        decrypted_data = cipher.decrypt(encrypted_data)
    except Exception:
        return HttpResponse("Shifrni ochishda xatolik. Kalit noto'g'ri bo'lishi mumkin.", status=400)

    # Hash ni tekshirish
    current_hash = hashlib.sha256(decrypted_data).hexdigest()
    if shared_file.file_hash and current_hash != shared_file.file_hash:
        return HttpResponse("Fayl buzilgan!", status=400)

    # Turi (MIME) ni aniqlash
    content_type, _ = mimetypes.guess_type(shared_file.original_name)
    if not content_type:
        content_type = "application/octet-stream"

    response = HttpResponse(decrypted_data, content_type=content_type)
    
    # Nomni kodlash (fayl up_177... deb atalmasdan, asl nomiga ega bo'lishi uchun)
    filename = shared_file.original_name
    response["Content-Disposition"] = (
        f"attachment; filename*=UTF-8''{escape_uri_path(filename)}"
    )
    
    return response

# -------------------------------------------------------------------------
def download_batch_zip(request, url_uuid):
    batch = get_object_or_404(FileBatch, url_uuid=url_uuid)

    if batch.expires_at < timezone.now():
        return HttpResponse("Muddat tugadi", status=410)

    # MUHIM: ZIP uchun parol tekshiruvini qo'shdim
    if batch.password and not request.session.get(f"auth_batch_{batch.id}"):
        return HttpResponse("Kirish taqiqlangan. Parolni kiriting.", status=403)

    buffer = io.BytesIO()
    cipher = Fernet(batch.encryption_key)

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for sf in batch.files.all():
            try:
                decrypted_data = cipher.decrypt(sf.file.read())
                zip_file.writestr(sf.original_name, decrypted_data)
            except:
                continue

    buffer.seek(0)
    response = HttpResponse(buffer.getvalue(), content_type="application/zip")
    response["Content-Disposition"] = (
        f'attachment; filename="tezshare_{batch.short_code}.zip"'
    )
    return response


from django.db.models import Count, Q

from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum
from django.shortcuts import render
from .models import FileBatch


@login_required
def my_files_view(request):
    # 1. Batchlarni olamiz (tekshiring: owner yoki user?)
    batches = FileBatch.objects.filter(owner=request.user).order_by("-created_at")
    
    # 2. Havolalarni hisoblaymiz
    total_batches = batches.count()
    
    # 3. Barcha fayllarni ishonchlilik uchun qo'lda hisoblaymiz
    total_files = 0
    for b in batches:
        total_files += b.files.count()
        
    # 4. Parollarni hisoblaymiz
    p_count = 0
    for b in batches:
        if b.password: # Maydon nomini tekshiring: password yoki password_hash
            p_count += 1

    return render(request, "main/my_files.html", {
        "batches": batches,
        "total_batches": total_batches,
        "total_files_count": total_files,
        "password_count": p_count
    })



def feedback_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        subject = request.POST.get("subject")
        message = request.POST.get("message")

        # Asosiy tozalash (xavfsizlik uchun muhokama qilganimiz kabi)
        clean_subject = strip_tags(subject)[:200]
        clean_message = strip_tags(message)[:2000]

        Feedback.objects.create(
            # Agar request.user.is_authenticated — bog'laymiz, aks holda None
            user=request.user if request.user.is_authenticated else None,
            email=email,
            subject=clean_subject,
            message=clean_message,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        messages.success(request, "Rahmat! Xabaringiz yuborildi. Ko'rsatilgan Email ga javob beramiz.")
        return redirect('main')

    return render(request, "main/feedback.html")


def about_us(request):
    return render(request,"main/about_us.html")



def info(request):
    return render(request,"main/info.html")



def obligation(request):
    return render(request,"main/obligation.html")


def coming_soon(request):
    return render(request,"main/coming_soon.html")

from django.http import HttpResponse
from django.views.decorators.http import require_GET

@require_GET
def robots_txt(request):
    lines = [
        "User-agent: *",          # Barcha robotlar uchun qoidalar
        "Disallow: /admin/",      # Adminni indekslamaslik
        "Disallow: /media/",      # Fayllarning o'zini indekslamaslik
        "Allow: /",               # Qolgan hamma narsaga ruxsat
        "",
        "Sitemap: https://tezsend.uz/sitemap.xml", # Sayt xaritasi havolasi
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")