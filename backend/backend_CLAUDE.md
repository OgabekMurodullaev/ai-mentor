# AI-Mentor: Turonbank — Backend Prompt (Claude Code)

Sen Django backend dasturchisisisan. Quyidagi loyihani to'liq yozib ber.

---

## Texnologiyalar

- Python 3.11+
- Django 5.x + Django REST Framework
- djangorestframework-simplejwt (JWT auth)
- langchain-groq + langchain-community (RAG)
- chromadb (vector database, lokal fayl)
- httpx (AISHA AI async so'rovlar)
- python-dotenv
- django-cors-headers
- SQLite (lokal ishlab chiqish uchun)

---

## requirements.txt

```
django>=5.0
djangorestframework
djangorestframework-simplejwt
django-cors-headers
python-dotenv
httpx
langchain
langchain-groq
langchain-community
chromadb
sentence-transformers
```

---

## Loyiha Strukturasi

```
backend/
├── manage.py
├── requirements.txt
├── .env
├── chroma_db/                  # ChromaDB lokal storage
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── asgi.py
└── apps/
    ├── users/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── admin.py
    ├── chatbot/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── services.py
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    ├── voice/
    │   ├── __init__.py
    │   ├── services.py
    │   ├── views.py
    │   └── urls.py
    ├── simulator/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── data.py             # Sintetik stsenariylar
    │   ├── services.py
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    ├── gamification/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── services.py
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    └── analytics/
        ├── __init__.py
        ├── services.py
        ├── views.py
        └── urls.py
```

---

## config/settings.py

```python
import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-hackathon-2024")
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "apps.users",
    "apps.chatbot",
    "apps.voice",
    "apps.simulator",
    "apps.gamification",
    "apps.analytics",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
AUTH_USER_MODEL = "users.User"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# External APIs
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
AISHA_API_KEY = os.getenv("AISHA_API_KEY")
AISHA_BASE_URL = "https://back.aisha.group"

# ChromaDB
CHROMA_DB_PATH = str(BASE_DIR / "chroma_db")

STATIC_URL = "/static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LANGUAGE_CODE = "uz"
TIME_ZONE = "Asia/Tashkent"
USE_TZ = True
```

---

## apps/users/models.py

```python
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        EMPLOYEE = "EMPLOYEE", "Hodim"
        HR = "HR", "HR Mutaxassis"
        ADMIN = "ADMIN", "Admin"

    class LearningPath(models.TextChoices):
        CASHIER = "CASHIER", "Kassir"
        CREDIT = "CREDIT", "Kreditchi"
        OPERATIONS = "OPERATIONS", "Operatsionist"
        SERVICE = "SERVICE", "Xizmat Ko'rsatish"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)
    full_name = models.CharField(max_length=200)
    department = models.CharField(max_length=100, blank=True)
    branch = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    learning_path = models.CharField(
        max_length=20, choices=LearningPath.choices, default=LearningPath.SERVICE
    )
    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "full_name"]
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.full_name} ({self.role})"


class UserProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="progress")
    total_score = models.IntegerField(default=0)
    completed_quests = models.IntegerField(default=0)
    completion_percentage = models.FloatField(default=0.0)
    current_streak = models.IntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.full_name} — {self.total_score} ball"
```

---

## apps/users/views.py

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, UserProgress
from .serializers import UserSerializer, RegisterSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(request, username=email, password=password)

        if not user:
            return Response({"error": "Email yoki parol noto'g'ri"}, status=400)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class RegisterView(APIView):
    """Faqat HR yoki ADMIN yangi hodim qo'sha oladi"""

    def post(self, request):
        if request.user.role not in ["HR", "ADMIN"]:
            return Response({"error": "Ruxsat yo'q"}, status=403)

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            UserProgress.objects.create(user=user)
            return Response(UserSerializer(user).data, status=201)
        return Response(serializer.errors, status=400)
```

---

## apps/users/serializers.py

```python
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, UserProgress


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = ["total_score", "completed_quests", "completion_percentage", "current_streak"]


class UserSerializer(serializers.ModelSerializer):
    progress = UserProgressSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "full_name", "role", "department",
            "branch", "position", "learning_path",
            "onboarding_completed", "progress",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email", "full_name", "password", "role",
            "department", "branch", "position", "learning_path",
        ]

    def create(self, validated_data):
        validated_data["username"] = validated_data["email"]
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)
```

---

## apps/users/urls.py

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, MeView, RegisterView

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("refresh/", TokenRefreshView.as_view()),
    path("me/", MeView.as_view()),
    path("register/", RegisterView.as_view()),
]
```

---

## apps/chatbot/services.py (RAG Pipeline)

```python
import os
from django.conf import settings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate


# Sintetik bank hujjatlari
SYNTHETIC_DOCUMENTS = [
    """
    TURONBANK ICHKI QOIDALARI
    1. Ish vaqti: Dushanba-Juma 09:00-18:00, Shanba 09:00-13:00.
    2. Kechikish: 3 martadan ortiq kechikish ogohlantirish yoziladi.
    3. Mehnat ta'tili: Yiliga 24 ish kuni.
    4. Korporativ email: firstname.lastname@turonbank.uz formatida.
    5. Maxfiylik: Bank mijozlari ma'lumotlari uchinchi shaxslarga berilmaydi.
    """,
    """
    DRESS-CODE TALABLARI
    Erkaklar: Klassik kostyum (qora, ko'k, kulrang), oq yoki och rangli ko'ylak, galstuk majburiy.
    Ayollar: Klassik kiyim, to'q bo'lmagan ranglar, sport kiyim taqiqlanadi.
    Poyabzal: Klassik, toza holda bo'lishi shart.
    Sochilar: Tartibli, haddan tashqari bo'yoq taqiqlanadi.
    """,
    """
    KASSA OPERATSIYALARI YO'RIQNOMASI
    1. Kassir ish boshida kassani tekshiradi va sana/imzo qo'yadi.
    2. Naqd pul qabul qilishda: hisoblash, tekshirish, kvitansiya berish.
    3. Naqd pul berish: pasport tekshirish, tizimda tasdiqlash, berish.
    4. Kun oxirida: kassa hisobotini tuzish, inkassatsiyaga topshirish.
    5. Xato operatsiya: darhol nazoratchi xabardor qilinadi.
    """,
    """
    KREDIT BERISH TARTIBI
    1. Ariza qabul qilish: pasport, daromad ma'lumotnomasi, garov hujjatlari.
    2. Tahlil: kredit tarixi NBKI tizimida tekshiriladi.
    3. Qaror: kredit qo'mitasi 3 ish kuni ichida qaror qabul qiladi.
    4. Foiz stavkasi: yillik 22-28% (muddatga qarab).
    5. Maksimal summa: oylik daromadning 50% idan oshmasligi kerak.
    """,
    """
    TEZKOR SAVOL-JAVOBLAR (FAQ)
    S: Ish haqi qachon to'lanadi?
    J: Har oyning 5-sanasida asosiy ish haqi, 20-sanasida avans.
    
    S: Kasal bo'lganda nima qilish kerak?
    J: HR ga xabar berish va davolanish varaqasi topshirish.
    
    S: Korporativ kartani qanday olsa bo'ladi?
    J: HR bo'limiga murojaat qiling, 3 ish kunida tayyorlanadi.
    
    S: Mehnat tartibini buzganda nima bo'ladi?
    J: Ogohlantirishdan boshlanib, og'ir hollarda ishdan bo'shatish.
    
    S: Filiallar orasida o'tkazma qanday amalga oshiriladi?
    J: Tizimda o'tkazma yaratib, boshqaruvchi tasdiqlaydi.
    """,
    """
    PLASTIK KARTA XIZMATLARI
    Karta turlari: Uzcard (milliy), Visa/Mastercard (xalqaro).
    Chiqarish muddati: 3-5 ish kuni.
    Yillik xizmat haqi: Uzcard — 30,000 so'm, Visa — 150,000 so'm.
    PIN kod: Faqat mijozning o'zi bilishi kerak, hech kimga aytilmaydi.
    Karta bloklash: +998 71 200-00-00 raqamiga qo'ng'iroq qiling.
    """,
]


class RAGService:
    _instance = None
    _qa_chain = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _get_chain(self):
        if self._qa_chain is None:
            self._qa_chain = self._build_chain()
        return self._qa_chain

    def _build_chain(self):
        embeddings = SentenceTransformerEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )

        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        docs = []
        for text in SYNTHETIC_DOCUMENTS:
            chunks = splitter.create_documents([text])
            docs.extend(chunks)

        vectorstore = Chroma.from_documents(
            documents=docs,
            embedding=embeddings,
            persist_directory=settings.CHROMA_DB_PATH,
        )

        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.3,
        )

        prompt = PromptTemplate(
            input_variables=["context", "question"],
            template="""
Sen Turonbank'ning AI-Mentori (Zulfiya)san. Yangi hodimlar va amaliyotchilarga
bank ichki qoidalari, tartib-qoidalar va ish jarayonlari haqida yordam berasan.

Faqat quyidagi ma'lumotlar asosida javob ber:
{context}

Savol: {question}

O'zbek tilida, qisqa va aniq javob ber. Agar ma'lumot bo'lmasa:
"Bu haqida HR bo'limiga murojaat qiling" de.
""",
        )

        return RetrievalQA.from_chain_type(
            llm=llm,
            retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
            chain_type_kwargs={"prompt": prompt},
        )

    def get_answer(self, question: str) -> str:
        chain = self._get_chain()
        result = chain.invoke({"query": question})
        return result["result"]
```

