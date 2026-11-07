// ===== ЭЛЕМЕНТЫ =====
const grid = document.getElementById('grid');
const chipsContainer = document.getElementById('chips');
const searchInput = document.getElementById('search');
const emptyMsg = document.getElementById('empty');
const searchPanel = document.getElementById('searchPanel');
const searchToggle = document.getElementById('searchToggle');
const searchClose = document.getElementById('searchClose');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

const slidesEl = document.getElementById('slides');
const dotsEl = document.getElementById('dots');
const heroTag = document.getElementById('heroTag');
const heroTitle = document.getElementById('heroTitle');
const heroDesc = document.getElementById('heroDesc');
const heroBtn = document.getElementById('heroBtn');
const heroContent = document.getElementById('heroContent');

const sectionView = document.getElementById('sectionView');
const svTitle = document.getElementById('svTitle');
const svDesc = document.getElementById('svDesc');
const subsectionList = document.getElementById('subsectionList');
const backBtn = document.getElementById('backBtn');
const carousel = document.querySelector('.hero-carousel');

// ===== СОСТОЯНИЕ =====
let items = window.myData.items || [];
let sections = window.myData.sections || [];
let activeCategory = 'Все';
let currentSlide = 0;
let slideTimer = null;
let carouselInitialized = false;
const SLIDE_DURATION = 5000;

// ===== ГРАДИЕНТЫ (Объявлены до их использования) =====
const gradients = [
  'linear-gradient(135deg, #3a2a1a, #1a1208)',
  'linear-gradient(135deg, #2a1a3a, #12081a)',
  'linear-gradient(135deg, #1a2a3a, #08121a)',
  'linear-gradient(135deg, #3a1a1a, #1a0808)',
  'linear-gradient(135deg, #1a3a2a, #081a12)',
  'linear-gradient(135deg, #3a3a1a, #1a1a08)'
];

const lightGradients = [
  'linear-gradient(135deg, #e8d3b0, #d8bf94)',
  'linear-gradient(135deg, #d8c8e0, #c4b0d0)',
  'linear-gradient(135deg, #c8d8e0, #aec4d0)',
  'linear-gradient(135deg, #e0c8c0, #d0b0a4)',
  'linear-gradient(135deg, #c8dcc8, #aec8ae)',
  'linear-gradient(135deg, #e0dcc0, #d0c8a4)'
];

function gradientFor(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const palette = isLight ? lightGradients : gradients;
  return palette[sum % palette.length];
}

// ===== ТЕМА =====
const sunIcon = `<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>`;
const moonIcon = `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>`;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) themeIcon.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
  localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme')
  || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// ===== ПОИСК =====
function openSearch() {
  if (!searchPanel) return;
  searchPanel.classList.add('open');
  setTimeout(() => searchInput && searchInput.focus(), 150);
}

function closeSearch() {
  if (!searchPanel) return;
  searchPanel.classList.remove('open');
  if (searchInput) searchInput.value = '';
  render();
}

if (searchToggle) {
  searchToggle.addEventListener('click', () => {
    if (searchPanel && searchPanel.classList.contains('open')) closeSearch();
    else openSearch();
  });
}

if (searchClose) searchClose.addEventListener('click', closeSearch);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSearch();
});

document.addEventListener('click', e => {
  if (
    searchPanel &&
    searchPanel.classList.contains('open') &&
    !searchPanel.contains(e.target) &&
    searchToggle &&
    !searchToggle.contains(e.target)
  ) closeSearch();
});

// ===== КАТАЛОГ =====
function buildChips() {
  if (!chipsContainer) return;
  const cats = ['Все', ...new Set(items.map(i => i.category))];
  chipsContainer.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (cat === activeCategory ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => {
      activeCategory = cat;
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      render();
    };
    chipsContainer.appendChild(btn);
  });
}

