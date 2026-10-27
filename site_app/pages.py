import json
import re
from urllib.parse import urlsplit
from xml.etree import ElementTree

from .content_loader import get_home_context


PAGES = {
    'home': {'filename': 'index.html', 'label': 'Home', 'heading': 'Spaces That Tell Your Story'},
    'services': {'filename': 'services.html', 'label': 'Services', 'heading': 'Thoughtful design. Every space.'},
    'portfolio': {'filename': 'portfolio.html', 'label': 'Projects', 'heading': 'Step inside our projects.'},
    'process': {'filename': 'process.html', 'label': 'Our Process', 'heading': 'From first conversation to coming home.'},
    'about': {'filename': 'about.html', 'label': 'About', 'heading': 'Indian sensibility. Individual stories.'},
    'contact': {'filename': 'contact.html', 'label': 'Contact', 'heading': 'Your next chapter starts here.'},
}

def get_site_context():
    context = get_home_context()
    portfolio_enabled = context['config'].get('portfolio', {}).get('enabled') is not False
    context['navigation'] = [
        dict(page, key=key)
        for key, page in PAGES.items()
        if key != 'portfolio' or portfolio_enabled
    ]
    projects = []
    seen_slugs = set()
    for project in context['portfolio'] if portfolio_enabled else []:
        if project.get('enabled') is False:
            continue
        slug = project.get('slug', project['id'])
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug) or slug in seen_slugs:
            raise ValueError(f'Project slug must be unique and URL-safe: {slug!r}')
        seen_slugs.add(slug)
        projects.append(dict(project, slug=slug, url=f'gallery-{slug}.html'))
    context['portfolio'] = sorted(projects, key=lambda project: project.get('order', 999))
    return context


def public_site_url(config):
    base_url = config.get('site_url', '').strip().rstrip('/')
    if not base_url:
        return ''
    parsed = urlsplit(base_url)
    if parsed.scheme not in ('http', 'https') or not parsed.netloc or parsed.query or parsed.fragment:
        raise ValueError('site_url must be the public HTTP(S) site root without a query or fragment.')
    return base_url


def add_page_metadata(context, page_key, project=None):
    config = context['config']
    page = dict(PAGES[page_key], **context['page_content'].get(page_key, {}))
    title = project['title'] if project else page.get('title', page['label'])
    description = project['description'] if project else page.get('description', config['description'])
    filename = project['url'] if project else page['filename']
    base_url = public_site_url(config)
    canonical = f'{base_url}/{filename}' if base_url else ''
    if page_key == 'home' and base_url:
        canonical = f'{base_url}/'
    cover = (project.get('cover') if project else '') or config['hero']['image']
    image_url = f'{base_url}/static/{cover}' if base_url else ''
    organization = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': config['full_name'],
        'description': config['description'],
        'telephone': config['contact']['phone'],
        'email': config['contact']['email'],
        'address': config['contact']['location'],
        'sameAs': [url for url in config.get('social', {}).values() if url.startswith(('https://', 'http://'))],
    }
    if base_url:
        organization.update(url=f'{base_url}/', image=image_url)
    context.update(
        current_page=page_key,
        page=page,
        seo={
            'title': f'{title} | {config["title"]}',
            'description': description,
            'canonical': canonical,
            'image': image_url,
            'structured_data': json.dumps(organization, ensure_ascii=False).replace('<', '\\u003c'),
        },
    )
    return context


def get_build_pages():
    context = get_site_context()
    pages = [(f'/{page["filename"]}', page['filename']) for page in context['navigation']]
    pages.extend((f'/{project["url"]}', project['url']) for project in context['portfolio'])
    return pages


def render_sitemap():
    context = get_site_context()
    base_url = public_site_url(context['config'])
    root = ElementTree.Element('urlset', xmlns='http://www.sitemaps.org/schemas/sitemap/0.9')
    if base_url:
        for _, filename in get_build_pages():
            entry = ElementTree.SubElement(root, 'url')
            location = ElementTree.SubElement(entry, 'loc')
            location.text = f'{base_url}/' if filename == 'index.html' else f'{base_url}/{filename}'
    return ElementTree.tostring(root, encoding='utf-8', xml_declaration=True)
