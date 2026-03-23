from django.shortcuts import render

def home_view(request):
    """
    A simple landing page to welcome users and avoid 404s on the root URL.
    """
    return render(request, 'home.html')
