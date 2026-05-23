from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class CoreConfig(AppConfig):
    name = "apps.core"
    verbose_name = "Core"

    def ready(self):
        import os
        import sys

        if os.environ.get("DJANGO_INIT") != "true":
            return

        # migrate, makemigrations kabi commandlarda ishlamasin
        management_commands = {"migrate", "makemigrations", "shell", "test", "collectstatic"}
        if len(sys.argv) > 1 and sys.argv[1] in management_commands:
            return

        try:
            from apps.core.init_data import initialize_all
            initialize_all()
        except Exception as e:
            logger.error(f"Initsializatsiya xatosi: {e}")
