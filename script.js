/* ══════════════════════════════════════════════════════
   ESTADO
══════════════════════════════════════════════════════ */
const STATE = {
  currentIsland: 1,
  totalIslands: 11,
  foundEggs: new Set(JSON.parse(localStorage.getItem('foundEggs') || '[]')),
  userSide: localStorage.getItem('userSide') || null,
  heartCount: 0,
};

/* ══════════════════════════════════════════════════════
   GAME — Caça ao Tesouro (estado expandido)
══════════════════════════════════════════════════════ */
const GAME = {
  berries: 0,
  achievements: new Set(),
  quizScore: null,           // null = não fez, número = % acerto
  memoryBestMoves: null,     // menor número de jogadas
  treasureUnlocked: false,
  hatClicks: 0,              // contador para o 21º egg
  hintRevealed: false,       // dica do 21º após pegar os 20
  diaryText: '',
  cardName: '',
  cardSide: null,
  visitedIslands: new Set([1]),
  loreSeen: new Set(),       // peças de lore vistas
};

function saveGame() {
  const data = {
    berries: GAME.berries,
    achievements: [...GAME.achievements],
    quizScore: GAME.quizScore,
    memoryBestMoves: GAME.memoryBestMoves,
    treasureUnlocked: GAME.treasureUnlocked,
    hatClicks: GAME.hatClicks,
    hintRevealed: GAME.hintRevealed,
    diaryText: GAME.diaryText,
    cardName: GAME.cardName,
    cardSide: GAME.cardSide,
    visitedIslands: [...GAME.visitedIslands],
    loreSeen: [...GAME.loreSeen],
  };
  localStorage.setItem('gameState', JSON.stringify(data));
}

function loadGame() {
  try {
    const raw = localStorage.getItem('gameState');
    if (!raw) return;
    const d = JSON.parse(raw);
    GAME.berries          = d.berries || 0;
    GAME.achievements     = new Set(d.achievements || []);
    GAME.quizScore        = (typeof d.quizScore === 'number') ? d.quizScore : null;
    GAME.memoryBestMoves  = (typeof d.memoryBestMoves === 'number') ? d.memoryBestMoves : null;
    GAME.treasureUnlocked = !!d.treasureUnlocked;
    GAME.hatClicks        = d.hatClicks || 0;
    GAME.hintRevealed     = !!d.hintRevealed;
    GAME.diaryText        = d.diaryText || '';
    GAME.cardName         = d.cardName || '';
    GAME.cardSide         = d.cardSide || null;
    GAME.visitedIslands   = new Set(d.visitedIslands || [1]);
    GAME.loreSeen         = new Set(d.loreSeen || []);
  } catch(e) { console.warn('loadGame error', e); }
}

const ACHIEVEMENTS = {
  'first-egg':      { name: 'Aprendiz de Pirata',          desc: 'Encontrou seu primeiro easter egg',  icon: '🏴‍☠️', berries: 100  },
  'five-eggs':      { name: 'Explorador',                   desc: '5 easter eggs encontrados',          icon: '🗺️',  berries: 250  },
  'ten-eggs':       { name: 'Caçador de Tesouros',          desc: '10 easter eggs encontrados',         icon: '⚓',   berries: 500  },
  'fifteen-eggs':   { name: 'Veterano dos Sete Mares',      desc: '15 easter eggs encontrados',         icon: '🦜',   berries: 750  },
  'twenty-eggs':    { name: 'Quase Lá...',                  desc: 'Todos os 20 easter eggs visíveis',   icon: '👑',   berries: 1500 },
  'one-piece':      { name: 'O One Piece é Real',           desc: 'Encontrou o 21º egg secreto',        icon: '🏆',   berries: 5000 },
  'all-islands':    { name: 'Mestre Navegador',             desc: 'Visitou todas as ilhas',             icon: '🧭',   berries: 500  },
  'quiz-done':      { name: 'Conhecedor do Casal',          desc: 'Completou o Quiz do Casal',          icon: '💕',   berries: 400  },
  'quiz-perfect':   { name: 'Íntimo do Casal',              desc: 'Acertou 100% do quiz',               icon: '💎',   berries: 1000 },
  'memory-done':    { name: 'Boa Memória',                  desc: 'Completou o Memory Game',            icon: '🧠',   berries: 400  },
  'memory-perfect': { name: 'Memória de Elefante',          desc: 'Memory game em ≤16 jogadas',         icon: '🐘',   berries: 800  },
  'cupido':         { name: 'Cupido',                       desc: '50+ curtidas no Instagram da ilha',  icon: '💘',   berries: 300  },
  'diarista':       { name: 'Cronista de Bordo',            desc: 'Deixou mensagem no diário',          icon: '📖',   berries: 200  },
  'identificado':   { name: 'Pirata Identificado',          desc: 'Criou sua carteirinha de pirata',    icon: '🪪',   berries: 300  },
  'timeline-seen':  { name: 'Historiador',                  desc: 'Leu a timeline completa',            icon: '📜',   berries: 250  },
  'map-seen':       { name: 'Cartógrafo',                   desc: 'Abriu o mapa real do Brasil',        icon: '🇧🇷',  berries: 200  },
};

function unlockAchievement(id) {
  if (GAME.achievements.has(id)) return;
  const a = ACHIEVEMENTS[id];
  if (!a) return;
  GAME.achievements.add(id);
  GAME.berries += a.berries;
  saveGame();
  updateHUD();
  showAchievementToast(a);
}

