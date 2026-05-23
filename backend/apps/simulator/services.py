import logging
from django.conf import settings
from asgiref.sync import async_to_sync
from apps.voice.services import AishaTTSService

logger = logging.getLogger(__name__)

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


class DifficultClientService:
    def __init__(self):
        from langchain_groq import ChatGroq
        self.llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.75,
            max_tokens=150,
        )
        self.tts = AishaTTSService()

    def get_response(self, scenario_id: int, employee_message: str, history: list) -> dict:
        scenario = get_scenario_by_id(scenario_id)
        if not scenario:
            return {"client_text": "Stsenariy topilmadi.", "audio_url": ""}

        from langchain.schema import SystemMessage, HumanMessage, AIMessage

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

        try:
            response = self.llm.invoke(messages)
            client_text = response.content.strip()
        except Exception as e:
            logger.error(f"Groq xato: {e}")
            client_text = "Xo'sh, davom eting."

        try:
            audio_url = async_to_sync(self.tts.synthesize)(client_text, "difficult_client")
        except Exception as e:
            logger.error(f"AISHA TTS xato: {e}")
            audio_url = ""

        return {"client_text": client_text, "audio_url": audio_url}


class EvaluationService:
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
            return f"Zo'r! Kalit so'zlar: {', '.join(matched)}"
        return f"Maslahat: Quyidagi iboralardan foydalaning: {', '.join(expected[:3])}"

    def calculate_total_score(self, step_scores: list, total_time: int, mistake_count: int) -> int:
        base = sum(step_scores)
        deduction = mistake_count * 5
        speed_bonus = 10 if total_time < 180 else 0
        return max(0, base - deduction + speed_bonus)
