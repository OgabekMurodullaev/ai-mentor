from django.db import models
from apps.users.models import User


class Badge(models.Model):
    class ConditionType(models.TextChoices):
        SPEED = "SPEED", "Tezlik"
        PERFECT = "PERFECT", "Mukammal"
        STREAK = "STREAK", "Streak"
        FIRST_DAY = "FIRST_DAY", "Birinchi kun"

    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=10)
    condition_type = models.CharField(max_length=20, choices=ConditionType.choices)
    awarded_to = models.ManyToManyField(User, blank=True, related_name="badges")

    def __str__(self):
        return f"{self.icon} {self.name}"
