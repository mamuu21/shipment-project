from rest_framework import serializers
from .models import UserProfile, SystemSettings


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["id", "avatar", "phone", "address", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = [
            "site_name", "contact_email", "timezone", "currency", "logo",
            "email_alerts_enabled", "sms_alerts_enabled",
            "two_factor_enabled", "session_timeout_minutes",
        ]
