def get_user_role(user):
    """Derive a role string from Django Group membership.

    Priority: superuser → 'admin' group → 'staff' group → 'customer'.
    """
    if user.is_superuser:
        return "admin"
    group_names = set(user.groups.values_list("name", flat=True))
    if "admin" in group_names:
        return "admin"
    if "staff" in group_names:
        return "staff"
    return "customer"
