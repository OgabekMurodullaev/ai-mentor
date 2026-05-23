from django.urls import path
from .views import ProgressView, LeaderboardView, BadgesView

urlpatterns = [
    path("progress/", ProgressView.as_view()),
    path("leaderboard/", LeaderboardView.as_view()),
    path("badges/", BadgesView.as_view()),
]