function showAchievementToast(a) {
  const el = document.createElement('div');
  el.className = 'achievement-toast';
  el.innerHTML = `
    <div class="ach-icon">${a.icon}</div>
    <div class="ach-text">
      <div class="ach-label">🏆 Conquista desbloqueada!</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
      <div class="ach-reward">+${a.berries} Berries</div>
    </div>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 50);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 500);
  }, 4500);
}

function addBerries(amount, reason) {
  GAME.berries += amount;
  saveGame();
  updateHUD();
  if (amount > 0 && reason) {
    showFloatingBerries(amount);
  }
}

function showFloatingBerries(amount) {
  const el = document.createElement('div');
  el.className = 'floating-berries';
  el.textContent = `+${amount} 🟠`;
  // Posiciona perto do contador de berries no HUD
  const berriesEl = document.getElementById('hud-berries-wrap');
  if (berriesEl) {
    const rect = berriesEl.getBoundingClientRect();
    el.style.left = `${rect.left + rect.width/2}px`;
    el.style.top  = `${rect.bottom + 4}px`;
  } else {
    el.style.left = '50%';
    el.style.top  = '60px';
  }
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

function countableEggs() {
  return [...STATE.foundEggs].filter(id => {
    const e = EGG_DATA[id];
    return e && !e.secret && e.type !== 'bonus';
  }).length;
}

function checkProgressAchievements() {
  const count = countableEggs();
  if (count >= 1)  unlockAchievement('first-egg');
  if (count >= 5)  unlockAchievement('five-eggs');
  if (count >= 10) unlockAchievement('ten-eggs');
  if (count >= 15) unlockAchievement('fifteen-eggs');
  if (count >= 20) {
    unlockAchievement('twenty-eggs');
    if (!GAME.hintRevealed) {
      GAME.hintRevealed = true;
      saveGame();
      setTimeout(showHintModal, 1500);
    }
  }
  if (STATE.foundEggs.has('21')) {
    unlockAchievement('one-piece');
    if (!GAME.treasureUnlocked) {
      GAME.treasureUnlocked = true;
      saveGame();
      setTimeout(showTreasureFinal, 1800);
    }
  }
  if (GAME.visitedIslands.size >= 11) unlockAchievement('all-islands');
}

function updateHUD() {
  // Berries
  const berriesEl = document.getElementById('hud-berries');
  if (berriesEl) berriesEl.textContent = GAME.berries.toLocaleString('pt-BR');
  // Tesouro X/Y
  const tEl = document.getElementById('hud-treasure');
  if (tEl) {
    const c = countableEggs();
    const total = GAME.hintRevealed ? 21 : 20;
    const has21 = STATE.foundEggs.has('21') ? 1 : 0;
    tEl.textContent = `${c + has21}/${total}`;
  }
}

/* ══════════════════════════════════════════════════════
   DADOS DOS EASTER EGGS
══════════════════════════════════════════════════════ */
const EGG_DATA = {
  '1': {
    type: 'op',
    title: 'Den Den Mushi',
    html: `<h3>📞 Den Den Mushi</h3>
      ${buildGallery(['assets/fotos/luffy-filhote.jpeg','assets/fotos/casal-fun.jpeg','assets/fotos/casal-carro.jpeg'], 'Den Den Mushi')}
      <p style="margin-top:0.5rem">Comunicação 100% pirata. Sinal fraco, conexão forte.</p>
      <p style="font-style:italic;font-size:0.85rem;margin-top:0.4rem;opacity:0.85">
        "Foi assim que Bernardo descobriu como conversar com Clara fora do trabalho: pelo Den Den Mushi do Instagram."
      </p>`,
  },
  '2': {
    type: 'op',
    title: 'Baú do Tesouro',
    html: `<h3>🎁 Baú do Tesouro</h3>
      ${buildGallery(['assets/fotos/casal-encontro.jpeg','assets/fotos/casal-principal.jpeg','assets/fotos/casal-fun.jpeg'], 'Memórias')}
      <p style="margin-top:0.5rem">Nem todo baú tem ouro. Alguns têm memórias.</p>
      <p style="font-style:italic;font-size:0.85rem;margin-top:0.4rem;opacity:0.85">
        Datas marcadas. Lugares revisitados. Pequenas comemorações que ninguém viu — mas que ficaram.
      </p>`,
  },
  '3': {
    type: 'op',
    title: 'Santo Antônio',
    html: `<h3>🙏 Santo Antônio</h3>
      <p style="font-family:'Special Elite',monospace;font-size:1.1rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.15);border-radius:8px;margin-top:0.5rem;">
        "13 de junho.<br>Ele sabe o que fez."
      </p>`,
  },
  '4': {
    type: 'op',
    title: 'Bandeirinha Junina',
    html: `<h3>🎏 Bandeirinha Junina</h3>
      <p style="font-family:'Special Elite',monospace;font-size:0.95rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.15);border-radius:8px;margin-top:0.5rem;">
        "Festa junina? Talvez.<br>Festa do Bê e da Clara? Com certeza."
      </p>`,
  },
  '5': {
    type: 'op',
    title: 'Brasil na Copa',
    html: `<h3>⚽ Brasil na Copa</h3>
      <p>"Brasil na Copa. Eles torcendo juntos desde sempre."</p>
      <p style="margin-top:0.5rem">E tem mais uma coisa escondida por aqui...</p>
      <button class="link-btn" id="btn-abrir-satira" style="margin-top:0.5rem">Ver o casal na Copa →</button>`,
    afterShow: () => {
      const btn = document.getElementById('btn-abrir-satira');
      if (btn) btn.onclick = () => { closeModal(); setTimeout(() => showEgg('5b', true), 300); };
    },
  },
  '5b': {
    type: 'op',
    secret: true,
    title: 'Virgínia vs Vini Jr',
    html: buildSatiraHtml(),
  },
  '6': {
    type: 'op',
    title: 'Cartão de Aposta',
    html: `<h3>🎰 Cartão de Aposta</h3>
      <img src="assets/fotos/evento-startbet.jpeg" alt="Startbet — Corrida das Estrelas">
      <p style="font-family:'Special Elite',monospace;margin-top:0.5rem">"Startbet. A corrida."</p>`,
  },
  '7': {
    type: 'op',
    title: 'Terminal DevOps',
    html: `<h3>💻 Terminal DevOps</h3>
      <div class="terminal" id="terminal-devops">$ terraform apply --target=amor<span class="cursor"></span></div>`,
    afterShow: () => animateTerminal('terminal-devops',
      ['$ terraform apply --target=amor\n', '> Plan: 1 to add, 0 to change, 0 to destroy.\n', '> Apply complete! ❤️  Resources: amor added.\n', '> 1 file changed: coração no lugar certo ✅'],
    ),
  },
  '8': {
    type: 'op',
    title: 'Livro de Leis',
    html: `<h3>📚 Livro de Leis</h3>
      <p style="font-family:'Special Elite',monospace;font-size:0.95rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
        "Clara. Direito, compliance e muita elegância."
      </p>`,
  },
  '9': {
    type: 'op',
    title: 'It Takes Two',
    html: `<h3>🎮 It Takes Two</h3>
      <p style="font-family:'Special Elite',monospace;font-size:0.95rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
        "It Takes Two. Jogaram juntos.<br>Faz sentido."
      </p>`,
  },
  '10': {
    type: 'op',
    title: 'Quartinha',
    html: `<h3>🕯️</h3>`,
  },
  '11': {
    type: 'op',
    title: 'Chapéu de Palha',
    html: `<h3>🎩 Chapéu de Palha</h3>
      <p style="font-family:'Special Elite',monospace;font-size:0.95rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
        "D. Luffy aprovaria essa festa."
      </p>`,
  },
  '12': {
    type: 'op',
    title: 'Calendário "30"',
    html: `<h3>📅 De Repente 30</h3>
      <p style="font-family:'Special Elite',monospace;font-size:0.95rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
        "De Repente 30. Ela chegou.<br>Tá linda."
      </p>`,
  },
  '13': {
    type: 'op',
    title: 'Aniversário do Ravi',
    html: `<h3>📸 Aniversário do Ravi</h3>
      ${buildGallery(['assets/fotos/evento-ravi.jpeg'], 'Aniversário do Ravi')}
      <p style="font-family:'Special Elite',monospace;font-size:0.9rem;margin-top:0.5rem">
        "Aniversário do Ravi. Um capítulo importante."
      </p>
      <p style="font-style:italic;font-size:0.85rem;margin-top:0.4rem;opacity:0.85">
        Dos primeiros eventos sociais "do casal" — quando deixou de ser segredo e começou a ser história.
      </p>`,
  },
  '14': {
    type: 'op',
    title: 'Casamento do Miguel',
    html: `<h3>💍 Casamento do Miguel</h3>
      ${buildGallery(['assets/fotos/evento-miguel.jpeg'], 'Casamento do Miguel')}
      <p style="font-family:'Special Elite',monospace;font-size:0.9rem;margin-top:0.5rem">
        "Casamento do Miguel. Foram juntos."
      </p>
      <p style="font-style:italic;font-size:0.85rem;margin-top:0.4rem;opacity:0.85">
        Primeiras fotos formais. Primeira vez em que olharam um pro outro vestidos como adultos e pensaram: "isso é a gente."
      </p>`,
  },
  'carrapato': {
    type: 'bonus',
    secret: true,
    title: 'Carrapato',
    html: `<h3>🦟 Carrapato</h3>
      <p style="font-family:'Special Elite',monospace;text-align:center;padding:1rem;background:rgba(192,57,43,0.1);border-radius:8px;margin-top:0.5rem;">
        "Ah sim. Os carrapatos.<br>Parte integrante do romance.<br>Parte não planejada do roteiro."
      </p>`,
  },
  'C1': {
    type: 'dr30',
    title: 'Casa de Boneca',
    html: `<div class="dr30-body">
      <h3>🏠 Casa de Boneca</h3>
      <div class="glitter-modal-container" id="glitter-c1"></div>
      <p>Ela dormiu com 13 anos, acordou com 30 e descobriu que crescer talvez fosse só mais uma cena cortada do roteiro.</p>
      <div class="dr30-sticker" style="font-size:2rem;display:block;text-align:center;margin:0.75rem 0">✨🏠✨</div>
    </div>`,
    afterShow: () => spawnGlitterInModal('glitter-c1'),
  },
  'C2': {
    type: 'dr30',
    title: 'Vestido Colorido',
    html: `<div class="dr30-body">
      <h3>👗 Vestido Colorido</h3>
      <div style="text-align:center;font-size:3rem;animation:danca 0.6s ease-in-out alternate infinite;display:block;margin:0.5rem 0">👗</div>
      <p>De repente 30: oficialmente adulta, extraoficialmente ainda uma adolescente dramática por dentro.</p>
    </div>`,
  },
  'C3': {
    type: 'dr30',
    title: 'Espelho Mágico',
    html: `<div class="dr30-body">
      <h3>🪞 Espelho Mágico</h3>
      <div class="glitter-modal-container" id="glitter-c3"></div>
      <p style="font-style:italic;font-size:1.1rem;text-align:center;padding:0.75rem;background:rgba(255,158,196,0.2);border-radius:8px;margin:0.5rem 0">
        "sim, você tem 30.<br>não, você ainda não sabe lidar com isso."
      </p>
      <div class="dr30-sticker" style="display:block;text-align:center">🪞✨</div>
    </div>`,
    afterShow: () => spawnGlitterInModal('glitter-c3'),
  },
  'C4': {
    type: 'dr30',
    title: 'Revista Adolescente',
    html: `<div class="dr30-body" style="background:linear-gradient(135deg,#ffe0f0,#fff0d0);border-radius:10px;padding:0.5rem">
      <h3 style="font-size:1.4rem;color:#d63384;text-align:center;border:3px solid #d63384;border-radius:8px;padding:0.5rem;margin-bottom:0.75rem">
        ✨ EDIÇÃO ESPECIAL ✨<br>Clara 30 anos
      </h3>
      <div style="text-align:center;font-size:1.5rem;margin:0.5rem 0">
        <span class="dr30-sticker">⭐</span>
        <span class="dr30-sticker" style="animation-delay:0.2s">💄</span>
        <span class="dr30-sticker" style="animation-delay:0.4s">💅</span>
      </div>
      <p style="text-align:center;font-size:1.1rem;color:#4a2040;font-weight:bold">30, intensa e florescendo</p>
      <img src="assets/fotos/casal-principal.jpeg" alt="Polaroid do casal" style="margin:0.5rem auto;filter:sepia(0.2) saturate(1.1)">
    </div>`,
  },
  'C5': {
    type: 'dr30',
    title: 'Calendário 13→30',
    html: buildCalendarioHtml(),
  },
  'C6': {
    type: 'dr30',
    title: 'Pista de Dança',
    html: buildDiscoHtml(),
  },
};

/* ══════════════════════════════════════════════════════
   CONTEÚDO DOS BUILDERS (inline HTML)
══════════════════════════════════════════════════════ */
function buildSatiraHtml() {
  const flags = Array.from({length: 8}, (_, i) =>
    `<span class="satira-flag" style="left:${i*12+5}%;--fd:${3+Math.random()*2}s;animation-delay:${Math.random()*3}s">🇧🇷</span>`
  ).join('');
  const notas = Array.from({length: 3}, (_, i) =>
    `<span class="nota" style="left:${15+i*20}%;top:20%;--nd:${1.5+i*0.3}s;animation-delay:${i*0.5}s">♪</span>`
  ).join('');
  const lagrimas = Array.from({length: 3}, (_, i) =>
    `<span class="lagrima" style="left:${55+i*10}%;top:25%;animation-delay:${i*0.25}s">💧</span>`
  ).join('');
  const haTexts = ['HÁ!', 'HÁ!', 'HÁ!', 'HÁ!'].map((t, i) =>
    `<span class="ha-text" style="left:${48+i*10}%;top:${20+i*15}%;animation-delay:${i*0.22}s">${t}</span>`
  ).join('');
  return `
    <h3 style="text-align:center;font-family:'Bangers',cursive;letter-spacing:0.05em">⚽ Sessão da Copa ⚽</h3>
    <div class="satira-scene">
      <div class="satira-flags">${flags}</div>
      <div class="satira-notes">${notas}</div>
      <div class="satira-ha">${haTexts}</div>
      <div class="satira-ha">${lagrimas}</div>
      <div class="satira-char satira-virginia">
        <span class="satira-body">💃</span>
        <span class="satira-name">VIRGÍNIA</span>
        <span class="satira-sub">(a.k.a. Clara, 30 anos)</span>
      </div>
      <div class="satira-vs">VS</div>
      <div class="satira-char satira-vinijr">
        <span class="satira-body">🤣</span>
        <span class="satira-name">VINI JR</span>
        <span class="satira-sub">(a.k.a. Bernardo, 27 anos)</span>
      </div>
    </div>
    <p class="satira-caption">
      "Uma comédia romântica cheia de caos, amor e reviravoltas."<br>
      <strong>Dia 13 de junho • Sessão da Tarde • Brumadinho/MG</strong>
    </p>`;
}

function buildCalendarioHtml() {
  const nums = [13, 18, 21, 25, 30];
  const pages = nums.map((n, i) =>
    `<div class="cal-page${n === 30 ? ' current' : ''}" style="animation-delay:${i * 0.35}s">${n}</div>`
  ).join('');
  return `<div class="dr30-body">
    <h3>📅 De Repente 30</h3>
    <div class="cal-pages">${pages}</div>
    <div class="glitter-modal-container" id="glitter-c5"></div>
    <p style="margin-top:0.75rem">
      Clara piscou aos 13, acordou aos 30 e a vida adulta veio sem manual, mas com boleto, skincare, compliance, um namorado mais novo e um Border Collie duplo merle.
    </p>
  </div>`;
}

function buildDiscoHtml() {
  const colors = ['#FF9EC4','#C9A0DC','#FFD700','#FF6B35','#1a6b8a','#39ff14','#ff4444','#fff'];
  const tiles = Array.from({length: 15}, (_, i) =>
    `<div class="disco-tile" style="background:${colors[i % colors.length]};--df:${0.5+Math.random()*0.8}s;animation-delay:${Math.random()*0.5}s"></div>`
  ).join('');
  return `<div class="dr30-body">
    <h3>🪩 Pista de Dança</h3>
    <div class="disco-floor">${tiles}</div>
    <span class="disco-dancer">💃</span>
    <p style="text-align:center;font-style:italic;margin:0.5rem 0">"I Wanna Dance With Somebody"</p>
    <div class="disco-links">
      <a href="https://open.spotify.com/search/I%20Wanna%20Dance%20With%20Somebody%20Whitney%20Houston" target="_blank" rel="noopener" class="link-btn" style="flex:1">▶ Spotify</a>
      <a href="https://www.youtube.com/results?search_query=Whitney+Houston+I+Wanna+Dance+With+Somebody" target="_blank" rel="noopener" class="link-btn" style="flex:1">▶ YouTube</a>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════ */
function saveEggs() {
  localStorage.setItem('foundEggs', JSON.stringify([...STATE.foundEggs]));
}

function updateEggCounter() {
  const countable = [...STATE.foundEggs].filter(id => {
    const e = EGG_DATA[id];
    return e && !e.secret && e.type !== 'bonus';
  });
  document.getElementById('egg-count').textContent = countable.length;
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

function spawnConfetti(x, y) {
  const colors = ['#f5c518','#FF9EC4','#C9A0DC','#FF6B35','#1a6b8a'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left:${x + (Math.random()-0.5)*80}px;
      top:${y - 20}px;
      background:${colors[i % colors.length]};
      --cf:${0.8+Math.random()*0.8}s;
      transform:rotate(${Math.random()*360}deg);
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function spawnGlitterInModal(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const colors = ['#FFD700','#FF9EC4','#C9A0DC','#FF6B35'];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'glitter-particle';
    p.style.cssText = `
      left:${Math.random()*100}%;
      top:0;
      background:${colors[i % colors.length]};
      --gd:${1.5+Math.random()*2}s;
      animation-delay:${Math.random()*1}s;
      width:${4+Math.random()*6}px;
      height:${4+Math.random()*6}px;
    `;
    el.appendChild(p);
  }
}

function animateTerminal(elId, lines) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  let li = 0, ci = 0;
  const full = lines.join('');
  const iv = setInterval(() => {
    if (ci < full.length) {
      el.textContent = full.slice(0, ++ci);
      el.appendChild(cursor);
    } else {
      clearInterval(iv);
    }
  }, 40);
}

/* ══════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════ */
function openModal(html, isDr30 = false, extraClass = '') {
  const modal    = document.getElementById('modal');
  const box      = document.getElementById('modal-box');
  const body     = document.getElementById('modal-body');
  body.innerHTML = html;
  body.className = 'modal-body' + (isDr30 ? ' dr30-body' : '');
  box.className  = 'modal-box' + (isDr30 ? ' dr30-modal' : '') + (extraClass ? ' ' + extraClass : '');
  modal.classList.remove('hidden');
  document.getElementById('modal-close').focus();
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ══════════════════════════════════════════════════════
   EASTER EGGS
══════════════════════════════════════════════════════ */
function showEgg(id, skipCount = false) {
  const data = EGG_DATA[id];
  if (!data) return;

  if (!STATE.foundEggs.has(id) && !skipCount) {
    STATE.foundEggs.add(id);
    saveEggs();
    updateEggCounter();
    updateHUD();
    const eggEl = document.getElementById('egg-' + id);
    if (eggEl) eggEl.classList.add('found');
    const rect = eggEl ? eggEl.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2 };
    spawnConfetti(rect.left + rect.width/2, rect.top);
    const toastType = data.type === 'dr30' ? 'dr30-found' : 'egg-found';
    showToast(`✨ Easter egg encontrado: ${data.title}!`, toastType);
    // Berries + achievements
    const reward = data.secret ? 1000 : (data.type === 'bonus' ? 50 : 100);
    addBerries(reward, 'egg');
    checkProgressAchievements();
  }

  openModal(data.html, data.type === 'dr30');
  if (data.afterShow) setTimeout(data.afterShow, 100);
}

function initEasterEggs() {
  document.querySelectorAll('.easter-egg').forEach(el => {
    const id = el.dataset.eggId;
    if (!id) return;
    if (STATE.foundEggs.has(id)) el.classList.add('found');
    el.addEventListener('click', () => showEgg(id));
    el.addEventListener('touchstart', e => { e.preventDefault(); showEgg(id); }, { passive: false });
  });
}

/* ══════════════════════════════════════════════════════
   INTERAÇÕES DE ILHA
══════════════════════════════════════════════════════ */
const STAR_MSGS = [
  "Esse céu foi deles os dois essa noite.",
  "Carrapatos, barraca e estrelas. Romance no seu estado bruto.",
  "Ali começou. Embaixo dessas estrelas.",
  "Nenhum app de namoro poderia ter programado isso.",
  "Mato, frio, fogueira e os dois. Às vezes é assim que começa.",
];

function handleAction(action, el, event) {
  switch(action) {
    case 'bernardo-balao':
      openModal(`<h3>👨‍💼 Bernardo</h3>
        <p style="font-family:'Special Elite',monospace;font-size:1rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
          "olhando nada discreto desde 2022"
        </p>`);
      break;
    case 'clara-balao':
      openModal(`<h3>👩‍💼 Clara</h3>
        <p style="font-family:'Special Elite',monospace;font-size:1rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
          "quem é esse menino?"
        </p>`);
      break;
    case 'cracha-photo':
      openModal(`<h3>🪪 Evento da Empresa</h3>
        <img src="assets/fotos/casal-gym.jpeg" alt="Evento Reino Desencantado">
        <p style="margin-top:0.5rem">O evento que mudou tudo. Crachás obrigatórios, histórias não planejadas.</p>`);
      break;
    case 'wanted-modal': {
      openModal(`<h3>📜 WANTED</h3>
        <img src="assets/fotos/casal-principal.jpeg" alt="WANTED — Clara & Bernardo" style="filter:sepia(0.4) contrast(1.1)">
        <div style="text-align:center;margin-top:0.75rem">
          <span class="carimbo-text">PROIBIDO SE ENVOLVER<br><small>RH Marineford — Aviso Oficial</small></span>
        </div>`);
      break;
    }
    case 'carimbo-tremor': {
      const box = document.getElementById('modal-box');
      if (box && !document.getElementById('modal').classList.contains('hidden')) {
        box.classList.add('shake');
        box.addEventListener('animationend', () => box.classList.remove('shake'), { once: true });
      } else {
        openModal(`<h3>🔴 Carimbo do RH</h3>
          <p>*BUUM* — A tela treme. O regulamento foi invocado.</p>`, false, 'shake');
        const modalBox = document.getElementById('modal-box');
        modalBox.addEventListener('animationend', () => modalBox.classList.remove('shake'), { once: true });
      }
      break;
    }
    case 'regulamento-egg':
      openModal(`<h3>📋 Regulamento Interno</h3>
        <p style="font-family:'Special Elite',monospace;font-size:0.9rem;padding:1rem;background:rgba(192,57,43,0.08);border-radius:8px;margin-top:0.5rem;">
          Artigo 42, § 3º: relacionamentos entre colaboradores são desaconselhados pelo departamento de RH.
        </p>
        <p style="font-style:italic;margin-top:0.75rem;font-size:0.85rem">
          "mesmo que o regulamento tenha sido escrito pela própria Clara."
        </p>`);
      break;
    case 'den-den-audio':
      openModal(`<h3>🐌 Den Den Mushi</h3>
        <p style="font-family:'Special Elite',monospace;font-size:0.9rem;text-align:center;padding:0.75rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
          📞 *toot toot* ...<br><br>
          [tema The Office toca ao longe]
        </p>
        <p style="margin-top:0.5rem;font-style:italic;">Bernardo nem gostava de The Office. Mandava os reels mesmo assim.</p>`);
      break;
    case 'reels-msg':
      openModal(`<h3>📱 Reels de The Office</h3>
        <p style="font-family:'Special Elite',monospace;font-size:0.95rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
          "Bernardo nem gostava.<br>Mas mandava mesmo assim."
        </p>`);
      break;
    case 'heart-counter': {
      STATE.heartCount++;
      const display = document.getElementById('heart-count-display');
      const num = document.getElementById('heart-num');
      if (display && num) {
        display.classList.remove('hidden');
        num.textContent = STATE.heartCount;
        display.style.animation = 'none';
        void display.offsetWidth;
        display.style.animation = '';
      }
      if (STATE.heartCount === 1) showToast('❤️ +1 curtida', 'egg-found');
      if (STATE.heartCount === 10) showToast('🔥 10 curtidas! Ele estava aqui.', 'egg-found');
      if (STATE.heartCount === 50) showToast('😂 Tá bem, Bernardo. Você curtiu muito.', 'egg-found');
      break;
    }
    case 'barraca-photo':
      openModal(`<h3>⛺ Conselheiro Mata</h3>
        <img src="assets/fotos/conselheiro-mata.jpeg" alt="Conselheiro Mata">
        <p style="margin-top:0.5rem;font-style:italic">"Aqui virou namoro."</p>`);
      break;
    case 'star-msg': {
      const idx = parseInt(el.dataset.star || '1') - 1;
      openModal(`<h3>⭐ Céu de Minas</h3>
        <p style="font-family:'Special Elite',monospace;font-size:0.95rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
          "${STAR_MSGS[idx] || STAR_MSGS[0]}"
        </p>`);
      break;
    }
    case 'fogueira-grow':
      openModal(`<h3>🔥 A Fogueira</h3>
        <img src="assets/fotos/conselheiro-fogueira.jpeg" alt="Fogueira em Conselheiro Mata">
        <p style="font-family:'Special Elite',monospace;font-size:0.95rem;text-align:center;padding:0.75rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
          "aqui virou namoro"
        </p>`);
      break;
    case 'serro-photo':
      openModal(`<h3>⛪ Serro, MG</h3>
        <img src="assets/fotos/casal-carro.jpeg" alt="A caminho do Serro">
        <p style="margin-top:0.5rem">"Casario colonial, história viva e o melhor queijo do Brasil."</p>`);
      break;
    case 'queijo-egg':
      openModal(`<h3>🧀 Queijo do Serro</h3>
        <p style="font-family:'Special Elite',monospace;font-size:1rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
          "o melhor queijo do Brasil.<br>Ponto."
        </p>`);
      break;
    case 'piracema-photo':
      openModal(`<h3>💧 Piracema</h3>
        <img src="assets/fotos/piracema.jpeg" alt="Piracema">
        <p style="margin-top:0.5rem">"Água fria, pedra quente."</p>`);
      break;
    case 'guarapari-photo':
      openModal(`<h3>🌊 Guarapari</h3>
        <img src="assets/fotos/casal-fun.jpeg" alt="Guarapari">
        <p style="margin-top:0.5rem">"Areia radioativa, sol quente, eles dois não ligando pra nada."</p>`);
      break;
    case 'placa-egg':
      openModal(`<h3>🪧 Placa de Guarapari</h3>
        <p style="font-family:'Special Elite',monospace;font-size:0.9rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
          "areia monazítica — radioativa,<br>mas romântica"
        </p>`);
      break;
    case 'entrerios-photo':
      openModal(`<h3>🏞️ Entre Rios</h3>
        <img src="assets/fotos/bernardo-floresta.jpeg" alt="Entre Rios">
        <p style="margin-top:0.5rem;font-style:italic">"Daquelas viagens onde não precisa acontecer nada pra valer tudo."</p>`);
      break;
    case 'cipo-photo':
      openModal(`<h3>⛰️ Serra do Cipó</h3>
        <img src="assets/fotos/serra-do-cipo.jpeg" alt="Serra do Cipó">
        <p style="margin-top:0.5rem">"A mais épica. Porque algumas histórias pedem cachoeira grande."</p>`);
      break;
    case 'topo-wind':
      openModal(`<h3>🏔️ No Topo</h3>
        <p style="font-size:2rem;text-align:center;margin:0.5rem 0">🌬️⛰️</p>
        <p style="font-family:'Special Elite',monospace;font-size:0.95rem;text-align:center;padding:0.75rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
          "chegaram juntos no topo"
        </p>`);
      break;
    case 'luffy-gallery':
      openModal(`<h3>🐕 Luffy</h3>
        <img src="assets/fotos/luffy-cachorro.jpeg" alt="Luffy — Border Collie duplo merle">
        <p style="margin-top:0.5rem">Border Collie que parece albino, mas é duplo merle. Mais amor, mais pelos, mais caos.</p>`);
      break;
    case 'pelo-egg':
      openModal(`<h3>🪶 Pelos</h3>
        <p style="font-family:'Special Elite',monospace;font-size:0.9rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.1);border-radius:8px;margin-top:0.5rem;">
          "parece albino. Não é.<br>É duplo merle.<br>Detalhe importante."
        </p>`);
      break;
    case 'coleira-bark':
      openModal(`<h3>🔔 Coleira do Luffy</h3>
        <p style="font-size:2.5rem;text-align:center;margin:0.5rem 0;animation:floatDeco 1s ease-in-out infinite alternate">🐕</p>
        <p style="font-family:'Special Elite',monospace;text-align:center;font-size:1rem">Au! Au! Au!</p>`);
      break;
    default:
      break;
  }
}

function initIslandInteractions() {
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', e => handleAction(el.dataset.action, el, e));
  });
}

