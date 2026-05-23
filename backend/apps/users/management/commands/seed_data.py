from django.core.management.base import BaseCommand
from apps.core.init_data import initialize_all


class Command(BaseCommand):
    help = "Demo uchun sintetik ma'lumotlar yuklash"

    def handle(self, *args, **kwargs):
        initialize_all()
        self.stdout.write(self.style.SUCCESS("Sintetik ma'lumotlar muvaffaqiyatli yuklandi!"))
        self.stdout.write("HR: hr@turonbank.uz / demo1234")
        self.stdout.write("Hodim: ali@turonbank.uz / demo1234")
