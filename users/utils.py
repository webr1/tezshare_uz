import secrets
import string


def generate_otp_code(length=6):
    """
    Генерирует цифровой OTP код (например: 395821).
    Использует secrets для максимальной безопасности.
    """
    return "".join(secrets.choice(string.digits) for _ in range(length))
