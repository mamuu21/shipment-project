import django_filters
from .models import Invoice

class InvoiceFilter(django_filters.FilterSet):
    shipment_no = django_filters.CharFilter(field_name='shipment__shipment_no', lookup_expr='icontains')
    customer_name = django_filters.CharFilter(field_name='customer__name', lookup_expr='icontains')

    class Meta:
        model = Invoice
        fields = ['invoice_no', 'shipment_no', 'customer_name']
