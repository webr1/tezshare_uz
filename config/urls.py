from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from main.views import robots_txt
from django.contrib.sitemaps.views import sitemap  
from main.sitemaps import StaticViewSitemap     # Импорт твоего класса

# Словарь со всеми картами сайта
sitemaps = {
    'static': StaticViewSitemap,
}
urlpatterns = [
    path("admin/", admin.site.urls),
    path('robots.txt', robots_txt),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path("", include("main.urls")),
    path("user/", include("users.urls")),
    path("accounts/", include("allauth.urls")),
]

handler404 = 'apps.main.views.custom_404'

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
