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
