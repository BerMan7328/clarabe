/* ══════════════════════════════════════════════════════════════
   GRAND LINE — Clara & Bê · script
══════════════════════════════════════════════════════════════ */

const STATE = {
  current: 1,
  total: 15,
  visited: new Set([1]),
  skippedStory: false, // true se clicou em "sou chato, quero pular a história"
  quizScore: null,     // ex: "7/10"
  quizTags: '',        // ex: "1,3,5,7,8,9,10" (índices 1-based das perguntas acertadas)
  quizSuggestionSkipped: false, // true se já recusou fazer o quiz antes de enviar
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

  // Botão "sou chato, quero pular a história" → vai direto pra ilha 15 (RSVP)
  const skipBtn = document.getElementById('welcome-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      STATE.skippedStory = true; // marca que esse user pulou — vai pra planilha
      w.classList.add('fade-out');
      setTimeout(() => {
        w.classList.add('hidden');
        enterMap(15);
      }, 600);
    }, { once: true });
  }
}

function enterMap(targetIsland = 1) {
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('map-wrapper').classList.remove('hidden');
  // garante que o browser fez layout antes de calcular offsetLeft do alvo
  requestAnimationFrame(() => {
    requestAnimationFrame(() => navigateTo(targetIsland, false));
  });
  // chama atenção pro quiz logo no início
  setTimeout(showQuizNudge, 1200);
}

function showQuizNudge() {
  // Não mostra se já mostrou antes nessa sessão
  if (localStorage.getItem('quizNudgeSeen') === '1') return;
  const nudge = document.getElementById('quiz-nudge');
  if (!nudge) return;
  nudge.classList.remove('hidden');
  // auto-esconde após 10s
  setTimeout(hideQuizNudge, 10000);
}

function hideQuizNudge() {
  const nudge = document.getElementById('quiz-nudge');
  if (!nudge || nudge.classList.contains('hidden')) return;
  nudge.classList.add('fade-out');
  setTimeout(() => {
    nudge.classList.add('hidden');
    nudge.classList.remove('fade-out');
  }, 400);
  // marca como visto pra não aparecer de novo
  localStorage.setItem('quizNudgeSeen', '1');
  // tira o pulse do botão
  const btn = document.getElementById('open-quiz');
  if (btn) btn.classList.add('calmed');
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
   QUIZ DO CASAL — 10 perguntas sobre a história
════════════════════════════════════════════════════════════ */
const QUIZ = [
  {
    q: "Quem disse: 'quem é esse menino?'",
    options: ['Clara', 'Bernardo', 'O RH', 'Luffy'],
    correct: 0,
    explanation: "Clara, no primeiro evento da empresa — ele olhando nada discreto desde 2022.",
  },
  {
    q: 'Qual a diferença de idade entre eles?',
    options: ['1 ano (ele mais novo)', '2 anos (ele mais novo)', '3 anos (ele mais novo)', '3 anos (ela mais nova)'],
    correct: 2,
    explanation: 'Bernardo é 3 anos mais novo que Clara.',
  },
  {
    q: 'Onde aconteceu o primeiro grande sinal?',
    options: ['Em um bar', 'Em uma festa da empresa', 'No Instagram', 'Em Conselheiro Mata'],
    correct: 1,
    explanation: "No dia seguinte ao primeiro olhar, em uma festa da firma — onde Clara ia, Bernardo aparecia.",
  },
  {
    q: 'O que o RH disse sobre o casal?',
    options: ['Parabéns', "'Melhor vocês não se envolverem por causa do trabalho'", 'Nada, nunca soube', 'Que era proibido namorar'],
    correct: 1,
    explanation: 'O alerta clássico — ironicamente, o regulamento foi escrito pela própria Clara.',
  },
  {
    q: 'Como Clara começou a conversa fora do trabalho?',
    options: ['Mandou DM no LinkedIn', 'Pediu o Instagram dele', 'Pediu o número', 'Marcou um café'],
    correct: 1,
    explanation: 'Com uma desculpa qualquer, Clara pediu o Instagram dele.',
  },
  {
    q: 'O que Bernardo mandava no Instagram pra conquistar?',
    options: ['Frases motivacionais', 'Memes de gato', 'Reels de The Office (mesmo sem gostar)', 'Fotos do treino'],
    correct: 2,
    explanation: 'Reels de The Office — mesmo Bernardo nem gostando, mas fingindo com a dedicação de quem já estava entregue ao papel.',
  },
  {
    q: 'Onde foi a primeira viagem que virou namoro?',
    options: ['Serra do Cipó', 'Conselheiro Mata', 'Piracema', 'Guarapari'],
    correct: 1,
    explanation: 'Conselheiro Mata — mato, barraca e carrapatos.',
  },
  {
    q: 'O Luffy (cachorro) é:',
    options: ['Albino', 'Duplo merle', 'Mestiço', 'Pintado'],
    correct: 1,
    explanation: 'Parece albino, mas é duplo merle. Detalhe importante.',
  },
  {
    q: 'Quantos anos a Clara está fazendo?',
    options: ['27', '28', '29', '30'],
    correct: 3,
    explanation: 'Clara está chegando oficialmente em "De Repente 30".',
  },
  {
    q: 'E o Bernardo?',
    options: ['25', '26', '27', '28'],
    correct: 2,
    explanation: 'Bernardo está fazendo 27 — meio perdido às vezes, mas sempre com o coração no lugar certo.',
  },
];

let quizState = null;

function openQuizModal() {
  quizState = { index: 0, score: 0, hits: [] };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (quizState.index >= QUIZ.length) return finishQuiz();
  const q = QUIZ[quizState.index];
  const opts = q.options.map((opt, i) =>
    `<button type="button" class="quiz-option" data-quiz-i="${i}">${opt}</button>`
  ).join('');
  openModal(`
    <h3>Quiz do Casal</h3>
    <div class="quiz-progress">Pergunta ${quizState.index + 1} de ${QUIZ.length} · ${quizState.score} acertos</div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">${opts}</div>
  `);
}

function answerQuiz(i) {
  const q = QUIZ[quizState.index];
  const correct = i === q.correct;
  if (correct) {
    quizState.score++;
    quizState.hits.push(quizState.index + 1); // índice 1-based
  }

  document.querySelectorAll('.quiz-option').forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.correct) btn.classList.add('correct');
    else if (idx === i) btn.classList.add('wrong');
  });

  const body = document.getElementById('modal-body');
  const exp = document.createElement('div');
  exp.className = 'quiz-explanation ' + (correct ? 'is-correct' : 'is-wrong');
  exp.innerHTML = `
    <span class="quiz-exp-icon">${correct ? '✓' : '✗'}</span>
    <span class="quiz-exp-text">${q.explanation}</span>
    <button type="button" class="quiz-next">${quizState.index === QUIZ.length - 1 ? 'Ver resultado' : 'Próxima'} →</button>`;
  body.appendChild(exp);
  // o listener é via event delegation no initQuiz
}

