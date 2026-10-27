document.documentElement.classList.add('js');

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionEnabled = () => document.body.dataset.animations === 'true' && !motionPreference.matches;
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const readingProgress = document.getElementById('readingProgress');
const backToTop = document.getElementById('backToTop');
let scrollScheduled = false;

function updateScrollState() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0;
  nav?.classList.toggle('scrolled', window.scrollY > 40);
  if (readingProgress) readingProgress.style.transform = `scaleX(${progress})`;
  if (backToTop) backToTop.hidden = window.scrollY < 600;
  scrollScheduled = false;
}

function scheduleScrollUpdate() {
  if (scrollScheduled) return;
  scrollScheduled = true;
  window.requestAnimationFrame(updateScrollState);
}

window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
window.addEventListener('resize', scheduleScrollUpdate);
window.addEventListener('load', scheduleScrollUpdate);
updateScrollState();

function closeMenu() {
  navLinks?.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Open menu');
}

navToggle?.addEventListener('click', () => {
  const isOpen = navLinks?.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
  navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});
navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navLinks?.classList.contains('open')) {
    closeMenu();
    navToggle?.focus();
  }
});

const revealItems = document.querySelectorAll(
  '.section-header, .expertise-card, .portfolio-item, .process-step, .stat, .about__body, .contact__left, .contact__form'
);
if ('IntersectionObserver' in window && motionEnabled()) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.05 });
  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${index % 3 * 70}ms`);
    revealObserver.observe(item);
  });
}

const portfolioItems = [...document.querySelectorAll('.portfolio-item')];
const filterButtons = [...document.querySelectorAll('.filter-btn')];
const portfolioStatus = document.getElementById('portfolioStatus');

function updatePortfolioStatus() {
  const count = portfolioItems.filter(item => !item.classList.contains('hidden')).length;
  if (portfolioStatus) portfolioStatus.textContent = count ? `${count} project renders` : 'New projects are coming soon.';
  scheduleScrollUpdate();
}

filterButtons.forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  button.hidden = button.dataset.filter !== 'all' && !portfolioItems.some(item => item.dataset.category === button.dataset.filter);
  button.addEventListener('click', () => {
    filterButtons.forEach(filterButton => {
      const active = filterButton === button;
      filterButton.classList.toggle('active', active);
      filterButton.setAttribute('aria-pressed', String(active));
    });
    portfolioItems.forEach(item => {
      const visible = button.dataset.filter === 'all' || item.dataset.category === button.dataset.filter;
      item.classList.toggle('hidden', !visible);
      if (visible && motionEnabled() && typeof item.animate === 'function') {
        item.animate([{ opacity: 0.25, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, easing: 'ease-out' });
      }
    });
    updatePortfolioStatus();
  });
});
updatePortfolioStatus();

const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImage = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeButton = document.getElementById('lightboxClose');
  const previousButton = document.getElementById('lightboxPrev');
  const nextButton = document.getElementById('lightboxNext');
  const backgroundElements = [...document.querySelectorAll('body > nav, body > main, body > footer, .skip-link, .back-to-top')];
  let currentItems = [];
  let currentIndex = 0;
  let returnFocus = null;
  let previousOverflow = '';
  let backgroundState = [];

  function showSlide(index) {
    const item = currentItems[index];
    if (!item) return;
    const image = item.querySelector('img');
    const title = item.querySelector('.portfolio-item__title')?.textContent.trim();
    const location = item.querySelector('.portfolio-item__loc')?.textContent.trim();
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = [title, location, `${index + 1} / ${currentItems.length}`].filter(Boolean).join(' · ');
    previousButton.hidden = nextButton.hidden = currentItems.length < 2;
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousOverflow;
    backgroundState.forEach(([element, inert]) => { element.inert = inert; });
    returnFocus?.focus();
  }

  function changeSlide(direction) {
    if (!currentItems.length) return;
    currentIndex = (currentIndex + direction + currentItems.length) % currentItems.length;
    showSlide(currentIndex);
  }

  portfolioItems.forEach(item => item.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    returnFocus = item;
    currentItems = portfolioItems.filter(project => !project.classList.contains('hidden'));
    currentIndex = currentItems.indexOf(item);
    showSlide(currentIndex);
    previousOverflow = document.body.style.overflow;
    backgroundState = backgroundElements.map(element => [element, element.inert]);
    backgroundElements.forEach(element => { element.inert = true; });
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }));

  closeButton.addEventListener('click', closeLightbox);
  previousButton.addEventListener('click', () => changeSlide(-1));
  nextButton.addEventListener('click', () => changeSlide(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') { event.preventDefault(); changeSlide(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); changeSlide(1); }
    if (event.key === 'Tab') {
      const buttons = [...lightbox.querySelectorAll('button')].filter(button => !button.hidden);
      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === firstButton) { event.preventDefault(); lastButton.focus(); }
      if (!event.shiftKey && document.activeElement === lastButton) { event.preventDefault(); firstButton.focus(); }
    }
  });
}

const contactForm = document.getElementById('contactForm');
const contactSubmit = contactForm?.querySelector('button[type="submit"]');
if (contactSubmit) contactSubmit.disabled = false;
contactForm?.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const formData = new FormData(contactForm);
  const details = ['name', 'phone', 'email', 'service', 'message']
    .map(field => `${field}: ${String(formData.get(field) || '').trim()}`).join('\n');
  document.getElementById('formNote').textContent = 'Review and send the enquiry in your email app. If it does not open, use the email link on this page. Nothing has been sent yet.';
  window.location.href = `mailto:${contactForm.dataset.email}?subject=${encodeURIComponent('Interior design enquiry')}&body=${encodeURIComponent(details)}`;
});
