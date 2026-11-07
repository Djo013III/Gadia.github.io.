const grid = document.getElementById('grid');
const chipsContainer = document.getElementById('chips');
const searchInput = document.getElementById('search');
const emptyMsg = document.getElementById('empty');
const searchPanel = document.getElementById('searchPanel');
const searchToggle = document.getElementById('searchToggle');
const searchClose = document.getElementById('searchClose');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

let items = [];
let activeCategory = 'Все';

// ===== ТЕМА =====
const sunIcon = `<circle cx="12" cy="12" r="4"></circle>
  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>`;
const moonIcon = `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>`;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
  localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme')
  || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ===== ПОИСК =====
function openSearch() {
  searchPanel.classList.add('open');
  setTimeout(() => searchInput.focus(), 150);
}
function closeSearch() {
  searchPanel.classList.remove('open');
  searchInput.value = '';
  render();
}
searchToggle.addEventListener('click', () => {
  searchPanel.classList.contains('open') ? closeSearch() : openSearch();
});
searchClose.addEventListener('click', closeSearch);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSearch();
});
// закрытие по клику вне панели
document.addEventListener('click', e => {
  if (
    searchPanel.classList.contains('open') &&
    !searchPanel.contains(e.target) &&
    !searchToggle.contains(e.target)
  ) closeSearch();
});

// ===== ГРАДИЕНТЫ =====
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

// ===== ЗАГРУЗКА ДАННЫХ =====
fetch('data.json')
  .then(r => r.json())
  .then(data => { items = data; buildChips(); render(); })
  .catch(() => {
    items = window.FALLBACK_ITEMS || [];
    buildChips();
    render();
  });

function buildChips() {
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
  const q = searchInput.value.trim().toLowerCase();
  const filtered = items.filter(item => {
    const matchCat = activeCategory === 'Все' || item.category === activeCategory;
    const matchSearch = !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.tags || []).some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  grid.innerHTML = '';
  emptyMsg.style.display = filtered.length ? 'none' : 'block';

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-poster" style="background:${gradientFor(item.title)}">
        ${item.title.split(' ').slice(0, 2).join('<br>')}
      </div>
      <div class="card-body">
        <div class="card-cat">${item.category}</div>
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.description}</div>
        <div class="card-tags">${(item.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    `;
    card.onclick = () => openModal(item);
    grid.appendChild(card);
  });
}

searchInput.addEventListener('input', render);

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
  modal.querySelector('.modal-cat').textContent = item.category;
  modal.querySelector('.modal-title').textContent = item.title;
  modal.querySelector('.modal-text').textContent = item.description;
  modal.querySelector('.modal-tags').innerHTML =
    (item.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  modal.classList.add('open');
}
modal.querySelector('.modal-close').onclick = () => modal.classList.remove('open');
modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') modal.classList.remove('open');
});
