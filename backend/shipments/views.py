from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from django.http import FileResponse

from rest_framework import generics, status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django_filters.rest_framework import DjangoFilterBackend

from .models import Shipment, Customer, Parcel, Document, Invoice
from .serializers import (
    ShipmentSerializer, CustomerSerializer, ParcelSerializer,
    DocumentSerializer, InvoiceSerializer, RegisterSerializer,
    CustomTokenObtainPairSerializer, UserSerializer
)
from .permissions import RoleBasedAccessPermission, IsSelfOrAdmin
from .filters import InvoiceFilter

import io
import logging
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch


User = get_user_model()


logger = logging.getLogger(__name__)


class StaffDeleteProtectedMixin:
    """
    Mixin that prevents staff from deleting objects.
    Admins can still delete.
    """
    def destroy(self, request, *args, **kwargs):
        if request.user.role == 'staff':
            return Response({"detail": "Staff cannot delete objects."}, status=403)
        return super().destroy(request, *args, **kwargs)


# ==============================
#  Base Role-Based Mixin
# ==============================
class RoleBasedQuerysetMixin:
    model = None
    customer_field = 'customer__email'

    def get_queryset(self):
        user = self.request.user
        qs = self.model.objects.all()

        # Admin & staff see all
        if user.role in ['admin', 'staff']:
            return qs

        # Customers see only their own data
        if user.role == 'customer':
            filter_kwargs = {self.customer_field: user}
            return qs.filter(**filter_kwargs)

        return self.model.objects.none()

    def perform_create(self, serializer):
        instance = serializer.save()
        logger.info(f"{self.request.user.email} created {self.model.__name__} ID={instance.pk}")

    def perform_update(self, serializer):
        instance = serializer.save()
        logger.info(f"{self.request.user.email} updated {self.model.__name__} ID={instance.pk}")

    def perform_destroy(self, instance):
        logger.info(f"{self.request.user.email} deleted {self.model.__name__} ID={instance.pk}")
        super().perform_destroy(instance)



# ==============================
#  Register Views
# ==============================
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        data = {
            "user": serializer.data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        
        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ==============================
# User Profile View
# ==============================
class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# ==============================

class BaseUserView:
    authentication_classes = [JWTAuthentication]


# ==============================
#  Shipment Views
# ==============================
class ShipmentListCreateView(BaseUserView, RoleBasedQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = ShipmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shipment_no', 'transport', 'origin', 'destination', 'status']
    model = Shipment
    customer_field = 'customers__email'
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission]


class ShipmentDetailView(StaffDeleteProtectedMixin, BaseUserView, RoleBasedQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ShipmentSerializer
    model = Shipment
    lookup_field = 'pk'
    customer_field = 'customers__email'
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission]


class ShipmentCustomersView(generics.ListAPIView):
    serializer_class = CustomerSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        shipment_pk = self.kwargs['pk']
        return Customer.objects.filter(parcels__shipment__pk=shipment_pk).distinct()


# ==============================
#  Customer Views
# ==============================
class CustomerListCreateView(BaseUserView, RoleBasedQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    model = Customer
    customer_field = 'email'
    filter_backends = [DjangoFilterBackend]
    filterset_fields = [
        'name', 'email', 'phone',
        'parcels__shipment', 'parcels__shipment__shipment_no',
    ]
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.distinct()


class CustomerDetailView(StaffDeleteProtectedMixin, BaseUserView, RoleBasedQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    model = Customer
    customer_field = 'email'
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission, IsSelfOrAdmin]


# ==============================
#  Parcel Views
# ==============================
class ParcelListCreateView(BaseUserView, RoleBasedQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = ParcelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['parcel_no', 'customer', 'shipment', 'shipment__shipment_no']
    model = Parcel
    customer_field = 'customer__email'
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission]


class ParcelDetailView(StaffDeleteProtectedMixin, BaseUserView, RoleBasedQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ParcelSerializer
    model = Parcel
    customer_field = 'customer__email'
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission]


# ==============================
# Document Views
# ==============================
class DocumentListCreateView(BaseUserView, RoleBasedQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document_no', 'shipment__shipment_no', 'customer__name', 'parcel__parcel_no', 'document_type']
    model = Document
    customer_field = 'customer__email'
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission]


class DocumentDetailView(StaffDeleteProtectedMixin, BaseUserView, RoleBasedQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    model = Document
    customer_field = 'customer__email'
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission]


# ==============================
# Invoice Views
# ==============================
class InvoiceListCreateView(BaseUserView, RoleBasedQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = InvoiceFilter
    model = Invoice
    customer_field = 'customer__email'
    ordering = ['-issue_date']
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission]


class InvoiceDetailView(StaffDeleteProtectedMixin, BaseUserView, RoleBasedQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InvoiceSerializer
    model = Invoice
    customer_field = 'customer__email'
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission]


# ==============================
# Charts API
# ==============================
class ChartDataView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        revenue_data = Shipment.objects.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            air=Count('id', filter=Q(transport__iexact='Air')),
            sea=Count('id', filter=Q(transport__iexact='Sea'))
        ).order_by('month')

        for entry in revenue_data:
            entry["name"] = entry["month"].strftime('%Y-%m') if entry["month"] else "Unknown"

        air_vehicle_data = Shipment.objects.filter(
            transport__iexact='Air'
        ).values('vessel').annotate(value=Count('id'))

        marine_vehicle_data = Shipment.objects.filter(
            transport__iexact='Marine'
        ).values('vessel').annotate(value=Count('id'))

        return Response({
            'revenueData': list(revenue_data),
            'airVehicleData': list(air_vehicle_data),
            'marineVehicleData': list(marine_vehicle_data)
        })


# ==============================
# PDF Invoice Generation
# ==============================
class GenerateInvoicePDF(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        customer_id = kwargs.get('customer_id')
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response(status=404)

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.setFont("Helvetica-Bold", 16)
        p.drawString(1 * inch, 10 * inch, "Invoice")

        p.setFont("Helvetica", 12)
        p.drawString(1 * inch, 9.5 * inch, f"Invoice for: {customer.name}")
        p.drawString(1 * inch, 9.3 * inch, f"Email: {customer.email}")
        p.drawString(1 * inch, 9.1 * inch, f"Phone: {customer.phone}")

        p.setFont("Helvetica-Bold", 12)
        p.drawString(1 * inch, 8.5 * inch, "Description")
        p.drawString(4 * inch, 8.5 * inch, "Amount")
        p.setFont("Helvetica", 12)
        p.drawString(1 * inch, 8.3 * inch, "Parcel Shipping")
        p.drawString(4 * inch, 8.3 * inch, "$100.00")

        p.showPage()
        p.save()

        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f'invoice_{customer.name}.pdf')