---

## apps/chatbot/views.py

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChatHistory
from .services import RAGService


class AskView(APIView):
    def post(self, request):
        question = request.data.get("question", "").strip()
        if not question:
            return Response({"error": "Savol yuborilmadi"}, status=400)

        service = RAGService()
        answer = service.get_answer(question)

        ChatHistory.objects.create(
            user=request.user,
            question=question,
            answer=answer,
        )

        return Response({"question": question, "answer": answer})


class HistoryView(APIView):
    def get(self, request):
        history = ChatHistory.objects.filter(user=request.user).order_by("-created_at")[:20]
        data = [
            {"question": h.question, "answer": h.answer, "created_at": h.created_at}
            for h in history
        ]
        return Response(data)
```

---

## apps/chatbot/models.py

```python
from django.db import models
from apps.users.models import User


class ChatHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
```

---

## apps/voice/services.py

```python
import httpx
from django.conf import settings
from asgiref.sync import async_to_sync

AISHA_HEADERS = {"X-Api-Key": settings.AISHA_API_KEY}

VOICE_SETTINGS = {
    "mentor":           {"model": "Gulnoza", "mood": "Cheerful"},
    "client":           {"model": "Gulnoza", "mood": "Neutral"},
    "difficult_client": {"model": "Gulnoza", "mood": "Sad"},
    "congratulation":   {"model": "Gulnoza", "mood": "Happy"},
}


class AishaSTTService:
    async def transcribe(self, audio_bytes: bytes, filename: str = "recording.wav") -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{settings.AISHA_BASE_URL}/api/v1/stt/post/",
                headers=AISHA_HEADERS,
                files={"audio": (filename, audio_bytes, "audio/wav")},
                data={"language": "uz"},
            )
            response.raise_for_status()
            return response.json()


class AishaTTSService:
    async def synthesize(self, text: str, voice_type: str = "mentor") -> str:
        voice = VOICE_SETTINGS.get(voice_type, VOICE_SETTINGS["mentor"])
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{settings.AISHA_BASE_URL}/api/v1/tts/post/",
                headers={**AISHA_HEADERS, "Content-Type": "application/json"},
                json={
                    "transcript": text,
                    "language": "uz",
                    "model": voice["model"],
                    "mood": voice["mood"],
                },
            )
            response.raise_for_status()
            return response.json()["audio_path"]
```

---

## apps/voice/views.py

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from asgiref.sync import async_to_sync
from .services import AishaSTTService, AishaTTSService
from apps.chatbot.services import RAGService


class STTView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        audio_file = request.FILES.get("audio")
        if not audio_file:
            return Response({"error": "Audio fayl yuborilmadi"}, status=400)

        stt = AishaSTTService()
        result = async_to_sync(stt.transcribe)(audio_file.read(), audio_file.name)
        return Response({
            "transcript": result["transcript"],
            "duration": result.get("duration"),
        })


class TTSView(APIView):
    def post(self, request):
        text = request.data.get("text", "").strip()
        voice_type = request.data.get("voice_type", "mentor")

        if not text:
            return Response({"error": "Matn yuborilmadi"}, status=400)

        tts = AishaTTSService()
        audio_url = async_to_sync(tts.synthesize)(text, voice_type)
        return Response({"audio_url": audio_url})


class VoiceChatView(APIView):
    """To'liq pipeline: Audio → STT → RAG → TTS → Audio URL"""
    parser_classes = [MultiPartParser]

    def post(self, request):
        audio_file = request.FILES.get("audio")
        voice_type = request.data.get("voice_type", "mentor")

        if not audio_file:
            return Response({"error": "Audio yuborilmadi"}, status=400)

        # 1. STT
        stt = AishaSTTService()
        stt_result = async_to_sync(stt.transcribe)(audio_file.read())
        user_text = stt_result["transcript"]

        # 2. RAG
        rag = RAGService()
        bot_response = rag.get_answer(user_text)

        # 3. TTS
        tts = AishaTTSService()
        audio_url = async_to_sync(tts.synthesize)(bot_response, voice_type)

        return Response({
            "user_text": user_text,
            "bot_response": bot_response,
            "audio_url": audio_url,
        })
```

---

## apps/simulator/data.py (Sintetik stsenariylar)

```python
SCENARIOS = [
    {
        "id": 1,
        "title": "Qiyin mijoz: Kredit rad etildi",
        "description": "Mijoz kreditga rad javob olgandan keyin g'azablanib keldi.",
        "scenario_type": "COMPLAINT",
        "difficulty": "HARD",
        "max_score": 100,
        "steps": [
            {
                "step": 1,
                "client_message": "Sizlarning bankingiz menga nima uchun kredit bermadi?! Bu adolatsizlik!",
                "correct_answer_keywords": ["tushunaman", "sabab", "ko'rib chiqamiz", "yordam"],
                "hint": "Mijozni tinglang va vaziyatni tushuning",
                "score": 30,
            },
            {
                "step": 2,
                "client_message": "Men 5 yildan beri mijozingizman! Bu qanday munosabat?!",
                "correct_answer_keywords": ["qadrlaymiz", "rahmat", "imkoniyat", "qayta ko'rib"],
                "hint": "Mijozning sodiqligini tan oling",
                "score": 35,
            },
            {
                "step": 3,
                "client_message": "Xo'sh, endi nima qilishim kerak?",
                "correct_answer_keywords": ["hujjat", "murojaat", "yordam", "yo'l"],
                "hint": "Aniq yechim taklif qiling",
                "score": 35,
            },
        ],
    },
    {
        "id": 2,
        "title": "Depozit ochish",
        "description": "Mijoz 50 million so'm depozit ochmoqchi.",
        "scenario_type": "DEPOSIT",
        "difficulty": "EASY",
        "max_score": 100,
        "steps": [
            {
                "step": 1,
                "client_message": "Salom, depozit ochmoqchiman. Qanday shartlar bor?",
                "correct_answer_keywords": ["xush kelibsiz", "shartlar", "muddат", "foiz"],
                "hint": "Depozit shartlarini tushuntiring",
                "score": 40,
            },
            {
                "step": 2,
                "client_message": "6 oylik qo'ysam necha foiz bo'ladi?",
                "correct_answer_keywords": ["foiz", "yillik", "hisoblanadi", "stavka"],
                "hint": "Aniq foiz stavkasini ayting",
                "score": 30,
            },
            {
                "step": 3,
                "client_message": "Yaxshi, ochib bering. Pasportim shu yerda.",
                "correct_answer_keywords": ["pasport", "shartnoma", "raqam", "tasdiqlang"],
                "hint": "Hujjatlarni qabul qiling va jarayon boshlang",
                "score": 30,
            },
        ],
    },
]
```

---

## apps/simulator/services.py

```python
from django.conf import settings
from langchain_groq import ChatGroq
from asgiref.sync import async_to_sync
from apps.voice.services import AishaTTSService
from .data import SCENARIOS
from .models import QuestResult


class SimulatorService:
    def get_scenarios(self, learning_path: str) -> list:
        """Learning path bo'yicha filtrlab qaytaradi"""
        return SCENARIOS

    def evaluate_answer(self, answer: str, keywords: list) -> bool:
        answer_lower = answer.lower()
        return any(kw.lower() in answer_lower for kw in keywords)

    def calculate_score(self, base_score: int, time_spent: int, mistakes: int) -> int:
        score = base_score
        if time_spent < 60:
            score += 5  # Tez bajarish bonusi
        score -= mistakes * 5
        return max(0, score)


class DifficultClientService:
    """Groq bilan qiyin mijoz rolini o'ynaydi"""

    def __init__(self):
        self.llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.7,
        )

    def get_client_response(self, scenario: str, employee_message: str, history: list) -> dict:
        messages = [
            {
                "role": "system",
                "content": f"""Sen Turonbank mijozisan. {scenario}
Xizmatdan norozi, emotsional, lekin haqiqiy odam kabi gapirasan.
Hodim to'g'ri munosabat ko'rsatsa, asta-sekin tinchlanasan.
Faqat o'zbek tilida, qisqa (1-2 jumla) javob ber.""",
            }
        ]

        for h in history:
            messages.append({"role": "user", "content": h["employee"]})
            messages.append({"role": "assistant", "content": h["client"]})

        messages.append({"role": "user", "content": employee_message})

        from langchain_groq import ChatGroq
        from langchain.schema import SystemMessage, HumanMessage, AIMessage

        groq_messages = [SystemMessage(content=messages[0]["content"])]
        for msg in messages[1:]:
            if msg["role"] == "user":
                groq_messages.append(HumanMessage(content=msg["content"]))
            else:
                groq_messages.append(AIMessage(content=msg["content"]))

        response = self.llm.invoke(groq_messages)
        client_text = response.content

        # AISHA AI bilan ovozli javob
        tts = AishaTTSService()
        audio_url = async_to_sync(tts.synthesize)(client_text, "difficult_client")

        return {"client_text": client_text, "audio_url": audio_url}
```

---

## apps/gamification/models.py

