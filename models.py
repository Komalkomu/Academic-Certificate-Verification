from django.db import models

class BlockchainBlock(models.Model):
    index = models.PositiveIntegerField(unique=True)
    timestamp = models.DateTimeField()
    data = models.JSONField()
    previous_hash = models.CharField(max_length=64)
    block_hash = models.CharField(max_length=64, unique=True)

    class Meta:
        ordering = ["index"]

    def __str__(self):
        return f"Block {self.index}"


class Certificate(models.Model):
    student_name = models.CharField(max_length=150)
    usn = models.CharField(max_length=30, db_index=True)
    course = models.CharField(max_length=150)
    certificate_id = models.CharField(max_length=50, unique=True, db_index=True)
    issue_date = models.DateField()
    pdf_file = models.FileField(upload_to="certificates/pdfs/")
    sha256_hash = models.CharField(max_length=64)
    qr_code = models.ImageField(upload_to="certificates/qr_codes/", blank=True)
    blockchain_block = models.ForeignKey(
        BlockchainBlock, on_delete=models.PROTECT, related_name="certificates"
    )
    is_revoked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.certificate_id} - {self.student_name}"
