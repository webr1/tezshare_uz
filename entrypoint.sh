#!/bin/bash

# Ждем, пока база данных станет доступна
echo "Waiting for postgres..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Выполняем миграции
python manage.py migrate

# Собираем статику (для CSS/JS)
python manage.py collectstatic --noinput

# Запускаем основной процесс (Gunicorn)
exec "$@"