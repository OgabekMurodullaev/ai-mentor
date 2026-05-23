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
export const VOICE_RESPONSES = [
  {
    user_text: "Turonbankda ish vaqti qanday?",
    bot_response:
      "Ish vaqti Dushanba-Juma 09:00-18:00, Shanba esa 09:00-13:00 gacha. Tushlik tanaffusi 13:00-14:00.",
  },
  {
    user_text: "Kredit olish uchun qanday hujjatlar kerak?",
    bot_response:
      "Kredit uchun pasport, JSHSHIR va 6 oylik daromad ma'lumotnomasi kerak. Kredit qo'mitasi 3 ish kunida qaror qabul qiladi.",
  },
  {
    user_text: "Depozit foizlari qancha?",
    bot_response:
      "Eng foydali depozit Istiqbol — yillik 22 foiz, 24 oyga. Minimal summa 500 ming so'm.",
  },
  {
    user_text: "Dress-code talablari qanday?",
    bot_response:
      "Erkaklar uchun klassik kostyum va galstuk majburiy. Sport kiyim va jinsi shim mutlaqo taqiqlanadi.",
  },
  {
    user_text: "Ta'til necha kun beriladi?",
    bot_response:
      "Asosiy ta'til yiliga 24 ish kuni. 3 yildan ortiq ishlaganlarga yana 3 kun qo'shimcha beriladi.",
  },
  {
    user_text: "Ish haqi qachon to'lanadi?",
    bot_response:
      "Asosiy ish haqi har oyning 5-sanasida. Avans esa 20-sanasida, ish haqining 40 foizi miqdorida.",
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
