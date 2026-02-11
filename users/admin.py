from django.contrib import admin

from .models import OneTimeToken


@admin.register(OneTimeToken)
class OneTimeTokenAdmin(admin.ModelAdmin):
    # Какие колонки показывать в списке
    list_display = ("email", "token", "created_at", "expires_at", "is_expired_status")

    # Добавляем поиск по почте
    search_fields = ("email",)

    # Фильтр справа, чтобы быстро видеть свежие токены
    list_filter = ("created_at",)

    # Делаем поля только для чтения (чтобы случайно не изменить код в админке)
    readonly_fields = ("created_at",)

    # Кастомная колонка, чтобы в списке сразу было видно: "Протух" или "Активен"
    def is_expired_status(self, obj):
        return obj.is_expired()

    is_expired_status.boolean = True  # Покажет красивую иконку (галочка/крестик)
    is_expired_status.short_description = "Истек?"
