from django.urls import path
from .views import AskView, HistoryView

urlpatterns = [
    path("ask/", AskView.as_view()),
    path("history/", HistoryView.as_view()),
]
