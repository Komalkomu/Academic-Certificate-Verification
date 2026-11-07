from rest_framework import serializers
from .models import Certificate

class CertificateSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()
    qr_url = serializers.SerializerMethodField()
    block_index = serializers.IntegerField(source="blockchain_block.index", read_only=True)

    class Meta:
        model = Certificate
        fields = [
            "id", "student_name", "usn", "course", "certificate_id",
            "issue_date", "pdf_url", "qr_url", "sha256_hash",
            "block_index", "is_revoked", "created_at",
        ]
        read_only_fields = [
            "id", "sha256_hash", "qr_url", "block_index", "is_revoked", "created_at"
        ]

    def get_pdf_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.pdf_file.url) if request and obj.pdf_file else None

    def get_qr_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.qr_code.url) if request and obj.qr_code else None
