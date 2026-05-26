/* ══════════════════════════════════════════════════════════════
   GRAND LINE — Clara & Bê · script
══════════════════════════════════════════════════════════════ */

const STATE = {
  current: 1,
  total: 15,
  visited: new Set([1]),
};

/* ════════════════════════════════════════════════════════════
   WORLD MAP — posições das ilhas em SVG (viewBox 1000x1400)
════════════════════════════════════════════════════════════ */
const WORLD_ISLANDS = [
  { i: 1,  x: 200, y: 130,  label: 'Reino Desencantado' },
  { i: 2,  x: 480, y: 180,  label: 'O Olhar' },
  { i: 3,  x: 700, y: 330,  label: 'Festa da Firma' },
  { i: 4,  x: 660, y: 510,  label: 'Regimento' },
  { i: 5,  x: 380, y: 600,  label: 'Stories' },
  { i: 6,  x: 220, y: 760,  label: 'O Convite' },
  { i: 7,  x: 380, y: 900,  label: 'Conselheiro Mata' },
  { i: 8,  x: 680, y: 850,  label: 'Luffy' },
  { i: 9,  x: 820, y: 920,  label: 'O Vilão' },
  { i: 10, x: 660, y: 1060, label: 'De Repente 30' },
  { i: 11, x: 380, y: 1140, label: 'Grand Line' },
  { i: 12, x: 320, y: 1290, label: 'A Festa' },
  { i: 13, x: 500, y: 1320, label: 'Comédia' },
  { i: 14, x: 680, y: 1280, label: 'Sessão da Tarde' },
  { i: 15, x: 820, y: 1180, label: 'RSVP' },
];

/* ════════════════════════════════════════════════════════════
   "CONFIRA AQUI" — conteúdo dos modais por ilha
════════════════════════════════════════════════════════════ */
const CONFIRA = {
  1: {
    title: 'O Reino Desencantado',
    photos: ['assets/fotos/evento-startbet.jpeg', 'assets/fotos/evento-startbet-be.jpeg'],
    caption: 'O Reino Desencantado tinha cara de empresa: crachás, RH, eventos corporativos. Foi exatamente ali que começou.',
  },
  3: {
    title: 'A Festa da Firma',
    photos: ['assets/fotos/evento-startbet.jpeg', 'assets/fotos/evento-startbet-be.jpeg'],
    caption: 'A noite em que o RH percebeu — e mandou recado.',
  },
  5: {
    title: 'Stories, Reels e o início',
    photos: ['assets/fotos/casal-fun.jpeg', 'assets/fotos/casal-carro.jpeg'],
    caption: 'O começo: curtidas, reels, mensagens que não terminavam. E uma série inteira de The Office assistida por obrigação amorosa.',
  },
  7: {
    title: 'Conselheiro Mata',
    photos: ['assets/fotos/conselheiro-mata.jpeg', 'assets/fotos/conselheiro-fogueira.jpeg', 'assets/fotos/bernardo-mato.jpeg'],
    caption: 'A primeira viagem. Mato, barraca, carrapatos, fogueira. Romance no estado bruto.',
  },
  8: {
    title: 'Luffy entra em cena',
    photos: ['assets/fotos/luffy-filhote.jpeg', 'assets/fotos/luffy-cachorro.jpeg'],
    caption: 'Luffy: Border Collie duplo merle. Mais amor, mais pelos, mais caos no roteiro.',
  },
  10: {
    title: 'De Repente 30',
    photos: ['assets/fotos/casal-fun.jpeg', 'assets/fotos/casal-encontro.jpeg'],
    caption: 'Clara, agora oficialmente no enredo de De Repente 30.',
  },
  11: {
    title: 'Bernardo na Grand Line',
    photos: ['assets/fotos/bernardo-floresta.jpeg', 'assets/fotos/casal-carro.jpeg'],
    caption: 'Bernardo navegando pela própria Grand Line — meio perdido, mas com o coração no rumo certo.',
  },
  12: {
    title: 'A Festa — onde, quando e como',
    photos: ['assets/fotos/casal-principal.jpeg'],
    caption: 'Dia 13 de junho de 2026 · sábado · a partir das 14h · Recanto da Serra, Brumadinho/MG. Piscina, sauna, comida, drinks e Brasil na Copa.',
  },
};

/* ════════════════════════════════════════════════════════════
   INTRO — animação de digitação do título
════════════════════════════════════════════════════════════ */
function initIntro() {
  const titleEl = document.getElementById('intro-title-text');
  const fullTitle = 'Grand Line';

  // typing effect
  titleEl.textContent = '';
  let i = 0;
  const iv = setInterval(() => {
    if (i < fullTitle.length) {
      titleEl.textContent += fullTitle[i++];
    } else {
      clearInterval(iv);
    }
  }, 90);

  // glitter
  initGlitter();

  // botão zarpar
  document.getElementById('zarpar-btn').addEventListener('click', () => {
    document.getElementById('intro-screen').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('intro-screen').classList.add('hidden');
      showWelcome();
    }, 800);
  });
}

