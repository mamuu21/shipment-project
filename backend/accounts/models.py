from django.db import models
from django.conf import settings


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


class SystemSettings(models.Model):
    site_name = models.CharField(max_length=255, default="CargoPro")
    contact_email = models.EmailField(default="admin@cargopro.com")
    timezone = models.CharField(max_length=50, default="UTC")
    currency = models.CharField(max_length=10, default="TZS")
    logo = models.ImageField(upload_to="settings/", blank=True, null=True)
    email_alerts_enabled = models.BooleanField(default=True)
    sms_alerts_enabled = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    session_timeout_minutes = models.PositiveIntegerField(default=30)

    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.site_name
