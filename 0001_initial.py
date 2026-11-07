from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="BlockchainBlock",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("index", models.PositiveIntegerField(unique=True)),
                ("timestamp", models.DateTimeField()),
                ("data", models.JSONField()),
                ("previous_hash", models.CharField(max_length=64)),
                ("block_hash", models.CharField(max_length=64, unique=True)),
            ],
            options={"ordering": ["index"]},
        ),
        migrations.CreateModel(
            name="Certificate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("student_name", models.CharField(max_length=150)),
                ("usn", models.CharField(db_index=True, max_length=30)),
                ("course", models.CharField(max_length=150)),
                ("certificate_id", models.CharField(db_index=True, max_length=50, unique=True)),
                ("issue_date", models.DateField()),
                ("pdf_file", models.FileField(upload_to="certificates/pdfs/")),
                ("sha256_hash", models.CharField(max_length=64)),
                ("qr_code", models.ImageField(blank=True, upload_to="certificates/qr_codes/")),
                ("is_revoked", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("blockchain_block", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="certificates", to="certificates.blockchainblock")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
