def get_user_role(user):
    if hasattr(user, "role"):
        return user.role
    if user.is_superuser:
        return "admin"
    if user.is_staff:
        return "staff"
    return "customer"
