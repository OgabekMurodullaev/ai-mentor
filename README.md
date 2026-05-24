# AI-Mentor: Turonbank

Yangi hodimlar va amaliyotchilar uchun intellektual onboarding simulyatori.  
React + Vite frontend · Django + DRF backend · AISHA AI ovoz · Groq RAG chatbot

---

## Tezkor ishga tushirish (Demo rejim)

> Demo rejimda **GROQ va AISHA API kalitlari shart emas** — barcha simulator va chatbot ma'lumotlari mock-data orqali ishlaydi.

### 1. Reponi klonlash

```bash
git clone https://github.com/<your-username>/ai-mentor.git
cd ai-mentor
```

### 2. Backend

```bash
cd backend

# Virtual muhit (ixtiyoriy, lekin tavsiya etiladi)
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Kutubxonalarni o'rnatish
pip install -r requirements.txt

# .env faylini yaratish (.env.example nusxasi yetarli — API key shart emas)
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

# Ma'lumotlar bazasini yaratish
python manage.py migrate

# Demo foydalanuvchilar + badge-larni yaratish
python manage.py seed_data

# Serverni ishga tushirish
python manage.py runserver
```

Backend `http://localhost:8000` da ishga tushadi.

### 3. Frontend

Yangi terminal oching:

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` da ochiladi.

---

## Demo hisoblar

| Rol      | Email                   | Parol      |
|----------|-------------------------|------------|
| HR       | hr@turonbank.uz         | demo1234   |
| Hodim 1  | ali@turonbank.uz        | demo1234   |
| Hodim 2  | dilnoza@turonbank.uz    | demo1234   |
| Hodim 3  | jasur@turonbank.uz      | demo1234   |
| Hodim 4  | malika@turonbank.uz     | demo1234   |
| Hodim 5  | bobur@turonbank.uz      | demo1234   |
| Hodim 6  | shahlo@turonbank.uz     | demo1234   |

---

## Demo rejimni yoqish

Navbar-dagi **Demo** tugmasini bosing (o'ng tomonda, yuqorida).  
`Yoniq` holatida barcha API chaqiruvlari mock-data bilan almashtiriladi — internet va API key shart emas.

---

## To'liq rejim (real API bilan)

`backend/.env` fayliga haqiqiy kalitlarni kiriting:

```env
SECRET_KEY=django-insecure-hackathon-2024
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# https://console.groq.com — bepul
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# https://aisha.group — o'zbek TTS/STT
AISHA_API_KEY=xxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Keyin RAG ma'lumotlarini yuklash:

```bash
python manage.py seed_data
```

---

## Arxitektura

```
Frontend  :5173  (React + Vite + Tailwind)
    ↓ HTTP/JWT
Backend   :8000  (Django + DRF)
    ├── Groq API      — llama-3.3-70b-versatile (RAG chatbot)
    ├── AISHA AI API  — O'zbek TTS + STT
    ├── ChromaDB      — Lokal vektoral qidiruv (backend/chroma_db/)
    └── SQLite        — Ma'lumotlar bazasi (backend/db.sqlite3)
```

---

## Papka tuzilmasi

```
ai-mentor/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example          ← shu faylni .env ga nusxalang
│   ├── config/               ← Django settings, urls
│   └── apps/
│       ├── users/            ← JWT auth, hodim modeli
│       ├── chatbot/          ← RAG (Groq + ChromaDB)
│       ├── voice/            ← AISHA STT/TTS
│       ├── simulator/        ← ABS/CRM stsenariylar
│       ├── gamification/     ← Ball, badge, leaderboard
│       └── analytics/        ← HR dashboard
└── frontend/
    ├── src/
    │   ├── pages/            ← Login, Dashboard, Chatbot, Simulator ...
    │   ├── components/       ← DifficultClient, VoiceModal, Navbar ...
    │   ├── api/
    │   │   └── mockData.js   ← Demo rejim uchun barcha ma'lumotlar
    │   └── store/            ← Zustand (auth, chat, progress)
    └── vite.config.js
```

---

## Tez-tez so'raladigan savollar

**`seed_data` xato bersa?**  
`python manage.py migrate` ni avval ishga tushirganingizni tekshiring. Agar RAG xatosi bo'lsa — demo rejimda ishlash uchun bu muhim emas, xatoni e'tiborsiz qoldiring.

**`chroma_db/` papkasi yo'q?**  
Bu tabiiy — u `git`ga kirmaydi. `seed_data` komandasi uni avtomatik yaratadi (GROQ_API_KEY bo'lsa). Demo rejimda kerak emas.

**Port band bo'lsa?**  
```bash
# Backend boshqa portda:
python manage.py runserver 8001
# Frontend src/api/axios.js dagi baseURL ni mos ravishda o'zgartiring
```
