# AI-Mentor: Turonbank — Loyiha Qo'llanmasi

## Loyiha Haqida

**AI-Mentor: Turonbank** — yangi hodimlar va amaliyotchilar uchun intellektual onboarding simulyatori.
Hackathon MVP versiyasi. Lokal muhitda ishga tushadi.

---

## Arxitektura

```
Frontend (React + Vite)  :5173
          ↓ HTTP
Backend (Django + DRF)   :8000
          ├── AISHA AI API      (https://back.aisha.group)
          ├── Groq API          (llama-3.3-70b-versatile)
          ├── ChromaDB          (lokal fayl — chroma_db/)
          └── SQLite            (db.sqlite3)
```

**Ishga tushirish:**
```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

---

## Loyiha Strukturasi

```
ai-mentor-turonbank/
├── CLAUDE.md
├── prompt_backend.md
├── prompt_frontend.md
├── prompt_ml.md
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── db.sqlite3
│   ├── chroma_db/                   # ChromaDB lokal fayl
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── asgi.py
│   └── apps/
│       ├── users/                   # Hodim, HR modellari + JWT auth
│       ├── chatbot/                 # RAG chatbot (Groq + ChromaDB)
│       ├── voice/                   # AISHA AI STT + TTS
│       ├── simulator/               # ABS/CRM mock stsenariylar
│       ├── gamification/            # Ball, badge, leaderboard
│       └── analytics/               # HR dashboard statistika
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Chatbot.jsx
        │   ├── Simulator.jsx
        │   ├── Quest.jsx
        │   ├── Leaderboard.jsx
        │   └── HRDashboard.jsx
        ├── components/
        │   ├── VoiceAssistant.jsx
        │   ├── DifficultClient.jsx
        │   ├── BadgeCard.jsx
        │   ├── ProgressBar.jsx
        │   └── Navbar.jsx
        ├── store/
        │   ├── authStore.js
        │   ├── chatStore.js
        │   └── progressStore.js
        └── api/
            ├── axios.js
            ├── voice.js
            ├── chat.js
            └── gamification.js
```

---

## Environment Variables

**`backend/.env`:**
```env
SECRET_KEY=django-insecure-hackathon-secret-key-2024
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

GROQ_API_KEY=gsk_...
AISHA_API_KEY=xxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Backend API Endpointlar

### Auth
```
POST   /api/auth/login/               # JWT token
POST   /api/auth/refresh/             # Token yangilash
GET    /api/auth/me/                  # Joriy user
POST   /api/auth/register/            # HR tomonidan hodim qo'shish
```

### Chatbot (RAG)
```
POST   /api/chatbot/ask/              # Savol → RAG javob
GET    /api/chatbot/history/          # Chat tarixi
```

### Voice (AISHA AI)
```
POST   /api/voice/stt/                # Audio → matn
POST   /api/voice/tts/                # Matn → audio URL
POST   /api/voice/voice-chat/         # Audio → RAG → audio (to'liq pipeline)
```

### Simulator
```
GET    /api/simulator/scenarios/      # Stsenariylar ro'yxati
POST   /api/simulator/start/          # Stsenariy boshlash
POST   /api/simulator/submit/         # Javob yuborish
GET    /api/simulator/result/{id}/    # Natija
POST   /api/simulator/difficult-client/ # Qiyin mijoz AI javobi
```

### Gamification
```
GET    /api/gamification/progress/    # Hodim progressi
GET    /api/gamification/badges/      # Nishonlar
GET    /api/gamification/leaderboard/ # Reyting
```

### Analytics (HR)
```
GET    /api/analytics/overview/       # Umumiy statistika
GET    /api/analytics/employees/      # Hodimlar progressi
```

---

## Ma'lumotlar Modellari

### User
```
id, full_name, email, password
role: EMPLOYEE | HR | ADMIN
department, branch, position
learning_path: CASHIER | CREDIT | OPERATIONS | SERVICE
onboarding_completed (bool)
```

### UserProgress
```
user (OneToOne)
total_score
completed_quests
completion_percentage
current_streak
last_activity
```

