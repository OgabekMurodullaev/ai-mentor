/**
 * 🎬 Demo Mock Ma'lumotlari
 * Hackathon demo uchun oldindan tayyorlangan savol-javoblar.
 */

// ── Matnli chat ─────────────────────────────────────────────────────────────
// keywords: bu so'zlar xabarda bo'lsa shu javob qaytariladi
export const TEXT_RESPONSES = [
  {
    keywords: ["ish vaqti", "soat", "boshlanadi", "tugaydi", "grafik", "qachon"],
    answer:
      "Turonbank'da ish vaqti Dushanba-Juma 09:00-18:00, Shanba 09:00-13:00. Tushlik tanaffusi 13:00-14:00 (1 soat). Kechikish oyda 3 martadan ortiq bo'lmasligi kerak — aks holda ogohlantirish beriladi.",
  },
  {
    keywords: ["kredit", "qarz", "hujjat", "olish", "kredit olish", "zarur"],
    answer:
      "Kredit olish uchun: pasport (asl + nusxa), JSHSHIR, so'nggi 6 oylik daromad ma'lumotnomasi va garov hujjatlari kerak. Kredit qo'mitasi 3 ish kuni ichida qaror qabul qiladi. Oylik to'lov daromadning 50% dan oshmasligi shart.",
  },
  {
    keywords: ["dress", "kiyim", "kostyum", "libos", "kiyinish", "form"],
    answer:
      "Erkaklar uchun: klassik kostyum (qora, ko'k, kulrang), oq ko'ylak va galstuk — barchasi majburiy. Ayollar uchun: klassik kostyum yoki yubka-bluza kombinatsiyasi. Sport kiyim, jinsi shim va futbolka mutlaqo taqiqlanadi.",
  },
  {
    keywords: ["depozit", "foiz", "omonat", "jamg'arma", "stavka"],
    answer:
      "Eng yuqori stavka — 'Istiqbol' depoziti: yillik 22%, 24 oy muddatga. 'Gulbahor' (12 oy) — yillik 20%, oylik foiz to'lanadi. Minimal summa: naqd — 500,000 so'm, o'tkazma — 1,000,000 so'm.",
  },
  {
    keywords: ["ta'til", "dam", "bayram", "rejalash"],
    answer:
      "Asosiy ta'til yiliga 24 ish kuni. 3 yildan ortiq staj uchun qo'shimcha 3 kun beriladi. Ta'til arizasini 2 hafta oldin rahbarga topshiring — HR tasdiqlaydi.",
  },
  {
    keywords: ["ish haqi", "maosh", "oylik", "bonus", "avans"],
    answer:
      "Asosiy ish haqi har oyning 5-sanasida, avans 20-sanasida (ish haqining 40%). Bonus choraklik KPI natijasiga ko'ra, chorak tugaganidan 30 kun ichida to'lanadi.",
  },
  {
    keywords: ["kassa", "naqd", "kassir", "operatsiya"],
    answer:
      "Kassir kundalik tartibi: ish boshida kassani qabul qilish → operatsiyalarni tizimda rasmiylashtirish → kun yakunida hisobot tuzish va inkassatsiyaga topshirish. Kassa xatosi aniqlanganda darhol nazoratchi xabardor qilinadi.",
  },
  {
    keywords: ["email", "pochta", "korporativ", "it", "tizim"],
    answer:
      "Korporativ email: ism.familiya@turonbank.uz formatida. Ishga birinchi kuni IT bo'limi tomonidan sozlanadi. ABS tizimiga kirish uchun IT bo'limiga murojaat qiling — rahbar ruxsati va o'quv kursi talab qilinadi.",
  },
  {
    keywords: ["kasal", "sog'liq", "betob", "varag'"],
    answer:
      "Kasal bo'lganda ertalab soat 9:00 gacha rahbar va HR ga xabar bering. Davolanish varag'ini sog'ayganingizdan keyin HR ga topshiring. Tibbiy muassasa tasdiqlagan holda kasallik to'lanadi.",
  },
  {
    keywords: ["parol", "xavfsizlik", "axborot", "himoya"],
    answer:
      "Parol kamida 8 belgi, katta/kichik harf, raqam va maxsus belgi bo'lishi shart. Har 90 kunda o'zgartirish majburiy. Bank xodimlari HECH QACHON parolingizni so'ramaydi — so'rasa bu fishing hujumi.",
  },
];

