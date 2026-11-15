// Snake-Eye Trainer: viewer, trainer and quiz. No dependencies.
const $ = s => document.querySelector(s);
const LS = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const WHO = { you: 'You', opp: 'Opponent', note: 'Note' };

// ---------- Deck (as confirmed by you) ----------
const DECK = {
  monsters: [
    ['Snake-Eye Ash', 2, 'On Summon, adds a Level 1 FIRE monster (Kurikara or a Diabellstar).'],
    ['Snake-Eyes Poplar', 2, 'Tributing it replicates Temple’s effect.'],
    ['Snake-Eye Oak', 1, 'Retrieves a banished Level 1 FIRE monster.'],
    ['Snake-Eye Birch', 2, 'Level 1 Snake-Eye that can be revealed for Temple.'],
    ['Snake-Eyes Flamberge Dragon', 2, 'Extender; can be set in the backrow so Temple can block attacks.'],
    ['Diabellstar the Black Witch', 2, 'On Special Summon, sets a Sinful Spoils card; can negate at chain link 2.'],
    ['Kurikara Divincarnate', 1, 'Finisher: +1500 ATK for each monster Tributed.'],
    ['Nibiru, the Primal Being', 2, 'Answer to the opponent’s 5th summon; hold it for go-wide decks.'],
    ['Droll & Lock Bird', 1, 'Hand trap against decks that add cards from the Deck.']
  ],
  spells: [
    ['Forbidden Droplet', 3, 'Your key interaction. Scan for the opponent’s copies before committing.'],
    ['WANTED: Seeker of Sinful Spoils', 2, 'If only the opponent has a monster: send Silvera to GY and set another WANTED.'],
    ['Divine Temple of the Snake-Eye', 1, 'Reveal a Level 1 Snake-Eye or Diabellstar; add up to 2 Spoils cards or Temple. Works on the opponent’s turn.'],
    ['One for One', 1, ''], ['Hey, Trunade!', 1, ''], ['Spiritualism', 2, ''],
    ['Original Sinful Spoils - Snake-Eye (OSS)', 2, 'Special Summons Ash; GY effect returns a Level 1 FIRE.'],
    ['Sinful Spoils of Subversion - Snake-Eye', 1, 'Removal that sets up Ash.'],
    ['Sinful Spoils of Betrayal - Silvera', 1, ''], ['Startling Stare of the Snake-Eyes', 1, '']
  ],
  extra: [
    ['Lyrilusc - Independent Nightingale', 'Rank 1 Xyz'], ['S:P Little Knight', 'Link-2 (bait for negates)'],
    ['I:P Masquerena', 'Link-2'], ['Knightmare Phoenix', 'Link-2'], ['Linkuriboh', 'Link-1'],
    ['Promethean Princess, Bestower of Flames', 'Link-3'], ['Worldsea Dragon Zealantis', 'Link-4 board wipe'],
    ['Amphibious Swarmship Amblowhale', 'Link-4'], ['Underworld Goddess of the Closed World', 'Link-5 negate']
  ]
};

