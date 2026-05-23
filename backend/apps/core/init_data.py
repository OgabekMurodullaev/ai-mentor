import logging
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)


def initialize_all():
    logger.info("=" * 50)
    logger.info("AI-Mentor: Initsializatsiya boshlandi...")

    _init_badges()
    _init_users()
    _init_rag()

    logger.info("Initsializatsiya yakunlandi!")
    logger.info("=" * 50)


def _init_rag():
    chroma_path = Path(settings.CHROMA_DB_PATH)

    if chroma_path.exists() and any(chroma_path.iterdir()):
        logger.info("RAG: ChromaDB mavjud — o'tkazib yuborildi")
        return

    logger.info("RAG: ChromaDB yaratilmoqda...")

    try:
        from apps.chatbot.services import RAGService
        rag = RAGService()
        rag._initialize()
        logger.info("RAG: ChromaDB muvaffaqiyatli yaratildi")
    except Exception as e:
        logger.error(f"RAG initsializatsiya xatosi: {e}")


def _init_badges():
    try:
        from apps.gamification.models import Badge

        if Badge.objects.exists():
            logger.info("Badge: Mavjud — o'tkazib yuborildi")
            return

        logger.info("Badge: Standart nishonlar yaratilmoqda...")

        BADGES = [
            {
                "name": "Tez O'rganuvchi",
                "icon": "⚡",
                "condition_type": "SPEED",
                "description": "Onboarding'ni 3 kunda tugatdingiz!",
            },
            {
                "name": "Mukammal Xizmat",
                "icon": "🏆",
                "condition_type": "PERFECT",
                "description": "3 ta stsenariyni xatosiz o'tdingiz!",
            },
            {
                "name": "Aniq Javob",
                "icon": "🎯",
                "condition_type": "STREAK",
                "description": "5 ta savolga ketma-ket to'g'ri javob berdingiz!",
            },
            {
                "name": "Birinchi Kun Yulduzi",
                "icon": "🌟",
                "condition_type": "FIRST_DAY",
                "description": "Birinchi kuni barcha vazifani bajardingiz!",
            },
            {
                "name": "Streak Master",
                "icon": "🔥",
                "condition_type": "STREAK",
                "description": "7 kun ketma-ket tizimga kirdingiz!",
            },
        ]

        for b in BADGES:
            Badge.objects.create(**b)

        logger.info(f"Badge: {len(BADGES)} ta nishon yaratildi")

    except Exception as e:
        logger.error(f"Badge initsializatsiya xatosi: {e}")


def _init_users():
    try:
        from apps.users.models import User, UserProgress

        if User.objects.exists():
            logger.info("Users: Mavjud — o'tkazib yuborildi")
            return

        logger.info("Users: Sintetik foydalanuvchilar yaratilmoqda...")

        hr = User.objects.create_user(
            username="hr@turonbank.uz",
            email="hr@turonbank.uz",
            password="demo1234",
            full_name="Malika Yusupova",
            role="HR",
            branch="Bosh ofis",
            department="HR bo'limi",
            position="HR Mutaxassis",
        )
        logger.info(f"  HR yaratildi: {hr.email}")

        EMPLOYEES = [
            {
                "email": "ali@turonbank.uz",
                "full_name": "Ali Karimov",
                "position": "Kassir",
                "department": "Kassa bo'limi",
                "branch": "Chilonzor filiali",
                "learning_path": "CASHIER",
                "score": 85,
                "quests": 4,
            },
            {
                "email": "zulfiya@turonbank.uz",
                "full_name": "Zulfiya Nazarova",
                "position": "Kreditchi",
                "department": "Kredit bo'limi",
                "branch": "Yunusobod filiali",
                "learning_path": "CREDIT",
                "score": 120,
                "quests": 6,
            },
            {
                "email": "bobur@turonbank.uz",
                "full_name": "Bobur Toshmatov",
                "position": "Operatsionist",
                "department": "Operatsiyalar bo'limi",
                "branch": "Bosh ofis",
                "learning_path": "OPERATIONS",
                "score": 60,
                "quests": 3,
            },
            {
                "email": "nodira@turonbank.uz",
                "full_name": "Nodira Rahimova",
                "position": "Mijozlarga xizmat mutaxassisi",
                "department": "Xizmat ko'rsatish bo'limi",
                "branch": "Mirzo Ulug'bek filiali",
                "learning_path": "SERVICE",
                "score": 145,
                "quests": 7,
            },
            {
                "email": "jasur@turonbank.uz",
                "full_name": "Jasur Ergashev",
                "position": "Kassir",
                "department": "Kassa bo'limi",
                "branch": "Sergeli filiali",
                "learning_path": "CASHIER",
                "score": 30,
                "quests": 1,
            },
            {
                "email": "shaxlo@turonbank.uz",
                "full_name": "Shaxlo Mirzayeva",
                "position": "Kreditchi",
                "department": "Kredit bo'limi",
                "branch": "Chilonzor filiali",
                "learning_path": "CREDIT",
                "score": 95,
                "quests": 5,
            },
        ]

        for emp_data in EMPLOYEES:
            score = emp_data.pop("score")
            quests = emp_data.pop("quests")

            emp = User.objects.create_user(
                username=emp_data["email"],
                password="demo1234",
                role="EMPLOYEE",
                **emp_data,
            )

            completion = min(100.0, (quests / 10) * 100)
            UserProgress.objects.create(
                user=emp,
                total_score=score,
                completed_quests=quests,
                completion_percentage=completion,
                current_streak=quests % 4,
            )

            logger.info(f"  Hodim yaratildi: {emp.email} ({score} ball)")

        logger.info(f"Users: HR + {len(EMPLOYEES)} hodim yaratildi")
        logger.info("  Login: hr@turonbank.uz / demo1234")
        logger.info("  Login: ali@turonbank.uz / demo1234")

    except Exception as e:
        logger.error(f"Users initsializatsiya xatosi: {e}")