/* ══════════════════════════════════════════════════════
   NAVEGAÇÃO HORIZONTAL
══════════════════════════════════════════════════════ */
function getIslandElements() {
  return Array.from(document.querySelectorAll('.island[data-index]'));
}

function navigateToIsland(index, smooth = true) {
  const islands = getIslandElements();
  if (index < 1 || index > islands.length) return;
  const wasNew = !GAME.visitedIslands.has(index);
  STATE.currentIsland = index;
  GAME.visitedIslands.add(index);
  if (wasNew && index !== 1) addBerries(50, 'island-visit');
  saveGame();
  updateProgressDots(index);
  checkProgressAchievements();

  const targetIsland = islands[index - 1];
  const map = document.getElementById('map');
  const offset = targetIsland.offsetLeft;
  if (smooth) {
    map.style.transition = 'transform 0.65s cubic-bezier(0.25, 0.1, 0.25, 1)';
  } else {
    map.style.transition = 'none';
  }
  map.style.transform = `translateX(-${offset}px)`;

  document.getElementById('current-island-name').textContent =
    targetIsland.dataset.name || `Ilha ${index}`;

  document.getElementById('nav-left').disabled  = index <= 1;
  document.getElementById('nav-right').disabled = index >= islands.length;
}

function initProgressDots() {
  const container = document.getElementById('island-progress');
  if (!container) return;
  const islands = getIslandElements();
  islands.forEach((island, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    dot.title = island.dataset.name || `Ilha ${i+1}`;
    dot.addEventListener('click', () => navigateToIsland(i + 1));
    container.appendChild(dot);
  });
  updateProgressDots(1);
}

