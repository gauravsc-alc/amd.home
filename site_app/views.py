from django.shortcuts import render
from .content_loader import get_home_context


def home(request):
    return render(request, "home.html", get_home_context())
