from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        EMPLOYEE = "EMPLOYEE", "Hodim"
        HR = "HR", "HR Mutaxassis"
        ADMIN = "ADMIN", "Admin"

    class LearningPath(models.TextChoices):
        CASHIER = "CASHIER", "Kassir"
        CREDIT = "CREDIT", "Kreditchi"
        OPERATIONS = "OPERATIONS", "Operatsionist"
        SERVICE = "SERVICE", "Xizmat Ko'rsatish"

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=200)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)
    department = models.CharField(max_length=100, blank=True)
    branch = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    learning_path = models.CharField( 
        max_length=20, choices=LearningPath.choices, default=LearningPath.SERVICE
    )
    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.role})"


class UserProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="progress")
    total_score = models.IntegerField(default=0)
    completed_quests = models.IntegerField(default=0)
    completion_percentage = models.FloatField(default=0.0)
    current_streak = models.IntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.full_name} — {self.total_score} ball"