function updateProgressDots(index) {
  const dots = document.querySelectorAll('.progress-dot');
  dots.forEach((dot, i) => {
    dot.classList.remove('active', 'visited');
    if (i + 1 === index) dot.classList.add('active');
    else if (i + 1 < index) dot.classList.add('visited');
  });
}

function initNavigation() {
  document.getElementById('nav-left').addEventListener('click',  () => navigateToIsland(STATE.currentIsland - 1));
  document.getElementById('nav-right').addEventListener('click', () => navigateToIsland(STATE.currentIsland + 1));

  document.getElementById('quick-rsvp').addEventListener('click', () => {
    navigateToIsland(11);
  });

  document.addEventListener('keydown', e => {
    if (document.getElementById('modal').classList.contains('hidden')) {
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    navigateToIsland(STATE.currentIsland - 1);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  navigateToIsland(STATE.currentIsland + 1);
    }
  });

  // Swipe support
  let touchStartX = 0;
  const wrapper = document.getElementById('map-wrapper');
  wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) navigateToIsland(STATE.currentIsland + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════
   RSVP
══════════════════════════════════════════════════════ */
function initRSVP() {
  // RSVP da ilha 11 agora é só info final — não tem mais botões de lado (foram pra welcome screen).
  // Mantém o form invisível como compat, mas sem listener.
  const btnB = document.getElementById('btn-bernardo');
  const btnC = document.getElementById('btn-clara');
  const step1 = document.getElementById('rsvp-step-1');
  const step2 = document.getElementById('rsvp-step-2');
  const step3 = document.getElementById('rsvp-step-3');
  if (btnB && btnC && false) { // bloco desativado
    function chooseSide(side) {
      STATE.userSide = side;
      localStorage.setItem('userSide', side);
      const inp = document.getElementById('rsvp-lado-input');
      if (inp) inp.value = side;
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
    }
    btnB.addEventListener('click', () => chooseSide('Bernardo'));
    btnC.addEventListener('click', () => chooseSide('Clara'));
  }

  const form = document.getElementById('rsvp-form');
  if (form && form.tagName === 'FORM' && form.style.display !== 'none') form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
        // Confetti
        for (let i = 0; i < 4; i++) {
          setTimeout(() => spawnConfetti(
            window.innerWidth * (0.2 + i * 0.2),
            window.innerHeight * 0.5
          ), i * 200);
        }
        showToast('✅ Confirmado! Até dia 13!', 'egg-found');
      } else {
        throw new Error('Erro no envio');
      }
    } catch {
      // Fallback: show step 3 anyway (useful when Formspree not configured)
      step2.classList.add('hidden');
      step3.classList.remove('hidden');
      showToast('⚠️ Configure o Formspree para receber respostas.', '');
    }
  });

  // Agenda
  document.getElementById('btn-ics').addEventListener('click', downloadICS);

  // Google Calendar + ICS trigger secret egg
  ['btn-gcal', 'btn-ics'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
      setTimeout(showSecretEgg, 800);
    });
  });
}

