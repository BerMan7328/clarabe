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
   DADOS DOS EASTER EGGS
══════════════════════════════════════════════════════ */
const EGG_DATA = {
  '1': {
    type: 'op',
    title: 'Den Den Mushi',
    html: `<h3>📞 Den Den Mushi</h3>
      <img src="assets/fotos/luffy-filhote.jpeg" alt="Den Den Mushi — casal e Luffy filhote">
      <p>Comunicação 100% pirata. Sinal fraco, conexão forte.</p>`,
  },
  '2': {
    type: 'op',
    title: 'Baú do Tesouro',
    html: `<h3>🎁 Baú do Tesouro</h3>
      <img src="assets/fotos/casal-encontro.jpeg" alt="Dia dos namorados">
      <p>Nem todo baú tem ouro. Alguns têm memórias.</p>`,
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
      <img src="assets/fotos/evento-ravi.jpeg" alt="Aniversário do Ravi">
      <p>"Aniversário do Ravi. Um capítulo importante."</p>`,
  },
  '14': {
    type: 'op',
    title: 'Casamento do Miguel',
    html: `<h3>💍 Casamento do Miguel</h3>
      <img src="assets/fotos/evento-miguel.jpeg" alt="Casamento do Miguel">
      <p>"Casamento do Miguel. Foram juntos."</p>`,
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
    const eggEl = document.getElementById('egg-' + id);
    if (eggEl) eggEl.classList.add('found');
    const rect = eggEl ? eggEl.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2 };
    spawnConfetti(rect.left + rect.width/2, rect.top);
    const toastType = data.type === 'dr30' ? 'dr30-found' : 'egg-found';
    showToast(`✨ Easter egg encontrado: ${data.title}!`, toastType);
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
  STATE.currentIsland = index;

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
  const btnB = document.getElementById('btn-bernardo');
  const btnC = document.getElementById('btn-clara');
  const step1 = document.getElementById('rsvp-step-1');
  const step2 = document.getElementById('rsvp-step-2');
  const step3 = document.getElementById('rsvp-step-3');

  function chooseSide(side) {
    STATE.userSide = side;
    localStorage.setItem('userSide', side);
    document.getElementById('rsvp-lado-input').value = side;
    step1.classList.add('hidden');
    step2.classList.remove('hidden');

    if (side === 'Clara') {
      step2.classList.add('dr30-style');
      const q = step2.querySelector('.rsvp-question');
      if (q) q.style.fontFamily = "'Dancing Script', cursive";
    }
  }

  btnB.addEventListener('click', () => chooseSide('Bernardo'));
  btnC.addEventListener('click', () => chooseSide('Clara'));

  const form = document.getElementById('rsvp-form');
  form.addEventListener('submit', async e => {
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
      document.getElementById('hud').classList.remove('hidden');
      document.getElementById('map-wrapper').classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        updateEggCounter();
        navigateToIsland(1, false);
        restoreFoundEggs();
      }, 100);
    }, 800);
  });
}

function restoreFoundEggs() {
  STATE.foundEggs.forEach(id => {
    const el = document.getElementById('egg-' + id);
    if (el) el.classList.add('found');
  });
  updateEggCounter();
}

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  initEasterEggs();
  initIslandInteractions();
  initNavigation();
  initRSVP();
});
