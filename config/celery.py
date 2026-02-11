import os

from celery import Celery

# Устанавливаем переменную окружения для настроек Django
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE", "config.settings"
)  # Замени tezshare на имя своей папки проекта

app = Celery("config")

# Используем строку для конфигурации, чтобы воркер не инициализировал объект при запуске
app.config_from_object("django.conf:settings", namespace="CELERY")

# Автоматический поиск задач (tasks.py) во всех зарегистрированных приложениях (INSTALLED_APPS)
app.autodiscover_tasks()
