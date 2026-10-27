from django.http import Http404, HttpResponse
from django.shortcuts import render
from .pages import PAGES, add_page_metadata, get_site_context, render_sitemap


def home(request):
    return page(request, 'home')


def page(request, page_key):
    context = get_site_context()
    if page_key not in PAGES or page_key not in [item['key'] for item in context['navigation']]:
        raise Http404('Page not published')
    add_page_metadata(context, page_key)
    template = 'home.html' if page_key == 'home' else 'page.html'
    return render(request, template, context)


def project(request, slug):
    context = get_site_context()
    for index, item in enumerate(context['portfolio']):
        if item['slug'] == slug:
            context['project'] = item
            context['previous_project'] = context['portfolio'][index - 1] if index > 0 else None
            context['next_project'] = context['portfolio'][index + 1] if index + 1 < len(context['portfolio']) else None
            add_page_metadata(context, 'portfolio', item)
            return render(request, 'project.html', context)
    raise Http404('Project not published')


def sitemap(request):
    return HttpResponse(render_sitemap(), content_type='application/xml')
