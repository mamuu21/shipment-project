from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import (
    ShipmentListCreateView, ShipmentDetailView,
    CustomerListCreateView, CustomerDetailView,
    ParcelListCreateView, ParcelDetailView,
    DocumentListCreateView, DocumentDetailView,
    InvoiceListCreateView, InvoiceDetailView,
    RegisterView,
    ChartDataView,
    GenerateInvoicePDF,
    ShipmentCustomersView,
    UserProfileView,
    CustomerMeView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path('login/', TokenObtainPairView.as_view(), name='login' ),
    path('users/me/', UserProfileView.as_view(), name='user-profile'),

    path('shipments/', ShipmentListCreateView.as_view(), name='shipment-list-create'),
    path('shipments/<str:pk>/', ShipmentDetailView.as_view(), name='shipment-detail'),
    path('shipments/<str:pk>/customers/', ShipmentCustomersView.as_view(), name='shipment-customers'),
    
    path('customers/', CustomerListCreateView.as_view(), name='customer-list'),
    path('customers/me/', CustomerMeView.as_view(), name='customer-me'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
    
    path('parcels/', ParcelListCreateView.as_view(), name='parcel-list-create'),
    path('parcels/<str:pk>/', ParcelDetailView.as_view(), name='parcel-detail'),
    
    path('documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<str:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice-list-create'),
    path('invoices/<str:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('chart-data/', ChartDataView.as_view(), name='chart-data'),
    path('customers/<int:customer_id>/generate-invoice/', GenerateInvoicePDF.as_view(), name='generate-invoice'),
]
