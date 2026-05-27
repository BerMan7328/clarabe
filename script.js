/* ══════════════════════════════════════════════════════════════
   GRAND LINE — Clara & Bê · script
══════════════════════════════════════════════════════════════ */

const STATE = {
  current: 1,
  total: 16,
  visited: new Set([1]),
  skippedStory: false, // true se clicou em "sou chato, quero pular a história"
  quizScore: null,     // ex: "7/10"
  quizTags: '',        // ex: "1,3,5,7,8,9,10" (índices 1-based das perguntas acertadas)
  quizSuggestionSkipped: false, // true se já recusou fazer o quiz antes de enviar
  soundOn: false,      // estado do toggle de som
  audioMode: 'journey',// 'journey' (Drums of Liberation) | 'celebration' (refrão Whitney)
};

/* ════════════════════════════════════════════════════════════
   WORLD MAP — posições das ilhas em SVG (viewBox 1000x1400)
════════════════════════════════════════════════════════════ */
const WORLD_ISLANDS = [
  { i: 1,  x: 200, y: 120,  label: 'Reino Desencantado' },
  { i: 2,  x: 460, y: 170,  label: 'O Olhar' },
  { i: 3,  x: 700, y: 290,  label: 'Festa da Firma' },
  { i: 4,  x: 720, y: 460,  label: 'Regimento' },
  { i: 5,  x: 480, y: 540,  label: 'Stories' },
  { i: 6,  x: 240, y: 640,  label: 'O Convite' },
  { i: 7,  x: 320, y: 820,  label: 'Conselheiro Mata' },
  { i: 8,  x: 580, y: 800,  label: 'Luffy' },
  { i: 9,  x: 780, y: 870,  label: 'In Memorian' },
  { i: 10, x: 760, y: 1010, label: 'O Vilão' },
  { i: 11, x: 540, y: 1060, label: 'De Repente 30' },
  { i: 12, x: 320, y: 1080, label: 'Bernardo G.L.' },
  { i: 13, x: 280, y: 1230, label: 'A Festa' },
  { i: 14, x: 500, y: 1280, label: 'Comédia' },
  { i: 15, x: 720, y: 1260, label: 'Sessão da Tarde' },
  { i: 16, x: 840, y: 1130, label: 'RSVP' },
];

