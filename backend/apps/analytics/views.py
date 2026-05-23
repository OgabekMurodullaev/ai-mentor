from rest_framework.views import APIView
from rest_framework.response import Response
from apps.users.models import User, UserProgress


class OverviewView(APIView):
    def get(self, request):
        if request.user.role not in ["HR", "ADMIN"]:
            return Response({"error": "Ruxsat yo'q"}, status=403)

        total = User.objects.filter(role="EMPLOYEE").count()
        completed = User.objects.filter(role="EMPLOYEE", onboarding_completed=True).count()
        avg_score = 0

        progresses = UserProgress.objects.filter(user__role="EMPLOYEE")
        if progresses.exists():
            avg_score = sum(p.total_score for p in progresses) / progresses.count()

        avg_completion = 0
        if progresses.exists():
            avg_completion = sum(p.completion_percentage for p in progresses) / progresses.count()

        return Response({
            "total_employees": total,
            "completed_onboarding": completed,
            "in_progress": total - completed,
            "average_score": round(avg_score, 1),
            "average_completion": round(avg_completion, 1),
            "completion_rate": round((completed / total * 100) if total else 0, 1),
        })


class EmployeesView(APIView):
    def get(self, request):
        if request.user.role not in ["HR", "ADMIN"]:
            return Response({"error": "Ruxsat yo'q"}, status=403)

        employees = User.objects.filter(role="EMPLOYEE").select_related("progress")
        data = []
        for emp in employees:
            progress = getattr(emp, "progress", None)
            data.append({
                "id": emp.id,
                "full_name": emp.full_name,
                "department": emp.department,
                "branch": emp.branch,
                "position": emp.position,
                "learning_path": emp.learning_path,
                "total_score": progress.total_score if progress else 0,
                "completion_percentage": round(progress.completion_percentage, 1) if progress else 0,
                "completed_quests": progress.completed_quests if progress else 0,
                "current_streak": progress.current_streak if progress else 0,
                "onboarding_completed": emp.onboarding_completed,
            })

        return Response(data)
