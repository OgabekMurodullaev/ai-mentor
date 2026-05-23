from django.urls import path
from .views import (
    ScenariosView, StartScenarioView,
    DifficultClientView, SubmitAnswerView, FinishScenarioView, ResultView,
)

urlpatterns = [
    path("scenarios/", ScenariosView.as_view()),
    path("start/", StartScenarioView.as_view()),
    path("difficult-client/", DifficultClientView.as_view()),
    path("submit/", SubmitAnswerView.as_view()),
    path("finish/", FinishScenarioView.as_view()),
    path("result/<int:result_id>/", ResultView.as_view()),
]
