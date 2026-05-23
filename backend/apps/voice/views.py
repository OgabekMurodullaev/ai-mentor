from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from asgiref.sync import async_to_sync
from .services import AishaSTTService, AishaTTSService, GroqSTTService
from apps.chatbot.services import RAGService
from apps.chatbot.models import ChatHistory
import logging

logger = logging.getLogger(__name__)


def _run_stt(audio_bytes: bytes, filename: str) -> str:
    """
    STT pipeline:
      1. AISHA AI  — o'zbek tili uchun optimallashtirilgan (WAV talab qiladi)
      2. Groq Whisper — zaxira (AISHA ishlamasa)

    Frontend convertToWav() orqali WAV yuborayotganligi sababli
    AISHA endi to'g'ri ishlashi kerak.
    """
    # 1-urinish: AISHA (WAV formatida keladi)
    result = async_to_sync(AishaSTTService().transcribe)(audio_bytes, filename)
    transcript = result.get("transcript", "").strip()
    if transcript:
        logger.info(f"AISHA STT muvaffaqiyatli: '{transcript[:60]}'")
        return transcript

    # 2-urinish: Groq Whisper zaxirasi
    logger.info("AISHA STT bo'sh — Groq Whisper zaxirasi ishga tushirilmoqda...")
    result2 = async_to_sync(GroqSTTService().transcribe)(audio_bytes, filename)
    return result2.get("transcript", "").strip()


class STTView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        audio_file = request.FILES.get("audio")
        if not audio_file:
            return Response({"error": "Audio fayl yuborilmadi"}, status=400)

        audio_bytes = audio_file.read()
        filename = audio_file.name or "recording.wav"
        transcript = _run_stt(audio_bytes, filename)
        return Response({"transcript": transcript, "duration": 0})


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
    """
    To'liq ovozli suhbat pipeline:
      Audio (WAV) → STT → RAG (qisqa javob) → TTS → Audio URL

    Optimizatsiyalar:
    - Frontend WAV yuboradi → AISHA STT aniq ishlaydi
    - get_voice_answer() → 1-2 jumla (TTS tezroq)
    - TTS matn 280 belgidan oshmasligi ta'minlangan
    """
    parser_classes = [MultiPartParser]

    def post(self, request):
        audio_file = request.FILES.get("audio")
        voice_type = request.data.get("voice_type", "mentor")

        if not audio_file:
            return Response({"error": "Audio yuborilmadi"}, status=400)

        audio_bytes = audio_file.read()
        filename = audio_file.name or "recording.wav"

        # 1. STT: ovoz → matn
        user_text = _run_stt(audio_bytes, filename)

        if not user_text:
            return Response(
                {"error": "Ovozingizni aniqlab bo'lmadi. Iltimos aniqroq va balandroq gapiring."},
                status=400,
            )

        # 2. RAG: ovozli suhbat uchun qisqa javob (1-2 jumla)
        rag = RAGService()
        bot_response = rag.get_voice_answer(user_text)

        # 3. Tarix saqlash
        ChatHistory.objects.create(
            user=request.user,
            question=user_text,
            answer=bot_response,
        )

        # 4. TTS: matn → audio
        tts = AishaTTSService()
        audio_url = async_to_sync(tts.synthesize)(bot_response, voice_type)

        return Response({
            "user_text":    user_text,
            "bot_response": bot_response,
            "audio_url":    audio_url,
        })
