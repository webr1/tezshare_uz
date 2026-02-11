from django.urls import path

from .views import auth_email_view, logout_view, resend_otp_view, verify_otp_view

urlpatterns = [
    path("login/", auth_email_view, name="auth_email"),
    path("login/verify/", verify_otp_view, name="verify_otp"),
    path("user/login/resend/", resend_otp_view, name="resend_otp"),
    path("logout/", logout_view, name="logout"),
]
