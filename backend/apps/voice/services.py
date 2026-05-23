import logging
import httpx
from django.conf import settings

logger = logging.getLogger(__name__)

def _get_aisha_headers():
    return {"X-Api-Key": settings.AISHA_API_KEY or ""}

VOICE_CONFIG = {
    "mentor":           {"model": "Gulnoza", "mood": "Cheerful"},
    "client":           {"model": "Gulnoza", "mood": "Neutral"},
    "difficult_client": {"model": "Gulnoza", "mood": "Sad"},
    "congratulation":   {"model": "Gulnoza", "mood": "Happy"},
}


def _detect_content_type(filename: str) -> str:
    """Fayl nomidan content-type aniqlash"""
    name = filename.lower()
    if name.endswith(".webm"):
        return "audio/webm"
    elif name.endswith(".ogg"):
        return "audio/ogg"
    elif name.endswith(".mp4") or name.endswith(".m4a"):
        return "audio/mp4"
    elif name.endswith(".wav"):
        return "audio/wav"
    elif name.endswith(".mp3"):
        return "audio/mpeg"
    return "audio/webm"


class AishaSTTService:
    async def transcribe(self, audio_bytes: bytes, filename: str = "recording.webm") -> dict:
        content_type = _detect_content_type(filename)
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(
                    f"{settings.AISHA_BASE_URL}/api/v1/stt/post/",
                    headers=_get_aisha_headers(),
                    files={"audio": (filename, audio_bytes, content_type)},
                    data={"language": "uz"},
                )
                response.raise_for_status()
                data = response.json()
                transcript = data.get("transcript", "").strip()
                if transcript:
                    logger.info(f"AISHA STT OK: '{transcript[:50]}'")
                return data
        except Exception as e:
            logger.warning(f"AISHA STT ishlamadi: {e}")
            return {"transcript": "", "duration": 0, "gender": "unknown"}


class GroqSTTService:
    """Groq Whisper — AISHA ishlamagan holda zaxira STT"""

    async def transcribe(self, audio_bytes: bytes, filename: str = "recording.webm") -> dict:
        content_type = _detect_content_type(filename)
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
                    files={"file": (filename, audio_bytes, content_type)},
                    data={
                        "model": "whisper-large-v3",
                        "language": "uz",
                        "response_format": "json",
                    },
                )
                response.raise_for_status()
                data = response.json()
                transcript = data.get("text", "").strip()
                logger.info(f"Groq Whisper STT OK: '{transcript[:50]}'")
                return {"transcript": transcript, "duration": 0, "gender": "unknown"}
        except httpx.TimeoutException:
            logger.error("Groq STT timeout")
            return {"transcript": "", "duration": 0, "gender": "unknown"}
        except Exception as e:
            logger.error(f"Groq STT xato: {e}")
            return {"transcript": "", "duration": 0, "gender": "unknown"}


class AishaTTSService:
    async def synthesize(self, text: str, voice_type: str = "mentor") -> str:
        if not text or not text.strip():
            return ""

        voice = VOICE_CONFIG.get(voice_type, VOICE_CONFIG["mentor"])
        text = text[:500] if len(text) > 500 else text

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{settings.AISHA_BASE_URL}/api/v1/tts/post/",
                    headers={**_get_aisha_headers(), "Content-Type": "application/json"},
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
