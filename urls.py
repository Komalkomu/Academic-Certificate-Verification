from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.dashboard),
    path("certificates/", views.certificate_list_create),
    path("certificates/<str:certificate_id>/", views.certificate_detail),
    path("certificates/<str:certificate_id>/verify/", views.public_verify),
    path("certificates/<str:certificate_id>/verify-file/", views.verify_uploaded_pdf),
    path("certificates/<str:certificate_id>/revoke/", views.revoke_certificate),
    path("ledger/status/", views.ledger_status),
]