/* ════════════════════════════════════════════════════════════
   "CONFIRA AQUI" — conteúdo dos modais por ilha
════════════════════════════════════════════════════════════ */
const CONFIRA = {
  1: {
    title: 'O Reino Desencantado',
    photos: ['assets/ilhas/reino-desencantado-1.jpeg'],
    caption: 'O Reino Desencantado tinha cara de empresa: crachás, RH, eventos corporativos. Foi exatamente ali que começou.',
  },
  2: {
    title: 'O Olhar',
    photos: ['assets/ilhas/o-olhar-1.jpeg'],
    caption: 'O primeiro olhar — fixo, nada discreto, mudando tudo em silêncio.',
  },
  3: {
    title: 'A Festa da Firma',
    photos: ['assets/ilhas/festa-da-firma-1.jpeg', 'assets/ilhas/festa-da-firma-2.jpeg'],
    caption: 'A noite em que o destino deu o segundo sinal — e o RH mandou recado.',
  },
  6: {
    title: 'O Convite',
    photos: ['assets/ilhas/o-convite-1.jpeg'],
    caption: 'Depois de um mês inteiro de suspense, finalmente o primeiro encontro.',
  },
  7: {
    title: 'Conselheiro Mata',
    photos: ['assets/ilhas/conselheiro-mata-1.jpeg', 'assets/ilhas/conselheiro-mata-2.jpeg', 'assets/ilhas/conselheiro-mata-3.jpeg'],
    caption: 'A primeira viagem. Mato, barraca, carrapatos, fogueira. Romance no estado bruto.',
  },
  8: {
    title: 'Luffy entra em cena',
    photos: ['assets/ilhas/luffy-1.jpeg', 'assets/ilhas/luffy-2.jpeg', 'assets/ilhas/luffy-3.jpeg'],
    caption: 'Luffy: Border Collie duplo merle. Mais amor, mais pelos, mais caos no roteiro.',
  },
  10: {
    title: 'O Vilão: Contexto de Trabalho',
    photos: ['assets/ilhas/vilao-1.jpeg', 'assets/ilhas/vilao-2.jpeg', 'assets/ilhas/vilao-3.jpeg', 'assets/ilhas/vilao-4.jpeg'],
    caption: 'A maior reviravolta da história — e a nova fase que veio depois.',
  },
  11: {
    title: 'De Repente 30',
    photos: ['assets/ilhas/de-repente-30-1.jpeg', 'assets/ilhas/de-repente-30-2.jpeg', 'assets/ilhas/de-repente-30-3.jpeg'],
    caption: 'Clara, agora oficialmente no enredo de De Repente 30.',
  },
  12: {
    title: 'Bernardo na Grand Line',
    photos: ['assets/ilhas/bernardo-grand-line-1.jpeg', 'assets/ilhas/bernardo-grand-line-2.jpeg'],
    caption: 'Bernardo navegando pela própria Grand Line — meio perdido, mas com o coração no rumo certo.',
  },
  13: {
    title: 'A Festa — onde, quando e como',
    photos: ['assets/ilhas/a-festa-1.jpeg'],
    caption: 'Dia 13 de junho de 2026 · sábado · a partir das 14h · Recanto da Serra, Brumadinho/MG. Piscina, sauna, comida, drinks e Brasil na Copa.',
  },
  14: {
    title: 'A Comédia Romântica',
    photos: [
      'assets/ilhas/comedia-romantica-1.jpeg',
      'assets/ilhas/comedia-romantica-2.jpeg',
      'assets/ilhas/comedia-romantica-3.jpeg',
      'assets/ilhas/comedia-romantica-4.jpeg',
      'assets/ilhas/comedia-romantica-5.jpeg',
      'assets/ilhas/comedia-romantica-6.jpeg',
    ],
    caption: 'Caos, amor, reviravoltas — e muita cumplicidade no elenco principal.',
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

  // botão zarpar — ativa o som (primeira interação destrava autoplay)
  document.getElementById('zarpar-btn').addEventListener('click', () => {
    setSoundOn(true);
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
        enterMap(16);
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
  // Não mostra se já fez o quiz ou se dismissou nessa sessão
  if (STATE.quizScore !== null) return;
  if (STATE.quizNudgeDismissedThisSession) return;
  const nudge = document.getElementById('quiz-nudge');
  const btn = document.getElementById('open-quiz');
  if (!nudge || !btn) return;
  nudge.classList.remove('hidden');
  positionQuizNudge();
  window.addEventListener('resize', positionQuizNudge);
  // auto-esconde após 12s
  clearTimeout(STATE._nudgeTimeout);
  STATE._nudgeTimeout = setTimeout(hideQuizNudge, 12000);
}

function positionQuizNudge() {
  const nudge = document.getElementById('quiz-nudge');
  const btn = document.getElementById('open-quiz');
  const arrow = nudge && nudge.querySelector('.quiz-nudge-arrow');
  if (!nudge || !btn || !arrow) return;
  const btnRect = btn.getBoundingClientRect();
  const arrowStyle = getComputedStyle(arrow);
  const arrowW = arrow.offsetWidth || parseFloat(arrowStyle.width) || 26;
  const arrowMR = parseFloat(arrowStyle.marginRight) || 0;
  // distância do centro da seta até a borda direita do container .quiz-nudge
  const arrowCenterFromContainerRight = arrowMR + arrowW / 2;
  const quizCenterX = btnRect.left + btnRect.width / 2;
  const rightPx = window.innerWidth - quizCenterX - arrowCenterFromContainerRight;
  nudge.style.right = Math.max(8, rightPx) + 'px';
}

function hideQuizNudge(permanent = false) {
  const nudge = document.getElementById('quiz-nudge');
  if (!nudge || nudge.classList.contains('hidden')) return;
  nudge.classList.add('fade-out');
  window.removeEventListener('resize', positionQuizNudge);
  setTimeout(() => {
    nudge.classList.add('hidden');
    nudge.classList.remove('fade-out');
  }, 400);
  // se dismissado por X ou click no Quiz, marca só nessa sessão
  if (permanent) {
    STATE.quizNudgeDismissedThisSession = true;
    const btn = document.getElementById('open-quiz');
    if (btn) btn.classList.add('calmed');
  }
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
      Que tal testar o quanto você <strong>conhece o casal</strong>?<br>
      São <strong>10 perguntas rápidas</strong> sobre a história deles.
    </p>
    <p class="quiz-suggest-hint">o seu resultado vai junto com sua confirmação</p>
    <div class="quiz-suggest-actions">
      <button type="button" class="quiz-suggest-go-btn" id="quiz-suggest-go">Fazer o quiz primeiro</button>
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
    const form = document.getElementById('rsvp-form');
    if (form) form.requestSubmit();
  });
}

function initQuiz() {
  const btn = document.getElementById('open-quiz');
  if (btn) btn.addEventListener('click', () => {
    hideQuizNudge(true); // dismissa permanentemente nessa sessão
    openQuizModal();
  });

  // botão "X" para fechar o nudge
  const closeBtn = document.getElementById('quiz-nudge-close');
  if (closeBtn) closeBtn.addEventListener('click', () => hideQuizNudge(true));

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
  if (goRsvp) goRsvp.addEventListener('click', () => navigateTo(16));
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
    photosHtml = `<div class="photo-single"><img src="${data.photos[0]}" alt="${data.title}" loading="lazy"></div>`;
  } else if (data.photos && data.photos.length > 1) {
    const slides = data.photos.map((p, i) =>
      `<div class="photo-slide${i === 0 ? ' is-active' : ''}" data-i="${i}">
         <img src="${p}" alt="${data.title} — ${i + 1}" loading="lazy">
       </div>`
    ).join('');
    const dots = data.photos.map((_, i) =>
      `<button type="button" class="photo-dot${i === 0 ? ' is-active' : ''}" data-i="${i}" aria-label="Foto ${i + 1}"></button>`
    ).join('');
    photosHtml = `
      <div class="photo-carousel" data-total="${data.photos.length}" data-index="0">
        <div class="photo-track">${slides}</div>
        <button type="button" class="photo-nav photo-nav-prev" aria-label="Foto anterior">
          <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>
        </button>
        <button type="button" class="photo-nav photo-nav-next" aria-label="Próxima foto">
          <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>
        </button>
        <div class="photo-counter"><span class="photo-counter-cur">1</span> / ${data.photos.length}</div>
        <div class="photo-dots">${dots}</div>
      </div>`;
  }

  openModal(`
    <h3>${data.title}</h3>
    ${photosHtml}
    ${data.caption ? `<p class="modal-caption">${data.caption}</p>` : ''}
  `);

  initCarousel();
}