```python
from django.db import models
from apps.users.models import User


class Badge(models.Model):
    class ConditionType(models.TextChoices):
        SPEED = "SPEED", "Tezlik"
        PERFECT = "PERFECT", "Mukammal"
        STREAK = "STREAK", "Streak"
        FIRST_DAY = "FIRST_DAY", "Birinchi kun"

    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=10)  # emoji
    condition_type = models.CharField(max_length=20, choices=ConditionType.choices)
    awarded_to = models.ManyToManyField(User, blank=True, related_name="badges")

    def __str__(self):
        return f"{self.icon} {self.name}"


class QuestResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    scenario_id = models.IntegerField()
    scenario_title = models.CharField(max_length=200)
    score = models.IntegerField()
    max_score = models.IntegerField()
    time_spent_seconds = models.IntegerField()
    mistakes = models.JSONField(default=list)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]
```

---

## apps/gamification/services.py

```python
from .models import Badge, QuestResult
from apps.users.models import UserProgress


BADGE_DEFINITIONS = [
    {"name": "Tez O'rganuvchi", "icon": "⚡", "condition_type": "SPEED",
     "description": "Onboarding'ni 3 kunda tugatdingiz!"},
    {"name": "Mukammal Xizmat", "icon": "🏆", "condition_type": "PERFECT",
     "description": "3 ta stsenariyni xatosiz o'tdingiz!"},
    {"name": "Aniq Javob", "icon": "🎯", "condition_type": "STREAK",
     "description": "5 ta savolga ketma-ket to'g'ri javob berdingiz!"},
    {"name": "Birinchi Kun Yulduzi", "icon": "🌟", "condition_type": "FIRST_DAY",
     "description": "Birinchi kuni barcha vazifani bajardingiz!"},
    {"name": "Streak Master", "icon": "🔥", "condition_type": "STREAK",
     "description": "7 kun ketma-ket kirdingiz!"},
]


def ensure_badges_exist():
    for bd in BADGE_DEFINITIONS:
        Badge.objects.get_or_create(
            name=bd["name"],
            defaults={
                "icon": bd["icon"],
                "condition_type": bd["condition_type"],
                "description": bd["description"],
            },
        )


def update_progress_after_quest(user, quest_result: QuestResult):
    progress, _ = UserProgress.objects.get_or_create(user=user)
    progress.total_score += quest_result.score
    progress.completed_quests += 1

    total_quests = 10  # Demo uchun
    progress.completion_percentage = min(
        100, (progress.completed_quests / total_quests) * 100
    )
    progress.save()

    check_and_award_badges(user, progress, quest_result)
    return progress


def check_and_award_badges(user, progress, quest_result):
    ensure_badges_exist()

    # Mukammal — xatosiz
    if quest_result.score == quest_result.max_score:
        badge = Badge.objects.filter(condition_type="PERFECT").first()
        if badge:
            badge.awarded_to.add(user)

    # Birinchi kun
    from django.utils import timezone
    if user.created_at.date() == timezone.now().date() and progress.completed_quests >= 1:
        badge = Badge.objects.filter(condition_type="FIRST_DAY").first()
        if badge:
            badge.awarded_to.add(user)


def get_leaderboard():
    from apps.users.models import UserProgress
    return (
        UserProgress.objects.select_related("user")
        .filter(user__role="EMPLOYEE")
        .order_by("-total_score")[:10]
    )
```

---

## apps/gamification/views.py

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Badge, QuestResult
from .services import get_leaderboard
from apps.users.models import UserProgress


class ProgressView(APIView):
    def get(self, request):
        progress, _ = UserProgress.objects.get_or_create(user=request.user)
        badges = request.user.badges.all()
        results = QuestResult.objects.filter(user=request.user)[:5]

        return Response({
            "total_score": progress.total_score,
            "completed_quests": progress.completed_quests,
            "completion_percentage": round(progress.completion_percentage, 1),
            "current_streak": progress.current_streak,
            "badges": [
                {"name": b.name, "icon": b.icon, "description": b.description}
                for b in badges
            ],
            "recent_results": [
                {
                    "scenario": r.scenario_title,
                    "score": r.score,
                    "max_score": r.max_score,
                    "completed_at": r.completed_at,
                }
                for r in results
            ],
        })


class LeaderboardView(APIView):
    def get(self, request):
        leaderboard = get_leaderboard()
        data = [
            {
                "rank": i + 1,
                "full_name": p.user.full_name,
                "branch": p.user.branch,
                "total_score": p.total_score,
                "completed_quests": p.completed_quests,
                "completion_percentage": round(p.completion_percentage, 1),
                "is_current_user": p.user == request.user,
            }
            for i, p in enumerate(leaderboard)
        ]
        return Response(data)


class BadgesView(APIView):
    def get(self, request):
        all_badges = Badge.objects.all()
        user_badges = request.user.badges.all()

        return Response([
            {
                "name": b.name,
                "icon": b.icon,
                "description": b.description,
                "earned": b in user_badges,
            }
            for b in all_badges
        ])
```

---

## apps/analytics/views.py

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.users.models import User, UserProgress


class OverviewView(APIView):
    def get(self, request):
        if request.user.role not in ["HR", "ADMIN"]:
            return Response({"error": "Ruxsat yo'q"}, status=403)

        total = User.objects.filter(role="EMPLOYEE").count()
        completed = User.objects.filter(role="EMPLOYEE", onboarding_completed=True).count()
        avg_score = 0

        progresses = UserProgress.objects.filter(user__role="EMPLOYEE")
        if progresses.exists():
            avg_score = sum(p.total_score for p in progresses) / progresses.count()

        return Response({
            "total_employees": total,
            "completed_onboarding": completed,
            "in_progress": total - completed,
            "average_score": round(avg_score, 1),
            "completion_rate": round((completed / total * 100) if total else 0, 1),
        })


class EmployeesView(APIView):
    def get(self, request):
        if request.user.role not in ["HR", "ADMIN"]:
            return Response({"error": "Ruxsat yo'q"}, status=403)

        employees = User.objects.filter(role="EMPLOYEE").select_related("progress")
        data = []
        for emp in employees:
            progress = getattr(emp, "progress", None)
            data.append({
                "id": emp.id,
                "full_name": emp.full_name,
                "department": emp.department,
                "branch": emp.branch,
                "position": emp.position,
                "learning_path": emp.learning_path,
                "total_score": progress.total_score if progress else 0,
                "completion_percentage": round(progress.completion_percentage, 1) if progress else 0,
                "completed_quests": progress.completed_quests if progress else 0,
                "onboarding_completed": emp.onboarding_completed,
            })

        return Response(data)
```

---

