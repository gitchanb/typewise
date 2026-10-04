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
]

const WORD_LISTS = {
  common: WORDS,
  numbers: ["1234", "5678", "9012", "3456", "7890", "1357", "2468"]
}

const CHUNK_WORD_LISTS = {
  english_200: "words/english_200.json",
  english_1k: "words/english_1k.json",
  english_5k: "words/english_5k.json",
  english_10k: "words/english_10k.json",
}
let chunkListName = "english_1k"
const chunkWordCache = {}

async function loadChunkWords(name) {
  if (chunkWordCache[name]) return chunkWordCache[name]
  const res = await fetch(CHUNK_WORD_LISTS[name])
  if (!res.ok) throw new Error(`Failed to load ${name}`)
  const data = await res.json()
  chunkWordCache[name] = data
  return data
}

const STORAGE_WPM = "typewise.targetWpm"
const STORAGE_N = "typewise.unlockN"

const wordEl = document.getElementById("word")
const speedEl = document.getElementById("speed")
const speedValueEl = document.getElementById("speedValue")
const chargeEl = document.getElementById("charge")
const chargeCountEl = document.getElementById("chargeCount")
const stageEl = document.getElementById("stage")
const restartEl = document.getElementById("restart")

let currentMode = "burst"
let numChunks = 2
let selectedTime = 30

const state = {
  words: [],
  index: 0,
  typed: "",
  startTime: null,
  charge: 0,
  targetWpm: 90,
  unlockN: 5,
}

const chunkState = {
  allLetters: [],
  position: 0,
  startTime: null,
  timer: null,
  timeLeft: 30,
}

// ── AUDIO ─────────────────────────────────────────────
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

function playCorrect() { playSound(600, 'sine', 0.15) }
function playChargeUp() { playSound(800, 'sine', 0.2) }
function playWrong() { playSound(200, 'square', 0.1) }
function playSlow() { playSound(350, 'sine', 0.25) }