function finishQuiz() {
  const score = quizState.score;
  const pct = Math.round((score / QUIZ.length) * 100);

  // salva no STATE pra ir junto com o RSVP
  STATE.quizScore = `${score}/${QUIZ.length}`;
  STATE.quizTags  = quizState.hits.join(',');

  let title, msg;
  if (pct === 100)      { title = 'Íntimo do casal!'; msg = 'Você conhece eles como ninguém. Bem-vindo à tripulação principal.'; }
  else if (pct >= 80)   { title = 'Excelente!'; msg = 'Você é da turma íntima. Vai brilhar na festa.'; }
  else if (pct >= 60)   { title = 'Bom!'; msg = 'Você conhece os pontos principais. Dá pra puxar papo tranquilo.'; }
  else if (pct >= 40)   { title = 'Médio'; msg = 'Você conhece o básico. Vai melhorar na festa, prometemos.'; }
  else                  { title = 'Pegou só pela vibe'; msg = 'Talvez você tenha sido convidado por sorte. Sem problemas — dia 13 a gente te apresenta tudo!'; }

  openModal(`
    <h3>${title}</h3>
    <div class="quiz-result">
      <div class="quiz-score">${score}<span>/${QUIZ.length}</span></div>
      <div class="quiz-pct">${pct}%</div>
    </div>
    <p class="quiz-result-msg">${msg}</p>
    <button type="button" class="link-btn quiz-retry" id="quiz-retry">Tentar de novo</button>
  `);
  // listener é via event delegation no initQuiz
}

function showQuizSuggestion() {
  openModal(`
    <h3>Antes de confirmar...</h3>
    <p class="quiz-suggest-intro">
      Que tal testar o quanto você <strong>conhece o casal</strong>?
      São <strong>10 perguntas rápidas</strong> sobre a história deles.
    </p>
    <div class="quiz-suggest-pointer">
      <svg viewBox="0 0 30 50" aria-hidden="true">
        <path d="M15 46 L15 12 M5 22 L15 8 L25 22" stroke="#FFD700" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="quiz-suggest-pointer-text">o botão Quiz fica ali em cima</span>
    </div>
    <div class="quiz-suggest-actions">
      <button type="button" class="primary-btn" id="quiz-suggest-go">Fazer o quiz primeiro</button>
      <button type="button" class="quiz-suggest-skip" id="quiz-suggest-skip">Não, enviar minha confirmação</button>
    </div>
  `);
  document.getElementById('quiz-suggest-go').addEventListener('click', () => {
    closeModal();
    setTimeout(openQuizModal, 250);
  });
  document.getElementById('quiz-suggest-skip').addEventListener('click', () => {
    STATE.quizSuggestionSkipped = true;
    closeModal();
    // re-trigger o submit
    const form = document.getElementById('rsvp-form');
    if (form) form.requestSubmit();
  });
}

