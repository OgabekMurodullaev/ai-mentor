from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProgress


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["email", "full_name", "role", "branch", "learning_path", "onboarding_completed"]
    list_filter = ["role", "learning_path", "branch"]
    fieldsets = UserAdmin.fieldsets + (
        ("Qo'shimcha ma'lumotlar", {
            "fields": ("full_name", "role", "department", "branch", "position",
                       "learning_path", "onboarding_completed"),
        }),
    )


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ["user", "total_score", "completed_quests", "completion_percentage", "current_streak"]