function initGlitter() {
  const container = document.getElementById('intro-glitter');
  if (!container) return;
  const colors = ['#FFD700', '#FF9EC4', '#C9A0DC', '#FFFFFF', '#FFC2A1'];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'glitter-particle';
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = colors[i % colors.length];
    p.style.setProperty('--gd', (2.5 + Math.random() * 3) + 's');
    p.style.setProperty('--gdelay', (Math.random() * 5) + 's');
    p.style.width = p.style.height = (3 + Math.random() * 5) + 'px';
    container.appendChild(p);
  }
}

/* ════════════════════════════════════════════════════════════
   WELCOME
════════════════════════════════════════════════════════════ */
function showWelcome() {
  const w = document.getElementById('welcome-screen');
  w.classList.remove('hidden');

  document.getElementById('welcome-embark').addEventListener('click', () => {
    w.classList.add('fade-out');
    setTimeout(() => {
      w.classList.add('hidden');
      enterMap();
    }, 600);
  }, { once: true });
}

function enterMap() {
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('map-wrapper').classList.remove('hidden');
  navigateTo(1, false);
}

/* ════════════════════════════════════════════════════════════
   NAVEGAÇÃO entre páginas
════════════════════════════════════════════════════════════ */
function getIslands() {
  return Array.from(document.querySelectorAll('.island[data-index]'));
}

function navigateTo(index, smooth = true) {
  const islands = getIslands();
  if (index < 1 || index > islands.length) return;
  STATE.current = index;
  STATE.visited.add(index);

  const target = islands[index - 1];
  const map = document.getElementById('map');
  const offset = target.offsetLeft;

  if (smooth) {
    map.style.transition = 'transform 0.75s var(--easing-page, cubic-bezier(0.22, 0.61, 0.36, 1))';
  } else {
    map.style.transition = 'none';
  }
  map.style.transform = `translateX(-${offset}px)`;

  // HUD update
  document.getElementById('current-island-name').textContent =
    target.dataset.name || `Capítulo ${index}`;
  document.getElementById('hud-current').textContent = index;
  document.getElementById('hud-total').textContent = islands.length;

  // Progress dots
  updateProgressDots(index);

  // Nav buttons
  document.getElementById('nav-left').disabled = index <= 1;
  document.getElementById('nav-right').disabled = index >= islands.length;

  // Scroll inner page to top
  const innerPage = target.querySelector('.island-page');
  if (innerPage) innerPage.scrollTop = 0;

  // Update world map markers if open
  updateWorldMapMarkers();
}

/* ════════════════════════════════════════════════════════════
   WORLD MAP — zoom-out de todas as ilhas
════════════════════════════════════════════════════════════ */
function initWorldMap() {
  const container = document.getElementById('world-islands');
  if (!container) return;

  // Injeta as ilhas
  WORLD_ISLANDS.forEach(island => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'world-island');
    g.setAttribute('data-i', island.i);
    g.setAttribute('transform', `translate(${island.x}, ${island.y})`);

    g.innerHTML = `
      <circle class="island-marker" cx="0" cy="0" r="22"/>
      <text class="island-num" x="0" y="4">${island.i}</text>
      <text class="island-label" x="0" y="46">${island.label}</text>
    `;

    g.addEventListener('click', () => {
      navigateTo(island.i);
      closeWorldMap();
    });

    container.appendChild(g);
  });

  // Botões de abrir/fechar
  document.getElementById('open-world-map').addEventListener('click', openWorldMap);
  document.getElementById('close-world-map').addEventListener('click', closeWorldMap);

  // ESC para fechar
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('world-map').classList.contains('hidden')) {
      closeWorldMap();
    }
  });
}

function openWorldMap() {
  const wm = document.getElementById('world-map');
  wm.classList.remove('hidden', 'fade-out');
  updateWorldMapMarkers();
}

function closeWorldMap() {
  const wm = document.getElementById('world-map');
  wm.classList.add('fade-out');
  setTimeout(() => {
    wm.classList.add('hidden');
    wm.classList.remove('fade-out');
  }, 400);
}

function updateWorldMapMarkers() {
  document.querySelectorAll('.world-island').forEach(g => {
    const i = parseInt(g.dataset.i);
    g.classList.remove('visited', 'current');
    if (i === STATE.current) g.classList.add('current');
    else if (STATE.visited.has(i) || i < STATE.current) g.classList.add('visited');
  });
}

