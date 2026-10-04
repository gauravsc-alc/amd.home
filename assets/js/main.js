/* ─────────────────────────────────────────────────────────────
   Ashapura Maison Design — main.js
   Portfolio filter · Lightbox · Nav scroll · Mobile menu
───────────────────────────────────────────────────────────── */

// ── Nav scroll behaviour ─────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile nav toggle ────────────────────────────────────────
const navToggle  = document.getElementById('navToggle');
const navLinks   = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ── Portfolio filter ─────────────────────────────────────────
// Reveal content as it enters the viewport
const revealItems = document.querySelectorAll(
  '.section-header, .expertise-card, .portfolio-item, .process-step, .stat, .about__inner, .contact__left, .contact__form'
);

if ('IntersectionObserver' in window) {
  revealItems.forEach((item, index) => {
    item.classList.add('reveal-on-scroll');
    item.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach(item => revealObserver.observe(item));
}

const filterBtns  = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    portfolioItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// ── Lightbox ─────────────────────────────────────────────────
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose  = document.getElementById('lightboxClose');
const lightboxPrev   = document.getElementById('lightboxPrev');
const lightboxNext   = document.getElementById('lightboxNext');

let currentItems = [];   // visible items
let currentIndex = 0;

function openLightbox(items, index) {
  currentItems = items;
  currentIndex = index;
  showSlide(currentIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showSlide(index) {
  const item  = currentItems[index];
  const img   = item.querySelector('.portfolio-item__img-wrap img');
  const title = item.querySelector('.portfolio-item__title');
  const loc   = item.querySelector('.portfolio-item__loc');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = title
    ? `${title.textContent}${loc ? ' · ' + loc.textContent : ''}`
    : '';
}

portfolioItems.forEach((item) => {
  item.addEventListener('click', () => {
    const visible = [...portfolioItems].filter(i => !i.classList.contains('hidden'));
    const idx = visible.indexOf(item);
    openLightbox(visible, idx);
  });
});

lightboxClose.addEventListener('click', closeLightbox);

lightboxPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
  showSlide(currentIndex);
});

lightboxNext.addEventListener('click', (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % currentItems.length;
  showSlide(currentIndex);
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev.click();
  if (e.key === 'ArrowRight') lightboxNext.click();
});

// ── Contact form (client-side only) ─────────────────────────
// To receive real emails, sign up at https://formspree.io
// and replace the form action with your Formspree endpoint.
const contactForm = document.getElementById('contactForm');
const formNote    = document.getElementById('formNote');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = contactForm.querySelector('#name').value.trim();
  if (!name) {
    formNote.style.color = '#c00';
    formNote.textContent = 'Please enter your name.';
    return;
  }
  // Show success message (replace with actual form submission)
  formNote.style.color = '#2a7a2a';
  formNote.textContent = 'Thank you! We will get back to you shortly.';
  contactForm.reset();
});
