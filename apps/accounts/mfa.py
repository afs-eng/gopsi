import base64
import hashlib
import hmac
import secrets
import struct
import time
from urllib.parse import quote

from django.conf import settings


def generate_totp_secret() -> str:
    return base64.b32encode(secrets.token_bytes(20)).decode("ascii").rstrip("=")


def _hotp(secret: str, counter: int, digits: int = 6) -> str:
    padded_secret = secret + "=" * ((8 - len(secret) % 8) % 8)
    key = base64.b32decode(padded_secret, casefold=True)
    message = struct.pack(">Q", counter)
    digest = hmac.new(key, message, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    code = struct.unpack(">I", digest[offset : offset + 4])[0] & 0x7FFFFFFF
    return str(code % (10**digits)).zfill(digits)


def totp_now(secret: str, at_time: int | None = None) -> str:
    timestamp = int(at_time if at_time is not None else time.time())
    return _hotp(secret, timestamp // 30)


def verify_totp(secret: str, code: str, window: int = 1) -> bool:
    if not code or not code.isdigit():
        return False
    now = int(time.time())
    for offset in range(-window, window + 1):
        if hmac.compare_digest(_hotp(secret, now // 30 + offset), code):
            return True
    return False


def provisioning_uri(user, secret: str) -> str:
    issuer = getattr(settings, "MFA_ISSUER", "Plataforma PSI")
    label = quote(f"{issuer}:{user.email or user.username}")
    return f"otpauth://totp/{label}?secret={secret}&issuer={quote(issuer)}"