function initProgressDots() {
  const container = document.getElementById('island-progress');
  if (!container) return;
  const islands = getIslands();
  islands.forEach((island, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (i === islands.length - 1) dot.classList.add('dot-rsvp');
    dot.title = island.dataset.name || `Capítulo ${i + 1}`;
    dot.addEventListener('click', () => navigateTo(i + 1));
    container.appendChild(dot);
  });
  updateProgressDots(1);
}

function updateProgressDots(index) {
  document.querySelectorAll('.progress-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'visited');
    if (i + 1 === index) dot.classList.add('active');
    else if (i + 1 < index) dot.classList.add('visited');
  });
}

function initNavigation() {
  document.getElementById('nav-left').addEventListener('click', () => navigateTo(STATE.current - 1));
  document.getElementById('nav-right').addEventListener('click', () => navigateTo(STATE.current + 1));

  document.addEventListener('keydown', e => {
    if (!document.getElementById('modal').classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')   navigateTo(STATE.current - 1);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigateTo(STATE.current + 1);
  });

  // Swipe
  let touchStartX = 0, touchStartY = 0;
  const wrapper = document.getElementById('map-wrapper');
  wrapper.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  wrapper.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // só conta swipe horizontal, ignora vertical (scroll de página)
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      navigateTo(STATE.current + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  // CTA: ir do capítulo final pro RSVP
  const goRsvp = document.getElementById('go-to-rsvp');
  if (goRsvp) goRsvp.addEventListener('click', () => navigateTo(15));
}

/* ════════════════════════════════════════════════════════════
   "CONFIRA AQUI" — modais com fotos
════════════════════════════════════════════════════════════ */
function initConfira() {
  document.querySelectorAll('.confira-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.confira;
      openConfira(id);
    });
  });
}

function openConfira(id) {
  const data = CONFIRA[id];
  if (!data) return;

  let photosHtml = '';
  if (data.photos && data.photos.length === 1) {
    photosHtml = `<div class="photo-single"><img src="${data.photos[0]}" alt="${data.title}"></div>`;
  } else if (data.photos && data.photos.length > 1) {
    photosHtml = `<div class="photo-grid">${data.photos.map(p => `<img src="${p}" alt="${data.title}">`).join('')}</div>`;
  }

  openModal(`
    <h3>${data.title}</h3>
    ${photosHtml}
    ${data.caption ? `<p class="modal-caption">${data.caption}</p>` : ''}
  `);
}

/* ════════════════════════════════════════════════════════════
   MODAL — infra
════════════════════════════════════════════════════════════ */
function openModal(html) {
  const modal = document.getElementById('modal');
  document.getElementById('modal-body').innerHTML = html;
  modal.classList.remove('hidden');
  // focus trap simples
  document.getElementById('modal-close').focus();
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function initModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('modal').classList.contains('hidden')) {
      closeModal();
    }
  });
}

/* ════════════════════════════════════════════════════════════
   RSVP — form submit + confirmação
════════════════════════════════════════════════════════════ */
function initRSVP() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        showConfirmation();
        showToast('Presença confirmada!');
      } else {
        throw new Error('Erro Formspree');
      }
    } catch (err) {
      // mesmo se Formspree não configurado, deixa o user prosseguir
      showConfirmation();
      showToast('Confirmação recebida localmente. Configure o Formspree para receber as respostas.');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  // ICS
  const btnIcs = document.getElementById('btn-ics-final');
  if (btnIcs) btnIcs.addEventListener('click', downloadICS);
}

function showConfirmation() {
  document.getElementById('rsvp-form-wrap').classList.add('hidden');
  document.getElementById('rsvp-confirmed').classList.remove('hidden');
}

function downloadICS() {
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Grand Line//Clara & Bê//PT
BEGIN:VEVENT
DTSTART:20260613T140000
DTEND:20260613T230000
SUMMARY:Sessão da Tarde — Aniversário Clara & Bê
DESCRIPTION:Dois aniversários. Uma história improvável. Brasil na Copa.
LOCATION:Av Nair Martins Drumond\\, nº 7\\, Recanto da Serra\\, Brumadinho/MG
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sessao-da-tarde-clara-be.ics';
  a.click();
  URL.revokeObjectURL(url);
}

/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */
function showToast(msg, duration = 2800) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  initNavigation();
  initProgressDots();
  initConfira();
  initModal();
  initRSVP();
  initWorldMap();
});

// reajusta posição em resize (vw muda)
window.addEventListener('resize', () => {
  if (!document.getElementById('map-wrapper').classList.contains('hidden')) {
    navigateTo(STATE.current, false);
  }
});
