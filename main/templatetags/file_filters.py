from django import template
import os

register = template.Library()

@register.filter
def mul(value, arg):
    """
    Умножает значение на аргумент.
    Использование: {{ value|mul:100 }}
    """
    try:
        return int(value) * int(arg)
    except (ValueError, TypeError):
        return 0

@register.filter
def file_icon(filename):
    """
    Возвращает класс иконки FontAwesome на основе расширения файла.
    Использование: {{ file.original_name|file_icon }}
    """
    if not filename:
        return 'fas fa-file'
    
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    
    icon_map = {
        # Изображения
        'jpg': 'fas fa-file-image', 'jpeg': 'fas fa-file-image', 'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image', 'svg': 'fas fa-file-image', 'webp': 'fas fa-file-image',
        'bmp': 'fas fa-file-image', 'ico': 'fas fa-file-image',
        
        # Видео
        'mp4': 'fas fa-file-video', 'avi': 'fas fa-file-video', 'mov': 'fas fa-file-video',
        'mkv': 'fas fa-file-video', 'wmv': 'fas fa-file-video', 'flv': 'fas fa-file-video',
        'webm': 'fas fa-file-video',
        
        # Аудио
        'mp3': 'fas fa-file-audio', 'wav': 'fas fa-file-audio', 'flac': 'fas fa-file-audio',
        'aac': 'fas fa-file-audio', 'ogg': 'fas fa-file-audio', 'm4a': 'fas fa-file-audio',
        'wma': 'fas fa-file-audio',
        
        # Документы
        'pdf': 'fas fa-file-pdf', 'doc': 'fas fa-file-word', 'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel', 'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint', 'pptx': 'fas fa-file-powerpoint',
        
        # Архивы
        'zip': 'fas fa-file-archive', 'rar': 'fas fa-file-archive', '7z': 'fas fa-file-archive',
        'tar': 'fas fa-file-archive', 'gz': 'fas fa-file-archive', 'bz2': 'fas fa-file-archive',
        'xz': 'fas fa-file-archive',
        
        # Код
        'html': 'fas fa-file-code', 'css': 'fas fa-file-code', 'js': 'fas fa-file-code',
        'py': 'fas fa-file-code', 'json': 'fas fa-file-code', 'xml': 'fas fa-file-code',
        'php': 'fas fa-file-code', 'cpp': 'fas fa-file-code', 'java': 'fas fa-file-code',
        
        # Текст
        'txt': 'fas fa-file-alt', 'md': 'fas fa-file-alt', 'csv': 'fas fa-file-csv',
    }
    
    return icon_map.get(ext, 'fas fa-file')


@register.filter
def pluralize_ru(value, arg=""):
    """
    Склонение русских слов. 
    ВАЖНО: Я переименовал его в pluralize_ru, чтобы не было конфликта со встроенным pluralize.
    Использование: {{ count|pluralize_ru:"файл,файла,файлов" }}
    """
    try:
        value = int(value)
    except (ValueError, TypeError):
        return ''
    
    if not arg:
        return ''
    
    forms = arg.split(',')
    if len(forms) != 3:
        return ''
    
    last_digit = value % 10
    last_two_digits = value % 100
    
    if last_two_digits >= 11 and last_two_digits <= 19:
        return forms[2]
    
    if last_digit == 1:
        return forms[0]
    
    if last_digit >= 2 and last_digit <= 4:
        return forms[1]
    
    return forms[2]