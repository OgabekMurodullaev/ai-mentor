import logging
from django.conf import settings

logger = logging.getLogger(__name__)

BANK_DOCUMENTS = [
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
    """,
    """
    TEZKOR SAVOL-JAVOBLAR (FAQ) — YANGI HODIMLAR UCHUN

    UMUMIY SAVOLLAR:

    S: Korporativ email qachon beriladi?
    J: Ishga birinchi kuni IT bo'limi tomonidan sozlanadi.

    S: Kasal bo'lganda nima qilish kerak?
    J: Sabah 9:00 gacha rahbar va HR ga xabar bering. Davolanish varag'ini topshiring.

    S: Mehnat ta'tili qanday olinadi?
    J: Ta'til arizasini 2 hafta oldin rahbarga topshiring. HR tasdiqlaydi.

    MOLIYAVIY SAVOLLAR:

    S: Ish haqi necha kunga kechikishi mumkin?
    J: Belgilangan sana 2 ish kuniga kechikishi mumkin. Undan ortiq — HR ga murojaat.

    S: Bonus qachon to'lanadi?
    J: Choraklik KPI natijalariga ko'ra, chorak tugaganidan 30 kun ichida.

    BANK TIZIMLARIGA KIRISH:

    S: ABS (Asosiy Bank Tizimi) ga kirish uchun nima kerak?
    J: IT bo'limiga murojaat qiling. Rahbar ruxsati va o'quv kursi talab qilinadi.

    S: Parolni unutsam?
    J: IT qo'llab-quvvatlash xizmatiga: it.support@turonbank.uz yoki +998 71 200-00-01.

    MAXFIYLIK:

    S: Mijoz ma'lumotlarini do'stlarimga aytishim mumkinmi?
    J: YO'Q. Bu bankning maxfiylik siyosatini va qonunni buzish hisoblanadi.

    S: Bank hujjatlarini uyga olib ketsa bo'ladimi?
    J: YO'Q. Barcha hujjatlar faqat bank ichida saqlanadi.
    """,
    """
    AXBOROT XAVFSIZLIGI QOIDALARI

    PAROL XAVFSIZLIGI:
    - Minimal uzunlik: 8 belgi.
    - Tarkib: Katta/kichik harf, raqam, maxsus belgi.
    - Yangilash: Har 90 kunda majburiy.
    - Taqiqlanadi: Ism, tug'ilgan kun, "password123" kabi oddiy parollar.

    KOMPYUTER XAVFSIZLIGI:
    - Kompyuterni qulflamasdan tashlab ketish taqiqlanadi (Win+L).
    - Noma'lum flesh kartalarni ulash taqiqlanadi.
    - Litsenziyasiz dasturlar o'rnatish taqiqlanadi.

    FISHING HUJUMLARIDAN HIMOYA:
    - Shubhali emaildagi havolalarni bosmang.
    - Bank xodimlari HECH QACHON parol so'ramaydi.
    - Noma'lum yuboruvchidan kelgan fayllarni ochmang.

    MA'LUMOTLAR MAXFIYLIGI:
    - Mijoz ma'lumotlari uchinchi shaxslarga berilmaydi.
    - Bank sirlari oshkor etilganda jinoiy javobgarlik ko'zda tutiladi.
    - Ekranni fotosuratga olish va videoga olish taqiqlanadi.
    """,
]


class RAGService:
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

        import os
        from langchain_groq import ChatGroq
        from langchain_community.vectorstores import Chroma
        from langchain_community.embeddings import SentenceTransformerEmbeddings
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from langchain_core.prompts import PromptTemplate
        from langchain_core.output_parsers import StrOutputParser
        from langchain_core.runnables import RunnablePassthrough

        logger.info("RAG pipeline yuklanmoqda...")

        embeddings = SentenceTransformerEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )

        # Agar ChromaDB allaqachon mavjud bo'lsa, qayta yaratmaymiz
        chroma_path = settings.CHROMA_DB_PATH
        chroma_exists = (
            os.path.exists(chroma_path)
            and os.path.isdir(chroma_path)
            and any(f for f in os.listdir(chroma_path) if not f.startswith("."))
        )

        if chroma_exists:
            logger.info("Mavjud ChromaDB yuklanmoqda...")
            vectorstore = Chroma(
                persist_directory=chroma_path,
                embedding_function=embeddings,
                collection_name="turonbank_docs",
            )
        else:
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
            vectorstore = Chroma.from_documents(
                documents=docs,
                embedding=embeddings,
                persist_directory=chroma_path,
                collection_name="turonbank_docs",
            )

        self._retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3},
        )

        self._llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=512,
        )

        self._prompt = PromptTemplate(
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

        # LCEL chain: retriever | prompt | llm | parser
        def format_docs(docs):
            return "\n\n".join(d.page_content for d in docs)

        self._qa_chain = (
            {"context": self._retriever | format_docs, "question": RunnablePassthrough()}
            | self._prompt
            | self._llm
            | StrOutputParser()
        )

        self._is_initialized = True
        logger.info("RAG pipeline tayyor!")

    def get_answer(self, question: str) -> str:
        try:
            self._initialize()
            # Barcha bank hujjatlarini context sifatida uzatamiz
            # (kichik hajm — Groq 32K context ichida)
            context = "\n\n---\n\n".join(doc.strip() for doc in BANK_DOCUMENTS)
            prompt_text = self._prompt.format(context=context, question=question)
            result = self._llm.invoke(prompt_text)
            answer = result.content if hasattr(result, "content") else str(result)
            return answer.strip() if answer.strip() else "Javob topilmadi. HR bo'limiga murojaat qiling."
        except Exception as e:
            logger.error(f"RAG xato: {e}")
            return "Texnik muammo yuz berdi. Qayta urining."

    def get_voice_answer(self, question: str) -> str:
        """
        Ovozli suhbat uchun optimallashtirilgan javob.
        - Faqat 1-2 qisqa jumla (TTS tezroq ishlashi uchun)
        - Tabiiy suhbat ohangi
        """
        try:
            self._initialize()
            context = "\n\n---\n\n".join(doc.strip() for doc in BANK_DOCUMENTS)
            voice_prompt = f"""Sen Turonbank'ning AI-Mentori — Zulfiya'san.
Quyidagi savol uchun FAQAT 1-2 qisqa, oddiy jumla bilan javob ber.
Bu ovozli suhbat — qisqa, aniq va do'stona gapir. Ro'yxat yoki sarlavha ishlatma.

Bank ma'lumotlari:
{context}

Savol: {question}

Qisqa ovozli javob (1-2 jumla):"""

            result = self._llm.invoke(voice_prompt)
            answer = result.content if hasattr(result, "content") else str(result)
            answer = answer.strip()

            # TTS uchun 280 belgidan oshmasligi kerak
            if len(answer) > 280:
                # Birinchi jumlada to'xtat
                for sep in [".", "!", "?"]:
                    idx = answer.find(sep)
                    if 20 < idx < 280:
                        answer = answer[: idx + 1]
                        break
                else:
                    answer = answer[:280]

            return answer if answer else "Javob topilmadi. HR bo'limiga murojaat qiling."
        except Exception as e:
            logger.error(f"Voice RAG xato: {e}")
            return "Texnik muammo yuz berdi. Qayta urining."