// ---------- Trainer content ----------
const SCENARIOS = [
  { t: 'Predaplant opponent. You hold Temple, Poplar, Ash and OSS. The opponent has Imperm and Dragostapelia.', o: ['Run OSS first', 'Activate Temple first as bait, then OSS', 'Hold everything'], a: 1, w: 'Make the opponent spend its negate on the less important card so OSS resolves.' },
  { t: 'The opponent’s Dragostapelia effect is on the chain. Diabellstar is in hand.', o: ['Let it resolve', 'Negate it with Diabellstar at the right chain link', 'Tribute Poplar'], a: 1, w: 'Save Diabellstar to negate Dragostapelia; it also lets you reach Subversion.' },
  { t: 'Stardust opponent searches with a Level 4 Stardust effect. You can negate it.', o: ['Negate the search', 'Wait for Satellite Warrior', 'Ignore it'], a: 0, w: 'Cutting the search stops the line before Satellite Warrior.' },
  { t: 'Stardust opponent has several Dragon Synchros in the GY. What do you aim for?', o: ['Leave the GY alone', 'Reduce different Dragon Synchro names below 5', 'Banish your own cards'], a: 1, w: 'Below 5 names, Converging Wishes can’t be used.' },
  { t: 'Dark Magician opponent could summon Red-Eyes Dark Dragoon. You have your Snake-Eye removal effect.', o: ['Remove the Dark Magician it needs', 'Attack first', 'Save the effect for later'], a: 0, w: 'Deny the Dragoon route until one of the opponent’s last plays.' },
  { t: 'Horus opponent has Canopic Protector set. You want to build a board.', o: ['Commit your key play immediately', 'Bait Canopic Protector with a lesser play first', 'Pass'], a: 1, w: 'Canopic Protector triggers on your activation, so bait before committing.' },
  { t: 'Shining Sarc opponent’s monsters negate automatically in the Standby Phase.', o: ['Avoid Kurikara', 'Plan Kurikara: each Tribute is +1500 ATK', 'Add more Spells'], a: 1, w: 'Their negates feed Kurikara.' },
  { t: 'You have S:P Little Knight and a key play to resolve. The opponent has a negate Xyz.', o: ['Use S:P as bait first', 'Make the key play first', 'End turn'], a: 0, w: 'S:P baits the negate away from the play you need.' },
  { t: 'The opponent activates an Xyz effect (Dingirsu) on your turn. You hold Temple.', o: ['Chain Temple to it', 'Do nothing'], a: 0, w: 'The creator’s review: they arguably should have chained Temple.' }
];
const LINES = [
  { n: 'Temple opening', s: ['Activate Temple (reveal Level 1, add Spoils)', 'Summon Poplar', 'Diabellstar searches OSS', 'OSS Special Summons Ash', 'Ash adds a Level 1 FIRE'] },
  { n: 'Diabellstar opening', s: ['Special Summon Diabellstar', 'Set OSS', 'Activate OSS (summon Ash)', 'Ash searches a Level 1 FIRE', 'Extend or hold Kurikara'] },
  { n: 'Bait sequence vs negates', s: ['Identify the opponent’s negates', 'Play the lesser card first', 'Let the negate be used', 'Resolve your key play', 'Keep Kurikara for the final turn'] }
];
const FACTS = [
  ['How many Forbidden Droplet are in your deck?', '3', ['1', '2', '3', '4']],
  ['How many Nibiru?', '2', ['1', '2', '3', '0']],
  ['How many Kurikara Divincarnate?', '1', ['1', '2', '3', '0']],
  ['Which Extra Deck monster is your board wipe?', 'Worldsea Dragon Zealantis', ['Worldsea Dragon Zealantis', 'Linkuriboh', 'I:P Masquerena', 'Knightmare Phoenix']],
  ['What does your skill restrict?', 'Special Summons to FIRE and Diabellstar (Extra Deck excepted)', ['Special Summons to FIRE and Diabellstar (Extra Deck excepted)', 'All Normal Summons', 'Spell activations', 'Battle Phase']],
  ['Temple reveals what from your hand?', 'A Level 1 Snake-Eye or Diabellstar', ['A Level 1 Snake-Eye or Diabellstar', 'Any Dragon', 'A Link monster', 'Nothing']],
  ['What does OSS Special Summon?', 'Snake-Eye Ash', ['Snake-Eye Ash', 'Kurikara', 'Diabellstar', 'Flamberge']],
  ['How much ATK does Kurikara gain per Tribute?', '1500', ['500', '1000', '1500', '2000']],
  ['Against Predaplant, what should you bait first?', 'Dragostapelia', ['Dragostapelia', 'Poplar', 'Droll & Lock Bird', 'Nibiru']],
  ['Which card answers the opponent’s 5th summon?', 'Nibiru', ['Nibiru', 'Droll & Lock Bird', 'Poplar', 'Oak']],
  ['Droll & Lock Bird is best against…', 'Decks that search from the Deck', ['Decks that search from the Deck', 'Link monsters', 'Spells', 'Burn']]
];

