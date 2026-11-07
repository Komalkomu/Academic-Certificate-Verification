from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .models import Certificate, BlockchainBlock
from .serializers import CertificateSerializer
from .utils import sha256_file, create_qr_image
from .blockchain import add_certificate_block, verify_chain


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    return Response({
        "total_certificates": Certificate.objects.count(),
        "active_certificates": Certificate.objects.filter(is_revoked=False).count(),
        "revoked_certificates": Certificate.objects.filter(is_revoked=True).count(),
        "ledger_blocks": BlockchainBlock.objects.count(),
    })


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def certificate_list_create(request):
    if request.method == "GET":
        query = request.query_params.get("search", "").strip()
        certificates = Certificate.objects.select_related("blockchain_block").all()
        if query:
            from django.db.models import Q
            certificates = certificates.filter(
                Q(student_name__icontains=query) |
                Q(usn__icontains=query) |
                Q(certificate_id__icontains=query)
            )
        return Response(CertificateSerializer(
            certificates, many=True, context={"request": request}
        ).data)

    required = ["student_name", "usn", "course", "certificate_id", "issue_date", "pdf_file"]
    missing = [field for field in required if not request.data.get(field)]
    if missing:
        return Response(
            {"error": "Missing required fields: " + ", ".join(missing)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    uploaded = request.FILES["pdf_file"]
    if uploaded.size > 10 * 1024 * 1024:
        return Response({"error": "PDF must be 10 MB or smaller."}, status=400)
    if not uploaded.name.lower().endswith(".pdf"):
        return Response({"error": "Only PDF files are accepted."}, status=400)

    file_hash = sha256_file(uploaded)

    try:
        with transaction.atomic():
            # Create the ledger block first, then attach the certificate to it.
            block = add_certificate_block(
                request.data["certificate_id"],
                file_hash,
                request.data["student_name"],
            )
            certificate = Certificate.objects.create(
                student_name=request.data["student_name"].strip(),
                usn=request.data["usn"].strip().upper(),
                course=request.data["course"].strip(),
                certificate_id=request.data["certificate_id"].strip(),
                issue_date=request.data["issue_date"],
                pdf_file=uploaded,
                sha256_hash=file_hash,
                blockchain_block=block,
            )
            create_qr_image(certificate)
    except Exception as exc:
        return Response({"error": f"Could not save certificate: {str(exc)}"}, status=400)

    return Response(
        CertificateSerializer(certificate, context={"request": request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def certificate_detail(request, certificate_id):
    certificate = get_object_or_404(
        Certificate.objects.select_related("blockchain_block"),
        certificate_id=certificate_id,
    )
    return Response(CertificateSerializer(certificate, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def public_verify(request, certificate_id):
    certificate = get_object_or_404(
        Certificate.objects.select_related("blockchain_block"),
        certificate_id=certificate_id,
    )
    chain_result = verify_chain()
    block = certificate.blockchain_block
    ledger_hash = block.data.get("certificate_hash")
    db_matches_ledger = (
        block.data.get("certificate_id") == certificate.certificate_id
        and ledger_hash == certificate.sha256_hash
    )
    valid = chain_result["valid"] and db_matches_ledger and not certificate.is_revoked

    return Response({
        "certificate_id": certificate.certificate_id,
        "student_name": certificate.student_name,
        "usn": certificate.usn,
        "course": certificate.course,
        "issue_date": certificate.issue_date,
        "is_revoked": certificate.is_revoked,
        "ledger_valid": chain_result["valid"],
        "ledger_message": chain_result["message"],
        "database_matches_ledger": db_matches_ledger,
        "registered_hash": certificate.sha256_hash,
        "block_index": block.index,
        "status": "GENUINE" if valid else ("REVOKED" if certificate.is_revoked else "INVALID / TAMPER DETECTED"),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def verify_uploaded_pdf(request, certificate_id):
    certificate = get_object_or_404(Certificate, certificate_id=certificate_id)
    uploaded = request.FILES.get("pdf_file")
    if not uploaded:
        return Response({"error": "Please select a PDF file."}, status=400)
    if not uploaded.name.lower().endswith(".pdf"):
        return Response({"error": "Only PDF files are accepted."}, status=400)

    submitted_hash = sha256_file(uploaded)
    matches = submitted_hash == certificate.sha256_hash
    return Response({
        "certificate_id": certificate.certificate_id,
        "submitted_hash": submitted_hash,
        "registered_hash": certificate.sha256_hash,
        "file_matches": matches,
        "status": "ORIGINAL FILE" if matches else "MODIFIED / DIFFERENT FILE",
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def revoke_certificate(request, certificate_id):
    certificate = get_object_or_404(Certificate, certificate_id=certificate_id)
    if certificate.is_revoked:
        return Response({"message": "Certificate is already revoked."})
    certificate.is_revoked = True
    certificate.save(update_fields=["is_revoked"])
    return Response({"message": "Certificate revoked successfully."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ledger_status(request):
    result = verify_chain()
    result["total_blocks"] = BlockchainBlock.objects.count()
    return Response(result)
