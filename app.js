const grid = document.getElementById('grid');
const chipsContainer = document.getElementById('chips');
const searchInput = document.getElementById('search');
const emptyMsg = document.getElementById('empty');

let items = [];
let activeCategory = 'Все';

const gradients = [
  'linear-gradient(135deg, #3a2a1a, #1a1208)',
  'linear-gradient(135deg, #2a1a3a, #12081a)',
  'linear-gradient(135deg, #1a2a3a, #08121a)',
  'linear-gradient(135deg, #3a1a1a, #1a0808)',
  'linear-gradient(135deg, #1a3a2a, #081a12)',
  'linear-gradient(135deg, #3a3a1a, #1a1a08)'
];

function gradientFor(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return gradients[sum % gradients.length];
}

// Загрузка данных
fetch('data.json')
  .then(r => r.json())
  .then(data => {
    items = data;
    buildChips();
    render();
  })
  .catch(() => {
    // fallback, если data.json не загрузился (например, при открытии файла локально)
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

// Модальное окно
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
document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });