from django.urls import path

from .views import (
    chunked_upload_view,
    decrypt_file_view,
    download_batch_zip,
    download_page_view,
    finalize_batch_view,
    main_page_views,
    my_files_view,
    verify_password_view,
    about_us,
    info,
    feedback_view,
    obligation,
    coming_soon
)

urlpatterns = [
    path("", main_page_views, name="main"),
    path('feedback/', feedback_view, name='feedback'),
    path("about/", about_us, name="about"),
    path("information/", info, name="information"),
    path("obligations/", obligation, name="obligations"),
    path("coming_soon/", coming_soon, name="coming_soon"),


    path("upload/", chunked_upload_view, name="chunk_upload"),

    path("verify-password/", verify_password_view, name="verify_password"),

    path("finalize-batch/", finalize_batch_view, name="finalize_batch"),

    path("my-files/", my_files_view, name="my_files"),
    
    # Страница со списком (по UUID)
    path("d/<uuid:url_uuid>/", download_page_view, name="download_page"),

    # Скачать всё (ZIP)
    path("d/<uuid:url_uuid>/zip/", download_batch_zip, name="download_zip"),

    # Скачать один файл (по ID файла)
    path("decrypt/<int:file_id>/", decrypt_file_view, name="decrypt_file"),
]
