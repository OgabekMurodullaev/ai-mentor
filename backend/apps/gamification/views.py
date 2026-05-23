from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Badge
from .services import get_leaderboard
from apps.users.models import UserProgress
from apps.simulator.models import QuestResult


class ProgressView(APIView):
    def get(self, request):
        progress, _ = UserProgress.objects.get_or_create(user=request.user)
        badges = request.user.badges.all()
        results = QuestResult.objects.filter(user=request.user)[:5]

        return Response({
            "total_score": progress.total_score,
            "completed_quests": progress.completed_quests,
            "completion_percentage": round(progress.completion_percentage, 1),
            "current_streak": progress.current_streak,
            "badges": [
                {"name": b.name, "icon": b.icon, "description": b.description}
                for b in badges
            ],
            "recent_results": [
                {
                    "scenario": r.scenario_title,
                    "score": r.score,
                    "max_score": r.max_score,
                    "completed_at": r.completed_at,
                }
                for r in results
            ],
        })


class LeaderboardView(APIView):
    def get(self, request):
        leaderboard = get_leaderboard()
        data = [
            {
                "rank": i + 1,
                "full_name": p.user.full_name,
                "branch": p.user.branch,
                "total_score": p.total_score,
                "completed_quests": p.completed_quests,
                "completion_percentage": round(p.completion_percentage, 1),
                "is_current_user": p.user == request.user,
            }
            for i, p in enumerate(leaderboard)
        ]
        return Response(data)


class BadgesView(APIView):
    def get(self, request):
        all_badges = Badge.objects.all()
        user_badges = set(request.user.badges.values_list("id", flat=True))

        return Response([
            {
                "name": b.name,
                "icon": b.icon,
                "description": b.description,
                "earned": b.id in user_badges,
            }
            for b in all_badges
        ])