function initQuiz() {
  const btn = document.getElementById('open-quiz');
  if (btn) btn.addEventListener('click', () => {
    hideQuizNudge();
    openQuizModal();
  });

  // botão "X" para fechar o nudge
  const closeBtn = document.getElementById('quiz-nudge-close');
  if (closeBtn) closeBtn.addEventListener('click', hideQuizNudge);

  // Event delegation no modal-body — resiliente a re-renders e propagação
  const body = document.getElementById('modal-body');
  if (!body) return;
  body.addEventListener('click', (e) => {
    // Opção do quiz
    const opt = e.target.closest('.quiz-option');
    if (opt && !opt.disabled && quizState) {
      e.stopPropagation();
      answerQuiz(parseInt(opt.dataset.quizI));
      return;
    }
    // Botão "Próxima/Ver resultado"
    const next = e.target.closest('.quiz-next');
    if (next && quizState) {
      e.stopPropagation();
      quizState.index++;
      renderQuizQuestion();
      return;
    }
    // Botão "Tentar de novo"
    const retry = e.target.closest('#quiz-retry');
    if (retry) {
      e.stopPropagation();
      openQuizModal();
    }
  });
}

/* ════════════════════════════════════════════════════════════
   WORLD MAP — zoom-out de todas as ilhas
════════════════════════════════════════════════════════════ */
function initWorldMap() {
  const container = document.getElementById('world-islands');
  if (!container) return;

  // Gera a rota dinâmica conectando todas as ilhas via curva Bezier suave
  const routePath = document.getElementById('route-path');
  if (routePath) {
    let d = `M ${WORLD_ISLANDS[0].x} ${WORLD_ISLANDS[0].y}`;
    for (let i = 1; i < WORLD_ISLANDS.length; i++) {
      const prev = WORLD_ISLANDS[i - 1];
      const cur = WORLD_ISLANDS[i];
      // ponto de controle entre prev e cur, com leve deslocamento
      const cx = (prev.x + cur.x) / 2 + ((i % 2 === 0) ? 30 : -30);
      const cy = (prev.y + cur.y) / 2;
      d += ` Q ${cx} ${cy} ${cur.x} ${cur.y}`;
    }
    routePath.setAttribute('d', d);
  }

  // Injeta as ilhas — wrapper externo para position, interno para scale/animate
  WORLD_ISLANDS.forEach(island => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'world-island');
    g.setAttribute('data-i', island.i);
    g.setAttribute('transform', `translate(${island.x}, ${island.y})`);

    // grupo interno (recebe scale sem conflitar com translate)
    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    inner.setAttribute('class', 'world-island-inner');
    inner.innerHTML = `
      <circle class="island-marker" cx="0" cy="0" r="28"/>
      <text class="island-num" x="0" y="7">${island.i}</text>
      <text class="island-label" x="0" y="56">${island.label}</text>
    `;
    g.appendChild(inner);

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
/* ════════════════════════════════════════════════════════════
   RSVP — Envia para Google Sheets via Apps Script + backup local
   Setup: ver SHEETS_SETUP.md
════════════════════════════════════════════════════════════ */
const RSVP_STORAGE_KEY = 'grand-line-rsvp';
const WHATSAPP_NUMBER = '5531999999999'; // PLACEHOLDER — número de quem recebe confirmações

// COLE AQUI a URL do Web App do Google Apps Script (após o deploy)
// Exemplo: 'https://script.google.com/macros/s/AKfycby.../exec'
const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzcSNBtxSvRHziEwP6_rKMnpNidmwuK1Er7gkYcHNxDnMykcBn966EMeIYp9Kd0_tIM/exec';

function saveRsvpLocally(data) {
  try {
    const all = JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) || '[]');
    all.push({ ...data, savedAt: new Date().toISOString() });
    localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('localStorage indisponível', e);
  }
}

function buildWhatsappMessage(data) {
  const lines = [
    '🏴‍☠️ *Confirmação de presença — Sessão da Tarde*',
    '',
    `*Nome:* ${data.nome || '-'}`,
    `*WhatsApp:* ${data.whatsapp || '-'}`,
    `*Vai?* ${data.vai || '-'}`,
    `*Quantas pessoas:* ${data.quantos || '1'}`,
    `*Lado:* ${data.lado || '-'}`,
    `*Pulou a história?* ${data.chato || 'Não'}`,
  ];
  if (data.acertos_quiz) {
    lines.push(`*Quiz:* ${data.acertos_quiz} acertos`);
  }
  if (data.recado && data.recado.trim()) {
    lines.push('', `*Recado:* ${data.recado}`);
  }
  return encodeURIComponent(lines.join('\n'));
}