function showSecretEgg() {
  const area = document.getElementById('secret-egg-area');
  if (!area || !area.classList.contains('hidden')) return;
  area.classList.remove('hidden');

  if (STATE.userSide === 'Clara') {
    area.innerHTML = `<div class="secret-dr30" id="secret-dr30-content">
      <div id="secret-glitter"></div>
      <p style="font-size:1.4rem;margin-bottom:0.5rem">✨🌸✨</p>
      <p>"De repente… você confirmou presença.</p>
      <p>Agora vista sua melhor versão de Sessão da Tarde</p>
      <p>e venha comemorar os 30 da Clara."</p>
      <p style="margin-top:0.75rem;font-size:1.5rem">🎉💕🎉</p>
    </div>`;
    spawnGlitterInModal('secret-glitter');
  } else {
    area.innerHTML = `<div class="secret-terminal">
      <div class="terminal" id="secret-terminal-el">$ <span class="cursor"></span></div>
    </div>`;
    animateTerminal('secret-terminal-el', [
      '$ git commit -m "vou na festa"\n',
      '> [main] Presença confirmada\n',
      '> 1 file changed: coração no lugar certo ✅\n',
      '> Push: dia 13/06 • 14h • Brumadinho 🎉',
    ]);
  }
}

function downloadICS() {
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sessão da Tarde//Aniversário Clara & Bê//PT
BEGIN:VEVENT
DTSTART:20260613T140000
DTEND:20260613T230000
SUMMARY:Sessão da Tarde — Aniversário da Clara & Bê
DESCRIPTION:Dois aniversários. Uma história improvável. Brasil na Copa. Piscina\\, sauna\\, comida e drinks.
LOCATION:Av Nair Martins Drumond\\, nº 7\\, Recanto da Serra\\, Brumadinho/MG
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'sessao-da-tarde-clara-be.ics';
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════
   GLITTER INTRO
══════════════════════════════════════════════════════ */
function initGlitter() {
  const container = document.getElementById('glitter-intro');
  if (!container) return;
  const colors = ['#FFD700','#FF9EC4','#C9A0DC','#FF6B35','#ffffff'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'glitter-particle';
    p.style.cssText = `
      left:${Math.random()*100}%;
      top:0;
      background:${colors[i % colors.length]};
      --gd:${2+Math.random()*3}s;
      animation-delay:${Math.random()*4}s;
      width:${3+Math.random()*7}px;
      height:${3+Math.random()*7}px;
    `;
    container.appendChild(p);
  }
}

/* ══════════════════════════════════════════════════════
   INTRO
══════════════════════════════════════════════════════ */
function typeTitle(text, callback) {
  const el = document.getElementById('grande-title');
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  el.appendChild(cursor);
  let i = 0;
  const iv = setInterval(() => {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i++]), cursor);
    } else {
      clearInterval(iv);
      setTimeout(() => {
        cursor.remove();
        if (callback) callback();
      }, 400);
    }
  }, 70);
}

function initIntro() {
  initGlitter();
  setTimeout(() => {
    typeTitle('A Grande Linha dos 27 & 30');
  }, 600);

  document.getElementById('zarpar-btn').addEventListener('click', () => {
    const intro = document.getElementById('intro-screen');
    intro.classList.add('fade-out');
    setTimeout(() => {
      intro.classList.add('hidden');
      showWelcomeScreen();
    }, 800);
  });
}

function showWelcomeScreen() {
  const w = document.getElementById('welcome-screen');
  w.classList.remove('hidden');
  document.body.style.overflow = 'auto';
  initWelcomeFlow();
}

function initWelcomeFlow() {
  const btnB = document.getElementById('w-btn-bernardo');
  const btnC = document.getElementById('w-btn-clara');
  const step1 = document.getElementById('welcome-step-1');
  const step2 = document.getElementById('welcome-step-2');
  const step3 = document.getElementById('welcome-step-3');
  const ladoInput = document.getElementById('w-rsvp-lado-input');

  function chooseSide(side) {
    STATE.userSide = side;
    GAME.cardSide = side;
    localStorage.setItem('userSide', side);
    saveGame();
    ladoInput.value = side;
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    if (side === 'Clara') step2.classList.add('dr30-style');
  }
  btnB?.addEventListener('click', () => chooseSide('Bernardo'));
  btnC?.addEventListener('click', () => chooseSide('Clara'));

  const form = document.getElementById('welcome-rsvp-form');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    btn.textContent = 'Enviando...';
    btn.disabled = true;
    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST', body: data, headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('fail');
    } catch {
      // fallback gracioso - mostra etapa 3 mesmo sem Formspree
    }
    step2.classList.add('hidden');
    step3.classList.remove('hidden');
    addBerries(200, 'rsvp-confirmed');
    // confetti
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnConfetti(window.innerWidth*(0.15 + i*0.18), window.innerHeight*0.35), i*150);
    }
  });

  // Bypass: já confirmado anteriormente?
  if (STATE.userSide) {
    step1.classList.add('hidden');
    // Já tem lado escolhido — pula direto pra confirmação
    step3.classList.remove('hidden');
  }

  document.getElementById('welcome-ics-btn')?.addEventListener('click', downloadICS);

  document.getElementById('welcome-embark')?.addEventListener('click', enterMap);
}

function enterMap() {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('toolbar').classList.remove('hidden');
  document.getElementById('map-wrapper').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    updateEggCounter();
    navigateToIsland(1, false);
    restoreFoundEggs();
  }, 100);
}

function restoreFoundEggs() {
  STATE.foundEggs.forEach(id => {
    const el = document.getElementById('egg-' + id);
    if (el) el.classList.add('found');
  });
  updateEggCounter();
  updateHUD();
  checkProgressAchievements();
}

/* ══════════════════════════════════════════════════════
   TOOLBAR — Menu de ferramentas (Timeline, Quiz, Memory, etc)
══════════════════════════════════════════════════════ */
function initToolbar() {
  document.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => openTool(btn.dataset.tool));
  });
}

function openTool(tool) {
  switch(tool) {
    case 'achievements': openAchievementsModal(); break;
    case 'stats':        openStatsModal();        break;
    case 'timeline':     openTimelineModal();     break;
    case 'quiz':         openQuizModal();         break;
    case 'memory':       openMemoryModal();       break;
    case 'map':          openBrasilMapModal();    break;
    case 'diary':        openDiaryModal();        break;
    case 'card':         openCardModal();         break;
    case 'help':         openHelpModal();         break;
  }
}

/* Conquistas — listagem */
function openAchievementsModal() {
  const total = Object.keys(ACHIEVEMENTS).length;
  const got   = GAME.achievements.size;
  const items = Object.entries(ACHIEVEMENTS).map(([id, a]) => {
    const has = GAME.achievements.has(id);
    return `<div class="ach-item ${has ? 'unlocked' : 'locked'}">
      <div class="ach-item-icon">${has ? a.icon : '🔒'}</div>
      <div class="ach-item-body">
        <div class="ach-item-name">${has ? a.name : '???'}</div>
        <div class="ach-item-desc">${a.desc}</div>
      </div>
      <div class="ach-item-reward">+${a.berries}</div>
    </div>`;
  }).join('');
  openModal(`
    <h3>🏆 Conquistas</h3>
    <div class="ach-progress-bar">
      <div class="ach-progress-fill" style="width:${(got/total)*100}%"></div>
    </div>
    <p style="text-align:center;font-family:'Special Elite',monospace;font-size:0.85rem;margin-bottom:0.5rem">
      ${got} / ${total} desbloqueadas • <strong>${GAME.berries.toLocaleString('pt-BR')} 🟠 Berries</strong>
    </p>
    <div class="ach-list">${items}</div>
  `);
}

/* Estatísticas do casal */
function openStatsModal() {
  const visits = GAME.visitedIslands.size;
  const eggs   = countableEggs();
  const total21 = STATE.foundEggs.has('21') ? 1 : 0;
  const ach    = GAME.achievements.size;
  const totalAch = Object.keys(ACHIEVEMENTS).length;
  // Stats reais do casal (estimadas pelo contexto)
  openModal(`
    <h3>📊 Estatísticas</h3>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num">9</div>
        <div class="stat-label">lugares visitados juntos</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">2+</div>
        <div class="stat-label">aniversários ao lado</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">1</div>
        <div class="stat-label">cachorro duplo merle</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">∞</div>
        <div class="stat-label">reels de The Office</div>
      </div>
    </div>
    <h4 style="margin-top:1rem;font-family:'Bangers',cursive;color:var(--op-oceano-esc)">🏴‍☠️ Sua jornada</h4>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num">${eggs + total21}/21</div>
        <div class="stat-label">easter eggs</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${visits}/11</div>
        <div class="stat-label">ilhas exploradas</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${ach}/${totalAch}</div>
        <div class="stat-label">conquistas</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${GAME.berries.toLocaleString('pt-BR')}</div>
        <div class="stat-label">berries 🟠</div>
      </div>
    </div>
  `);
}

/* ══════════════════════════════════════════════════════
   QUIZ DO CASAL
══════════════════════════════════════════════════════ */
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
  quizState = { index: 0, score: 0, answers: [] };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (quizState.index >= QUIZ.length) {
    finishQuiz();
    return;
  }
  const q = QUIZ[quizState.index];
  const opts = q.options.map((opt, i) =>
    `<button class="quiz-option" data-i="${i}">${opt}</button>`
  ).join('');
  openModal(`
    <h3>💕 Quiz do Casal</h3>
    <div class="quiz-progress">Pergunta ${quizState.index + 1} de ${QUIZ.length} · ${quizState.score} acertos</div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">${opts}</div>
  `);
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => answerQuiz(parseInt(btn.dataset.i)));
  });
}

