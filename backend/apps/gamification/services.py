from .models import Badge
from apps.users.models import UserProgress


def update_progress_after_quest(user, quest_result):
    progress, _ = UserProgress.objects.get_or_create(user=user)
    progress.total_score += quest_result.score
    progress.completed_quests += 1

    total_quests = 10
    progress.completion_percentage = min(
        100, (progress.completed_quests / total_quests) * 100
    )
    progress.save()

    check_and_award_badges(user, progress, quest_result)
    return progress


def check_and_award_badges(user, progress, quest_result):
    if quest_result.score == quest_result.max_score:
        badge = Badge.objects.filter(condition_type="PERFECT").first()
        if badge:
            badge.awarded_to.add(user)

    from django.utils import timezone
    if user.created_at.date() == timezone.now().date() and progress.completed_quests >= 1:
        badge = Badge.objects.filter(condition_type="FIRST_DAY").first()
        if badge:
            badge.awarded_to.add(user)

    if progress.current_streak >= 7:
        badge = Badge.objects.filter(name="Streak Master").first()
        if badge:
            badge.awarded_to.add(user)


def get_leaderboard():
    return (
        UserProgress.objects.select_related("user")
        .filter(user__role="EMPLOYEE")
        .order_by("-total_score")[:10]
    )
