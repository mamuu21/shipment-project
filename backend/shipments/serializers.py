from rest_framework import serializers
from decimal import Decimal
from django.db.models import Sum
from .models import Shipment, Customer, Parcel, Document, Invoice, User, InvoiceItem, Step, Parameter
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role')
        extra_kwargs = {
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
    
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'role': self.user.role
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['id']
        
        def get_customer(self, obj):
            if obj.role != "customer":
                return None
            try:
                return CustomerSerializer(obj.customer).data
            except Customer.DoesNotExist:
                return None
        

class CustomerSerializer(serializers.ModelSerializer):
    total_invoices_paid = serializers.SerializerMethodField()
    total_parcels = serializers.SerializerMethodField()
    total_parcel_weight = serializers.SerializerMethodField()
    total_shipments = serializers.SerializerMethodField()
    shipment_nos = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'address', 'phone', 'status',
                  'total_invoices_paid', 'total_parcels', 'total_parcel_weight',
                  'total_shipments', 'shipment_nos']
        
    def get_total_invoices_paid(self, obj):
        return obj.invoices.filter(status='Paid').count()
    
    def get_total_parcels(self, obj):
        return obj.parcels.count()
    
    def get_total_parcel_weight(self, obj):
        total_weight = obj.parcels.aggregate(total=Sum('weight'))['total']
        return total_weight or 0
    
    def get_total_shipments(self, obj):
        return Shipment.objects.filter(parcels__customer=obj).distinct().count()
    
    def get_shipment_nos(self, obj):
        request = self.context.get('request')
        shipment_no = request.query_params.get('shipment_no') if request else None

        shipments = Shipment.objects.filter(parcels__customer=obj).distinct()
        if shipment_no:
            shipments = shipments.filter(shipment_no=shipment_no)

        return [s.shipment_no for s in shipments]
    
               

class ShipmentSerializer(serializers.ModelSerializer):
    customer_count = serializers.SerializerMethodField()
    parcel_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Shipment
        fields = ['shipment_no', 'transport', 'vessel', 'origin', 'destination',
            'weight', 'weight_unit', 'volume', 'volume_unit', 'steps', 'status',
            'latitude', 'longitude',
            'customer_count', 'parcel_count']
        
    def get_customer_count(self, obj):
            return Customer.objects.filter(parcels__shipment=obj).distinct().count()

    def get_parcel_count(self, obj):
        return obj.parcels.count()

        
        
class ParcelSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )
    shipment_vessel = serializers.CharField(source='shipment.vessel', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    shipment_status = serializers.CharField(source='shipment.status', read_only=True)
    
    
            
    
    class Meta:
        model = Parcel
        fields = [
            'parcel_no', 'shipment', 'customer', 'customer_id', 'weight', 'weight_unit',
            'volume', 'volume_unit', 'charge', 'payment','commodity_type', 'description', 
            'shipment_vessel', 'customer_name', 'shipment_status'
        ]
      
        def to_representation(self, instance):
            """
            Ensure the parcel's status matches the shipment's status in API responses.
            """
            representation = super().to_representation(instance)
            representation['status'] = instance.shipment.status
            return representation
        
        
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'



class InvoiceItemSerializer(serializers.ModelSerializer):
    parcel_no = serializers.CharField(source='parcel.parcel_no', read_only=True)
    commodity_type = serializers.CharField(source='parcel.commodity_type', read_only=True)
    description = serializers.CharField(source='parcel.description', read_only=True)
    parcel_charge = serializers.SerializerMethodField()

    class Meta:
        model = InvoiceItem
        fields = ['id', 'parcel', 'parcel_no', 'commodity_type', 'description', 'parcel_charge', 'cost']
        extra_kwargs = {
            'parcel': {'write_only': True} 
        }

        
    def get_parcel_charge(self, obj):
        return obj.parcel.charge.amount if obj.parcel and obj.parcel.charge else Decimal('0.00')
      
        
class InvoiceSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer',  write_only=True
    )
    items = InvoiceItemSerializer(many=True, read_only=True) 
    total_amount = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    final_amount = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'invoice_no', 'customer', 'issue_date', 'due_date', 'customer_id',
            'total_amount', 'tax', 'final_amount', 'status', 'items'
        ]

        
    def get_total_amount(self, obj):
        return str(obj.total_amount.amount) if obj.total_amount  else Decimal('0.00')

    def get_tax(self, obj):
        return str(obj.tax.amount) if obj.tax else Decimal('0.00')

    def get_final_amount(self, obj):
        return str(obj.final_amount.amount) if obj.final_amount else Decimal('0.00')


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ["id", "name", "description", "order", "color", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class ParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameter
        fields = [
            "id", "category", "name", "description", "color",
            "is_default", "is_active", "sort_order",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]