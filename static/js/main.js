/* static/js/main.js — Portfolio filter · Lightbox · Nav scroll · Mobile menu */

// ── Nav scroll ────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile nav toggle ─────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);

// ── Portfolio filter ──────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.portfolio-item').forEach(item => {
      item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
    });
  });
});

// ── Lightbox ──────────────────────────────────────────────────
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
let   currentItems    = [];
let   currentIndex    = 0;

function openLightbox(items, index) {
  currentItems = items;
  currentIndex = index;
  showSlide(index);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
function showSlide(i) {
  const el    = currentItems[i];
  const img   = el.querySelector('.portfolio-item__img-wrap img');
  const title = el.querySelector('.portfolio-item__title');
  const loc   = el.querySelector('.portfolio-item__loc');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = title
    ? title.textContent + (loc ? ' · ' + loc.textContent : '')
    : '';
}

document.querySelectorAll('.portfolio-item').forEach(item => {
  item.addEventListener('click', () => {
    const visible = [...document.querySelectorAll('.portfolio-item')].filter(i => !i.classList.contains('hidden'));
    openLightbox(visible, visible.indexOf(item));
  });
});

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', e => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
  showSlide(currentIndex);
});
document.getElementById('lightboxNext').addEventListener('click', e => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % currentItems.length;
  showSlide(currentIndex);
});
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  document.getElementById('lightboxPrev').click();
  if (e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
});

// ── Contact form (client-side only) ──────────────────────────
// To receive real emails: add action="https://formspree.io/f/YOUR_ID" to <form>
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const note = document.getElementById('formNote');
  const name = document.getElementById('name').value.trim();
  if (!name) { note.style.color = '#c00'; note.textContent = 'Please enter your name.'; return; }
  note.style.color = '#2a7a2a';
  note.textContent = 'Thank you! We will get back to you shortly.';
  e.target.reset();
});
