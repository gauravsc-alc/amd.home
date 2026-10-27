from django.urls import path
from site_app import views
from site_app.pages import PAGES

urlpatterns = [
    path("", views.home, name="home"),
    path('gallery-<slug:slug>.html', views.project, name='project'),
    path('sitemap.xml', views.sitemap, name='sitemap'),
]
urlpatterns += [
    path(page['filename'], views.page, {'page_key': key}, name=f'page-{key}')
    for key, page in PAGES.items()
]
