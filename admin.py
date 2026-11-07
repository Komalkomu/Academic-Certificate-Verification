from django.contrib import admin
from .models import Certificate, BlockchainBlock

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ("certificate_id", "student_name", "usn", "course", "issue_date", "is_revoked")
    search_fields = ("certificate_id", "student_name", "usn")
    list_filter = ("is_revoked", "issue_date")

@admin.register(BlockchainBlock)
class BlockchainBlockAdmin(admin.ModelAdmin):
    list_display = ("index", "timestamp", "previous_hash", "block_hash")
    readonly_fields = ("index", "timestamp", "data", "previous_hash", "block_hash")