// ── UTILS ─────────────────────────────────────────────
function shuffle(list) {
  const copy = list.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function splitIntoChunks(word, n) {
  if (word.length <= 4) return [word]
  const size = Math.ceil(word.length / n)
  const chunks = []
  for (let i = 0; i < word.length; i += size) {
    chunks.push(word.slice(i, i + size))
  }
  return chunks
}

// ── BURST MODE ────────────────────────────────────────
function currentWord() { return state.words[state.index] }

function renderWord() {
  const word = currentWord()
  wordEl.replaceChildren()
  ;[...word].forEach((ch, i) => {
    const span = document.createElement("span")
    span.className = "letter"
    span.textContent = ch
    if (i < state.typed.length)
      span.classList.add(state.typed[i] === ch ? "is-correct" : "is-wrong")
    if (i === state.typed.length) span.classList.add("is-caret")
    wordEl.appendChild(span)
  })
}

function renderCharge() {
  chargeEl.replaceChildren()
  chargeEl.setAttribute("aria-valuemax", String(state.unlockN))
  chargeEl.setAttribute("aria-valuenow", String(state.charge))
  chargeCountEl.textContent = `${state.charge} / ${state.unlockN}`
  for (let i = 0; i < state.unlockN; i++) {
    const pip = document.createElement("div")
    pip.className = "pip" + (i < state.charge ? " is-filled" : "")
    chargeEl.appendChild(pip)
  }
}

function showSpeed(value, kind) {
  speedEl.classList.remove("is-good", "is-slow", "is-miss")
  if (kind) speedEl.classList.add(`is-${kind}`)
  speedValueEl.textContent = value
}

function flash(kind) {
  stageEl.classList.remove("is-miss", "is-unlock")
  void stageEl.offsetWidth
  stageEl.classList.add(kind === "unlock" ? "is-unlock" : "is-miss")
}

function resetAttempt() {
  state.typed = ""
  state.startTime = null
  renderWord()
}

function nextWord() {
  state.index++
  if (state.index >= state.words.length) {
    state.words = shuffle(WORDS)
    state.index = 0
  }
  state.charge = 0
  resetAttempt()
  renderCharge()
}

function attemptWpm(elapsedMs, charCount) {
  const minutes = elapsedMs / 60000
  if (minutes <= 0) return 0
  return Math.round((charCount / 5) / minutes)
}

function failAttempt(kind, wpmText) {
  state.charge = 0
  kind === "slow" ? playSlow() : playWrong()
  renderCharge()
  showSpeed(wpmText, kind)
  flash("miss")
  resetAttempt()
}

function succeedAttempt(wpm) {
  state.charge++
  playCorrect()
  showSpeed(String(wpm), "good")
  if (state.charge >= state.unlockN) {
    flash("unlock")
    playChargeUp()
    nextWord()
    return
  }
  renderCharge()
  resetAttempt()
}

function handleBurstKey(key) {
  const word = currentWord()
  if (!word) return
  if (key === "Backspace") {
    if (state.typed.length > 0) {
      state.typed = state.typed.slice(0, -1)
      renderWord()
    }
    return
  }
  if (key.length !== 1) return
  if (key === " ") { failAttempt("miss", "miss"); return }
  if (!state.startTime) state.startTime = performance.now()
  if (key !== word[state.typed.length]) { failAttempt("miss", "miss"); return }
  state.typed += key
  renderWord()
  if (state.typed.length === word.length) {
    const elapsed = performance.now() - state.startTime
    const wpm = attemptWpm(elapsed, word.length)
    wpm >= state.targetWpm ? succeedAttempt(wpm) : failAttempt("slow", String(wpm))
  }
}

// ── CHUNK MODE ────────────────────────────────────────
function renderChunkLine() {
  const container = document.getElementById("chunkLine")
  container.innerHTML = ""
  chunkState.allLetters = []
  const words = state.words.slice(0, 30)

  words.forEach(word => {
    const wordDiv = document.createElement("span")
    wordDiv.style.cssText = "display:inline-flex; align-items:baseline; margin-right:16px;"
    const chunks = splitIntoChunks(word, numChunks)
    chunks.forEach((chunk, ci) => {
      const chunkSpan = document.createElement("span")
      ;[...chunk].forEach(letter => {
        const s = document.createElement("span")
        s.className = "chunk-letter"
        s.textContent = letter
        chunkSpan.appendChild(s)
        chunkState.allLetters.push(s)
      })
      wordDiv.appendChild(chunkSpan)
      if (ci < chunks.length - 1) {
        const dot = document.createElement("span")
        dot.textContent = "·"
        dot.style.cssText = "color:#3d4250; margin:0 1px; font-size:0.8em;"
        wordDiv.appendChild(dot)
      }
    })
    const space = document.createElement("span")
    space.className = "chunk-letter chunk-space"
    space.textContent = " "
    wordDiv.appendChild(space)
    chunkState.allLetters.push(space)
    container.appendChild(wordDiv)
  })

  if (chunkState.allLetters.length > 0) {
    chunkState.allLetters[0].classList.add("is-caret")
  }
}

async function startChunkMode() {

  document.getElementById("chunkEndScreen").style.display = "none"
  chunkState.position = 0
  chunkState.startTime = null
  chunkState.timeLeft = selectedTime
  clearInterval(chunkState.timer)
  document.getElementById("chunkTimer").textContent = `${selectedTime}s`
  document.getElementById("chunkWpm").textContent = "— WPM"
  document.getElementById("chunkLine").textContent = "Loading words…"
  try {
    const words = await loadChunkWords(chunkListName)
    state.words = shuffle(words)
    renderChunkLine()
  } catch (err) {
    document.getElementById("chunkLine").textContent = "Couldn't load word list. Check the words/ folder and that you're using Live Server."
    console.error(err)
  }
}

function handleChunkKey(key) {
  if (chunkState.position >= chunkState.allLetters.length) return

  if (key === "Backspace") {
    if (chunkState.position > 0) {
      chunkState.position--
      const prev = chunkState.allLetters[chunkState.position]
      prev.classList.remove("is-correct", "is-wrong", "is-caret")
      prev.classList.add("is-caret")
      const next = chunkState.allLetters[chunkState.position + 1]
      if (next) next.classList.remove("is-caret")
    }
    return
  }

  if (!chunkState.startTime && key.length === 1) {
    chunkState.startTime = performance.now()
    chunkState.timer = setInterval(() => {
      chunkState.timeLeft--
      document.getElementById("chunkTimer").textContent = `${chunkState.timeLeft}s`
      if (chunkState.timeLeft <= 0) {
       clearInterval(chunkState.timer)
        endChunkRound()
      }
    }, 1000)
  }

  if (chunkState.timeLeft <= 0) return
  if (key.length !== 1) return

  const current = chunkState.allLetters[chunkState.position]
  current.classList.remove("is-caret")

  if (key === current.textContent || (key === " " && current.classList.contains("chunk-space"))) {
    current.classList.add("is-correct")
    playCorrect()
  } else {
    current.classList.add("is-wrong")
    playWrong()
  }

  chunkState.position++
  if (chunkState.position < chunkState.allLetters.length) {
    chunkState.allLetters[chunkState.position].classList.add("is-caret")
  }
}

// ── MODE SWITCHING ────────────────────────────────────
function switchMode(mode) {
  currentMode = mode
  const burstEl = document.getElementById("burstMode")
  const chunkEl = document.getElementById("chunkMode")
  const chunkCtrl = document.getElementById("chunkControl")
  const timerCtrl = document.getElementById("timerControl")
  const targetCtrl = document.getElementById("targetControl")
  const unlockCtrl = document.getElementById("unlockControl")

  if (mode === "burst") {
    burstEl.style.display = "flex"
    chunkEl.style.display = "none"
    chunkCtrl.style.display = "none"
    timerCtrl.style.display = "none"
    targetCtrl.style.display = "flex"
    unlockCtrl.style.display = "flex"
    document.getElementById("chunkListControl").style.display = "none"
    document.getElementById("listControl").style.display = "flex"
    restart()
  } else if (mode === "chunk") {
    burstEl.style.display = "none"
    chunkEl.style.display = "flex"
    chunkCtrl.style.display = "flex"
    timerCtrl.style.display = "flex"
    targetCtrl.style.display = "none"
    unlockCtrl.style.display = "none"
    document.getElementById("listControl").style.display = "none"
    document.getElementById("chunkListControl").style.display = "flex"
    startChunkMode()
  }
}
 
function endChunkRound() {
  const correct = chunkState.allLetters.filter(l => l.classList.contains("is-correct")).length
  const wrong = chunkState.allLetters.filter(l => l.classList.contains("is-wrong")).length
  const attempted = correct + wrong
  const wpm = Math.round((correct / 5) / (selectedTime / 60))
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 100

  document.getElementById("chunkWpm").textContent = `${wpm} WPM`
  document.getElementById("endWpm").textContent = wpm
  document.getElementById("endAccuracy").textContent = `${accuracy}%`
  document.getElementById("endChars").textContent = attempted
  document.getElementById("chunkEndScreen").style.display = "flex"
}

// ── SETTINGS ─────────────────────────────────────────
function loadSettings() {
  const wpm = Number(localStorage.getItem(STORAGE_WPM))
  const n = Number(localStorage.getItem(STORAGE_N))
  if ([60, 90, 120].includes(wpm)) state.targetWpm = wpm
  if ([3, 5, 10].includes(n)) state.unlockN = n
}

function saveSettings() {
  localStorage.setItem(STORAGE_WPM, String(state.targetWpm))
  localStorage.setItem(STORAGE_N, String(state.unlockN))
}

function syncChips() {
  document.querySelectorAll("[data-wpm]").forEach(c =>
    c.classList.toggle("is-active", Number(c.dataset.wpm) === state.targetWpm))
  document.querySelectorAll("[data-n]").forEach(c =>
    c.classList.toggle("is-active", Number(c.dataset.n) === state.unlockN))
  document.querySelectorAll("[data-chunks]").forEach(c =>
    c.classList.toggle("is-active", Number(c.dataset.chunks) === numChunks))
  document.querySelectorAll("[data-time]").forEach(c =>
    c.classList.toggle("is-active", Number(c.dataset.time) === selectedTime))
  document.querySelectorAll("[data-clist]").forEach(c =>
    c.classList.toggle("is-active", c.dataset.clist === chunkListName))
}

function restart() {
  state.words = shuffle(WORDS)
  state.index = 0
  state.charge = 0
  showSpeed("—", "")
  resetAttempt()
  renderCharge()
  stageEl.focus()
}

// ── OVERLAY ───────────────────────────────────────────
function openOverlay() {
  document.getElementById("overlay").style.display = "flex"
}

function closeOverlay() {
  document.getElementById("overlay").style.display = "none"
}

// ── EVENT LISTENERS ───────────────────────────────────
document.querySelectorAll(".mode").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return
    document.querySelectorAll(".mode").forEach(b => b.classList.remove("is-active"))
    btn.classList.add("is-active")
    switchMode(btn.dataset.mode)
  })
})