// ---------- State and routing ----------
let view = 'duels', duelIdx = 0, quiz = null, trainerMode = 'scenario', tState = {};
document.querySelectorAll('#nav button').forEach(b => b.onclick = () => go(b.dataset.v));
function go(v) { view = v; document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); ({ duels, deck, trainer, quizView })[v](); window.scrollTo(0, 0); }
const app = h => { $('#app').innerHTML = h; };
const on = (sel, fn) => document.querySelectorAll(sel).forEach(el => el.onclick = () => fn(el));

// ---------- Duels ----------
function duels() {
  const d = DUELS[duelIdx];
  app(`<h1>Duel logs</h1><p class="mute">Each move shows what it sets up next. Dots: green seen on screen, yellow commentary, grey inferred.</p>
  <div class="tabs">${DUELS.map((x, i) => `<button class="${i === duelIdx ? 'on' : ''}" data-i="${i}">${esc(x.n)}</button>`).join('')}</div>
  <div class="card"><b>${esc(d.res)}</b><p class="mute">${esc(d.chain)}</p></div>
  ${d.rows.map(r => `<div class="row ${r[0]}"><span class="t">${WHO[r[0]]} · ${r[1]}<i class="dot d${r[5]}"></i></span><h3>${esc(r[2])}</h3><p>${esc(r[3])}</p><p class="nx">Sets up: ${esc(r[4])}</p></div>`).join('')}`);
  on('.tabs button', el => { duelIdx = +el.dataset.i; duels(); });
}

// ---------- Deck ----------
function deck() {
  const line = x => `<div class="row"><b>${esc(x[0])}</b> <span class="cnt">×${x[1]}</span><p class="mute">${esc(x[2] || '')}</p></div>`;
  app(`<h1>Your deck</h1><p class="mute">30 Main, 9 Extra. Skill: Eyes of Sovereign Defiance.</p>
  <h2>Monsters (15)</h2>${DECK.monsters.map(line).join('')}<h2>Spells and Traps (15)</h2>${DECK.spells.map(line).join('')}
  <h2>Extra Deck (9)</h2>${DECK.extra.map(x => `<div class="row"><b>${esc(x[0])}</b><p class="mute">${esc(x[1])}</p></div>`).join('')}`);
}

// ---------- Trainer ----------
function trainer() {
  app(`<h1>Trainer</h1><div class="tabs"><button class="${trainerMode === 'scenario' ? 'on' : ''}" data-m="scenario">Scenarios</button><button class="${trainerMode === 'line' ? 'on' : ''}" data-m="line">Sequencer</button></div><div id="tbody"></div>`);
  on('.tabs button', el => { trainerMode = el.dataset.m; tState = {}; trainer(); });
  trainerMode === 'scenario' ? scenario() : sequencer();
}
function scenario() {
  const s = tState.s ?? (tState.s = SCENARIOS[Math.random() * SCENARIOS.length | 0]);
  $('#tbody').innerHTML = `<div class="card"><p>${esc(s.t)}</p></div>${s.o.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}<div id="fb"></div>`;
  on('.opt', el => {
    if (tState.done) return; tState.done = 1;
    document.querySelectorAll('.opt').forEach((b, i) => b.classList.add(i === s.a ? 'ok' : (b === el ? 'no' : '')));
    $('#fb').innerHTML = `<div class="card"><b>${+el.dataset.i === s.a ? 'Correct.' : 'Not quite.'}</b><p>${esc(s.w)}</p></div><button class="btn main" id="nx">Next scenario</button>`;
    $('#nx').onclick = () => { tState = {}; scenario(); };
  });
}
function sequencer() {
  const L = tState.l ?? (tState.l = LINES[Math.random() * LINES.length | 0]);
  const order = tState.order ?? (tState.order = shuffle(L.s)), got = tState.got ?? (tState.got = []);
  $('#tbody').innerHTML = `<h3>${esc(L.n)}</h3><p class="mute">Tap the steps in the right order.</p>${order.map(x => `<button class="step opt ${got.includes(x) ? 'done' : ''}" data-s="${esc(x)}">${got.includes(x) ? (got.indexOf(x) + 1) + '. ' : ''}${esc(x)}</button>`).join('')}
  ${got.length === L.s.length ? '<div class="card"><b>Line complete.</b></div><button class="btn main" id="nx">Next line</button>' : ''}`;
  on('.step', el => {
    const x = el.dataset.s; if (got.includes(x)) return;
    if (x === L.s[got.length]) { got.push(x); sequencer(); } else { el.classList.add('no'); setTimeout(() => el.classList.remove('no'), 400); }
  });
  const nx = $('#nx'); if (nx) nx.onclick = () => { tState = {}; sequencer(); };
}