function render() {
  if (!grid) return;

  const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const filtered = items.filter(item => {
    const matchCat = activeCategory === 'Все' || item.category === activeCategory;
    const matchSearch = !q ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.tags || []).some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  grid.innerHTML = '';
  if (emptyMsg) emptyMsg.style.display = filtered.length ? 'none' : 'block';

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-poster" style="background:${gradientFor(item.title || '')}">
        ${(item.title || '').split(' ').slice(0, 2).join('<br>')}
      </div>
      <div class="card-body">
        <div class="card-cat">${item.category || ''}</div>
        <div class="card-title">${item.title || ''}</div>
        <div class="card-desc">${item.description || ''}</div>
        <div class="card-tags">${(item.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    `;
    card.onclick = () => openModal(item);
    grid.appendChild(card);
  });
}

if (searchInput) searchInput.addEventListener('input', render);

// ===== МОДАЛЬНОЕ ОКНО =====
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
  <div class="modal-box">
    <button class="modal-close">×</button>
    <div class="modal-cat"></div>
    <div class="modal-title"></div>
    <div class="modal-text"></div>
    <div class="modal-tags"></div>
  </div>
`;
document.body.appendChild(modal);

function openModal(item) {
  const catEl = modal.querySelector('.modal-cat');
  const titleEl = modal.querySelector('.modal-title');
  const textEl = modal.querySelector('.modal-text');
  const tagsEl = modal.querySelector('.modal-tags');

  if (catEl) catEl.textContent = item.category || '';
  if (titleEl) titleEl.textContent = item.title || '';
  if (textEl) textEl.textContent = item.description || '';
  if (tagsEl) {
    tagsEl.innerHTML = (item.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  }
  modal.classList.add('open');
}

const modalClose = modal.querySelector('.modal-close');
if (modalClose) modalClose.onclick = () => modal.classList.remove('open');

modal.onclick = e => {
  if (e.target === modal) modal.classList.remove('open');
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') modal.classList.remove('open');
});

// ===== КАРУСЕЛЬ =====
function initCarousel() {
  if (carouselInitialized || !slidesEl || !dotsEl || !sections.length) return;
  carouselInitialized = true;

  sections.forEach((sec, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (i === 0 ? ' active' : '');
    slide.style.background = sec.background || 'var(--hero-grad)';
    slidesEl.appendChild(slide);

    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.innerHTML = '<span></span>';
    dotsEl.appendChild(dot);
  });

  updateHeroText(0);
  startAutoplay();

  if (heroBtn) heroBtn.addEventListener('click', () => openSection(currentSlide));
  if (backBtn) backBtn.addEventListener('click', closeSection);
}

function updateHeroText(index) {
  const sec = sections[index];
  if (!sec || !heroContent) return;

  heroContent.style.opacity = '0';
  setTimeout(() => {
    if (heroTag) heroTag.textContent = sec.tag || '';
    if (heroTitle) heroTitle.textContent = sec.title || '';
    if (heroDesc) heroDesc.textContent = sec.description || '';
    heroContent.style.opacity = '1';
  }, 250);
}

function goToSlide(index) {
  if (!sections.length) return;

  const slides = slidesEl.querySelectorAll('.slide');
  const dots = dotsEl.querySelectorAll('.dot');

  slides.forEach((s, i) => s.classList.toggle('active', i === index));

  dots.forEach((d, i) => {
    d.classList.toggle('active', i === index);
    const span = d.querySelector('span');
    if (span) {
      span.style.animation = 'none';
      void span.offsetWidth;
      span.style.animation = '';
    }
  });

  currentSlide = index;
  updateHeroText(index);
}

function startAutoplay() {
  stopAutoplay();
  if (!sections.length) return;
  slideTimer = setInterval(() => {
    goToSlide((currentSlide + 1) % sections.length);
  }, SLIDE_DURATION);
}

function stopAutoplay() {
  if (slideTimer) {
    clearInterval(slideTimer);
    slideTimer = null;
  }
}

// ===== МИНИ-БИБЛИОТЕКА РАЗДЕЛА =====
function openSection(index) {
  const sec = sections[index];
  if (!sec || !sectionView) return;

  stopAutoplay();

  if (svTitle) svTitle.textContent = sec.title || '';
  if (svDesc) svDesc.textContent = sec.description || '';

  if (subsectionList) {
    subsectionList.innerHTML = '';
    (sec.subsections || []).forEach(sub => {
      const div = document.createElement('div');
      div.className = 'subsection';
      div.innerHTML = `
        <h3>${sub.title || ''}</h3>
        <p>${sub.text || ''}</p>
        <div class="sub-tags">${(sub.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      `;
      subsectionList.appendChild(div);
    });
  }

  if (carousel) carousel.style.display = 'none';
  sectionView.classList.add('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeSection() {
  if (sectionView) sectionView.classList.remove('open');
  if (carousel) carousel.style.display = 'flex';
  startAutoplay();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ЗАПУСК ВСЕГО =====
buildChips();
render();
initCarousel();