function initCarousel() {
  const carousel = document.querySelector('#modal-body .photo-carousel');
  if (!carousel) return;
  const total = parseInt(carousel.dataset.total, 10);
  const slides = carousel.querySelectorAll('.photo-slide');
  const dots = carousel.querySelectorAll('.photo-dot');
  const counter = carousel.querySelector('.photo-counter-cur');

  function goTo(i) {
    const idx = ((i % total) + total) % total;
    carousel.dataset.index = idx;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === idx));
    dots.forEach((d, k) => d.classList.toggle('is-active', k === idx));
    if (counter) counter.textContent = idx + 1;
  }

  carousel.querySelector('.photo-nav-prev').addEventListener('click', () =>
    goTo(parseInt(carousel.dataset.index, 10) - 1));
  carousel.querySelector('.photo-nav-next').addEventListener('click', () =>
    goTo(parseInt(carousel.dataset.index, 10) + 1));
  dots.forEach((d, k) => d.addEventListener('click', () => goTo(k)));

  // swipe horizontal dentro do carrossel
  let sx = 0, sy = 0;
  carousel.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      goTo(parseInt(carousel.dataset.index, 10) + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });
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

    // ✨ vira a chave da trilha sonora: aventura → celebração
    switchToCelebration();

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
   ÁUDIO — trilha da jornada + refrão após confirmar presença
════════════════════════════════════════════════════════════ */
// Refrão de "I Wanna Dance With Somebody" — primeira aparição
// no áudio oficial da Whitney (intro instrumental ~21s antes).
const REFRAO_START = 46.5;
const REFRAO_END   = 75.5;