// ── Ovozli chat ─────────────────────────────────────────────────────────────
// Ketma-ket ko'rsatiladi: 1-gapirishda 1-javob, 2-gapirishda 2-javob va h.k.
// audio_url — AISHA AI "Gulnoza" ovozi bilan oldindan generatsiya qilingan
export const VOICE_RESPONSES = [
  {
    user_text:    "Turonbankda ish vaqti qanday?",
    bot_response: "Ish vaqti Dushanba-Juma 09:00-18:00, Shanba esa 09:00-13:00 gacha. Tushlik tanaffusi 13:00-14:00.",
    audio_url:    "https://cdn.aisha.group/backend/tts_audios/286047d7-3dea-48e8-aa92-fc94b82a968a.wav",
  },
  {
    user_text:    "Kredit olish uchun qanday hujjatlar kerak?",
    bot_response: "Kredit uchun pasport, JSHSHIR va 6 oylik daromad ma'lumotnomasi kerak. Kredit qo'mitasi 3 ish kunida qaror qabul qiladi.",
    audio_url:    "https://cdn.aisha.group/backend/tts_audios/3dd1f6e5-fb4d-4f9f-a8a3-51f4d257ddf5.wav",
  },
  {
    user_text:    "Depozit foizlari qancha?",
    bot_response: "Eng foydali depozit Istiqbol — yillik 22 foiz, 24 oyga. Minimal summa 500 ming so'm.",
    audio_url:    "https://cdn.aisha.group/backend/tts_audios/daeee721-3a7c-483c-8193-f67c5491ef63.wav",
  },
  {
    user_text:    "Dress-code talablari qanday?",
    bot_response: "Erkaklar uchun klassik kostyum va galstuk majburiy. Sport kiyim va jinsi shim mutlaqo taqiqlanadi.",
    audio_url:    "https://cdn.aisha.group/backend/tts_audios/7ec0cd6a-30a9-41cc-9a94-ee424fb0dd68.wav",
  },
  {
    user_text:    "Ta'til necha kun beriladi?",
    bot_response: "Asosiy ta'til yiliga 24 ish kuni. 3 yildan ortiq ishlaganlarga yana 3 kun qo'shimcha beriladi.",
    audio_url:    "https://cdn.aisha.group/backend/tts_audios/61f84c61-a249-41fc-9b82-daf3abc96260.wav",
  },
  {
    user_text:    "Ish haqi qachon to'lanadi?",
    bot_response: "Asosiy ish haqi har oyning 5-sanasida. Avans esa 20-sanasida, ish haqining 40 foizi miqdorida.",
    audio_url:    "https://cdn.aisha.group/backend/tts_audios/d3493552-0e22-4c40-bdc0-a642d7739c9f.wav",
  },
];

/** Ovozli mock indeksini boshqaruvchi modul-darajali kaounter */
let _voiceIndex = 0;

/** Keyingi ovozli mock javobini qaytaradi (ketma-ket aylanadi) */
export const getNextVoiceMock = () => {
  const item = VOICE_RESPONSES[_voiceIndex % VOICE_RESPONSES.length];
  _voiceIndex++;
  return item;
};

/** Demo ovoz indeksini boshiga qaytarish (yangi demo seansi uchun) */
export const resetVoiceIndex = () => { _voiceIndex = 0; };

// ── Simulator stsenariylari ──────────────────────────────────────────────────
/**
 * 3 ta to'liq mock stsenariy.
 * steps[].demo_voice_answer — ovozli demo rejimda avtomatik ishlatiladi.
 */
