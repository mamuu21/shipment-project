from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),

    # API / backend routes FIRST
    path("api/", include("shipments.urls")),

    # React SPA fallback (MUST BE LAST)
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
]
