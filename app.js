const WORDS = [
  "about", "above", "accept", "across", "action", "actor", "actual", "admit",
  "adopt", "adult", "after", "again", "agent", "agree", "ahead", "allow",
  "almost", "alone", "along", "also", "always", "among", "amount", "animal",
  "annual", "answer", "anyone", "appear", "apple", "apply", "argue", "around",
  "arrive", "artist", "assume", "attack", "attend", "author", "avoid", "award",
  "aware", "beach", "begin", "behind", "believe", "below", "benefit", "better",
  "beyond", "board", "border", "bottle", "branch", "break", "bridge", "bright",
  "bring", "brother", "budget", "build", "button", "camera", "career", "carry",
  "catch", "cause", "center", "chance", "change", "charge", "choice", "choose",
  "circle", "city", "claim", "class", "clean", "clear", "client", "close",
  "cloud", "coach", "coffee", "collect", "color", "common", "company", "compare",
  "complete", "computer", "concern", "control", "corner", "count", "course",
  "cover", "create", "credit", "crime", "cross", "culture", "current", "custom",
  "danger", "debate", "decade", "decide", "deep", "defend", "degree", "demand",
  "design", "detail", "device", "dinner", "direct", "discuss", "doctor", "double",
  "dream", "drive", "during", "early", "earth", "easy", "effect", "effort",
  "eight", "either", "energy", "engage", "engine", "enough", "enter", "entire",
  "equal", "error", "escape", "event", "every", "evidence", "exact", "example",
  "except", "exist", "expect", "expert", "extend", "extra", "face", "fact",
  "factor", "fail", "fair", "family", "famous", "father", "field", "figure",
  "final", "finger", "finish", "fire", "first", "focus", "follow", "force",
  "forest", "forget", "form", "former", "found", "frame", "friend", "front",
  "future", "garden", "gather", "general", "glass", "global", "ground", "group",
  "grow", "guard", "guess", "guide", "happen", "happy", "health", "heart",
  "heavy", "hello", "history", "hold", "home", "hope", "horse", "hotel",
  "hour", "house", "human", "idea", "image", "impact", "include", "income",
  "indeed", "inside", "instead", "interest", "issue", "item", "itself", "join",
  "judge", "just", "keep", "kind", "know", "large", "later", "laugh", "launch",
  "learn", "least", "leave", "legal", "letter", "level", "light", "likely",
  "limit", "listen", "little", "local", "long", "look", "machine", "major",
  "manage", "market", "master", "matter", "maybe", "mean", "media", "member",
  "memory", "method", "middle", "might", "minute", "model", "modern", "moment",
  "money", "month", "moral", "mother", "motor", "mouth", "move", "music",
  "myself", "nation", "nature", "near", "nearly", "need", "network", "never",
  "night", "noise", "north", "note", "notice", "number", "occur", "offer",
  "office", "often", "once", "online", "open", "option", "order", "other",
  "outside", "owner", "page", "paint", "paper", "parent", "part", "party",
  "pass", "peace", "people", "period", "person", "phone", "photo", "piece",
  "place", "plan", "plant", "player", "point", "policy", "power", "press",
  "pretty", "price", "private", "problem", "process", "produce", "product",
  "program", "project", "protect", "prove", "public", "pull", "purpose", "push",
  "quality", "question", "quick", "quite", "radio", "raise", "range", "rate",
  "rather", "reach", "read", "ready", "real", "reason", "recent", "record",
  "reduce", "region", "relate", "remain", "remember", "remove", "report",
  "require", "result", "return", "reveal", "right", "river", "road", "rock",
  "role", "round", "rule", "safe", "same", "save", "scene", "school", "science",
  "score", "search", "season", "second", "secret", "section", "seek", "seem",
  "select", "send", "sense", "series", "serve", "seven", "several", "shall",
  "share", "short", "should", "show", "side", "sign", "simple", "since",
  "single", "skill", "small", "smile", "social", "solid", "solve", "sound",
  "source", "south", "space", "speak", "special", "speed", "spend", "sport",
  "staff", "stage", "stand", "start", "state", "station", "stay", "step",
  "still", "stock", "stone", "store", "story", "street", "strong", "student",
  "study", "style", "subject", "success", "such", "sudden", "suffer", "summer",
  "supply", "support", "sure", "system", "table", "take", "talk", "target",
  "teach", "team", "tell", "ten", "tend", "term", "test", "than", "thank",
  "their", "them", "then", "theory", "there", "these", "thing", "think",
  "third", "those", "though", "thought", "three", "through", "throw", "thus",
  "time", "today", "together", "tone", "total", "touch", "toward", "town",
  "track", "trade", "train", "travel", "treat", "tree", "trial", "trip",
  "true", "truth", "turn", "type", "under", "unit", "until", "upon", "usual",
  "value", "various", "very", "video", "view", "visit", "voice", "wait",
  "walk", "want", "watch", "water", "weapon", "week", "weight", "well",
  "west", "what", "when", "where", "which", "while", "white", "whole",
  "whose", "wide", "wife", "will", "wind", "window", "wish", "within",
  "without", "woman", "wonder", "word", "work", "world", "worry", "worth",
  "would", "write", "wrong", "yard", "year", "young", "your"
];