function answerQuiz(i) {
  const q = QUIZ[quizState.index];
  const correct = i === q.correct;
  if (correct) quizState.score++;
  quizState.answers.push({ chosen: i, correct: q.correct });

  document.querySelectorAll('.quiz-option').forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.correct) btn.classList.add('correct');
    else if (idx === i)    btn.classList.add('wrong');
  });

  const body = document.getElementById('modal-body');
  const exp = document.createElement('div');
  exp.className = 'quiz-explanation';
  exp.innerHTML = `${correct ? '✅' : '❌'} ${q.explanation}
    <button class="quiz-next">${quizState.index === QUIZ.length-1 ? 'Ver resultado →' : 'Próxima →'}</button>`;
  body.appendChild(exp);
  exp.querySelector('.quiz-next').addEventListener('click', () => {
    quizState.index++;
    renderQuizQuestion();
  });

  if (correct) addBerries(100, 'quiz-correct');
}

function finishQuiz() {
  const score = quizState.score;
  const pct = Math.round((score / QUIZ.length) * 100);
  GAME.quizScore = pct;
  saveGame();
  unlockAchievement('quiz-done');
  if (pct === 100) unlockAchievement('quiz-perfect');

  let msg = '';
  if (pct === 100)      msg = "🏆 Perfeito! Você conhece esse casal como ninguém.";
  else if (pct >= 80)   msg = "💎 Excelente! Você é da turma íntima.";
  else if (pct >= 60)   msg = "👍 Bom! Você conhece os pontos principais.";
  else if (pct >= 40)   msg = "😅 Você conhece o básico... vai melhorar na festa!";
  else                  msg = "🤔 Talvez você tenha sido convidado por sorte. Sem problemas, vem que a gente te apresenta tudo dia 13.";

  openModal(`
    <h3>💕 Resultado do Quiz</h3>
    <div class="quiz-result">
      <div class="quiz-score">${score}<span>/${QUIZ.length}</span></div>
      <div class="quiz-pct">${pct}%</div>
    </div>
    <p style="text-align:center;font-family:'Lora',serif;font-style:italic;margin-top:0.5rem">${msg}</p>
    <button class="link-btn" id="quiz-retry" style="margin-top:1rem">Tentar de novo →</button>
  `);
  document.getElementById('quiz-retry').addEventListener('click', openQuizModal);
}

/* ══════════════════════════════════════════════════════
   MEMORY GAME
══════════════════════════════════════════════════════ */
const MEMORY_CARDS = [
  { emoji: '🏴‍☠️', label: 'Bandeira Pirata' },
  { emoji: '🐕',   label: 'Luffy' },
  { emoji: '⛺',   label: 'Camping' },
  { emoji: '💍',   label: 'Casamento' },
  { emoji: '⚽',   label: 'Copa' },
  { emoji: '🪪',   label: 'Crachá' },
  { emoji: '👗',   label: 'Vestido' },
  { emoji: '🎩',   label: 'Chapéu' },
];

let memoryState = null;

function openMemoryModal() {
  const deck = [...MEMORY_CARDS, ...MEMORY_CARDS]
    .map((c, i) => ({ ...c, id: i }))
    .sort(() => Math.random() - 0.5);
  memoryState = {
    deck,
    flipped: [],
    matched: new Set(),
    moves: 0,
    locked: false,
  };
  renderMemory();
}

function renderMemory() {
  const cells = memoryState.deck.map((c, idx) => {
    const isFlipped = memoryState.flipped.includes(idx) || memoryState.matched.has(idx);
    return `<div class="memory-card ${isFlipped ? 'flipped' : ''}" data-idx="${idx}">
      <div class="memory-front">?</div>
      <div class="memory-back">${c.emoji}</div>
    </div>`;
  }).join('');
  openModal(`
    <h3>🧠 Memory Game</h3>
    <div class="memory-status">
      Jogadas: <strong id="memory-moves">${memoryState.moves}</strong> · Pares: <strong>${memoryState.matched.size / 2}/${MEMORY_CARDS.length}</strong>
    </div>
    <div class="memory-grid">${cells}</div>
    <button class="link-btn" id="memory-restart" style="margin-top:0.75rem">Reiniciar</button>
  `);
  document.querySelectorAll('.memory-card').forEach(el => {
    el.addEventListener('click', () => flipMemory(parseInt(el.dataset.idx)));
  });
  document.getElementById('memory-restart').addEventListener('click', openMemoryModal);
}

function flipMemory(idx) {
  if (memoryState.locked) return;
  if (memoryState.matched.has(idx)) return;
  if (memoryState.flipped.includes(idx)) return;

  memoryState.flipped.push(idx);
  const el = document.querySelector(`.memory-card[data-idx="${idx}"]`);
  if (el) el.classList.add('flipped');

  if (memoryState.flipped.length === 2) {
    memoryState.moves++;
    document.getElementById('memory-moves').textContent = memoryState.moves;
    const [a, b] = memoryState.flipped;
    const ca = memoryState.deck[a];
    const cb = memoryState.deck[b];
    if (ca.emoji === cb.emoji) {
      memoryState.matched.add(a);
      memoryState.matched.add(b);
      memoryState.flipped = [];
      addBerries(50, 'memory-pair');
      if (memoryState.matched.size === memoryState.deck.length) {
        setTimeout(finishMemory, 600);
      }
    } else {
      memoryState.locked = true;
      setTimeout(() => {
        document.querySelector(`.memory-card[data-idx="${a}"]`)?.classList.remove('flipped');
        document.querySelector(`.memory-card[data-idx="${b}"]`)?.classList.remove('flipped');
        memoryState.flipped = [];
        memoryState.locked = false;
      }, 900);
    }
  }
}

function finishMemory() {
  const moves = memoryState.moves;
  if (GAME.memoryBestMoves === null || moves < GAME.memoryBestMoves) {
    GAME.memoryBestMoves = moves;
    saveGame();
  }
  unlockAchievement('memory-done');
  if (moves <= 16) unlockAchievement('memory-perfect');

  openModal(`
    <h3>🧠 Memory Completo!</h3>
    <div style="text-align:center;font-size:3rem;margin:0.5rem 0">🎉</div>
    <p style="text-align:center;font-family:'Lora',serif">
      Completou em <strong>${moves}</strong> jogadas.<br>
      ${GAME.memoryBestMoves === moves ? '🏆 Novo recorde pessoal!' : `Seu recorde: ${GAME.memoryBestMoves} jogadas`}
    </p>
    ${moves <= 16
      ? '<p style="text-align:center;color:var(--op-vermelho);font-weight:bold">💎 Memória de Elefante desbloqueada!</p>'
      : '<p style="text-align:center;font-size:0.85rem;opacity:0.7">Termine em ≤16 jogadas pra ganhar a conquista de Memória de Elefante.</p>'
    }
    <button class="link-btn" id="memory-again" style="margin-top:0.75rem">Jogar de novo</button>
  `);
  document.getElementById('memory-again').addEventListener('click', openMemoryModal);
}

/* ══════════════════════════════════════════════════════
   CARTEIRINHA DE PIRATA (WANTED POSTER)
══════════════════════════════════════════════════════ */
function openCardModal() {
  const savedName = GAME.cardName || '';
  const savedSide = GAME.cardSide || STATE.userSide || 'Bernardo';
  openModal(`
    <h3>🪪 Carteirinha de Pirata</h3>
    <p style="font-size:0.85rem;text-align:center;font-style:italic;margin-bottom:0.75rem">
      Crie seu cartaz WANTED oficial pra entrar na tripulação do casal.
    </p>
    <div class="field"><label>Seu nome de pirata</label>
      <input type="text" id="card-name-input" value="${savedName.replace(/"/g, '&quot;')}" placeholder="Ex: Bê Manoel" maxlength="22">
    </div>
    <div class="field"><label>Tripulação</label>
      <div class="radios">
        <label class="radio-opt"><input type="radio" name="card-side" value="Bernardo" ${savedSide === 'Bernardo' ? 'checked' : ''}> 🏴‍☠️ Bernardo</label>
        <label class="radio-opt"><input type="radio" name="card-side" value="Clara"    ${savedSide === 'Clara' ? 'checked' : ''}> 🌸 Clara</label>
      </div>
    </div>
    <button class="link-btn" id="card-generate">Gerar carteirinha →</button>
    <div id="card-preview" class="card-preview"></div>
  `);

  document.getElementById('card-generate').addEventListener('click', () => {
    const name = document.getElementById('card-name-input').value.trim() || 'Pirata Anônimo';
    const side = document.querySelector('input[name="card-side"]:checked')?.value || 'Bernardo';
    GAME.cardName = name;
    GAME.cardSide = side;
    saveGame();
    renderCard(name, side);
    unlockAchievement('identificado');
  });

  if (savedName) renderCard(savedName, savedSide);
}

function renderCard(name, side) {
  const reward = Math.floor(50 + Math.random() * 950); // milhões de berries
  const bountyText = `B$ ${reward.toLocaleString('pt-BR')}.000.000`;
  const isClara = side === 'Clara';
  const preview = document.getElementById('card-preview');
  if (!preview) return;
  preview.innerHTML = `
    <div class="wanted-card ${isClara ? 'wanted-clara' : ''}" id="wanted-card-render">
      <div class="wanted-title">WANTED</div>
      <div class="wanted-photo">${isClara ? '🌸' : '🏴‍☠️'}</div>
      <div class="wanted-name">${name.toUpperCase()}</div>
      <div class="wanted-subtitle">DEAD OR ALIVE</div>
      <div class="wanted-bounty">${bountyText}</div>
      <div class="wanted-crew">— Tripulação ${isClara ? 'da Clara 🌸' : 'do Bê 🏴‍☠️'} —</div>
      <div class="wanted-stamp">${isClara ? '✨' : '☠️'}</div>
    </div>
    <button class="link-btn" id="card-download" style="margin-top:0.75rem">📥 Baixar imagem</button>
  `;
  document.getElementById('card-download').addEventListener('click', downloadCard);
}

function downloadCard() {
  const node = document.getElementById('wanted-card-render');
  if (!node) return;
  // Renderização básica via canvas a partir da string SVG
  const w = node.offsetWidth, h = node.offsetHeight;
  const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${w*2}" height="${h*2}" viewBox="0 0 ${w} ${h}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">${new XMLSerializer().serializeToString(node)}</div>
    </foreignObject></svg>`;
  const blob = new Blob([data], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wanted-${(GAME.cardName||'pirata').replace(/\s+/g,'-').toLowerCase()}.svg`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('🪪 Carteirinha baixada!', 'egg-found');
}

