# 1. Используем стабильный и легкий образ Python
FROM python:3.12-slim

# 2. Устанавливаем системные зависимости (нужны для Postgres и Pillow)

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gettext \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# 3. Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# 4. Устанавливаем переменные окружения
# Запрещает Python генерировать файлы .pyc
ENV PYTHONDONTWRITEBYTECODE 1
# Гарантирует, что вывод логов идет сразу в консоль без задержек
ENV PYTHONUNBUFFERED 1

# 5. Сначала копируем только requirements.txt (для кэширования слоев)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 6. Копируем весь код проекта в контейнер
COPY . /app/

## Копируем скрипт в контейнер
COPY entrypoint.sh /app/entrypoint.sh

# Указываем, что этот скрипт должен запускаться первым
ENTRYPOINT ["/app/entrypoint.sh"]

# Команда по умолчанию (она передастся в скрипт как "$@")
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]