// ---------- Quiz ----------
function makeQuestions() {
  const qs = FACTS.map(f => ({ q: f[0], a: f[1], o: shuffle(f[2]) }));
  DUELS.forEach((d, n) => {
    const rows = d.rows.filter(r => r[5] === 1);
    shuffle(rows).slice(0, 2).forEach(r => {
      const others = shuffle(rows.filter(x => x[2] !== r[2])).slice(0, 3).map(x => x[2]);
      qs.push({ q: `Duel ${n + 1} at ${r[1]}: which move happened?`, a: r[2], o: shuffle([r[2], ...others]) });
      const nx = shuffle(rows.filter(x => x[4] !== r[4])).slice(0, 3).map(x => x[4]);
      qs.push({ q: `${r[2]} (Duel ${n + 1}): what did it set up?`, a: r[4], o: shuffle([r[4], ...nx]) });
    });
  });
  return shuffle(qs).slice(0, 12);
}
function quizView() {
  const st = LS.get('stats', { played: 0, best: 0 }), missed = LS.get('missed', []);
  if (!quiz) return app(`<h1>Quiz</h1><div class="card"><p>Played: ${st.played} · Best: ${st.best}/12</p><p class="mute">Questions come from your deck and the five duel logs.</p></div>
  <button class="btn main" id="go">Start 12 questions</button> ${missed.length ? `<button class="btn" id="rv">Review ${missed.length} missed</button>` : ''}`)
    || ($('#go').onclick = () => { quiz = { qs: makeQuestions(), i: 0, s: 0, miss: [] }; quizView(); }), $('#rv') && ($('#rv').onclick = () => { quiz = { qs: shuffle(missed).slice(0, 12), i: 0, s: 0, miss: [], review: 1 }; quizView(); });
  const q = quiz.qs[quiz.i];
  if (!q) {
    if (!quiz.review) LS.set('stats', { played: st.played + 1, best: Math.max(st.best, quiz.s) });
    LS.set('missed', quiz.review ? missed.filter(m => quiz.miss.some(x => x.q === m.q)) : [...quiz.miss, ...missed].slice(0, 30));
    const s = quiz.s, n = quiz.qs.length; quiz = null;
    return (app(`<h1>Done</h1><div class="card"><b>${s}/${n}</b></div><button class="btn main" id="again">Back</button>`), $('#again').onclick = quizView);
  }
  app(`<p class="mute">Question ${quiz.i + 1} of ${quiz.qs.length} · Score ${quiz.s}</p><div class="bar"><i style="width:${quiz.i / quiz.qs.length * 100}%"></i></div><div class="card"><p>${esc(q.q)}</p></div>${q.o.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}<div id="fb"></div>`);
  on('.opt', el => {
    if (quiz.lock) return; quiz.lock = 1;
    const right = el.dataset.o === q.a; if (right) quiz.s++; else quiz.miss.push(q);
    document.querySelectorAll('.opt').forEach(b => b.classList.add(b.dataset.o === q.a ? 'ok' : (b === el ? 'no' : '')));
    $('#fb').innerHTML = `<button class="btn main" id="nx">${quiz.i + 1 === quiz.qs.length ? 'Finish' : 'Next'}</button>`;
    $('#nx').onclick = () => { quiz.i++; quiz.lock = 0; quizView(); };
  });
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
go('duels');