## config/urls.py

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/chatbot/", include("apps.chatbot.urls")),
    path("api/voice/", include("apps.voice.urls")),
    path("api/simulator/", include("apps.simulator.urls")),
    path("api/gamification/", include("apps.gamification.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
]
```

---

## Management Command: Sintetik ma'lumotlar yuklash

```python
# apps/users/management/commands/seed_data.py
from django.core.management.base import BaseCommand
from apps.users.models import User, UserProgress
from apps.gamification.services import ensure_badges_exist


class Command(BaseCommand):
    help = "Demo uchun sintetik ma'lumotlar yuklash"

    def handle(self, *args, **kwargs):
        ensure_badges_exist()

        # HR user
        hr, _ = User.objects.get_or_create(
            email="hr@turonbank.uz",
            defaults={
                "username": "hr@turonbank.uz",
                "full_name": "Malika Yusupova",
                "role": "HR",
                "branch": "Bosh ofis",
            },
        )
        hr.set_password("demo1234")
        hr.save()

        # Demo hodimlar
        employees = [
            {"email": "ali@turonbank.uz", "full_name": "Ali Karimov",
             "position": "Kassir", "learning_path": "CASHIER",
             "branch": "Chilonzor filiali", "department": "Kassa bo'limi"},
            {"email": "zulfiya@turonbank.uz", "full_name": "Zulfiya Nazarova",
             "position": "Kreditchi", "learning_path": "CREDIT",
             "branch": "Yunusobod filiali", "department": "Kredit bo'limi"},
            {"email": "bobur@turonbank.uz", "full_name": "Bobur Toshmatov",
             "position": "Operatsionist", "learning_path": "OPERATIONS",
             "branch": "Bosh ofis", "department": "Operatsiyalar bo'limi"},
        ]

        for emp_data in employees:
            emp, created = User.objects.get_or_create(
                email=emp_data["email"],
                defaults={
                    "username": emp_data["email"],
                    "role": "EMPLOYEE",
                    **emp_data,
                },
            )
            if created:
                emp.set_password("demo1234")
                emp.save()
                UserProgress.objects.create(
                    user=emp,
                    total_score=0,
                    completed_quests=0,
                )

        self.stdout.write(self.style.SUCCESS("Sintetik ma'lumotlar muvaffaqiyatli yuklandi!"))
        self.stdout.write("HR: hr@turonbank.uz / demo1234")
        self.stdout.write("Hodim: ali@turonbank.uz / demo1234")
```

---

## Ishga Tushirish

```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data        # Demo ma'lumotlar yuklash
python manage.py runserver        # :8000 da ishga tushadi
```

---

## Muhim Eslatmalar

1. SQLite ishlatiladi — Docker shart emas
2. ChromaDB lokal `chroma_db/` papkasida saqlanadi
3. AISHA API so'rovlari `async_to_sync` orqali sinxron qilinadi
4. RAG chain Singleton pattern — faqat bir marta yuklanadi
5. Barcha endpointlar JWT talab qiladi (`AllowAny` faqat `/api/auth/login/` da)
6. CORS faqat `localhost:5173` uchun ochiq
# AI-Mentor: Turonbank — ML Prompt (Claude Code)

Sen ML/AI qismini yozuvchi dasturchisisisan. Bu qism Django backend ichida ishlaydi —
alohida servis yo'q. Barcha AI logika `backend/apps/` ichida joylashadi.

---

## Mas'uliyat Sohalari

| Qism | Texnologiya | Fayl joyi |
|------|-------------|-----------|
| RAG Pipeline | LangChain + ChromaDB + Groq | `apps/chatbot/services.py` |
| Qiyin mijoz agenti | LangChain + Groq | `apps/simulator/services.py` |
| AISHA AI wrapper | httpx (async) | `apps/voice/services.py` |
| Sintetik ma'lumotlar | Python dict/list | `apps/simulator/data.py` |
| Embedding model | sentence-transformers | `apps/chatbot/services.py` |

---

## Kerakli kutubxonalar (backend/requirements.txt ga qo'shiladi)

```
langchain>=0.2.0
langchain-groq>=0.1.0
langchain-community>=0.2.0
chromadb>=0.5.0
sentence-transformers>=3.0.0
httpx>=0.27.0
```

---

## 1. RAG PIPELINE — apps/chatbot/services.py

```python
"""
RAG (Retrieval-Augmented Generation) pipeline.

Qanday ishlaydi:
1. Django ishga tushganda sintetik bank hujjatlari ChromaDB ga yuklanadi
2. Foydalanuvchi savol berganda, ChromaDB dan eng o'xshash 3 ta chunk topiladi
3. Topilgan chunk'lar kontekst sifatida Groq LLM ga yuboriladi
4. LLM o'zbek tilida aniq javob qaytaradi

Singleton pattern ishlatiladi — RAG chain faqat bir marta yuklanadi.
"""

import logging
from django.conf import settings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

logger = logging.getLogger(__name__)

# ============================================================
# SINTETIK BANK HUJJATLARI
# Haqiqiy hujjat yo'q — demo uchun to'liq sintetik ma'lumotlar
# ============================================================

BANK_DOCUMENTS = [
    # --- UMUMIY QOIDALAR ---
    """
    TURONBANK ICHKI MEHNAT TARTIBI QO'LLANMASI

    1. ISH VAQTI VA TARTIB
    Ish vaqti: Dushanba-Juma 09:00-18:00, Shanba 09:00-13:00, Yakshanba dam olish kuni.
    Tushlik tanaffusi: 13:00-14:00 (1 soat).
    Kechikish: Oyda 3 martadan ortiq kechikish ogohlantirishga olib keladi.
    Erta ketish: Rahbar ruxsatisiz erta ketish man etiladi.

    2. MEHNAT TA'TILI
    Asosiy ta'til: Yiliga 24 ish kuni.
    Qo'shimcha ta'til: 3 yildan ortiq staj uchun +3 kun.
    Kasallik varag'i: Tibbiy muassasa tomonidan tasdiqlangan holda to'lanadi.

    3. ISH HAQI
    Asosiy ish haqi: Har oyning 5-sanasida.
    Avans: Har oyning 20-sanasida (ish haqining 40%).
    Bonus: Choraklik KPI baholash natijasiga ko'ra.

    4. KORPORATIV KOMMUNIKATSIYA
    Email format: ism.familiya@turonbank.uz
    Korporativ telefon: Faqat ish maqsadida ishlatiladi.
    Ijtimoiy tarmoqlar: Bank nomidan post qo'yish taqiqlanadi.
    """,

    # --- DRESS-CODE ---
    """
    TURONBANK DRESS-CODE TALABLARI

    ERKAKLAR UCHUN:
    Kostyum: Klassik kostyum (qora, to'q ko'k, kulrang, qo'ng'ir ranglar).
    Ko'ylak: Oq yoki och rangli, dazmollangan holda.
    Galstuk: Majburiy, rang kostyumga mos bo'lishi kerak.
    Poyabzal: Klassik charm poyabzal, toza va parvarishlangan.
    Sport kiyim, jinsi shim, futbolka mutlaqo taqiqlanadi.

    AYOLLAR UCHUN:
    Kiyim: Klassik kostyum yoki yubka-bluza kombinatsiyasi.
    Rang: Konservativ ranglar (qora, kulrang, ko'k, qo'ng'ir, bej).
    Soch: Tartibli, haddan tashqari bo'yoq taqiqlanadi.
    Taqinchoq: Minimal, diqqatni jalb qilmaydigan.
    Sport kiyim, qisqa yubka (tizzadan yuqori), shaffof kiyim taqiqlanadi.

    UMUMIY TALABLAR:
    Kiyim doimo toza, dazmollangan va yaxshi holda bo'lishi shart.
    Atir: Kuchli hidli atir ishlatish taqiqlanadi.
    Naqsh: Haddan tashqari yorqin naqshlar taqiqlanadi.
    """,

    # --- KASSA OPERATSIYALARI ---
    """
    KASSA OPERATSIYALARI BO'YICHA YO'RIQNOMA

    KASSIRNING KUNLIK TARTIBI:
    1. Ish boshida kassani qabul qilish: sana, mablag', imzo.
    2. Kassir shifri va ish stantsiyasini tekshirish.
    3. Qoldiq pul miqdorini limit bilan taqqoslash.

    NAQD PUL QABUL QILISH TARTIBI:
    1. To'lov hujjatini tekshirish (to'lov maqsadi, summa, imzo).
    2. Pulni mashina orqali hisoblash va banknotlarni tekshirish.
    3. Tizimda operatsiyani rasmiylash.
    4. Kvitansiyani chop etib mijozga berish.
    5. Pul va hujjatni arxivlash.

    NAQD PUL BERISH TARTIBI:
    1. Pasport va so'rov hujjatini tekshirish.
    2. Tizimda mijoz ma'lumotlarini tekshirish.
    3. Tizimda operatsiyani tasdiqlash.
    4. Pulni hisoblash, tekshirish va berish.
    5. Mijozdan imzo olish.

    KUN YAKUNIDA:
    1. Kassa hisobotini tuzish.
    2. Naqd pulni sanktsiyalash.
    3. Inkassatsiyaga topshirish va dalolatnoma rasmiylashtirish.
    4. Barcha hujjatlarni arxivlash.

    MUHIM: Kassa xatosi aniqlanganda darhol nazoratchi xabardor qilinadi.
    Kassir o'z kassasini boshqa xodimga topshira olmaydi.
    """,

    # --- KREDIT BERISH ---
    """
    KREDIT MAHSULOTLARI VA BERISH TARTIBI

    KREDIT TURLARI:
    1. Iste'mol krediti: 6-60 oy, yillik 22-26%.
    2. Ipoteka krediti: 5-25 yil, yillik 18-22%.
    3. Avtomobil krediti: 12-60 oy, yillik 20-24%.
    4. Biznes krediti: 3-84 oy, yillik 24-28%.
    5. Mikrokredit: 3-24 oy, yillik 26-30%.

    KREDIT BERISH TARTIBI:
    1-QADAM — ARIZA QABUL QILISH:
    Talab qilinadigan hujjatlar:
    - Pasport (asl nusxa va fotokopiya)
    - JSHSHIR (mahalla yoki IIV tomonidan tasdiqlangan)
    - So'nggi 6 oylik daromad ma'lumotnomasi
    - Garov hujjatlari (agar garovli kredit bo'lsa)
    - Nikoh guvohnomasi (turmush o'rtoq kafolatchisi bo'lsa)

    2-QADAM — TAHLIL VA TEKSHIRISH:
    - Kredit tarixi NBKI (Kredit byurosi) tizimida tekshiriladi
    - Daromad to'lovga layoqatlilik koeffitsienti hisoblanadi
    - Garov qiymati baholanadi
    - Mijozning joriy majburiyatlari tekshiriladi

    3-QADAM — QAROR:
    - Kredit qo'mitasi 3 ish kuni ichida qaror qabul qiladi
    - Yirik kreditlar (500 mln+) Bosh ofis tasdiqlaydi
    - Rad etilgan taqdirda sabablar yozma shaklda beriladi

    4-QADAM — SHARTNOMA:
    - Kredit shartnomasi 2 nusxada imzolanadi
    - Garov shartnomasi notarial tasdiqlangan bo'lishi kerak
    - Sug'urta shartnomasi (avtomobil, ipotekada majburiy)

    MUHIM QOIDALAR:
    - Oylik to'lov oylik daromadning 50% dan oshmasligi kerak
    - Kredit tarixi salbiy mijozlarga kredit berilmaydi
    - Hujjatlar to'liq bo'lmasa ariza ko'rib chiqilmaydi
    """,

    # --- DEPOZIT ---
    """
    DEPOZIT MAHSULOTLARI

    DEPOZIT TURLARI:
    1. "Omad" (talab bo'yicha): Yillik 12%, istalgan vaqt olinadi.
    2. "Farovonlik" (3 oy): Yillik 16%, muddatdan oldin foiz yo'qoladi.
    3. "Baraka" (6 oy): Yillik 18%, kapitallashtirilgan.
    4. "Gulbahor" (12 oy): Yillik 20%, oylik foiz to'lanadi.
    5. "Istiqbol" (24 oy): Yillik 22%, eng yuqori stavka.
    6. Valyuta depoziti (USD): Yillik 4-6%, 3-24 oy.

    DEPOZIT OCHISH TARTIBI:
    1. Pasport taqdim etish.
    2. Depozit turini va muddatini tanlash.
    3. Tizimda hisob raqam ochish.
    4. Pul qo'yish (naqd yoki o'tkazma).
    5. Shartnomani imzolash va nusxa olish.
    6. SMS xabarnomani ulash.

    MUHIM SHARTLAR:
    - Minimal summa: 500,000 so'm (naqd), 1,000,000 so'm (o'tkazma).
    - Foizlar oylik yoki muddati tugaganda to'lanadi (depozit turiga qarab).
    - Muddatdan oldin yopish: asosiy summa qaytariladi, foiz yo'qoladi.
    - Depozit merosga o'tadi (vafot holatida).
    - Depozit kafolat sifatida kredit olishda garov bo'la oladi.
    """,

    # --- PLASTIK KARTA ---
    """
    PLASTIK KARTA XIZMATLARI

    KARTA TURLARI:
    1. Uzcard (milliy): Faqat O'zbekiston ichida, yillik xizmat 30,000 so'm.
    2. Visa Classic: Xalqaro, yillik xizmat 150,000 so'm.
    3. Visa Gold: Premium, yillik xizmat 300,000 so'm.
    4. Mastercard Standard: Xalqaro, yillik xizmat 180,000 so'm.
    5. Korporativ karta: Yuridik shaxslar uchun.

    KARTA CHIQARISH:
    - Muddati: 3-5 ish kuni (standart), 1 kun (tezkor, qo'shimcha to'lov).
    - Talab: Pasport, ariza.
    - PIN kod: Faqat mijozning o'zi bilishi kerak — hech kimga aytilmaydi.

    KARTA XIZMATLARINI BOSHQARISH:
    - Balans: *100# yoki mobil ilova orqali.
    - O'tkazma: Internet banking yoki filialda.
    - Bloklash: +998 71 200-00-00 (24/7) yoki mobil ilovada.
    - Limit o'zgartirish: Filialda yoki internet banking da.

    XAVFSIZLIK QOIDALARI:
    - SMS kodlarni hech kimga bermang (bank xodimlari ham so'ramaydi).
    - Noma'lum saytlarda karta ma'lumotlarini kiritmang.
    - Shubhali operatsiya bo'lsa, darhol kartani bloklang.
    - Karta raqami, CVV va PIN birga saqlanmaydi.
    """,

    # --- PLASTIK KARTA O'TKAZMA ---
    """
    PUL O'TKAZMALARI VA TO'LOVLAR

    ICHKI O'TKAZMALAR (Turonbank ichida):
    - Komissiya: Bepul.
    - Vaqt: Darhol (real vaqtda).
    - Limit: Kunlik 50,000,000 so'm.

    TASHQI O'TKAZMALAR (Boshqa banklarga):
    - Komissiya: 0.3% (minimal 5,000 so'm).
    - Vaqt: 1-2 ish kuni.
    - SWIFT o'tkazma: Xalqaro, 1-3 ish kuni, tarif kelishuvga qarab.

    TO'LOV XIZMATLARI:
    - Kommunal to'lovlar: Gaz, elektr, suv, internet, TV.
    - Davlat to'lovlari: Soliq, jarima, davlat boji.
    - Mobil to'ldirish: Barcha operatorlar.
    - Kredit to'lash: Barcha banklar krediti.

    INTERNET BANKING:
    - Ro'yxatdan o'tish: Filialda yoki onlayn.
    - Xavfsizlik: SMS tasdiq kodi (OTP) har bir operatsiyada.
    - Sessiya: 10 daqiqa faolsizlikdan keyin avtomatik chiqish.
    """,

    # --- FAQ ---
    """
    TEZKOR SAVOL-JAVOBLAR (FAQ) — YANGI HODIMLAR UCHUN

    UMUMIY SAVOLLAR:

    S: Korporativ email qachon beriladi?
    J: Ishga birinchi kuni IT bo'limi tomonidan sozlanadi.

    S: Korporativ telefon beriladi?
    J: Muloqotga doimiy ehtiyoj bo'lgan lavozimlarda beriladi. HR dan so'rang.

    S: Kasal bo'lganda nima qilish kerak?
    J: Sabah 9:00 gacha rahbar va HR ga xabar bering. Davolanish varag'ini topshiring.

    S: Mehnat ta'tili qanday olinadi?
    J: Ta'til arizasini 2 hafta oldin rahbarga topshiring. HR tasdiqlaydi.

    S: Ish joyini o'zgartirish mumkinmi?
    J: HR ga ariza yozing. Lavozimdagi bo'sh o'rinlarga ichki tanlov e'lon qilinadi.

    MOLIYAVIY SAVOLLAR:

    S: Ish haqi necha kunga kechikishi mumkin?
    J: Belgilangan sana 2 ish kuniga kechikishi mumkin. Undan ortiq — HR ga murojaat.

    S: Bonus qachon to'lanadi?
    J: Choraklik KPI natijalariga ko'ra, chorak tugaganidan 30 kun ichida.

    S: Xizmat safari uchun kompensatsiya?
    J: Transport, mehmonxona va sutkalik xarajatlar tasdiqlangan tartibda to'lanadi.

    BANK TIZIMLARIGA KIRISH:

    S: ABS (Asosiy Bank Tizimi) ga kirish uchun nima kerak?
    J: IT bo'limiga murojaat qiling. Rahbar ruxsati va o'quv kursi talab qilinadi.

    S: CRM ga kirish?
    J: Mijozlar bilan ishlash bo'limining rahbari tomonidan ruxsat beriladi.

    S: Parolni unutsam?
    J: IT qo'llab-quvvatlash xizmatiga: it.support@turonbank.uz yoki +998 71 200-00-01.

    MAXFIYLIK:

    S: Mijoz ma'lumotlarini do'stlarimga aytishim mumkinmi?
    J: YO'Q. Bu bankning maxfiylik siyosatini va qonunni buzish hisoblanadi.

    S: Bank hujjatlarini uyga olib ketsa bo'ladimi?
    J: YO'Q. Barcha hujjatlar faqat bank ichida saqlanadi.
    """,

    # --- XAVFSIZLIK ---
    """
    AXBOROT XAVFSIZLIGI QOIDALARI

    PAROL XAVFSIZLIGI:
    - Minimal uzunlik: 8 belgi.
    - Tarkib: Katta/kichik harf, raqam, maxsus belgi.
    - Yangilash: Har 90 kunda majburiy.
    - Taqiqlanadi: Ism, tug'ilgan kun, "password123" kabi oddiy parollar.
    - Bir xil parol bir necha tizimda ishlatilmasin.

    KOMPYUTER XAVFSIZLIGI:
    - Kompyuterni qulflamasdan tashlab ketish taqiqlanadi (Win+L).
    - Noma'lum flesh kartalarni ulash taqiqlanadi.
    - Litsenziyasiz dasturlar o'rnatish taqiqlanadi.
    - Shaxsiy maqsadlarda bank kompyuteridan foydalanish taqiqlanadi.

    FISHING HUJUMLARIDAN HIMOYA:
    - Shubhali emaildagi havolalarni bosmang.
    - Bank xodimlari HECH QACHON parol so'ramaydi.
    - Noma'lum yuboruvchidan kelgan fayllarni ochmang.
    - Shubhali holat aniqlansа — it.security@turonbank.uz ga xabar bering.

    MA'LUMOTLAR MAXFIYLIGI:
    - Mijoz ma'lumotlari uchinchi shaxslarga berilmaydi.
    - Bank sirlari oshkor etilganda jinoiy javobgarlik ko'zda tutiladi.
    - Ekranni fotosuratga olish va videoga olish taqiqlanadi.
    """,
]


# ============================================================
# RAG SERVICE — SINGLETON PATTERN
# ============================================================

class RAGService:
    """
    Singleton RAG servisi.
    Birinchi chaqiruvda ChromaDB yuklanadi va chain quriladi.
    Keyingi barcha chaqiruvlarda bir xil instance ishlatiladi.
    """

    _instance = None
    _qa_chain = None
    _is_initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _initialize(self):
        if self._is_initialized:
            return

        logger.info("RAG pipeline yuklanmoqda...")

        # Embedding model (ko'p tilli, o'zbek tilini ham tushunadi)
        embeddings = SentenceTransformerEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )

        # Hujjatlarni bo'laklarga ajratish
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=600,
            chunk_overlap=80,
            separators=["\n\n", "\n", ".", " "],
        )

        docs = []
        for text in BANK_DOCUMENTS:
            chunks = splitter.create_documents([text.strip()])
            docs.extend(chunks)

        logger.info(f"{len(docs)} ta chunk ChromaDB ga yuklanmoqda...")

        # ChromaDB — lokal fayl (backend/chroma_db/)
        vectorstore = Chroma.from_documents(
            documents=docs,
            embedding=embeddings,
            persist_directory=settings.CHROMA_DB_PATH,
            collection_name="turonbank_docs",
        )

        # Groq LLM
        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,  # Past temperatura — aniq, faktga asoslangan javob
            max_tokens=512,
        )

        # System prompt — AI Mentor shaxsiyati
        prompt = PromptTemplate(
            input_variables=["context", "question"],
            template="""Sen Turonbank'ning AI-Mentori — Zulfiya'san.
Yangi hodimlar va amaliyotchilarning bank ichki qoidalari, tartib va jarayonlar bo'yicha
savollariga aniq, qisqa va do'stona javob berasan.

Qoidalar:
- Faqat quyidagi ma'lumotlar asosida javob ber
- O'zbek tilida yoz
- Qisqa va aniq bo'l (3-5 jumla)
- Agar javob ma'lumotlarda bo'lmasa: "Bu haqida HR bo'limiga murojaat qiling" de
- Kredit yoki depozit haqida so'ralsa — aniq foiz va shartlarni ayt

Mavjud ma'lumotlar:
{context}

Savol: {question}

Javob:""",
        )

        self._qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3},
            ),
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=False,
        )

        self._is_initialized = True
        logger.info("RAG pipeline tayyor!")

    def get_answer(self, question: str) -> str:
        """Savol → RAG javob"""
        self._initialize()
        try:
            result = self._qa_chain.invoke({"query": question})
            return result.get("result", "Javob topilmadi. HR bo'limiga murojaat qiling.")
        except Exception as e:
            logger.error(f"RAG xato: {e}")
            return "Texnik muammo yuz berdi. Qayta urining."