const STORAGE_WPM = "typewise.targetWpm";
const STORAGE_N = "typewise.unlockN";

const wordEl = document.getElementById("word");
const speedEl = document.getElementById("speed");
const speedValueEl = document.getElementById("speedValue");
const chargeEl = document.getElementById("charge");
const chargeCountEl = document.getElementById("chargeCount");
const stageEl = document.getElementById("stage");
const restartEl = document.getElementById("restart");

const state = {
  words: [],
  index: 0,
  typed: "",
  startTime: null,
  charge: 0,
  targetWpm: 90,
  unlockN: 5,
};

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function currentWord() {
  return state.words[state.index];
}

function loadSettings() {
  const wpm = Number(localStorage.getItem(STORAGE_WPM));
  const n = Number(localStorage.getItem(STORAGE_N));
  if (wpm === 60 || wpm === 90 || wpm === 120) state.targetWpm = wpm;
  if (n === 3 || n === 5 || n === 10) state.unlockN = n;
}

function saveSettings() {
  localStorage.setItem(STORAGE_WPM, String(state.targetWpm));
  localStorage.setItem(STORAGE_N, String(state.unlockN));
}

function syncChips() {
  document.querySelectorAll("[data-wpm]").forEach((chip) => {
    chip.classList.toggle("is-active", Number(chip.dataset.wpm) === state.targetWpm);
  });
  document.querySelectorAll("[data-n]").forEach((chip) => {
    chip.classList.toggle("is-active", Number(chip.dataset.n) === state.unlockN);
  });
}

function renderWord() {
  const word = currentWord();
  wordEl.replaceChildren();
  [...word].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = ch;
    if (i < state.typed.length) {
      span.classList.add(state.typed[i] === ch ? "is-correct" : "is-wrong");
    }
    if (i === state.typed.length) span.classList.add("is-caret");
    wordEl.appendChild(span);
  });
}

function renderCharge() {
  chargeEl.replaceChildren();
  chargeEl.setAttribute("aria-valuemax", String(state.unlockN));
  chargeEl.setAttribute("aria-valuenow", String(state.charge));
  chargeCountEl.textContent = `${state.charge} / ${state.unlockN}`;
  for (let i = 0; i < state.unlockN; i += 1) {
    const pip = document.createElement("div");
    pip.className = "pip" + (i < state.charge ? " is-filled" : "");
    chargeEl.appendChild(pip);
  }
}

function showSpeed(value, kind) {
  speedEl.classList.remove("is-good", "is-slow", "is-miss");
  if (kind) speedEl.classList.add(`is-${kind}`);
  speedValueEl.textContent = value;
}

function flash(kind) {
  stageEl.classList.remove("is-miss", "is-unlock");
  void stageEl.offsetWidth;
  stageEl.classList.add(kind === "unlock" ? "is-unlock" : "is-miss");
}

function resetAttempt() {
  state.typed = "";
  state.startTime = null;
  renderWord();
}

function nextWord() {
  state.index += 1;
  if (state.index >= state.words.length) {
    state.words = shuffle(WORDS);
    state.index = 0;
  }
  state.charge = 0;
  resetAttempt();
  renderCharge();
}

function attemptWpm(elapsedMs, charCount) {
  const minutes = elapsedMs / 60000;
  if (minutes <= 0) return 0;
  return Math.round((charCount / 5) / minutes);
}

function failAttempt(kind, wpmText) {
  state.charge = 0;
  if (kind === "slow") playSlow();
  else playWrong();
  renderCharge();
  showSpeed(wpmText, kind);
  flash("miss");
  resetAttempt();
}

