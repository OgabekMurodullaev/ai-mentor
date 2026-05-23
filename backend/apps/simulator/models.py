from django.db import models
from apps.users.models import User


class QuestResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quest_results")
    scenario_id = models.IntegerField()
    scenario_title = models.CharField(max_length=200)
    score = models.IntegerField()
    max_score = models.IntegerField()
    time_spent_seconds = models.IntegerField(default=0)
    mistakes = models.JSONField(default=list)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.user.full_name} — {self.scenario_title}: {self.score}/{self.max_score}"
