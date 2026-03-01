from django.conf import settings
from django.contrib.auth.models import Group, Permission
from django.db.models import Q
from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver

from .models import UserProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    admin_group, _ = Group.objects.get_or_create(name="admin")
    staff_group, _ = Group.objects.get_or_create(name="staff")

    all_perms = Permission.objects.all()
    if all_perms.exists():
        admin_group.permissions.set(all_perms)

    shipments_models = [
        "customer", "shipment", "parcel", "document",
        "invoice", "invoiceitem", "parameter", "step",
    ]
    staff_perms = Permission.objects.filter(
        content_type__app_label="shipments",
        content_type__model__in=shipments_models,
    ).filter(
        Q(codename__startswith="add_")
        | Q(codename__startswith="change_")
        | Q(codename__startswith="delete_")
        | Q(codename__startswith="view_")
    )
    if staff_perms.exists():
        staff_group.permissions.set(staff_perms)
