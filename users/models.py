from datetime import timedelta

from django.db import models
from django.utils import timezone


class OneTimeToken(models.Model):
    email = models.EmailField(unique=True)  # Один токен на один email одновременно
    token = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    # Новые поля для защиты
    attempts = models.IntegerField(default=0)  # Счётчик попыток
    blocked_until = models.DateTimeField(null=True, blank=True)  # До когда бан

    def is_blocked(self):
        """Проверяет, находится ли пользователь в бане"""
        if self.blocked_until and timezone.now() < self.blocked_until:
            return True
        return False

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() >= self.expires_at
