import uuid  # Не забудь импортировать
from datetime import timedelta

from cryptography.fernet import Fernet
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

from .utils import generate_short_code


class FileBatch(models.Model):
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True, db_index=True)

    # 6-значный код для ввода руками
    short_code = models.CharField(
        max_length=6,
        unique=True,
        blank=True,
        db_index=True,
    )

    # UUID для защищенной прямой ссылки
    url_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    comment = models.TextField(blank=True, null=True, verbose_name="Комментарий")

    encryption_key = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    password = models.CharField(max_length=128, blank=True, null=True)  # Хеш пароля

    def set_batch_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_batch_password(self, raw_password):
        if not self.password:
            return True
        return check_password(raw_password, self.password)

    def save(self, *args, **kwargs):
        # 1. Генерация уникального short_code (для ввода ручками)
        if not self.short_code:
            new_code = generate_short_code()
            while FileBatch.objects.filter(short_code=new_code).exists():
                new_code = generate_short_code()
            self.short_code = new_code

        # 2. Срок хранения
        if not self.expires_at:
            if self.owner and self.owner.is_superuser:
                self.expires_at = timezone.now() + timedelta(days=3650)
            elif self.owner:
                self.expires_at = timezone.now() + timedelta(days=7)
            else:
                self.expires_at = timezone.now() + timedelta(hours=24)

        # 3. Ключ шифрования
        if not self.encryption_key:
            self.encryption_key = Fernet.generate_key()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Batch {self.short_code} (UUID: {self.url_uuid})"


class SharedFile(models.Model):
    batch = models.ForeignKey(FileBatch, related_name="files", on_delete=models.CASCADE)
    file = models.FileField(upload_to="encrypted_uploads/%Y/%m/%d/")
    original_name = models.CharField(max_length=255)
    file_hash = models.CharField(max_length=64, blank=True, null=True)
    relative_path = models.CharField(max_length=500, blank=True, default="")
    file_size = models.BigIntegerField(default=0)

    def __str__(self):
        return f"{self.relative_path or self.original_name}"


class ChunkedUpload(models.Model):
    # Уникальный ID, который генерирует фронтенд (например, из имени и размера)
    upload_id = models.CharField(max_length=255, unique=True)

    # Кто загружает (если авторизован)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    filename = models.CharField(max_length=255)
    total_size = models.BigIntegerField()

    # Сколько байт мы уже получили и записали на диск
    offset = models.BigIntegerField(default=0)

    # Путь к временному файлу, который мы "дописываем"
    temp_file_path = models.CharField(max_length=500)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Загрузка {self.filename} ({self.offset}/{self.total_size})"

    @property
    def progress_percent(self):
        if self.total_size == 0:
            return 0
        return int((self.offset / self.total_size) * 100)



class Feedback(models.Model):
    # Если юзер залогинен, привяжем его. Если нет — оставим пустым.
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    email = models.EmailField(verbose_name="Электронная почта")
    subject = models.CharField(max_length=200, verbose_name="Тема")
    message = models.TextField(verbose_name="Сообщение")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False, verbose_name="Решено")

    def __str__(self):
        return f"Отзыв от {self.email} - {self.subject}"

    class Meta:
        verbose_name = "Обратная связь"
        verbose_name_plural = "Обратная связь"