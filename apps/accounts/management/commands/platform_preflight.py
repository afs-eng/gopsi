from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Count, Q

from apps.accounts.models import UserRole
from apps.clinics.models import Clinic, ClinicMembership


class Command(BaseCommand):
    help = (
        "Relata inconsistências de identidade entre plataforma e clínicas sem "
        "alterar dados."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--fail-on-findings",
            action="store_true",
            help="Retorna erro ao final quando houver achados para bloquear o deploy.",
        )

    def handle(self, *args, **options):
        user_model = get_user_model()
        findings = 0

        self.stdout.write("Platform/clinic identity preflight (read-only)")
        self.stdout.write("Only IDs, counts, status, and role facts are reported.")

        platform_membership_users = (
            user_model.objects.filter(
                global_role=UserRole.SUPERADMIN,
                clinic_memberships__isnull=False,
            )
            .annotate(
                membership_count=Count("clinic_memberships", distinct=True),
                active_membership_count=Count(
                    "clinic_memberships",
                    filter=Q(clinic_memberships__is_active=True),
                    distinct=True,
                ),
            )
            .order_by("id")
            .distinct()
        )
        findings += self._write_user_section(
            "PLATFORM_ROLE_WITH_CLINIC_MEMBERSHIPS",
            platform_membership_users,
            lambda user: (
                f"user_id={user.id} global_role={user.global_role} "
                f"membership_count={user.membership_count} "
                f"active_membership_count={user.active_membership_count}"
            ),
            (
                "Review the identity split; platform users must have no clinic "
                "memberships."
            ),
        )

        platform_profile_users = (
            user_model.objects.filter(
                global_role=UserRole.SUPERADMIN,
                professional_profiles__isnull=False,
            )
            .annotate(
                profile_count=Count("professional_profiles", distinct=True),
                active_profile_count=Count(
                    "professional_profiles",
                    filter=Q(professional_profiles__is_active=True),
                    distinct=True,
                ),
            )
            .order_by("id")
            .distinct()
        )
        findings += self._write_user_section(
            "PLATFORM_ROLE_WITH_PROFESSIONAL_PROFILES",
            platform_profile_users,
            lambda user: (
                f"user_id={user.id} global_role={user.global_role} "
                f"profile_count={user.profile_count} "
                f"active_profile_count={user.active_profile_count}"
            ),
            (
                "Review the identity split; platform users must have no "
                "professional profiles."
            ),
        )

        platform_technical_users = user_model.objects.filter(
            global_role=UserRole.SUPERADMIN,
        ).filter(Q(is_superuser=True) | Q(is_staff=True)).order_by("id")
        findings += self._write_user_section(
            "PLATFORM_ROLE_WITH_DJANGO_TECHNICAL_FLAGS",
            platform_technical_users,
            lambda user: (
                f"user_id={user.id} global_role={user.global_role} "
                f"is_superuser={user.is_superuser} is_staff={user.is_staff}"
            ),
            (
                "Review the identity split manually; do not convert the technical "
                "account in place."
            ),
        )

        invalid_memberships = ClinicMembership.objects.filter(
            role=UserRole.SUPERADMIN
        ).order_by("id")
        findings += self._write_section(
            "MEMBERSHIP_WITH_INVALID_PLATFORM_ROLE",
            invalid_memberships,
            lambda membership: (
                f"membership_id={membership.id} user_id={membership.user_id} "
                f"clinic_id={membership.clinic_id} role={membership.role} "
                f"is_active={membership.is_active}"
            ),
            "Review or remove the invalid membership role manually.",
        )

        legacy_clinic_admins = (
            user_model.objects.filter(global_role=UserRole.CLINIC_ADMIN)
            .exclude(
                clinic_memberships__role=UserRole.CLINIC_ADMIN,
                clinic_memberships__is_active=True,
            )
            .order_by("id")
            .distinct()
        )
        findings += self._write_user_section(
            "GLOBAL_CLINIC_ADMIN_WITHOUT_ACTIVE_MEMBERSHIP",
            legacy_clinic_admins,
            lambda user: f"user_id={user.id} global_role={user.global_role}",
            (
                "Assign an active clinic-admin membership or resolve the legacy "
                "role manually."
            ),
        )

        clinics_without_admin = (
            Clinic.objects.filter(is_active=True)
            .annotate(
                valid_active_admin_count=Count(
                    "memberships",
                    filter=(
                        Q(
                            memberships__role=UserRole.CLINIC_ADMIN,
                            memberships__is_active=True,
                        )
                        & ~Q(
                            memberships__user__global_role=UserRole.SUPERADMIN
                        )
                        & Q(memberships__user__is_active=True)
                    ),
                )
            )
            .filter(valid_active_admin_count=0)
            .order_by("id")
            .distinct()
        )
        findings += self._write_section(
            "ACTIVE_CLINIC_WITHOUT_ACTIVE_ADMIN",
            clinics_without_admin,
            lambda clinic: f"clinic_id={clinic.id} is_active={clinic.is_active}",
            "Provision or manually assign an active clinic administrator.",
        )

        technical_accounts_without_platform_role = (
            user_model.objects.filter(Q(is_superuser=True) | Q(is_staff=True))
            .exclude(global_role=UserRole.SUPERADMIN)
            .order_by("id")
        )
        findings += self._write_user_section(
            "DJANGO_TECHNICAL_ACCOUNT_WITHOUT_EXPLICIT_PLATFORM_ROLE",
            technical_accounts_without_platform_role,
            lambda user: (
                f"user_id={user.id} global_role={user.global_role} "
                f"is_superuser={user.is_superuser} is_staff={user.is_staff}"
            ),
            "Review the technical account manually; do not convert it in place.",
        )

        self.stdout.write(f"PREFLIGHT_SUMMARY findings={findings}")
        if findings:
            self.stdout.write(
                "ACTION_REQUIRED: resolve findings manually; this command did "
                "not change data."
            )
        else:
            self.stdout.write("STATUS: no identity or membership findings.")

        if findings and options["fail_on_findings"]:
            raise CommandError("Preflight failed because findings were reported.")

    def _write_user_section(self, name, users, formatter, action):
        return self._write_section(name, users, formatter, action)

    def _write_section(self, name, records, formatter, action):
        records = list(records)
        self.stdout.write(f"\n{name} count={len(records)}")
        for record in records:
            self.stdout.write(f"- {formatter(record)}")
        if records:
            self.stdout.write(f"  ACTION: {action}")
        return len(records)
