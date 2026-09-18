from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from apps.accounts.mfa import generate_totp_secret, provisioning_uri, totp_now
from apps.accounts.models import UserMFADevice


class Command(BaseCommand):
    help = "Cria ou reinicia o MFA TOTP confirmado para um usuário."

    def add_arguments(self, parser):
        parser.add_argument("username", help="Username do usuário que receberá MFA.")
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Gera um novo segredo mesmo que o usuário já tenha MFA.",
        )

    def handle(self, *args, **options):
        username = options["username"]
        try:
            user = get_user_model().objects.get(username=username)
        except get_user_model().DoesNotExist as error:
            raise CommandError(f"Usuário não encontrado: {username}") from error

        device, created = UserMFADevice.objects.get_or_create(
            user=user,
            defaults={"secret": generate_totp_secret()},
        )

        if options["reset"] and not created:
            device.secret = generate_totp_secret()

        now = timezone.now()
        device.is_confirmed = True
        device.confirmed_at = device.confirmed_at or now
        device.last_used_at = now
        device.save()

        self.stdout.write(self.style.SUCCESS("MFA ativado para o usuário."))
        self.stdout.write(f"Usuário: {user.username}")
        self.stdout.write(f"Secret: {device.secret}")
        self.stdout.write(f"URI: {provisioning_uri(user, device.secret)}")
        self.stdout.write(f"Código atual: {totp_now(device.secret)}")