```

---

## 2. QIYIN MIJOZ AGENTI — apps/simulator/services.py

```python
"""
Qiyin mijoz simulyatsiyasi.

Groq LLM mijoz rolini o'ynaydi:
- Dastlab g'azablangan/norozi
- Hodim to'g'ri munosabat ko'rsatsa, asta tinchlanadi
- Har bir javobdan keyin AISHA AI orqali ovozli javob qaytariladi

Conversation history saqlanadi — mijoz oldingi gaplarni "eslab" turadi.
"""

import logging
from django.conf import settings
from langchain_groq import ChatGroq
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from asgiref.sync import async_to_sync
from apps.voice.services import AishaTTSService

logger = logging.getLogger(__name__)


# ============================================================
# SINTETIK STSENARIYLAR
# ============================================================

SCENARIOS = [
    {
        "id": 1,
        "title": "Qiyin mijoz: Kredit rad etildi",
        "description": "Mijoz kreditga rad javob olgandan keyin g'azablanib keldi. "
                       "U 5 yillik sodiq mijoz va bunday munosabatdan norozi.",
        "scenario_type": "COMPLAINT",
        "difficulty": "HARD",
        "max_score": 100,
        "client_persona": (
            "Sen Kamoliddin, 42 yoshli tadbirkor. Turonbank'da 5 yildan beri mijozsan. "
            "Kredit so'rading — rad etildi. Sababini tushuntirishmadi. G'azablangan va xafa. "
            "Hodim to'g'ri munosabat ko'rsatsa — asta tinchlanasan."
        ),
        "initial_message": "Sizlarning bankingiz menga nima uchun kredit bermadi?! "
                           "5 yildan beri mijozingizman, bu qanday munosabat?!",
        "steps": [
            {
                "step": 1,
                "hint": "Mijozni tinglang, xafa bo'lganini tushunganingizni bildiring",
                "correct_keywords": ["tushunaman", "xafaligingizni", "tinglayman",
                                     "sabab", "ko'rib chiqamiz", "yordam"],
                "score": 30,
            },
            {
                "step": 2,
                "hint": "Mijozning 5 yillik sadoqatini qadrlaganingizni bildiring",
                "correct_keywords": ["qadrlaymiz", "rahmat", "muhim", "qayta",
                                     "imkoniyat", "bo'lim boshlig'i"],
                "score": 35,
            },
            {
                "step": 3,
                "hint": "Aniq keyingi qadam va yechim taklif qiling",
                "correct_keywords": ["hujjat", "qayta ko'rib", "bosh ofis",
                                     "murojaat", "hal qilamiz", "yo'l"],
                "score": 35,
            },
        ],
    },
    {
        "id": 2,
        "title": "Depozit ochish: Shoshilayotgan mijoz",
        "description": "Mijoz tushlik vaqtida kelib tezda depozit ochmoqchi. "
                       "Hujjatlari to'liq emas va sabrsiz.",
        "scenario_type": "DEPOSIT",
        "difficulty": "MEDIUM",
        "max_score": 100,
        "client_persona": (
            "Sen Nilufar, 35 yoshli o'qituvchi. Tushlik tanaffusida keldingiz, "
            "50 million so'm depozit qo'ymoqchisiz. Shoshilayapsiz, savollaring ko'p."
        ),
        "initial_message": "Salom, depozit qo'ymoqchiman. Tez bo'ladi, tushligim tugayapti.",
        "steps": [
            {
                "step": 1,
                "hint": "Xush kelibsiz va depozit shartlarini qisqacha tushuntiring",
                "correct_keywords": ["xush kelibsiz", "salom", "foiz", "muddat",
                                     "shartlar", "6 oy", "12 oy"],
                "score": 35,
            },
            {
                "step": 2,
                "hint": "Hujjatlar haqida so'rang va jarayonni tushuntiring",
                "correct_keywords": ["pasport", "hujjat", "summa", "qanday",
                                     "shartnoma", "daqiqa"],
                "score": 30,
            },
            {
                "step": 3,
                "hint": "Jarayonni tugatib, mijozni qoniqtiring",
                "correct_keywords": ["tayyor", "hisob", "sms", "shaxsiy kabinet",
                                     "raqam", "muammosiz"],
                "score": 35,
            },
        ],
    },
    {
        "id": 3,
        "title": "Plastik karta: SMS kod firibgarligi",
        "description": "Mijoz telefonda noma'lum shaxs uning kartasi bloklanganini aytib, "
                       "SMS kodni so'raganini aytib keldi.",
        "scenario_type": "SECURITY",
        "difficulty": "HARD",
        "max_score": 100,
        "client_persona": (
            "Sen Hamid, 60 yoshli pensioner. Telefonda kimdir o'zini bank xodimi deb tanishtirdi "
            "va SMS kodni so'radi. Siz berib qo'ydingiz. Endi kartangizdan pul ketganini ko'rdingiz. "
            "Xavotirlangan va qo'rqqansiz."
        ),
        "initial_message": "Yordam bering! Telefonda bank xodimi deb pul so'rashdi, "
                           "SMS kodini berdim, endi kartamdan pul ketib qoldi!",
        "steps": [
            {
                "step": 1,
                "hint": "Darhol kartani bloklang va mijozni tinchlantiring",
                "correct_keywords": ["tinchlaning", "darhol", "bloklaylik",
                                     "xavfsiz", "to'xtatamiz", "qarang"],
                "score": 40,
            },
            {
                "step": 2,
                "hint": "Holat va summani aniqlang, kiberjinoyat bo'limiga xabar bering",
                "correct_keywords": ["qancha", "summa", "qachon", "politsiya",
                                     "kiberjinoyat", "ariza", "hujjat"],
                "score": 30,
            },
            {
                "step": 3,
                "hint": "Bank xodimlari hech qachon SMS kod so'rasligini tushuntiring",
                "correct_keywords": ["hech qachon", "bank so'ramaydi", "firibgar",
                                     "ehtiyot", "kelajakda", "xavfsizlik"],
                "score": 30,
            },
        ],
    },
]


