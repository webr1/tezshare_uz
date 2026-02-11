import logging
from django.conf import settings
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

@shared_task
def send_otp_email_task(email, otp):
    try:
        subject = f"{otp} — tezshare kodi"
        from_email = settings.DEFAULT_FROM_EMAIL
        
        # 1. Текстовая версия (обязательно)
        text_content = f"Sizning tasdiqlash kodingiz: {otp}"
        
        # 2. Генерируем HTML
        # Убедись, что файл лежит именно по этому пути!
        html_content = render_to_string('registration_user/emails/otp_email.html', {'otp': otp})

        msg = EmailMultiAlternatives(subject, text_content, from_email, [email])
        
        # 3. Добавляем HTML-версию
        msg.attach_alternative(html_content, "text/html")
        
        # 4. Отправляем
        msg.send()
        
        return f"HTML Email sent to {email}"
    except Exception as e:
        logger.error(f"Xatolik yuz berdi: {str(e)}")
        return f"Error: {str(e)}"