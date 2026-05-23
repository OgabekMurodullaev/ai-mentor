from django.urls import path
from .views import OverviewView, EmployeesView

urlpatterns = [
    path("overview/", OverviewView.as_view()),
    path("employees/", EmployeesView.as_view()),
]