def get_scenarios_list():
    """Barcha stsenariylarni qaytaradi"""
    return [
        {
            "id": s["id"],
            "title": s["title"],
            "description": s["description"],
            "scenario_type": s["scenario_type"],
            "difficulty": s["difficulty"],
            "max_score": s["max_score"],
        }
        for s in SCENARIOS
    ]


def get_scenario_by_id(scenario_id: int):
    for s in SCENARIOS:
        if s["id"] == scenario_id:
            return s
    return None


# ============================================================
# QIYIN MIJOZ AGENTI
# ============================================================

class DifficultClientService:
    """
    Groq LLM qiyin mijoz rolini o'ynaydi.
    AISHA AI orqali ovozli javob ham qaytariladi.
    """

    def __init__(self):
        self.llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.75,
            max_tokens=150,  # Qisqa, real mijoz kabi
        )
        self.tts = AishaTTSService()

    def get_response(
        self,
        scenario_id: int,
        employee_message: str,
        history: list,
    ) -> dict:
        """
        Parametrlar:
          scenario_id     — stsenariy ID
          employee_message — hodimning so'nggi javobi
          history         — [{"employee": "...", "client": "..."}, ...]

        Qaytaradi:
          {"client_text": "...", "audio_url": "..."}
        """

        scenario = get_scenario_by_id(scenario_id)
        if not scenario:
            return {"client_text": "Stsenariy topilmadi.", "audio_url": ""}

        # Suhbat tarixini LangChain formatiga o'tkazish
        messages = [
            SystemMessage(content=f"""
{scenario["client_persona"]}

Qoidalar:
- Faqat o'zbek tilida gapir
- 1-2 ta qisqa jumla
- Dastlab g'azablangan, lekin hodim yaxshi javob bersa asta tinchlan
- Haqiqiy inson kabi gapir, rasmiy bo'lma
- Tarix: {len(history)} ta almashinuv o'tdi
"""),
        ]

        for h in history:
            messages.append(HumanMessage(content=h["employee"]))
            messages.append(AIMessage(content=h["client"]))

        messages.append(HumanMessage(content=employee_message))

        # Groq dan mijoz javobi
        try:
            response = self.llm.invoke(messages)
            client_text = response.content.strip()
        except Exception as e:
            logger.error(f"Groq xato: {e}")
            client_text = "Xo'sh, davom eting."

        # AISHA AI — ovozli javob (difficult_client = Sad mood)
        try:
            audio_url = async_to_sync(self.tts.synthesize)(
                client_text, "difficult_client"
            )
        except Exception as e:
            logger.error(f"AISHA TTS xato: {e}")
            audio_url = ""

        return {"client_text": client_text, "audio_url": audio_url}