/* ══════════════════════════════════════════════════════
   TIMELINE CRONOLÓGICA
══════════════════════════════════════════════════════ */
const TIMELINE = [
  {
    when: '2022 — primeiro semestre',
    icon: '👀',
    title: 'O primeiro olhar',
    text: 'No Reino Desencantado, num evento da empresa, Bernardo olhou pra Clara de um jeito fixo e nada discreto. Clara só pensou: "quem é esse menino?"',
    island: 1,
    chapter: 'principal',
  },
  {
    when: '2022 — dia seguinte',
    icon: '🎉',
    title: 'A festa do RH (Marineford)',
    text: 'Em uma festa da firma, onde Clara ia, Bernardo aparecia. O RH percebeu e veio o alerta: "melhor não se envolverem por causa do trabalho." Ironicamente, o regulamento foi escrito pela própria Clara.',
    island: 2,
    chapter: 'principal',
  },
  {
    when: '2022 — semanas seguintes',
    icon: '📱',
    title: 'O Instagram & os reels',
    text: 'Com uma desculpa qualquer, Clara pediu o Instagram dele. Começava ali uma sequência de curtidas em stories e reels de The Office — mesmo Bernardo não gostando, mas fingindo com a dedicação de quem já estava entregue ao papel.',
    island: 3,
    chapter: 'principal',
  },
  {
    when: '2022 — um mês depois',
    icon: '💌',
    title: 'O primeiro convite',
    text: 'Depois de mais de um mês de suspense, Bernardo finalmente criou coragem e chamou Clara pra sair.',
    chapter: 'principal',
  },
  {
    when: '2023',
    icon: '⛺',
    title: 'Conselheiro Mata',
    text: 'A primeira viagem juntos. Mato, barraca, carrapatos. O cenário menos óbvio do mundo pra começar um namoro — e foi exatamente ali que começou.',
    island: 4,
    chapter: 'principal',
  },
  {
    when: '2023',
    icon: '🐕',
    title: 'Luffy entra no roteiro',
    text: 'Um Border Collie que parece albino, mas é duplo merle. Mais amor, mais pelos pela casa, uma boa dose de caos.',
    island: 10,
    chapter: 'principal',
  },
  {
    when: '2023–2024',
    icon: '🏖️',
    title: 'Capítulo B — As Viagens',
    text: 'Em paralelo à história principal, o casal foi acumulando endereços: Serro, Piracema, Guarapari, Entre Rios, Serra do Cipó. Cinco cenários, uma constante: os dois juntos.',
    chapter: 'viagens',
  },
  {
    when: '2024–2025',
    icon: '🌀',
    title: 'Términos, voltas e reviravoltas',
    text: 'Entre conflitos, reconciliações e reviravoltas dignas de filme, o maior vilão foi sempre o mesmo: o contexto de trabalho do Reino Desencantado.',
    chapter: 'principal',
  },
  {
    when: '2025',
    icon: '🚪',
    title: 'A saída do Reino',
    text: 'Clara finalmente saiu daquele cenário. Foi quando os dois descobriram que talvez o amor só precisasse de uma nova fase pra acontecer do jeito certo.',
    chapter: 'principal',
  },
  {
    when: '13 de junho de 2026',
    icon: '🎂',
    title: 'A Sessão da Tarde',
    text: 'Clara fazendo 30 (entrando oficialmente em "De Repente 30"). Bernardo fazendo 27 (no melhor estilo One Piece: meio perdido às vezes, mas com o coração no lugar certo). Dois aniversários, uma história improvável, um cachorro no elenco, Brasil na Copa.',
    island: 11,
    chapter: 'principal',
  },
];

function openTimelineModal() {
  const items = TIMELINE.map((t, i) => `
    <div class="timeline-item timeline-${t.chapter}">
      <div class="timeline-icon">${t.icon}</div>
      <div class="timeline-body">
        <div class="timeline-when">${t.when}</div>
        <div class="timeline-title">${t.title}</div>
        <div class="timeline-text">${t.text}</div>
        ${t.island ? `<button class="timeline-goto" data-i="${t.island}">Ir pra ilha →</button>` : ''}
      </div>
    </div>
  `).join('');
  openModal(`
    <h3>📜 Linha do tempo</h3>
    <p style="font-size:0.82rem;text-align:center;font-style:italic;opacity:0.85;margin-bottom:0.75rem">
      A jornada do Bê &amp; Clara em ordem cronológica.<br>
      <span style="color:var(--op-vermelho)">🏴‍☠️ Capítulo principal</span> · <span style="color:#2d8a5a">🏖️ Viagens (capítulo paralelo)</span>
    </p>
    <div class="timeline">${items}</div>
  `);
  document.querySelectorAll('.timeline-goto').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal();
      navigateToIsland(parseInt(btn.dataset.i));
    });
  });
  unlockAchievement('timeline-seen');
}

/* ══════════════════════════════════════════════════════
   GALERIA UTILITY — múltiplas fotos em carousel
══════════════════════════════════════════════════════ */
function buildGallery(images, alt = '') {
  if (!images || !images.length) return '';
  if (images.length === 1) {
    return `<img src="${images[0]}" alt="${alt}">`;
  }
  const slides = images.map((src, i) =>
    `<img src="${src}" alt="${alt} ${i+1}" data-i="${i}" class="${i === 0 ? 'active' : ''}">`
  ).join('');
  const id = 'gal-' + Math.random().toString(36).slice(2, 8);
  setTimeout(() => initGallery(id), 50);
  return `<div class="gallery" id="${id}">
    <div class="gallery-frame">${slides}</div>
    <button class="gallery-prev" data-dir="-1">‹</button>
    <button class="gallery-next" data-dir="1">›</button>
    <div class="gallery-dots">${images.map((_,i)=>`<span class="gdot ${i===0?'active':''}" data-i="${i}"></span>`).join('')}</div>
  </div>`;
}

function initGallery(id) {
  const root = document.getElementById(id);
  if (!root) return;
  const slides = root.querySelectorAll('.gallery-frame img');
  const dots = root.querySelectorAll('.gdot');
  let idx = 0;
  function go(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle('active', j === idx));
    dots.forEach((d, j) => d.classList.toggle('active', j === idx));
  }
  root.querySelector('.gallery-prev')?.addEventListener('click', () => go(idx - 1));
  root.querySelector('.gallery-next')?.addEventListener('click', () => go(idx + 1));
  dots.forEach(d => d.addEventListener('click', () => go(parseInt(d.dataset.i))));
}
/* ══════════════════════════════════════════════════════
   MAPA REAL DO BRASIL — pins das viagens
══════════════════════════════════════════════════════ */
const BRAZIL_PINS = [
  { x: 540, y: 340, label: 'BH / Brumadinho',   desc: 'Origem do casal. A festa será aqui.', icon: '🏠' },
  { x: 555, y: 320, label: 'Conselheiro Mata',  desc: 'Mato, barraca, carrapatos — virou namoro.', icon: '⛺' },
  { x: 565, y: 305, label: 'Serro',             desc: 'Casario colonial e o melhor queijo do Brasil.', icon: '🧀' },
  { x: 535, y: 315, label: 'Piracema',          desc: 'Água fria, pedra quente.', icon: '💧' },
  { x: 615, y: 360, label: 'Guarapari (ES)',    desc: 'Areia radioativa, sol quente.', icon: '🌊' },
  { x: 510, y: 360, label: 'Entre Rios',        desc: 'Onde não precisa acontecer nada pra valer tudo.', icon: '🏞️' },
  { x: 555, y: 325, label: 'Serra do Cipó',     desc: 'A mais épica. Algumas histórias pedem cachoeira grande.', icon: '⛰️' },
];

function openBrasilMapModal() {
  const pins = BRAZIL_PINS.map((p, i) =>
    `<g class="br-pin" data-i="${i}" style="transform-origin:${p.x}px ${p.y}px">
      <circle cx="${p.x}" cy="${p.y}" r="9" fill="var(--op-vermelho)" stroke="#fff" stroke-width="2"/>
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#fff"/>
    </g>`
  ).join('');
  openModal(`
    <h3>🇧🇷 Os lugares deles, no Brasil real</h3>
    <p style="font-size:0.85rem;text-align:center;font-style:italic;opacity:0.85;margin-bottom:0.5rem">
      Tudo concentrado em Minas Gerais (e uma escapada pro Espírito Santo).
    </p>
    <div class="br-map-wrap">
      <svg viewBox="0 0 1000 1000" class="br-map-svg" xmlns="http://www.w3.org/2000/svg" aria-label="Mapa simplificado do Brasil">
        <!-- silhueta simplificada -->
        <path d="M 320 200 Q 380 140 500 130 Q 620 130 700 180 Q 770 240 770 320 Q 800 380 760 460 Q 760 540 700 620 Q 680 720 600 780 Q 530 830 460 820 Q 380 830 320 780 Q 260 720 250 620 Q 220 540 240 460 Q 230 380 260 320 Q 280 250 320 200 Z"
              fill="#dcc798" stroke="#5a3a18" stroke-width="3" />
        <!-- MG destacado (aproximação) -->
        <path d="M 480 280 Q 540 270 600 290 Q 640 320 640 360 Q 620 400 560 410 Q 510 410 470 380 Q 460 330 480 280 Z"
              fill="#f4e4c1" stroke="#c0392b" stroke-width="2" />
        <text x="540" y="350" font-family="Bangers" font-size="22" fill="#6b1d10" text-anchor="middle">MG</text>
        ${pins}
      </svg>
      <div class="br-pin-info" id="br-pin-info">
        <p style="font-style:italic;font-size:0.85rem;text-align:center;opacity:0.7">Clique nos pinos vermelhos pra ver cada lugar.</p>
      </div>
    </div>
  `);
  document.querySelectorAll('.br-pin').forEach((g, i) => {
    g.addEventListener('click', () => {
      const p = BRAZIL_PINS[i];
      document.querySelectorAll('.br-pin').forEach(x => x.classList.remove('active'));
      g.classList.add('active');
      const info = document.getElementById('br-pin-info');
      info.innerHTML = `
        <div style="text-align:center">
          <div style="font-size:2rem">${p.icon}</div>
          <h4 style="font-family:'Bangers',cursive;font-size:1.2rem;letter-spacing:0.04em;color:var(--op-oceano-esc)">${p.label}</h4>
          <p style="font-family:'Lora',serif;font-style:italic;font-size:0.9rem;margin-top:0.3rem">${p.desc}</p>
        </div>`;
    });
  });
  unlockAchievement('map-seen');
}