### Badge
```
name, description, icon (emoji)
condition_type: SPEED | PERFECT | STREAK | FIRST_DAY
awarded_to (ManyToMany → User)
```

### SimulatorScenario
```
title, description
scenario_type: CREDIT | DEPOSIT | COMPLAINT | TRANSFER
difficulty: EASY | MEDIUM | HARD
steps (JSONField)
max_score
```

### QuestResult
```
user (FK), scenario (FK)
score, max_score
time_spent_seconds
mistakes (JSONField)
completed_at
```

---

## AISHA AI — Voice Integratsiya

**Base URL:** `https://back.aisha.group`
**Auth:** `X-Api-Key: <AISHA_API_KEY>` (barcha so'rovlarda)

### STT
```
POST /api/v1/stt/post/
Body: multipart/form-data
  - audio: recording.wav (audio/wav)
  - language: "uz"
Response: { "transcript": "...", "duration": 3.2, "gender": "unknown" }
```

### TTS
```
POST /api/v1/tts/post/
Body: JSON
  - transcript: "matn"
  - language: "uz"
  - model: "Gulnoza"
  - mood: "Cheerful" | "Happy" | "Sad" | "Neutral"
Response: { "audio_path": "https://cdn.aisha.group/...wav" }
```

### Voice Type → Mood
```
mentor           → Cheerful   (AI Mentor ovozi)
client           → Neutral    (Oddiy mijoz)
difficult_client → Sad        (Qiyin mijoz)
congratulation   → Happy      (Badge/tabrik)
```

---

## Groq — RAG Chatbot

**Model:** `llama-3.3-70b-versatile`
**Kutubxona:** `langchain-groq`
**Vector DB:** ChromaDB (lokal, `backend/chroma_db/`)

**RAG Pipeline:**
```
Savol → ChromaDB (o'xshash hujjat qidirish) → Groq LLM → Javob
```

**Sintetik hujjatlar** (kod ichida generatsiya qilinadi):
- Bank ichki qoidalari
- Dress-code talablari
- Kassa operatsiyalari yo'riqnomasi
- Kredit berish tartibi
- FAQ

---

## Gamification Tizimi

### Ball Hisoblash
```
To'g'ri javob:            +10 ball
Tez bajarish (< 60 sek):  +5 bonus
Xatosiz o'tish:           +15 bonus
3 ketma-ket streak:        x2 multiplikator
```

### Badge Turlari
```
⚡ Tez O'rganuvchi     — onboarding 3 kunda tugatilsa
🏆 Mukammal Xizmat     — 3 stsenariy xatosiz o'tilsa
🎯 Aniq Javob          — 5 savol ketma-ket to'g'ri
🔥 Streak Master       — 7 kun ketma-ket kirish
🌟 Birinchi Kun Yulduzi — 1-kuni barcha vazifa bajarilsa
```

---

## Shaxsiylashtirilgan O'quv Yo'li

```
CASHIER     → [Kassa, Depozit, Plastik karta stsenariylari]
CREDIT      → [Kredit berish, Garov, Mijoz tahlili]
OPERATIONS  → [To'lovlar, O'tkazmalar, SWIFT]
SERVICE     → [Muloqot, Qiyin mijoz, FAQ]
```

---

## Demo Stsenariy (6 daqiqa)

```
1. (30 sek)  HR login → yangi hodim qo'shadi
2. (30 sek)  Hodim login → shaxsiylashtirilgan dashboard
3. (1 min)   AI Chatbot → ovozli savol, AISHA o'zbek tilida javob beradi
4. (2 min)   Simulyator → "Qiyin mijoz" kredit so'raydi, hodim hal qiladi
5. (1 min)   Natija → ball, badge, leaderboard yangilanadi
6. (1 min)   HR Dashboard → barcha hodimlar real-time progressi
```

---

## Xavfsizlik

- Haqiqiy bank ma'lumotlari YO'Q — faqat sintetik data
- AISHA va Groq API kalitlari faqat backend `.env` da
- JWT token barcha API so'rovlarda talab qilinadi
- CORS: faqat `http://localhost:5173` ruxsat etiladi
