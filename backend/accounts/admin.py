from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User, Group

from .models import UserProfile, SystemSettings


admin.site.unregister(User)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'display_role', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'groups')

    def display_role(self, obj):
        groups = list(obj.groups.values_list('name', flat=True))
        if obj.is_superuser:
            return 'superuser'
        return ', '.join(groups) if groups else 'customer'
    display_role.short_description = 'Role'

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        group_names = set(obj.groups.values_list('name', flat=True))
        if 'admin' in group_names:
            obj.groups.remove(*Group.objects.filter(name='staff'))
            if not obj.is_staff:
                obj.is_staff = True
                obj.save(update_fields=['is_staff'])
        elif 'staff' in group_names:
            obj.groups.remove(*Group.objects.filter(name='admin'))
            if not obj.is_staff:
                obj.is_staff = True
                obj.save(update_fields=['is_staff'])
        else:
            if obj.is_staff and not obj.is_superuser:
                obj.is_staff = False
                obj.save(update_fields=['is_staff'])


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "created_at")
    search_fields = ("user__username", "user__email", "phone")


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ("site_name", "contact_email", "currency")
