import random
from datetime import timedelta

from django.contrib import messages
from django.contrib.auth import get_user_model, login, logout
from django.core.mail import send_mail
from django.db import models
from django.shortcuts import redirect, render
from django.utils import timezone

from .forms import EmailRequestForm, OTPVerificationForm
from .models import OneTimeToken  # Modelni import qilishni unutmang!
from .tasks import send_otp_email_task  # CELERY VAZIFASINI IMPORT QILAMIZ
from .utils import generate_otp_code

User = get_user_model()


def auth_email_view(request):
    if request.method == "POST":
        form = EmailRequestForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"].lower()

            token_obj, created = OneTimeToken.objects.get_or_create(
                email=email, defaults={"token": "000000", "expires_at": timezone.now()}
            )

            if token_obj.is_blocked():
                remaining_time = token_obj.blocked_until - timezone.now()
                minutes = int(remaining_time.total_seconds() // 60)
                form.add_error(
                    None, f"Siz bloklangansiz. Yana {minutes + 1} daqiqa kuting."
                )
                return render(
                    request, "registration_user/auth_step_1.html", {"form": form}
                )

            if token_obj.blocked_until and timezone.now() > token_obj.blocked_until:
                token_obj.attempts = 0
                token_obj.blocked_until = None

            if token_obj.attempts >= 3:
                token_obj.blocked_until = timezone.now() + timedelta(minutes=5)
                token_obj.attempts = 0
                token_obj.save()
                messages.error(request, "Juda ko'p urinishlar. 5 daqiqa ban.")
                return redirect("verify_otp")

            otp = generate_otp_code()
            token_obj.token = otp
            token_obj.attempts += 1
            token_obj.expires_at = timezone.now() + timedelta(minutes=5)
            token_obj.save()

            request.session["otp_email"] = email

            # send_mail O'RNIGA CELERY DAN FOYDALANAMIZ
            send_otp_email_task.delay(email, otp)

            return redirect("verify_otp")
    else:
        form = EmailRequestForm()
    return render(request, "registration_user/auth_step_1.html", {"form": form})


# Kodni tekshiruvchi funksiya
def verify_otp_view(request):
    email = request.session.get("otp_email")
    token_obj = OneTimeToken.objects.filter(email=email).first()

    # 1. HTML dagi taymer uchun soniyalarni hisoblaymiz (5 DAQ BLOKLASH UCHUN MUHIM)
    lockout_seconds = 0
    if token_obj and token_obj.is_blocked():
        diff = token_obj.blocked_until - timezone.now()
        lockout_seconds = max(0, int(diff.total_seconds()))

    if request.method == "POST":
        form = OTPVerificationForm(request.POST)
        if form.is_valid():
            user_code = form.cleaned_data["otp"]

            try:
                otp_obj = OneTimeToken.objects.get(email=email)
                if otp_obj.token == user_code:
                    if not otp_obj.is_expired():
                        user, _ = User.objects.get_or_create(
                            email=email, defaults={"username": email}
                        )
                        login(
                            request,
                            user,
                            backend="django.contrib.auth.backends.ModelBackend",
                        )
                        otp_obj.delete()
                        return redirect("main")
                    else:
                        form.add_error("otp", "Kod muddati tugadi")
                else:
                    form.add_error("otp", "Noto'g'ri kod")
            except OneTimeToken.DoesNotExist:
                form.add_error("otp", "Kod topilmadi.")
    else:
        form = OTPVerificationForm()

    # lockout_seconds NI SHABLONGA UZATAMIZ
    return render(
        request,
        "registration_user/auth_step_2.html",
        {"form": form, "lockout_seconds": lockout_seconds},
    )


# Kodni qayta yuboruvchi funksiya
def resend_otp_view(request):
    email = request.session.get("otp_email")
    if not email:
        return redirect("auth_email")

    token_obj = OneTimeToken.objects.filter(email=email).first()
    if not token_obj:
        return redirect("auth_email")

    # 1. Umumiy blokirovkani tekshiramiz (5 daqiqa ban)
    if token_obj.is_blocked():
        remaining = (token_obj.blocked_until - timezone.now()).total_seconds()
        minutes = int(remaining // 60) + 1
        messages.error(request, f"Siz bloklangansiz. {minutes} daqiqa kuting.")
        return redirect("verify_otp")

    # 2. SPAM DAN HIMOYA (Xatlar orasida 60 soniya pauza)
    # Agar token oxirgi yangilanganidan beri 1 daqiqadan kam vaqt o'tgan bo'lsa
    time_since_last_send = timezone.now() - token_obj.expires_at + timedelta(minutes=5)
    if time_since_last_send.total_seconds() < 60:
        seconds_left = 60 - int(time_since_last_send.total_seconds())
        messages.warning(
            request, f"Qayta kod yuborish uchun {seconds_left} soniya kuting."
        )
        return redirect("verify_otp")

    # 3. Urinishlar sonini tekshiramiz
    if token_obj.attempts >= 3:
        token_obj.blocked_until = timezone.now() + timedelta(minutes=5)
        token_obj.attempts = 0
        token_obj.save()
        messages.error(request, "Urinishlar limiti tugadi. 5 daqiqa ban.")
        return redirect("verify_otp")

    # 4. Agar hammasi yaxshi bo'lsa — generatsiya qilamiz va yuboramiz
    otp = generate_otp_code()
    token_obj.token = otp
    token_obj.attempts += 1
    # Pauza taymerini qayta boshlash uchun vaqtni yangilaymiz
    token_obj.expires_at = timezone.now() + timedelta(minutes=5)
    token_obj.save()

    # Celery fonda sehrgarlik qiladi
    send_otp_email_task.delay(email, otp)
    messages.success(request, "Yangi kod emailga yuborildi!")

    return redirect("verify_otp")


def logout_view(request):
    logout(request)
    return redirect("main")