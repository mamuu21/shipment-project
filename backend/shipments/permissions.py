from rest_framework.permissions import BasePermission, SAFE_METHODS

class RolePermission(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in self.allowed_roles
        )

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
    - Admin → full CRUD on everything
    - Staff → create, read, update (no delete)
    - Customer → read only own data + update own profile
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        if user.role == 'admin':
            return True

        if user.role == 'staff':
            # Allow safe methods + create + update
            return request.method in SAFE_METHODS or request.method in ['POST', 'PUT', 'PATCH']

        if user.role == 'customer':
            # Allow safe methods + updating own profile
            return request.method in SAFE_METHODS or request.method in ['PUT', 'PATCH']

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role == 'admin':
            return True

        if user.role == 'staff':
            # Staff can do everything except delete
            return request.method != 'DELETE'

        if user.role == 'customer':
            # Customers can only access their own data
            if hasattr(obj, 'customer') and getattr(obj.customer, 'email', None) == user.email:
                return True
            if hasattr(obj, 'email') and obj.email == user.email:
                return True
            return False

        return False

class IsSelfOrAdmin(BasePermission):
    """
    Allows access if:
    - Admin user
    - Customer accessing their own profile
    """
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, "is_admin", lambda: False)():
            return True
        if getattr(request.user, "is_customer", lambda: False)() and hasattr(obj, "email"):
            return obj.email == request.user.email
        return False