# ============================================================
# BAHOLASH SERVISI
# ============================================================

class EvaluationService:
    """
    Hodim javobini baholaydi.
    Keyword-based oddiy baholash (demo uchun yetarli).
    """

    def evaluate_step(
        self,
        answer: str,
        correct_keywords: list,
        base_score: int,
        time_spent: int = 999,
    ) -> dict:
        answer_lower = answer.lower()
        matched = [kw for kw in correct_keywords if kw.lower() in answer_lower]
        is_correct = len(matched) > 0

        score = base_score if is_correct else int(base_score * 0.3)

        # Bonus: tez javob (60 sekunddan kam)
        bonus = 5 if is_correct and time_spent < 60 else 0
        total = score + bonus

        return {
            "is_correct": is_correct,
            "score": total,
            "matched_keywords": matched,
            "feedback": self._get_feedback(is_correct, matched, correct_keywords),
        }

    def _get_feedback(self, is_correct: bool, matched: list, expected: list) -> str:
        if is_correct:
            return f"✅ Zo'r! Kalit so'zlar: {', '.join(matched)}"
        return f"💡 Maslahat: Quyidagi iboralardan foydalaning: {', '.join(expected[:3])}"

    def calculate_total_score(
        self,
        step_scores: list,
        total_time: int,
        mistake_count: int,
    ) -> int:
        base = sum(step_scores)
        # Xatolar uchun chegirma
        deduction = mistake_count * 5
        # Umumiy tezlik bonusi
        speed_bonus = 10 if total_time < 180 else 0
        return max(0, base - deduction + speed_bonus)
```

---

## 3. AISHA AI WRAPPER — apps/voice/services.py

```python
"""
AISHA AI integratsiyasi.

STT: Audio (wav) → O'zbek matni
TTS: O'zbek matni → Audio URL (cdn.aisha.group)

Barcha so'rovlar async, Django da async_to_sync orqali ishlatiladi.
"""

import logging
import httpx
from django.conf import settings

logger = logging.getLogger(__name__)

AISHA_HEADERS = {"X-Api-Key": settings.AISHA_API_KEY}

VOICE_CONFIG = {
    "mentor":           {"model": "Gulnoza", "mood": "Cheerful"},
    "client":           {"model": "Gulnoza", "mood": "Neutral"},
    "difficult_client": {"model": "Gulnoza", "mood": "Sad"},
    "congratulation":   {"model": "Gulnoza", "mood": "Happy"},
}


class AishaSTTService:
    """Audio fayl → O'zbek matni"""

    async def transcribe(self, audio_bytes: bytes, filename: str = "recording.wav") -> dict:
        """
        Qaytaradi:
          {"transcript": "...", "duration": 3.2, "gender": "unknown"}
        """
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{settings.AISHA_BASE_URL}/api/v1/stt/post/",
                    headers=AISHA_HEADERS,
                    files={"audio": (filename, audio_bytes, "audio/wav")},
                    data={"language": "uz"},
                )
                response.raise_for_status()
                return response.json()
        except httpx.TimeoutException:
            logger.error("AISHA STT timeout")
            return {"transcript": "", "duration": 0, "gender": "unknown"}
        except Exception as e:
            logger.error(f"AISHA STT xato: {e}")
            return {"transcript": "", "duration": 0, "gender": "unknown"}


class AishaTTSService:
    """O'zbek matni → Audio URL"""

    async def synthesize(self, text: str, voice_type: str = "mentor") -> str:
        """
        Qaytaradi: audio URL (https://cdn.aisha.group/...wav)
        """
        if not text or not text.strip():
            return ""

        voice = VOICE_CONFIG.get(voice_type, VOICE_CONFIG["mentor"])

        # Matn juda uzun bo'lsa qisqartirish (TTS limit)
        text = text[:500] if len(text) > 500 else text

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{settings.AISHA_BASE_URL}/api/v1/tts/post/",
                    headers={**AISHA_HEADERS, "Content-Type": "application/json"},
                    json={
                        "transcript": text,
                        "language": "uz",
                        "model": voice["model"],
                        "mood": voice["mood"],
                    },
                )
                response.raise_for_status()
                return response.json().get("audio_path", "")
        except httpx.TimeoutException:
            logger.error("AISHA TTS timeout")
            return ""
        except Exception as e:
            logger.error(f"AISHA TTS xato: {e}")
            return ""
```

---

## 4. SIMULATOR VIEWS — apps/simulator/views.py

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from apps.voice.services import AishaTTSService
from apps.gamification.services import update_progress_after_quest
from .services import (
    get_scenarios_list, get_scenario_by_id,
    DifficultClientService, EvaluationService,
)
from .models import QuestResult


class ScenariosView(APIView):
    def get(self, request):
        return Response(get_scenarios_list())


class StartScenarioView(APIView):
    def post(self, request):
        scenario_id = request.data.get("scenario_id")
        scenario = get_scenario_by_id(scenario_id)
        if not scenario:
            return Response({"error": "Stsenariy topilmadi"}, status=404)

        # Dastlabki mijoz xabari uchun audio
        tts = AishaTTSService()
        audio_url = async_to_sync(tts.synthesize)(
            scenario["initial_message"], "difficult_client"
        )

        return Response({
            "scenario_id": scenario["id"],
            "title": scenario["title"],
            "description": scenario["description"],
            "initial_message": scenario["initial_message"],
            "audio_url": audio_url,
            "steps": scenario["steps"],
            "max_score": scenario["max_score"],
        })


class DifficultClientView(APIView):
    """Hodim javob berdi → mijoz reaktsiyasi"""

    def post(self, request):
        scenario_id = request.data.get("scenario_id")
        employee_message = request.data.get("employee_message", "")
        history = request.data.get("history", [])

        service = DifficultClientService()
        result = service.get_response(scenario_id, employee_message, history)
        return Response(result)


class SubmitAnswerView(APIView):
    """Bir qadam javobini baholash"""

    def post(self, request):
        scenario_id = request.data.get("scenario_id")
        step_index = request.data.get("step_index", 0)
        answer = request.data.get("answer", "")
        time_spent = request.data.get("time_spent", 999)

        scenario = get_scenario_by_id(scenario_id)
        if not scenario:
            return Response({"error": "Stsenariy topilmadi"}, status=404)

        steps = scenario["steps"]
        if step_index >= len(steps):
            return Response({"error": "Noto'g'ri qadam"}, status=400)

        current_step = steps[step_index]
        evaluator = EvaluationService()
        result = evaluator.evaluate_step(
            answer=answer,
            correct_keywords=current_step["correct_keywords"],
            base_score=current_step["score"],
            time_spent=time_spent,
        )

        return Response(result)


class FinishScenarioView(APIView):
    """Stsenariy yakunlandi — natija saqlash"""

    def post(self, request):
        scenario_id = request.data.get("scenario_id")
        total_score = request.data.get("total_score", 0)
        time_spent = request.data.get("time_spent_seconds", 0)
        mistakes = request.data.get("mistakes", [])

        scenario = get_scenario_by_id(scenario_id)
        if not scenario:
            return Response({"error": "Stsenariy topilmadi"}, status=404)

        quest_result = QuestResult.objects.create(
            user=request.user,
            scenario_id=scenario_id,
            scenario_title=scenario["title"],
            score=total_score,
            max_score=scenario["max_score"],
            time_spent_seconds=time_spent,
            mistakes=mistakes,
        )

        # Progress va badge yangilash
        progress = update_progress_after_quest(request.user, quest_result)

        # Tabrik audio
        tts = AishaTTSService()
        congrats_text = f"Tabriklayman! {total_score} ball to'pladingiz. Zo'r natija!"
        audio_url = async_to_sync(tts.synthesize)(congrats_text, "congratulation")

        return Response({
            "score": total_score,
            "max_score": scenario["max_score"],
            "percentage": round(total_score / scenario["max_score"] * 100, 1),
            "total_score_overall": progress.total_score,
            "congrats_audio": audio_url,
        })
```

---

## 5. SIMULATOR URLS — apps/simulator/urls.py

```python
from django.urls import path
from .views import (
    ScenariosView, StartScenarioView,
    DifficultClientView, SubmitAnswerView, FinishScenarioView,
)

urlpatterns = [
    path("scenarios/", ScenariosView.as_view()),
    path("start/", StartScenarioView.as_view()),
    path("difficult-client/", DifficultClientView.as_view()),
    path("submit/", SubmitAnswerView.as_view()),
    path("finish/", FinishScenarioView.as_view()),
]
```