/* ══════════════════════════════════════════════════════
   DIÁRIO DE BORDO — convidado escreve recado
══════════════════════════════════════════════════════ */
function openDiaryModal() {
  const txt = GAME.diaryText || '';
  openModal(`
    <h3>📖 Diário de Bordo</h3>
    <p style="font-size:0.85rem;font-style:italic;text-align:center;opacity:0.85;margin-bottom:0.5rem">
      Deixe um recado pro Bê &amp; Clara. Eles vão ler depois da festa.
    </p>
    <textarea id="diary-text" class="diary-textarea"
              placeholder="Querido casal,&#10;&#10;Eu queria contar pra vocês...">${txt.replace(/</g,'&lt;')}</textarea>
    <div style="display:flex;gap:0.5rem;margin-top:0.5rem">
      <button class="link-btn" id="diary-save" style="flex:1">💾 Salvar recado</button>
      <button class="link-btn" id="diary-clear" style="flex:0 0 auto;background:rgba(0,0,0,0.2)">Limpar</button>
    </div>
    <p style="font-size:0.75rem;opacity:0.6;margin-top:0.5rem;text-align:center">
      Seu texto fica salvo localmente. Para enviar ao casal de verdade, copie e mande pelo WhatsApp.
    </p>
  `);
  document.getElementById('diary-save').addEventListener('click', () => {
    const text = document.getElementById('diary-text').value.trim();
    GAME.diaryText = text;
    saveGame();
    if (text.length > 5) unlockAchievement('diarista');
    showToast('💾 Recado salvo!', 'egg-found');
  });
  document.getElementById('diary-clear').addEventListener('click', () => {
    if (confirm('Limpar o recado?')) {
      document.getElementById('diary-text').value = '';
      GAME.diaryText = '';
      saveGame();
    }
  });
}
function openHelpModal() {
  openModal(`
    <h3>🏴‍☠️ Como jogar</h3>
    <p style="font-family:'Lora',serif;line-height:1.7">
      Este é o convite-jornada do <strong>Bê &amp; Clara</strong>. Mas também é uma caça ao tesouro.<br><br>
      🗺️ Existem <strong>20 easter eggs</strong> espalhados pelas ilhas e oceanos.<br>
      🏆 Quando encontrar todos os 20, uma pista vai revelar onde está o <strong>21º</strong>.<br>
      💰 Cada descoberta soma <strong>Berries</strong> à sua conta de pirata.<br>
      🎮 Jogue o <strong>Quiz</strong> e o <strong>Memory</strong> para ganhar mais berries e conquistas.<br>
      📖 Deixe uma mensagem no <strong>Diário de Bordo</strong>.<br>
      🪪 Crie sua <strong>Carteirinha de Pirata</strong> oficial.<br><br>
      <strong>Quem encontrar o 21º easter egg ganha o tesouro do One Piece. 👑</strong>
    </p>
  `);
}

function showHintModal() {
  openModal(`
    <h3>🗝️ Uma pista do tesouro...</h3>
    <p style="font-family:'Special Elite',monospace;font-size:1.05rem;text-align:center;padding:1rem;background:rgba(245,197,24,0.15);border-radius:8px;line-height:1.7">
      "Você encontrou os <strong>20</strong>. Mas o tesouro real ainda dorme.<br><br>
      <em>Volte ao princípio.<br>
      O chapéu que te levou ao mar guarda um segredo.<br>
      Clique nele cinco vezes — e o mundo novo se abrirá."</em>
    </p>
    <p style="text-align:center;margin-top:0.75rem;font-size:0.85rem;opacity:0.7">— Carta da Marinha, encontrada à deriva</p>
  `);
}

function showTreasureFinal() {
  openModal(`
    <h3>🏆 VOCÊ ENCONTROU O ONE PIECE!</h3>
    <div style="text-align:center;font-size:3rem;margin:1rem 0">🏴‍☠️ 👑 🏴‍☠️</div>
    <p style="font-family:'Bangers',cursive;font-size:1.4rem;text-align:center;letter-spacing:0.04em;color:var(--op-vermelho)">
      "É o tesouro deles. Agora é seu também."
    </p>
    <p style="font-family:'Lora',serif;font-style:italic;text-align:center;margin-top:0.75rem;line-height:1.7">
      Você completou a jornada. Encontrou todos os 21 easter eggs.<br>
      Bê &amp; Clara guardaram um presente especial pra quem chegou até aqui.
    </p>
    <div style="background:linear-gradient(135deg,#f5c518,#c0392b);padding:1.5rem;border-radius:10px;margin-top:1rem;text-align:center;border:3px solid #4a2a00">
      <div style="font-size:2.5rem">🎁</div>
      <p style="font-family:'Special Elite',monospace;color:#fff;font-size:0.95rem;margin-top:0.5rem">
        TESOURO A SER REVELADO<br>
        <small>(em construção — surpresa do casal)</small>
      </p>
    </div>
    <p style="text-align:center;margin-top:1rem;font-size:0.9rem">
      🏆 Conquista desbloqueada: <strong>O One Piece é Real</strong><br>
      💰 +5000 Berries
    </p>
  `);
}

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadGame();
  initIntro();
  initEasterEggs();
  initIslandInteractions();
  initNavigation();
  initProgressDots();
  initRSVP();
  initToolbar();
  initHatClicks();
  injectIslandDates();
  updateHUD();
});

/* ══════════════════════════════════════════════════════
   FITINHAS DE DATA / CAPÍTULO em cada ilha
══════════════════════════════════════════════════════ */
const ISLAND_META = {
  1:  { date: '📅 2022 · primeiro semestre',  chapter: 'principal', tag: 'Capítulo I — O olhar' },
  2:  { date: '📅 2022 · dia seguinte',       chapter: 'principal', tag: 'Capítulo II — Marineford' },
  3:  { date: '📅 2022 · semanas seguintes',  chapter: 'principal', tag: 'Capítulo III — Reels e curtidas' },
  4:  { date: '📅 2023 · primeiro encontro',  chapter: 'principal', tag: 'Capítulo IV — Aqui virou namoro' },
  5:  { date: '🗺️ Capítulo B · As Viagens',   chapter: 'viagens',   tag: 'Serro · Minas colonial' },
  6:  { date: '🗺️ Capítulo B · As Viagens',   chapter: 'viagens',   tag: 'Piracema · água fria, pedra quente' },
  7:  { date: '🗺️ Capítulo B · As Viagens',   chapter: 'viagens',   tag: 'Guarapari · areia radioativa' },
  8:  { date: '🗺️ Capítulo B · As Viagens',   chapter: 'viagens',   tag: 'Entre Rios · silêncio que vale tudo' },
  9:  { date: '🗺️ Capítulo B · As Viagens',   chapter: 'viagens',   tag: 'Serra do Cipó · a mais épica' },
  10: { date: '📅 2023 · novo integrante',    chapter: 'principal', tag: 'Capítulo V — Luffy entra em cena' },
  11: { date: '📅 13/06/2026 · presente',     chapter: 'final',     tag: 'Capítulo Final — A Sessão da Tarde' },
};

function injectIslandDates() {
  document.querySelectorAll('.island[data-index]').forEach(island => {
    const idx = parseInt(island.dataset.index);
    const meta = ISLAND_META[idx];
    if (!meta) return;
    const title = island.querySelector('.island-title');
    if (!title) return;
    const strip = document.createElement('div');
    strip.className = `chapter-strip chapter-${meta.chapter}`;
    strip.innerHTML = `
      <div class="chapter-tag">${meta.tag}</div>
      <div class="chapter-date">${meta.date}</div>`;
    title.insertAdjacentElement('afterend', strip);
  });
}

/* Chapéu de palha — 21º easter egg secreto (5 cliques) */
function initHatClicks() {
  const hat = document.querySelector('.intro-screen .straw-hat');
  if (!hat) return;
  hat.style.cursor = 'pointer';
  hat.addEventListener('click', e => {
    e.stopPropagation();
    GAME.hatClicks++;
    saveGame();
    hat.style.transform = 'scale(1.3) rotate(' + (GAME.hatClicks * 15) + 'deg)';
    setTimeout(() => { hat.style.transform = ''; }, 300);
    if (GAME.hatClicks >= 5 && !STATE.foundEggs.has('21')) {
      // Só permite achar o 21º se já tem os 20 + dica revelada
      if (GAME.hintRevealed) {
        EGG_DATA['21'] = {
          type: 'op', secret: true, title: 'O Tesouro Final',
          html: `<h3>👑 ENCONTROU!</h3>
            <p style="text-align:center;font-size:1.1rem;font-family:'Bangers',cursive;color:var(--op-vermelho);letter-spacing:0.04em">
              O chapéu de palha era a chave.
            </p>
            <p style="text-align:center;font-style:italic;margin-top:0.5rem">
              "Você completou o impossível, navegante. Agora vê o que ninguém mais viu..."
            </p>`,
        };
        STATE.foundEggs.add('21');
        saveEggs();
        showEgg('21');
      } else {
        // Pisca dica mas não conta
        showToast('🏴‍☠️ O chapéu fez algo... mas talvez você precise descobrir mais antes.', 'egg-found');
      }
      GAME.hatClicks = 0;
      saveGame();
    }
  });
}
