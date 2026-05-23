from django.urls import path
from .views import STTView, TTSView, VoiceChatView

urlpatterns = [
    path("stt/", STTView.as_view()),
    path("tts/", TTSView.as_view()),
    path("voice-chat/", VoiceChatView.as_view()),
]