export const SIMULATOR_SCENARIOS = [
  {
    id:            "mock_1",
    title:         "Biznes kredit so'ragan mijoz",
    description:   "Mijoz yangi biznes ochish uchun kredit olmoqchi. Unga kredit turlari, hujjatlar va jarayon haqida to'liq ma'lumot bering.",
    scenario_type: "CREDIT",
    difficulty:    "EASY",
    max_score:     50,
    initial_message: "Salom, men biznes uchun kredit olmoqchiman. Qanday qilsam bo'ladi?",
    audio_url: "https://cdn.aisha.group/backend/tts_audios/955651bc-a208-4b9f-b576-802ba5ace4da.wav",
    steps: [
      {
        client_message: "50 million so'm kerak. Qancha foizda berasiz va qanday muddatga?",
        hint: "Biznes kredit shartlarini: foiz (24-28%), muddatini (3-84 oy) ayting.",
        correct_keywords: ["biznes", "kredit", "24", "28", "foiz", "oy", "muddati"],
        score: 10,
        demo_voice_answer: "Biznes kredit uchun yillik foiz 24 dan 28 foizgacha. Muddat 3 oydan 84 oygacha tanlashingiz mumkin.",
      },
      {
        client_message: "Kredit tarixi tekshiriladimi? Menda avval kichik muammo bo'lgan edi...",
        hint: "NBKI kredit byurosi tekshiruvini va salbiy tarix oqibatini tushuntiring.",
        correct_keywords: ["kredit tarixi", "nbki", "byuro", "tekshiriladi", "salbiy"],
        score: 10,
        demo_voice_answer: "Ha, kredit tarixi NBKI kredit byurosi orqali tekshiriladi. Agar salbiy tarix bo'lsa kredit berilmasligi mumkin.",
      },
      {
        client_message: "Qanday hujjatlar kerak? To'liq ro'yxatini bering.",
        hint: "Barcha zarur hujjatlarni sanab bering: pasport, JSHSHIR, daromad, garov.",
        correct_keywords: ["pasport", "jshshir", "daromad", "garov", "hujjat"],
        score: 15,
        demo_voice_answer: "Pasport, JSHSHIR, so'nggi 6 oylik daromad ma'lumotnomasi va garov hujjatlari kerak bo'ladi.",
      },
      {
        client_message: "Qaror qachon chiqadi? Ko'p kutishim kerakmi?",
        hint: "Kredit qo'mitasi 3 ish kuni ichida qaror qabul qilishini ayting.",
        correct_keywords: ["3 ish kuni", "qo'mita", "qaror", "kun", "muddati"],
        score: 15,
        demo_voice_answer: "Kredit qo'mitasi 3 ish kuni ichida qaror qabul qiladi. Katta kreditlar uchun Bosh ofis ham tasdiqlaydi.",
      },
    ],
  },

  {
    id:            "mock_2",
    title:         "Karta bloklangan norozilik",
    description:   "Mijoz kartasi bloklanib qolganidan g'azablangan. Tinch va professional tarzda muammoni hal qiling.",
    scenario_type: "COMPLAINT",
    difficulty:    "MEDIUM",
    max_score:     60,
    initial_message: "Uch kundan beri kartamdan pul ololmayapman! Bu nima degani, tushuntiring!",
    audio_url: null,
    steps: [
      {
        client_message: "Kecha ATMdan pul olmoqchi bo'ldim, 'karta bloklangan' dedi!",
        hint: "Avval uzr so'rang va muammoni aniqlashga tayyorligingizni bildiring.",
        correct_keywords: ["uzr", "noqulaylik", "tekshiramiz", "sabab", "aniqlaymiz", "yordam"],
        score: 15,
        demo_voice_answer: "Uzr, bu noqulaylik uchun. Darhol tekshirib, sababini aniqlaymiz. Pasportingizni ko'rsata olasizmi?",
      },
      {
        client_message: "Kunlik limitni oshdimmi? Buni bilmasam bo'lmaydi-ku!",
        hint: "Kunlik limit 50 million so'm ekanini va uni internet banking orqali kuzatish mumkinini ayting.",
        correct_keywords: ["limit", "50 million", "internet banking", "mobil", "ko'rish", "nazorat"],
        score: 15,
        demo_voice_answer: "Kunlik limit 50 million so'm. Internet banking yoki mobil ilovada limitni real vaqtda kuzatib borishingiz mumkin.",
      },
      {
        client_message: "Endi nima qilaman, kartam qachon ochilar?",
        hint: "Kartani ochish yo'llarini ko'rsating: call-center, filial yoki mobil ilova.",
        correct_keywords: ["200-00-00", "qo'ng'iroq", "filial", "mobil ilova", "blok", "ochish"],
        score: 15,
        demo_voice_answer: "Kartani ochish uchun +998 71 200-00-00 ga qo'ng'iroq qiling yoki mobil ilovada blokdan chiqaring. Bu 5 daqiqa oladi.",
      },
      {
        client_message: "Keyingi safar bunday bo'lmasligi uchun nima qilishim kerak?",
        hint: "SMS xabarnoma va limit nazoratini ulashni tavsiya eting.",
        correct_keywords: ["sms", "xabarnoma", "limit", "nazorat", "internet banking", "tavsiya"],
        score: 15,
        demo_voice_answer: "SMS xabarnomani ulang — har bir operatsiyadan habar olasiz. Internet bankingda limitni ham kuzatib boring.",
      },
    ],
  },

  {
    id:            "mock_3",
    title:         "Depozit ochmoqchi bo'lgan mijoz",
    description:   "Mijoz depozit ochmoqchi, lekin variantlarni bilmaydi. Unga eng mos depozitni tavsiya qiling va jarayonni tushuntiring.",
    scenario_type: "DEPOSIT",
    difficulty:    "HARD",
    max_score:     70,
    initial_message: "Salom, pullarimni depozitga qo'ymoqchiman. Sizda qanday imkoniyatlar bor?",
    audio_url: null,
    steps: [
      {
        client_message: "Eng yuqori foiz qanday va necha oyga?",
        hint: "'Istiqbol' depozitini tavsiya eting — yillik 22%, 24 oy.",
        correct_keywords: ["istiqbol", "22", "foiz", "24 oy", "yuqori", "yillik"],
        score: 15,
        demo_voice_answer: "Eng yuqori stavka — 'Istiqbol' depoziti: yillik 22 foiz, 24 oyga. Bu sizga eng ko'p foyda beradi.",
      },
      {
        client_message: "Agar muddatdan oldin pulimni olsam nima bo'ladi?",
        hint: "Asosiy summa qaytariladi, lekin foizlar yo'qolishini tushuntiring.",
        correct_keywords: ["asosiy summa", "foiz", "yo'qoladi", "muddatdan oldin", "qaytariladi"],
        score: 15,
        demo_voice_answer: "Muddatdan oldin olinsa, asosiy summa to'liq qaytariladi, lekin hisoblangan foizlar yo'qoladi.",
      },
      {
        client_message: "Minimal qancha pul qo'yishim kerak?",
        hint: "Naqd va o'tkazma uchun minimal summani ayting.",
        correct_keywords: ["500", "ming", "minimal", "naqd", "million", "o'tkazma"],
        score: 10,
        demo_voice_answer: "Naqd pul uchun minimal summa 500 ming so'm, o'tkazma orqali ochilsa 1 million so'm.",
      },
      {
        client_message: "Oylik foiz olish imkoni bormi? Har oy hisobimga tushsa yaxshi bo'lardi.",
        hint: "'Gulbahor' depoziti oylik foiz to'laydi — 12 oy, yillik 20%.",
        correct_keywords: ["gulbahor", "oylik", "12 oy", "20", "foiz", "to'lanadi"],
        score: 15,
        demo_voice_answer: "'Gulbahor' depoziti 12 oyga, yillik 20 foiz. Har oy foiz to'g'ridan-to'g'ri hisobingizga o'tkaziladi.",
      },
      {
        client_message: "Xo'p, 'Istiqbol' depozitini ochamiz. Nima kerak?",
        hint: "Depozit ochish tartibini tushuntiring: pasport, ariza, pul.",
        correct_keywords: ["pasport", "ariza", "shartnoma", "pul", "hisob", "imzo"],
        score: 15,
        demo_voice_answer: "Pasportingizni olib keling, ariza to'ldirasiz, shartnomani imzolaysiz va pul qo'yasiz. 15 daqiqada bajariladi.",
      },
    ],
  },
];