document.addEventListener("keydown", (event) => {
  if (document.getElementById("overlay").style.display === "flex") return
  if (document.getElementById("chunkEndScreen").style.display === "flex") return
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const tag = event.target?.tagName
  if (tag === "BUTTON" && event.key === "Enter") return
  if (event.key === "Tab") return
  const isChar = event.key.length === 1 || event.key === "Backspace"
  if (!isChar) return
  event.preventDefault()
  currentMode === "chunk" ? handleChunkKey(event.key) : handleBurstKey(event.key)
})

document.getElementById("wpmChips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-wpm]")
  if (!chip) return
  state.targetWpm = Number(chip.dataset.wpm)
  saveSettings()
  syncChips()
})

document.getElementById("nChips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-n]")
  if (!chip) return
  state.unlockN = Number(chip.dataset.n)
  state.charge = 0
  saveSettings()
  syncChips()
  renderCharge()
})

document.getElementById("chunkChips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-chunks]")
  if (!chip) return
  numChunks = Number(chip.dataset.chunks)
  syncChips()
  startChunkMode()
})

document.getElementById("timerChips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-time]")
  if (!chip) return
  selectedTime = Number(chip.dataset.time)
  syncChips()
  startChunkMode()
})

document.getElementById("chunkListChips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-clist]")
  if (!chip) return
  chunkListName = chip.dataset.clist
  syncChips()
  startChunkMode()
})

document.getElementById("listChips").addEventListener("click", (e) => {
  if (currentMode !== "burst") return
  const chip = e.target.closest("[data-list]")
  if (!chip) return
  if (chip.dataset.list === "custom") { openOverlay(); return }
  state.words = WORD_LISTS[chip.dataset.list].slice()
  state.index = 0
  state.charge = 0
  if (currentMode === "chunk") {
    startChunkMode()
  } else {
    renderWord()
    renderCharge()
  }
})

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

restartEl.addEventListener("click", () => {
  currentMode === "chunk" ? startChunkMode() : restart()
})
document.getElementById("tryAgainBtn").addEventListener("click", () => {
  startChunkMode()
})
// ── INIT ─────────────────────────────────────────────
loadSettings()
syncChips()
restart()