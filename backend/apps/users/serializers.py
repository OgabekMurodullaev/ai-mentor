from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, UserProgress


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = ["total_score", "completed_quests", "completion_percentage", "current_streak"]


class UserSerializer(serializers.ModelSerializer):
    progress = UserProgressSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "full_name", "role", "department",
            "branch", "position", "learning_path",
            "onboarding_completed", "progress",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email", "full_name", "password", "role",
            "department", "branch", "position", "learning_path",
        ]

    def create(self, validated_data):
        validated_data["username"] = validated_data["email"]
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)
