from django.contrib import admin

from .models import ChunkedUpload, FileBatch, SharedFile


# Класс для отображения файлов прямо внутри батча (инлайн-редактирование)
class SharedFileInline(admin.TabularInline):
    model = SharedFile
    extra = 0  # Не добавлять пустые строки по умолчанию
    readonly_fields = ("file", "file_size", "file_hash", "original_name")
    fields = ("original_name", "file", "file_size", "file_hash", "relative_path")


@admin.register(FileBatch)
class FileBatchAdmin(admin.ModelAdmin):
    # Поля, которые будут видны в списке
    list_display = ("short_code", "owner", "created_at", "expires_at", "is_active")

    # Поля, по которым можно искать
    search_fields = ("short_code", "owner__username", "owner__email")

    # Фильтры справа
    list_filter = ("created_at", "expires_at")

    # Добавляем список файлов внутрь страницы батча
    inlines = [SharedFileInline]

    # Метод для визуального отображения статуса (истек срок или нет)
    @admin.display(boolean=True, description="Активен")
    def is_active(self, obj):
        from django.utils import timezone

        return obj.expires_at > timezone.now()


@admin.register(SharedFile)
class SharedFileAdmin(admin.ModelAdmin):
    list_display = ("original_name", "batch", "file_size", "relative_path")
    search_fields = ("original_name", "batch__short_code")
    list_filter = ("batch__created_at",)
    readonly_fields = ("file_hash", "file_size")


@admin.register(ChunkedUpload)
class ChunkedUploadAdmin(admin.ModelAdmin):
    list_display = ("filename", "progress_bar", "total_size_mb", "created_at")
    readonly_fields = ("upload_id", "temp_file_path", "offset", "total_size")

    def progress_bar(self, obj):
        percent = int((obj.offset / obj.total_size) * 100) if obj.total_size > 0 else 0
        return f"{percent}% ({obj.offset} bytes)"

    progress_bar.short_description = "Прогресс"

    def total_size_mb(self, obj):
        return f"{round(obj.total_size / (1024 * 1024), 2)} MB"

    total_size_mb.short_description = "Размер"


from django.contrib import admin
from .models import Feedback

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    # Поля, которые будут видны в списке
    list_display = ('subject', 'email', 'user', 'created_at', 'is_resolved', 'ip_address')
    
    # Фильтры справа
    list_filter = ('is_resolved', 'created_at')
    
    # Поля, по которым работает поиск
    search_fields = ('email', 'subject', 'message', 'user__username')
    
    # Поля, которые нельзя редактировать вручную (IP и дата создания)
    readonly_fields = ('ip_address', 'created_at', 'user')
    
    # Группировка полей в форме редактирования
    fieldsets = (
        ('Основная информация', {
            'fields': ('subject', 'message', 'is_resolved')
        }),
        ('Контактные данные', {
            'fields': ('email', 'user', 'ip_address', 'created_at'),
        }),
    )

    # Быстрое изменение статуса "Решено" прямо из списка
    list_editable = ('is_resolved',)
    
    # Сортировка: сначала новые, затем по статусу решения
    ordering = ('is_resolved', '-created_at')