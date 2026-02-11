import logging
import os
import os
from celery import shared_task
from cryptography.fernet import Fernet
from django.core.files.base import ContentFile
from django.conf import settings
from .models import FileBatch, SharedFile, ChunkedUpload
from celery import shared_task
from django.utils import timezone

from .models import FileBatch

logger = logging.getLogger(__name__)


@shared_task
def cleanup_expired_files():
    """
    Периодическая задача: удаляет все батчи, время жизни которых истекло.
    """
    now = timezone.now()
    expired_batches = FileBatch.objects.filter(expires_at__lt=now)

    count = 0
    for batch in expired_batches:
        # Удаляем файлы с диска
        for shared_file in batch.files.all():
            if shared_file.file and os.path.isfile(shared_file.file.path):
                try:
                    os.remove(shared_file.file.path)
                except Exception as e:
                    logger.error(f"Ошибка при удалении файла {shared_file.id}: {e}")

        # Удаляем запись из БД (SharedFile удалятся каскадом)
        batch.delete()
        count += 1

    return f"Cleanup finished: {count} batches removed."


@shared_task
def delete_batch_files_task(batch_id):
    """
    Фоновая задача для немедленного удаления файлов батча
    (например, после полной выгрузки ZIP или по нажатию кнопки).
    """
    try:
        batch = FileBatch.objects.get(id=batch_id)
        for shared_file in batch.files.all():
            if shared_file.file and os.path.isfile(shared_file.file.path):
                os.remove(shared_file.file.path)
        batch.delete()
        return f"Batch {batch_id} deleted successfully."
    except FileBatch.DoesNotExist:
        return f"Batch {batch_id} already deleted."


@shared_task
def cleanup_files():
    expired = FileBatch.objects.filter(expires_at__lt=timezone.now())
    for batch in expired:
        for f in batch.files.all():
            if os.path.exists(f.file.path):
                os.remove(f.file.path)
        batch.delete()


# main/tasks.py (или users/tasks.py)


@shared_task
def encrypt_files_background_task(batch_id, upload_ids_data):
    """
    Фоновое шифрование:
    upload_ids_data — это список словарей [{'up_id': '...', 'real_name': '...'}]
    """
    try:
        batch = FileBatch.objects.get(id=batch_id)
        cipher = Fernet(batch.encryption_key)

        for item in upload_ids_data:
            up_id = item['up_id']
            real_filename = item['real_name']
            
            safe_up_id = os.path.basename(up_id)
            temp_path = os.path.join(settings.MEDIA_ROOT, "temp_uploads", safe_up_id)

            if os.path.exists(temp_path):
                with open(temp_path, "rb") as f:
                    raw_data = f.read()
                
                # Шифруем в отдельном процессе Celery
                encrypted_data = cipher.encrypt(raw_data)
                
                SharedFile.objects.create(
                    batch=batch,
                    file=ContentFile(encrypted_data, name=f"{safe_up_id}.enc"),
                    original_name=real_filename,
                    file_size=len(encrypted_data)
                )
                
                # Чистим временные данные
                os.remove(temp_path)
                ChunkedUpload.objects.filter(upload_id=safe_up_id).delete()
        
        return f"Batch {batch_id} successfully encrypted."
    except Exception as e:
        return f"Error encrypting batch {batch_id}: {str(e)}"