---

## 6. SIMULATOR MODEL — apps/simulator/models.py

```python
from django.db import models
from apps.users.models import User


class QuestResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quest_results")
    scenario_id = models.IntegerField()
    scenario_title = models.CharField(max_length=200)
    score = models.IntegerField()
    max_score = models.IntegerField()
    time_spent_seconds = models.IntegerField(default=0)
    mistakes = models.JSONField(default=list)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.user.full_name} — {self.scenario_title}: {self.score}/{self.max_score}"
```

---

## Test: RAG ishlayotganini tekshirish

```python
# python manage.py shell da ishga tushiring

from apps.chatbot.services import RAGService

rag = RAGService()

test_questions = [
    "Ish vaqti qanday?",
    "Kredit olish uchun qanday hujjatlar kerak?",
    "Dress-code talablari nima?",
    "Depozit foizi qancha?",
    "Kasal bo'lsam nima qilaman?",
]

for q in test_questions:
    answer = rag.get_answer(q)
    print(f"\nS: {q}")
    print(f"J: {answer}")
    print("-" * 50)
```

---

## Muhim Eslatmalar

1. **RAG Singleton** — `RAGService()` bir marta yuklanadi, har chaqiruvda qayta yuklanmaydi
2. **ChromaDB** — `backend/chroma_db/` papkasida lokal saqlanadi, `.gitignore` ga qo'shing
3. **Groq temperature** — RAG uchun `0.2` (aniq), qiyin mijoz uchun `0.75` (kreativ)
4. **AISHA timeout** — 30 soniya, xato bo'lsa bo'sh string qaytariladi (frontend handle qiladi)
5. **Matn uzunligi** — TTS ga 500 belgidan uzun matn yuborilmaydi
6. **Embedding model** — `paraphrase-multilingual-MiniLM-L12-v2` o'zbek tilini tushunadi
7. **Stsenariy baholash** — keyword-based, demo uchun yetarli, real loyihada NLP ishlatish mumkin

---

## 7. AVTOMATIK INITSIALIZATSIYA — "Initialize Once" Pattern

```
Loyiha birinchi marta ishga tushganda:
  1. ChromaDB papkasi yo'q → RAG hujjatlar yuklanadi
  2. DB da hodim yo'q → sintetik hodimlar yaratiladi
  3. Badge yo'q → standart badge'lar yaratiladi

Keyingi ishga tushirishlarda:
  1. ChromaDB papkasi bor → o'tkazib yuboriladi
  2. DB da hodimlar bor → o'tkazib yuboriladi
  3. Badge'lar bor → o'tkazib yuboriladi
```

---

### apps/core/ — yangi app yarating

```
backend/apps/core/
├── __init__.py
├── apps.py          ← AppConfig.ready() shu yerda
└── init_data.py     ← barcha initsializatsiya logikasi
```

---

### apps/core/apps.py

```python
from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class CoreConfig(AppConfig):
    name = "apps.core"
    verbose_name = "Core"

    def ready(self):
        """
        Django ishga tushganda bir marta chaqiriladi.
        migrate, shell, test kabi commandlarda ham chaqiriladi —
        shuning uchun ichida mavjudlikni tekshiramiz.
        """
        # runserver va gunicorn da ishlashi uchun
        import os
        if os.environ.get("RUN_MAIN") != "true" and os.environ.get("DJANGO_INIT") != "true":
            # Development da Django ikki marta ishga tushadi (reloader tufayli)
            # RUN_MAIN=true bo'lganda faqat asosiy jarayon
            return

        try:
            from apps.core.init_data import initialize_all
            initialize_all()
        except Exception as e:
            logger.error(f"Initsializatsiya xatosi: {e}")
```

---

### apps/core/init_data.py

```python
"""
Loyiha birinchi marta ishga tushganda sintetik ma'lumotlarni yaratadi.
Agar ma'lumotlar mavjud bo'lsa — o'tkazib yuboradi.
"""

import os
import logging
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)


def initialize_all():
    """Barcha initsializatsiya funksiyalarini tartib bilan chaqiradi"""
    logger.info("=" * 50)
    logger.info("AI-Mentor: Initsializatsiya boshlandi...")

    _init_rag()
    _init_badges()
    _init_users()

    logger.info("Initsializatsiya yakunlandi!")
    logger.info("=" * 50)


# ============================================================
# 1. RAG — ChromaDB initsializatsiyasi
# ============================================================

def _init_rag():
    """
    ChromaDB papkasi mavjud bo'lsa — o'tkazib yuboradi.
    Yo'q bo'lsa — sintetik hujjatlarni yuklab ChromaDB yaratadi.
    """
    chroma_path = Path(settings.CHROMA_DB_PATH)

    # ChromaDB allaqachon yaratilganmi?
    if chroma_path.exists() and any(chroma_path.iterdir()):
        logger.info("✅ RAG: ChromaDB mavjud — o'tkazib yuborildi")
        return

    logger.info("⏳ RAG: ChromaDB yaratilmoqda...")

    try:
        from apps.chatbot.services import RAGService
        rag = RAGService()
        rag._initialize()  # Majburan initsializatsiya
        logger.info("✅ RAG: ChromaDB muvaffaqiyatli yaratildi")
    except Exception as e:
        logger.error(f"❌ RAG initsializatsiya xatosi: {e}")


# ============================================================
# 2. BADGE — standart nishonlar
# ============================================================

def _init_badges():
    """Badge'lar mavjud bo'lsa — o'tkazib yuboradi"""
    try:
        from apps.gamification.models import Badge

        if Badge.objects.exists():
            logger.info("✅ Badge: Mavjud — o'tkazib yuborildi")
            return

        logger.info("⏳ Badge: Standart nishonlar yaratilmoqda...")

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

        logger.info(f"✅ Badge: {len(BADGES)} ta nishon yaratildi")

    except Exception as e:
        logger.error(f"❌ Badge initsializatsiya xatosi: {e}")


# ============================================================
# 3. USERS — sintetik hodimlar va HR
# ============================================================

def _init_users():
    """Foydalanuvchilar mavjud bo'lsa — o'tkazib yuboradi"""
    try:
        from apps.users.models import User, UserProgress

        if User.objects.exists():
            logger.info("✅ Users: Mavjud — o'tkazib yuborildi")
            return

        logger.info("⏳ Users: Sintetik foydalanuvchilar yaratilmoqda...")

        # --- HR ---
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

        # --- Sintetik hodimlar ---
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

            # Progress yaratish — har bir hodimda turli ball
            completion = min(100.0, (quests / 10) * 100)
            UserProgress.objects.create(
                user=emp,
                total_score=score,
                completed_quests=quests,
                completion_percentage=completion,
                current_streak=quests % 4,  # Random streak
            )

            logger.info(f"  Hodim yaratildi: {emp.email} ({score} ball)")

        logger.info(f"✅ Users: HR + {len(EMPLOYEES)} hodim yaratildi")
        logger.info("  Login: hr@turonbank.uz / demo1234")
        logger.info("  Login: ali@turonbank.uz / demo1234")

    except Exception as e:
        logger.error(f"❌ Users initsializatsiya xatosi: {e}")
```

---

### config/settings.py ga qo'shing

```python
INSTALLED_APPS = [
    # ...
    "apps.core",      # ← shu qatorni qo'shing (eng oxirida)
    "apps.users",
    "apps.chatbot",
    "apps.voice",
    "apps.simulator",
    "apps.gamification",
    "apps.analytics",
]
```

---

### manage.py ga 1 ta qator qo'shing

```python
#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    # Initsializatsiyani yoqish uchun
    os.environ.setdefault("DJANGO_INIT", "true")   # ← shu qator

    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
```

---

### Ishga tushirish tartibi

```bash
cd backend
pip install -r requirements.txt

# Faqat birinchi marta:
python manage.py makemigrations
python manage.py migrate

# Ishga tushirish (initsializatsiya avtomatik ishlaydi):
python manage.py runserver
```

**Console da ko'rinadi:**
```
==================================================
AI-Mentor: Initsializatsiya boshlandi...
⏳ RAG: ChromaDB yaratilmoqda...
✅ RAG: ChromaDB muvaffaqiyatli yaratildi
⏳ Badge: Standart nishonlar yaratilmoqda...
✅ Badge: 5 ta nishon yaratildi
⏳ Users: Sintetik foydalanuvchilar yaratilmoqda...
  HR yaratildi: hr@turonbank.uz
  Hodim yaratildi: ali@turonbank.uz (85 ball)
  ...
✅ Users: HR + 6 hodim yaratildi
Initsializatsiya yakunlandi!
==================================================

# Ikkinchi ishga tushirishda:
✅ RAG: ChromaDB mavjud — o'tkazib yuborildi
✅ Badge: Mavjud — o'tkazib yuborildi
✅ Users: Mavjud — o'tkazib yuborildi
```

---

### Qayta initsializatsiya (agar kerak bo'lsa)

```bash
# ChromaDB o'chirish
rm -rf backend/chroma_db/

# DB ni tozalash
rm backend/db.sqlite3
python manage.py migrate

# Qayta ishga tushirish — hammasi yangi yaratiladi
python manage.py runserver
```