async function sendToSheets(dataObj) {
  if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT === 'PLACEHOLDER_SHEETS_URL') {
    return false;
  }
  try {
    // Apps Script Web App não suporta CORS preflight com Content-Type custom,
    // por isso usa 'text/plain' e parse no lado do Apps Script.
    const res = await fetch(SHEETS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors', // Apps Script doPost com no-cors funciona
      body: JSON.stringify({ ...dataObj, ts: new Date().toISOString() }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
    // no-cors: response é opaque (sempre ok=true). Confiamos no envio.
    return true;
  } catch (err) {
    console.warn('Sheets falhou', err);
    return false;
  }
}

function formatBrPhone(raw) {
  const digits = (raw || '').toString().replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2)  return `(${digits}`;
  if (digits.length <= 3)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 7)  return `(${digits.slice(0,2)}) ${digits.slice(2,3)} ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,3)} ${digits.slice(3,7)}-${digits.slice(7)}`;
}

function initWhatsappMask() {
  const inp = document.getElementById('rsvp-whatsapp');
  if (!inp) {
    console.warn('[whatsapp mask] input não encontrado — retry em 200ms');
    setTimeout(initWhatsappMask, 200);
    return;
  }
  if (inp.dataset.maskWired === '1') return; // evita wiring duplo
  inp.dataset.maskWired = '1';

  const apply = (el) => {
    const formatted = formatBrPhone(el.value);
    if (formatted !== el.value) el.value = formatted;
  };

  inp.addEventListener('input', e => apply(e.target));
  inp.addEventListener('blur',  e => apply(e.target));
  inp.addEventListener('paste', e => setTimeout(() => apply(e.target), 0));
  console.log('[whatsapp mask] wired OK');
}

function initRSVP() {
  initWhatsappMask();
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Se ainda não fez o quiz, oferece antes de enviar
    if (!STATE.quizScore && !STATE.quizSuggestionSkipped) {
      showQuizSuggestion();
      return;
    }

    const btn = form.querySelector('.submit-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    const data = new FormData(form);
    const dataObj = Object.fromEntries(data.entries());

    // Hard cap: máximo 5 pessoas por confirmação
    const qtd = parseInt(dataObj.quantos || '1', 10);
    if (isNaN(qtd) || qtd < 1) {
      dataObj.quantos = '1';
    } else if (qtd > 5) {
      dataObj.quantos = '5';
      showToast('Máximo 5 pessoas por confirmação. Ajustado para 5.');
    }

    // adiciona flag de "pulou a história" e score do quiz (se fez)
    dataObj.chato = STATE.skippedStory ? 'Sim' : 'Não';
    dataObj.acertos_quiz = STATE.quizScore || '';
    dataObj.tags_acertos_quiz = STATE.quizTags || '';

    console.log('[RSVP] Enviando payload:', dataObj);
    console.log('[RSVP] STATE.skippedStory:', STATE.skippedStory);

    // 1. SEMPRE salva no localStorage (backup)
    saveRsvpLocally(dataObj);

    // 2. Envia para Google Sheets via Apps Script
    const sheetsOk = await sendToSheets(dataObj);

    // 3. Mostra confirmação
    showConfirmation(dataObj, sheetsOk);

    if (sheetsOk) {
      showToast('Presença confirmada!');
    } else {
      showToast('Confirmação salva. Configure a planilha ou envie pelo WhatsApp.');
    }

    btn.textContent = originalText;
    btn.disabled = false;
  });

  // ICS
  const btnIcs = document.getElementById('btn-ics-final');
  if (btnIcs) btnIcs.addEventListener('click', downloadICS);
}

function showConfirmation(data, formspreeOk) {
  document.getElementById('rsvp-form-wrap').classList.add('hidden');
  document.getElementById('rsvp-confirmed').classList.remove('hidden');

  // Se Formspree falhou, mostrar botão de envio via WhatsApp com a mensagem pronta
  if (data && !formspreeOk) {
    const fallbackEl = document.getElementById('rsvp-fallback-wa');
    if (fallbackEl) {
      const msg = buildWhatsappMessage(data);
      const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
      fallbackEl.querySelector('.fallback-wa-link').href = waLink;
      fallbackEl.classList.remove('hidden');
    }
  }
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
  initQuiz();
});

// reajusta posição em resize (vw muda)
window.addEventListener('resize', () => {
  if (!document.getElementById('map-wrapper').classList.contains('hidden')) {
    navigateTo(STATE.current, false);
  }
});
