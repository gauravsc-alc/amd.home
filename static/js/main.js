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
  '.section-header, .expertise-card, .project-card, .portfolio-item, .home-path, .process-step, .stat, .about__body, .contact__left, .contact__form'
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
const houseScene = document.getElementById('houseScene');
if (houseScene) {
  const panels = [...houseScene.querySelectorAll('.concept-panel')];
  const selectors = document.getElementById('conceptSelectors');
  const sceneButtons = [...selectors.querySelectorAll('button')];
  const pauseButton = document.getElementById('pauseHouse');
  const replayButton = document.getElementById('replayHouse');
  let sceneIndex = 0;
  let remaining = 0;
  let timer = null;
  let lastStarted = 0;
  let started = false;
  let paused = false;
  let finished = false;
  let visible = !('IntersectionObserver' in window);

  function stopTimer() {
    if (timer === null) return;
    clearTimeout(timer);
    remaining = Math.max(0, remaining - (performance.now() - lastStarted));
    timer = null;
  }

  function showScene(index, animate) {
    stopTimer();
    sceneIndex = index;
    panels.forEach((panel, panelIndex) => {
      panel.hidden = panelIndex !== index;
      panel.classList.remove('is-building', 'is-paused');
      sceneButtons[panelIndex].setAttribute('aria-pressed', String(panelIndex === index));
    });
    const active = panels[index];
    remaining = Number(active.dataset.duration);
    active.style.setProperty('--scene-duration', `${remaining}ms`);
    document.getElementById('conceptTitle').textContent = active.dataset.title;
    document.getElementById('conceptEdition').textContent = `Concept / ${String(index + 1).padStart(2, '0')} of ${String(panels.length).padStart(2, '0')}`;
    if (animate) {
      void active.offsetWidth;
      active.classList.add('is-building');
    }
  }

  function syncPlayback() {
    stopTimer();
    const enabled = motionEnabled();
    pauseButton.hidden = !enabled;
    replayButton.hidden = !enabled;
    if (!enabled) {
      panels.forEach(panel => panel.classList.remove('is-building', 'is-paused'));
      if (started) paused = true;
      return;
    }
    if (!started && visible && !document.hidden) {
      started = true;
      showScene(0, true);
    }
    const running = started && !paused && !finished && visible && !document.hidden;
    panels[sceneIndex].classList.toggle('is-paused', !running);
    pauseButton.textContent = finished ? 'Play again' : paused ? 'Resume' : 'Pause';
    if (!running) return;
    lastStarted = performance.now();
    timer = setTimeout(() => {
      timer = null;
      if (sceneIndex === panels.length - 1) {
        finished = true;
      } else {
        showScene(sceneIndex + 1, true);
      }
      syncPlayback();
    }, remaining);
  }

  function replaySequence() {
    if (!motionEnabled()) return;
    started = true;
    paused = false;
    finished = false;
    showScene(0, true);
    syncPlayback();
  }

  selectors.hidden = false;
  sceneButtons.forEach((button, index) => button.addEventListener('click', () => {
    started = true;
    paused = true;
    finished = false;
    showScene(index, false);
    syncPlayback();
  }));
  pauseButton.addEventListener('click', () => {
    if (finished) return replaySequence();
    paused = !paused;
    if (!paused && !panels[sceneIndex].classList.contains('is-building')) showScene(sceneIndex, true);
    syncPlayback();
  });
  replayButton.addEventListener('click', replaySequence);
  motionPreference.addEventListener('change', syncPlayback);
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pagehide', stopTimer);
  window.addEventListener('pageshow', syncPlayback);
  new MutationObserver(syncPlayback).observe(document.body, { attributes: true, attributeFilter: ['data-animations'] });
  if ('IntersectionObserver' in window) {
    const houseObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.12;
      syncPlayback();
    }, { threshold: [0, 0.12] });
    houseObserver.observe(houseScene);
  }
  syncPlayback();
}

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
    currentItems = portfolioItems.filter(photo => photo.dataset.project === item.dataset.project);
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
