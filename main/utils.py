import base64
import hashlib
import io
import secrets
import string

import qrcode

import qrcode
import os
import io
import base64
from django.conf import settings


def generate_qr_code_base64(url, uuid=None): # uuid сделаем необязательным для страховки
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    # Кодируем в base64
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"


def calculate_file_hash(data):
    """Генерирует SHA-256 хеш для проверки целостности файла"""
    return hashlib.sha256(data).hexdigest()


def generate_short_code(length=6):
    """Просто генерирует строку, никого не импортируя"""
    characters = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(characters) for _ in range(length))
