from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.utils.crypto import get_random_string

from apps.accounts.models import UserMFADevice, UserRole


class Command(BaseCommand):
    help = "Reseta a senha de uma conta administrativa da Plataforma PSI."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            help="Username da conta que deve ter a senha resetada.",
        )
        parser.add_argument(
            "--email",
            help="E-mail da conta que deve ter a senha resetada.",
        )
        parser.add_argument(
            "--password",
            help="Nova senha. Se omitida, uma senha temporária será gerada.",
        )
        parser.add_argument(
            "--full-name",
            default="Administrador GoPsi",
            help="Nome completo usado ao criar uma conta com --create.",
        )
        parser.add_argument(
            "--create",
            action="store_true",
            help="Cria a conta SUPERADMIN se ela não existir.",
        )
        parser.add_argument(
            "--clear-mfa",
            action="store_true",
            help=(
                "Remove o dispositivo MFA para permitir nova configuração "
                "no próximo login."
            ),
        )

    def handle(self, *args, **options):
        username = options.get("username")
        email = options.get("email")
        password = options.get("password") or get_random_string(18)

        if username and email and not options.get("create"):
            raise CommandError("Use apenas --username ou --email, não ambos.")

        User = get_user_model()
        users = User.objects.all().order_by("date_joined", "username")

        if username and email:
            users = users.filter(username=username, email=email)
        elif username:
            users = users.filter(username=username)
        elif email:
            users = users.filter(email=email)
        else:
            users = users.filter(global_role=UserRole.SUPERADMIN, is_active=True)

        user = users.first()
        if not user:
            if not options.get("create"):
                raise CommandError(
                    "Nenhum admin encontrado. Informe --username ou --email "
                    "de uma conta existente, ou use --create."
                )
            if not username or not email:
                raise CommandError("Para criar admin, informe --username e --email.")
            user = User.objects.create_user(
                username=username,
                email=email,
                full_name=options["full_name"],
                password=password,
                global_role=UserRole.SUPERADMIN,
                is_staff=True,
                is_superuser=True,
            )
        else:
            user.set_password(password)
            user.is_active = True
            user.save(update_fields=["password", "is_active", "updated_at"])

        if user.global_role != UserRole.SUPERADMIN:
            self.stdout.write(
                self.style.WARNING(
                    "A conta não é SUPERADMIN; senha foi alterada, mas ela pode "
                    "não acessar o workspace da plataforma."
                )
            )

        if options.get("clear_mfa"):
            UserMFADevice.objects.filter(user=user).delete()

        self.stdout.write(self.style.SUCCESS("Senha resetada com sucesso."))
        self.stdout.write(f"Username: {user.username}")
        self.stdout.write(f"E-mail: {user.email}")
        self.stdout.write(f"Perfil: {user.global_role}")
        self.stdout.write(f"Nova senha: {password}")
        if options.get("clear_mfa"):
            self.stdout.write("MFA removido: sim")
