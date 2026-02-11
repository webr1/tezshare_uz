import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = os.getenv("SECRET_KEY")




# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG") == "True"

if not DEBUG:
    # Доверяем заголовку от Nginx, что соединение защищено (SSL)
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # Для защиты медиа-файлов через X-Accel-Redirect (если настроил в Nginx)
    # USE_X_ACCEL = True

ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "127.0.0.1,localhost",
).split(",")

# Application definition

INSTALLED_APPS = [
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # 1
    "main",
    "users",
    # 3
    'django.contrib.sitemaps',
    'mathfilters',
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",

]
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"}, # Убрал prompt: select_account для скорости, если юзер один
        "OAUTH_PKCE_ENABLED": True,
        "APP": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "secret": os.getenv("GOOGLE_SECRET"),
        },
    }
}
SITE_ID = 1

# Настройки логики
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_EMAIL_VERIFICATION = "none" # ВАЖНО: отключает проверку почты

# Настройки входа через соцсети
SOCIALACCOUNT_LOGIN_ON_GET = True
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True
SOCIALACCOUNT_EMAIL_VERIFICATION = "none" # ВАЖНО: для соцсетей тоже отключаем

# Редиректы
LOGIN_REDIRECT_URL = '/'
ACCOUNT_LOGOUT_ON_GET = True
LOGOUT_REDIRECT_URL = '/'
# Убедись, что LOGIN_REDIRECT_URL ведет на главную

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]


ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database postgresql
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT"),
    }
}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/
#
STATIC_URL = "static/"

# Исправляем ошибку NameError здесь:
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),  # Используем BASE_DIR вместо BASE_PATH
]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# settings.py

# Теперь Celery будет искать Redis по имени сервиса 'redis' из docker-compose
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")

CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

#Проверяем режим: реальная отправка или в консоль
EMAIL_LIVE_MODE = os.getenv("EMAIL_LIVE_MODE", "False") == "True"

if EMAIL_LIVE_MODE:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

#Загружаем настройки из .env
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = True  # Для 587 порта почти всегда True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "webmaster@localhost")




# --- TEZSHARE LIMITS ---
TEZSHARE_GUEST_LIMIT_MB = 500
TEZSHARE_USER_LIMIT_MB = 1000

# Автоматический перевод в байты для удобства использования в коде
TEZSHARE_GUEST_MAX_SIZE = TEZSHARE_GUEST_LIMIT_MB * 1024 * 1024
TEZSHARE_USER_MAX_SIZE = TEZSHARE_USER_LIMIT_MB * 1024 * 1024

JAZZMIN_SETTINGS = {
    "site_title": "TezShare Admin",
    "site_header": "TezShare",
    "site_brand": "TezShare",
    "welcome_sign": "Панель управления TezShare",
    "copyright": "TezShare.uz",
    "search_model": ["auth.User", "main.FileBatch"],
    "show_sidebar": True,
    "navigation_expanded": True,
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "main.FileBatch": "fas fa-cloud-upload-alt",
        "main.SharedFile": "fas fa-file",
        "main.ChunkedUpload": "fas fa-cut",
    },
}

JAZZMIN_UI_CONFIG = {
    # Тёмная тема (черный фон)
    "theme": "darkly",
    # Цвета панелей (полный черный и темно-серый)
    "navbar": "navbar-dark",  # Черная верхняя панель
    "brand_colour": "navbar-dark",  # Логотип на черном фоне
    "sidebar": "sidebar-dark-primary",  # Черный сайдбар
    "accent": "accent-primary",  # Синие кнопки и акценты (для контраста)
    "no_navbar_border": True,
    "navbar_fixed": True,
    "sidebar_fixed": True,
    "sidebar_nav_flat_style": True,  # Плоские элементы управления
}



