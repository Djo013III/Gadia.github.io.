const grid = document.getElementById('grid');
const chipsContainer = document.getElementById('chips');
const searchInput = document.getElementById('search');
const emptyMsg = document.getElementById('empty');
const searchPanel = document.getElementById('searchPanel');
const searchToggle = document.getElementById('searchToggle');
const searchClose = document.getElementById('searchClose');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const promo = document.getElementById('promo');
const promoClose = document.getElementById('promoClose');
const promoOpenCollections = document.getElementById('promoOpenCollections');

const collectionsToggle = document.getElementById('collectionsToggle');
const collectionsPanel = document.getElementById('collectionsPanel');
const collectionsClose = document.getElementById('collectionsClose');
const collectionsGrid = document.getElementById('collectionsGrid');

const activeCollection = document.getElementById('activeCollection');
const activeCollectionName = document.getElementById('activeCollectionName');
const clearCollectionBtn = document.getElementById('clearCollection');

let items = [];
let activeCategory = 'Все';
let activeCollectionIds = null; // null = подборка не выбрана

// ===== ПОДБОРКИ =====
// ID должны совпадать с data.json
const COLLECTIONS = [
  {
    id: 'start',
    icon: '🚪',
    title: 'С чего начать',
    desc: 'Краткий маршрут: кто такой Честняков, его главная картина и где он учился.',
    ids: ['psevdonim', 'shkola-Repina', 'city-wellbeing']
  },
  {
    id: 'painting',
    icon: '🎨',
    title: 'Живопись и утопия',
    desc: 'Главные полотна и история их обретения. Для тех, кто пришёл смотреть картины.',
    ids: ['city-wellbeing', 'obretenie', 'materialy']
  },
  {
    id: 'glinyanki',
    icon: '🏺',
    title: 'Глинянки и театр',
    desc: 'Скульптура, детский театр и трагедия «актёров» из глины.',
    ids: ['glinyanki', 'teatr']
  },
  {
    id: 'skazki',
    icon: '📖',
    title: 'Сказки и мифология',
    desc: 'Литература, кологривский говор и персонажи народных поверий.',
    ids: ['chudesnoe-yabloko', 'teteriviny-korol', 'mifologiya']
  },
  {
    id: 'memory',
    icon: '🕯️',
    title: 'Народная память',
    desc: 'Пророчества, целительство, Ефимов ключ и почитание как праведника.',
    ids: ['e fimov-kluch', 'prorochestva', 'yurodstvo']
  },
  {
    id: 'bio',
    icon: '🧭',
    title: 'Биография и быт',
    desc: 'Семья, сёстры, фотография и повседневная жизнь в Шаблове.',
    ids: ['psevdonim', 'sestry', 'fotograf', 'obretenie']
  }
];

function renderCollections() {
  collectionsGrid.innerHTML = '';
  COLLECTIONS.forEach(col => {
    // считаем только те id, что реально есть в data.json
    const count = col.ids.filter(id => items.some(i => i.id === id)).length;
    const card = document.createElement('div');
    card.className = 'collection-card';
    card.innerHTML = `
      <span class="cc-icon">${col.icon}</span>
      <span class="cc-title">${col.title}</span>
      <span class="cc-desc">${col.desc}</span>
      <span class="cc-count">${count} материалов</span>
    `;
    card.onclick = () => applyCollection(col);
    collectionsGrid.appendChild(card);
  });
}

function applyCollection(col) {
  activeCollectionIds = col.ids;
  activeCategory = 'Все';
  searchInput.value = '';
  // сбрасываем чипы
  document.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.textContent === 'Все');
  });
  activeCollectionName.textContent = `${col.icon} ${col.title}`;
  activeCollection.hidden = false;
  closeCollections();
  render();
  // прокрутка к каталогу
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearCollection() {
  activeCollectionIds = null;
  activeCollection.hidden = true;
  render();
}

clearCollectionBtn.addEventListener('click', clearCollection);

function openCollections() {
  collectionsPanel.classList.add('open');
  collectionsToggle.classList.add('active');
  closeSearch();
}
function closeCollections() {
  collectionsPanel.classList.remove('open');
  collectionsToggle.classList.remove('active');
}
collectionsToggle.addEventListener('click', () => {
  collectionsPanel.classList.contains('open') ? closeCollections() : openCollections();
});
collectionsClose.addEventListener('click', closeCollections);

// ===== ПРОМО-БАННЕР =====
if (localStorage.getItem
