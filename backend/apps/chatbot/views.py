from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChatHistory
from .services import RAGService


class AskView(APIView):
    def post(self, request):
        question = request.data.get("question", "").strip()
        if not question:
            return Response({"error": "Savol yuborilmadi"}, status=400)

        service = RAGService()
        answer = service.get_answer(question)

        ChatHistory.objects.create(
            user=request.user,
            question=question,
            answer=answer,
        )

        return Response({"question": question, "answer": answer})


class HistoryView(APIView):
    def get(self, request):
        history = ChatHistory.objects.filter(user=request.user).order_by("-created_at")[:20]
        data = [
            {"question": h.question, "answer": h.answer, "created_at": h.created_at}
            for h in history
        ]
        return Response(data)
