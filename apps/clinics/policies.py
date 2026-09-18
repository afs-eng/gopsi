from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.clinics.models import ClinicMembership


def has_active_clinic_membership(user, clinic_id, role=None) -> bool:
    """Check clinic authority from an active membership only."""
    if (
        not getattr(user, "is_authenticated", False)
        or not getattr(user, "is_active", False)
        or has_explicit_platform_role(user)
    ):
        return False

    memberships = user.clinic_memberships.filter(
        clinic_id=clinic_id,
        is_active=True,
    )
    if role is not None:
        if role == UserRole.SUPERADMIN:
            return False
        memberships = memberships.filter(role=role)
    else:
        memberships = memberships.exclude(role=UserRole.SUPERADMIN)
    return memberships.exists()


def is_clinic_admin(user, clinic_id) -> bool:
    return has_active_clinic_membership(user, clinic_id, role=UserRole.CLINIC_ADMIN)
