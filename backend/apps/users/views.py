from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, UserProgress
from .serializers import UserSerializer, RegisterSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(request, username=email, password=password)

        if not user:
            return Response({"error": "Email yoki parol noto'g'ri"}, status=400)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class RegisterView(APIView):
    def post(self, request):
        if request.user.role not in ["HR", "ADMIN"]:
            return Response({"error": "Ruxsat yo'q"}, status=403)

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            UserProgress.objects.create(user=user)
            return Response(UserSerializer(user).data, status=201)
        return Response(serializer.errors, status=400)
