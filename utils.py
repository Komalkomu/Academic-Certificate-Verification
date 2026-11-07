import hashlib
from io import BytesIO
import qrcode
from django.conf import settings
from django.core.files.base import ContentFile

def sha256_file(uploaded_file):
    digest = hashlib.sha256()
    for chunk in uploaded_file.chunks():
        digest.update(chunk)
    uploaded_file.seek(0)
    return digest.hexdigest()

def create_qr_image(certificate):
    verify_url = f"{settings.FRONTEND_BASE_URL}/verify/{certificate.certificate_id}"
    image = qrcode.make(verify_url)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    certificate.qr_code.save(
        f"{certificate.certificate_id}_qr.png",
        ContentFile(buffer.getvalue()),
        save=True,
    )
