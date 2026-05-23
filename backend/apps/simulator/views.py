from rest_framework.views import APIView
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from apps.voice.services import AishaTTSService
from apps.gamification.services import update_progress_after_quest
from .services import (
    get_scenarios_list, get_scenario_by_id,
    DifficultClientService, EvaluationService,
)
from .models import QuestResult


class ScenariosView(APIView):
    def get(self, request):
        return Response(get_scenarios_list())


class StartScenarioView(APIView):
    def post(self, request):
        scenario_id = request.data.get("scenario_id")
        scenario = get_scenario_by_id(scenario_id)
        if not scenario:
            return Response({"error": "Stsenariy topilmadi"}, status=404)

        tts = AishaTTSService()
        audio_url = async_to_sync(tts.synthesize)(
            scenario["initial_message"], "difficult_client"
        )

        return Response({
            "scenario_id": scenario["id"],
            "title": scenario["title"],
            "description": scenario["description"],
            "initial_message": scenario["initial_message"],
            "audio_url": audio_url,
            "steps": scenario["steps"],
            "max_score": scenario["max_score"],
        })


class DifficultClientView(APIView):
    def post(self, request):
        scenario_id = request.data.get("scenario_id")
        employee_message = request.data.get("employee_message", "")
        history = request.data.get("history", [])

        service = DifficultClientService()
        result = service.get_response(scenario_id, employee_message, history)
        return Response(result)


class SubmitAnswerView(APIView):
    def post(self, request):
        scenario_id = request.data.get("scenario_id")
        step_index = request.data.get("step_index", 0)
        answer = request.data.get("answer", "")
        time_spent = request.data.get("time_spent", 999)

        scenario = get_scenario_by_id(scenario_id)
        if not scenario:
            return Response({"error": "Stsenariy topilmadi"}, status=404)

        steps = scenario["steps"]
        if step_index >= len(steps):
            return Response({"error": "Noto'g'ri qadam"}, status=400)

        current_step = steps[step_index]
        evaluator = EvaluationService()
        result = evaluator.evaluate_step(
            answer=answer,
            correct_keywords=current_step["correct_keywords"],
            base_score=current_step["score"],
            time_spent=time_spent,
        )

        return Response(result)


class FinishScenarioView(APIView):
    def post(self, request):
        scenario_id = request.data.get("scenario_id")
        total_score = request.data.get("total_score", 0)
        time_spent = request.data.get("time_spent_seconds", 0)
        mistakes = request.data.get("mistakes", [])

        scenario = get_scenario_by_id(scenario_id)
        if not scenario:
            return Response({"error": "Stsenariy topilmadi"}, status=404)

        quest_result = QuestResult.objects.create(
            user=request.user,
            scenario_id=scenario_id,
            scenario_title=scenario["title"],
            score=total_score,
            max_score=scenario["max_score"],
            time_spent_seconds=time_spent,
            mistakes=mistakes,
        )

        progress = update_progress_after_quest(request.user, quest_result)

        tts = AishaTTSService()
        congrats_text = f"Tabriklayman! {total_score} ball to'pladingiz. Zo'r natija!"
        audio_url = async_to_sync(tts.synthesize)(congrats_text, "congratulation")

        return Response({
            "score": total_score,
            "max_score": scenario["max_score"],
            "percentage": round(total_score / scenario["max_score"] * 100, 1) if scenario["max_score"] else 0,
            "total_score_overall": progress.total_score,
            "congrats_audio": audio_url,
        })


class ResultView(APIView):
    def get(self, request, result_id):
        try:
            result = QuestResult.objects.get(id=result_id, user=request.user)
            return Response({
                "id": result.id,
                "scenario_title": result.scenario_title,
                "score": result.score,
                "max_score": result.max_score,
                "time_spent_seconds": result.time_spent_seconds,
                "mistakes": result.mistakes,
                "completed_at": result.completed_at,
            })
        except QuestResult.DoesNotExist:
            return Response({"error": "Natija topilmadi"}, status=404)
