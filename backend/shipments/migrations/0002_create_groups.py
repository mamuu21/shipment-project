from django.db import migrations
from django.db.models import Q


def create_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Permission = apps.get_model('auth', 'Permission')

    admin_group, _ = Group.objects.get_or_create(name='admin')
    staff_group, _ = Group.objects.get_or_create(name='staff')

    all_permissions = Permission.objects.all()
    admin_group.permissions.set(all_permissions)

    shipments_models = [
        'customer', 'shipment', 'parcel', 'document',
        'invoice', 'invoiceitem', 'parameter', 'step',
    ]
    staff_permissions = Permission.objects.filter(
        content_type__app_label='shipments',
        content_type__model__in=shipments_models,
    ).filter(
        Q(codename__startswith='add_')
        | Q(codename__startswith='change_')
        | Q(codename__startswith='delete_')
        | Q(codename__startswith='view_')
    )
    staff_group.permissions.set(staff_permissions)


def remove_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=['admin', 'staff']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('shipments', '0001_initial'),
        ('auth', '0012_alter_user_first_name_max_length'),
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.RunPython(create_groups, remove_groups),
    ]