function getAudio(mode) {
  return document.getElementById(mode === 'celebration' ? 'audio-celebration' : 'audio-journey');
}

function ensureCelebrationLoop() {
  const a = getAudio('celebration');
  if (!a || a.dataset.loopWired === '1') return;
  a.dataset.loopWired = '1';
  a.addEventListener('timeupdate', () => {
    if (a.currentTime >= REFRAO_END || a.currentTime < REFRAO_START - 0.2) {
      a.currentTime = REFRAO_START;
    }
  });
  a.addEventListener('seeked', () => { /* noop, mas necessário p/ alguns browsers */ });
}

function fadeAudio(audio, from, to, ms, onDone) {
  if (!audio) { onDone && onDone(); return; }
  const steps = 18;
  const stepMs = ms / steps;
  let i = 0;
  audio.volume = Math.max(0, Math.min(1, from));
  const iv = setInterval(() => {
    i++;
    const v = from + ((to - from) * (i / steps));
    audio.volume = Math.max(0, Math.min(1, v));
    if (i >= steps) {
      clearInterval(iv);
      onDone && onDone();
    }
  }, stepMs);
}

function startJourneyMusic() {
  if (!STATE.soundOn) return;
  const a = getAudio('journey');
  if (!a) return;
  STATE.audioMode = 'journey';
  // se já tocando, ignora
  if (!a.paused) return;
  a.volume = 0;
  const p = a.play();
  if (p && typeof p.catch === 'function') {
    p.then(() => fadeAudio(a, 0, 0.55, 900))
     .catch(() => { /* bloqueado pelo browser — usuário precisa interagir de novo */ });
  }
}

function stopJourneyMusic(cb) {
  const a = getAudio('journey');
  if (!a || a.paused) { cb && cb(); return; }
  fadeAudio(a, a.volume, 0, 600, () => {
    a.pause();
    a.currentTime = 0;
    cb && cb();
  });
}

function startCelebrationMusic() {
  ensureCelebrationLoop();
  const a = getAudio('celebration');
  if (!a) return;
  STATE.audioMode = 'celebration';
  if (!STATE.soundOn) return; // mesmo se off, registra modo; toggle ON depois retoma
  a.currentTime = REFRAO_START;
  a.volume = 0;
  const p = a.play();
  if (p && typeof p.catch === 'function') {
    p.then(() => fadeAudio(a, 0, 0.7, 900))
     .catch(() => { /* ignorado */ });
  }
}

function setSoundOn(on, opts = {}) {
  STATE.soundOn = !!on;
  const btn = document.getElementById('toggle-sound');
  if (btn) {
    btn.setAttribute('aria-pressed', String(STATE.soundOn));
    btn.classList.toggle('is-on', STATE.soundOn);
  }
  if (STATE.soundOn) {
    if (STATE.audioMode === 'celebration') {
      startCelebrationMusic();
    } else {
      startJourneyMusic();
    }
  } else {
    const j = getAudio('journey');
    const c = getAudio('celebration');
    if (j && !j.paused) fadeAudio(j, j.volume, 0, 400, () => j.pause());
    if (c && !c.paused) fadeAudio(c, c.volume, 0, 400, () => c.pause());
  }
  try { localStorage.setItem('grand-line-sound', STATE.soundOn ? '1' : '0'); } catch (e) {}
}

function initSound() {
  const btn = document.getElementById('toggle-sound');
  if (btn) {
    btn.addEventListener('click', () => setSoundOn(!STATE.soundOn));
  }
  // restaura preferência (mas só liga quando o usuário interagir — autoplay policy)
  try {
    const pref = localStorage.getItem('grand-line-sound');
    if (pref === '1') STATE.soundOn = true; // será ativado de fato na próxima interação
  } catch (e) {}
}

// trocar do journey → celebration ao confirmar presença
function switchToCelebration() {
  STATE.audioMode = 'celebration';
  stopJourneyMusic(() => {
    if (STATE.soundOn) startCelebrationMusic();
  });
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
  initSound();
});

// reajusta posição em resize (vw muda)
window.addEventListener('resize', () => {
  if (!document.getElementById('map-wrapper').classList.contains('hidden')) {
    navigateTo(STATE.current, false);
  }
});