function succeedAttempt(wpm) {
  state.charge += 1;
  playCorrect();
  showSpeed(String(wpm), "good");
  if (state.charge >= state.unlockN) {
    flash("unlock");
    playChargeUp();
    nextWord();
    return;
  }
  renderCharge();
  resetAttempt();
}

function handleKey(key) {
  const word = currentWord();
  if (!word) return;

  if (key === "Backspace") {
    if (state.typed.length > 0) {
      state.typed = state.typed.slice(0, -1);
      renderWord();
    }
    return;
  }

  if (key.length !== 1) return;
  if (key === " ") {
    failAttempt("miss", "miss");
    return;
  }

  if (!state.startTime) state.startTime = performance.now();

  const nextIndex = state.typed.length;
  if (key !== word[nextIndex]) {
    failAttempt("miss", "miss");
    return;
  }

  state.typed += key;
  renderWord();

  if (state.typed.length === word.length) {
    const elapsed = performance.now() - state.startTime;
    const wpm = attemptWpm(elapsed, word.length);
    if (wpm >= state.targetWpm) succeedAttempt(wpm);
    else failAttempt("slow", String(wpm));
  }
}

function restart() {
  state.words = shuffle(WORDS);
  state.index = 0;
  state.charge = 0;
  showSpeed("—", "");
  resetAttempt();
  renderCharge();
  stageEl.focus();
}

function applyUnlockN(n) {
  state.unlockN = n;
  state.charge = 0;
  saveSettings();
  syncChips();
  renderCharge();
}

function applyTargetWpm(wpm) {
  state.targetWpm = wpm;
  state.charge = 0;
  saveSettings();
  syncChips();
  renderCharge();
}

const ctx = new AudioContext()

function playSound(freq, type, duration) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = type
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start()
    osc.stop(ctx.currentTime + duration)
}

// correct sound - high pleasant tone
function playCorrect() { playSound(600, 'sine', 0.15) }

// charge up sound  
function playChargeUp() { playSound(800, 'sine', 0.2) }

// wrong sound - low harsh tone
function playWrong() { playSound(200, 'square', 0.1) }

//slow type sound 
function playSlow() { playSound(350, 'sine', 0.25) }const WORD_LISTS = {
  common: WORDS,
  numbers: ["1234", "5678", "9012", "3456", "7890", "1357", "2468"],
}

function openOverlay() {
  const overlay = document.getElementById("overlay")
  overlay.style.display = "flex"
}

function closeOverlay() {
  document.getElementById("overlay").style.display = "none"
}

document.getElementById("closeOverlay").addEventListener("click", closeOverlay)

document.getElementById("applyCustom").addEventListener("click", () => {
  const input = document.getElementById("overlayWords").value.trim()
  if (!input) return
  state.words = input.split(/[\s\n]+/).filter(w => w.length > 0)
  state.index = 0
  state.charge = 0
  renderWord()
  renderCharge()
  closeOverlay()
})

// update your list chip handler
// when list === "custom" → openOverlay() instead of showing inline input

document.getElementById("listChips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-list]")
  if (!chip) return
  const list = chip.dataset.list
  if (list === "custom") {
    openOverlay()
    return
  }
  state.words = WORD_LISTS[list].slice()
  state.index = 0
  state.charge = 0
  renderWord()
  renderCharge()
})

document.getElementById("applyCustom").addEventListener("click", () => {
  const input = document.getElementById("customWords").value.trim()
  if (!input) return
  state.words = input.split(" ").filter(w => w.length > 0)
  state.index = 0
  state.charge = 0
  renderWord()
  renderCharge()
})



document.addEventListener("keydown", (event) => {
      if (document.getElementById("overlay").style.display === "flex") return
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const tag = event.target && event.target.tagName;
  if (tag === "BUTTON" && event.key === "Enter") return;
  if (event.key === "Tab") return;

  const isChar = event.key.length === 1 || event.key === "Backspace";
  if (!isChar) return;
  event.preventDefault();
  handleKey(event.key);
});

document.getElementById("wpmChips").addEventListener("click", (event) => {
  const chip = event.target.closest("[data-wpm]");
  if (!chip) return;
  applyTargetWpm(Number(chip.dataset.wpm));
});

document.getElementById("nChips").addEventListener("click", (event) => {
  const chip = event.target.closest("[data-n]");
  if (!chip) return;
  applyUnlockN(Number(chip.dataset.n));
});

restartEl.addEventListener("click", restart);

loadSettings();
syncChips();
restart();
