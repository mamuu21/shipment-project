from rest_framework.permissions import BasePermission, SAFE_METHODS
from .utils import get_user_role


class RolePermission(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return get_user_role(request.user) in self.allowed_roles


class IsAdmin(RolePermission):
    allowed_roles = ['admin']


class IsStaff(RolePermission):
    allowed_roles = ['staff']


class IsCustomer(RolePermission):
    allowed_roles = ['customer']


class IsAdminOrStaff(RolePermission):
    allowed_roles = ['admin', 'staff']


class IsAdminOrStaffOrCustomer(RolePermission):
    allowed_roles = ['admin', 'staff', 'customer']


class RoleBasedAccessPermission(BasePermission):
    """
    Role-based CRUD rules:
    - Admin -> full CRUD on everything
    - Staff -> create, read, update (no delete)
    - Customer -> read only own data + update own profile
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        role = get_user_role(user)

        if role == 'admin':
            return True

        if role == 'staff':
            return request.method in SAFE_METHODS or request.method in ['POST', 'PUT', 'PATCH']

        if role == 'customer':
            return request.method in SAFE_METHODS or request.method in ['PUT', 'PATCH']

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = get_user_role(user)

        if role == 'admin':
            return True

        if role == 'staff':
            return request.method != 'DELETE'

        if role == 'customer':
            if hasattr(obj, 'customer') and getattr(obj.customer, 'email', None) == user.email:
                return True
            if hasattr(obj, 'email') and obj.email == user.email:
                return True
            return False

        return False


class IsSelfOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        role = get_user_role(request.user)
        if role == 'admin':
            return True
        if role == 'customer' and hasattr(obj, 'email'):
            return obj.email == request.user.email
        return False
