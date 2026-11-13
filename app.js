
const WORD_LISTS = {
  numbers: ["1234", "5678", "9012", "3456", "7890", "1357", "2468"]
}

const burstWordCache = {}

async function loadBurstWords(name) {
  if (WORD_LISTS[name]) return WORD_LISTS[name]
  if (burstWordCache[name]) return burstWordCache[name]
  const res = await fetch(`words/burst_${name}.json`)
  if (!res.ok) throw new Error(`Failed to load ${name}`)
  burstWordCache[name] = await res.json()
  return burstWordCache[name]
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
const STORAGE_INTRO = "typewise.seenIntro"

const wordEl = document.getElementById("word")
const speedEl = document.getElementById("speed")
const speedValueEl = document.getElementById("speedValue")
const chargeEl = document.getElementById("charge")
const chargeCountEl = document.getElementById("chargeCount")
const stageEl = document.getElementById("stage")
const restartEl = document.getElementById("restart")
const customWpmChip = document.getElementById("customWpmChip")
const customWpmInput = document.getElementById("customWpmInput")

let currentMode = "chunk"
let numChunks = 2
let selectedTime = 30
let burstStarted = false
let burstListName = "easy"

const STORAGE_BANK = "typewise.repairBank"
let repairBank = {}

function loadBank() {
  try {
    repairBank = JSON.parse(localStorage.getItem(STORAGE_BANK)) || {}
  } catch (e) {
    repairBank = {}
  }
}

function saveBank() {
  try {
    localStorage.setItem(STORAGE_BANK, JSON.stringify(repairBank))
  } catch (e) {}
  updateBankBadge()
}

function addToBank(word, expected, pressed) {
  if (!word || word.length < 3) return
  const entry = repairBank[word] || { misses: 0, added: Date.now() }
  entry.misses++
  entry.expected = expected
  entry.pressed = pressed
  repairBank[word] = entry
  const keys = Object.keys(repairBank)
  if (keys.length > 60) {
    keys.sort((a, b) => repairBank[a].added - repairBank[b].added)
    delete repairBank[keys[0]]
  }}

const BANK_RULE = { burst: 5, chunk: 1 }

function addToBank(word, expected, pressed, source) {
  if (!word || word.length < 3) return
  const entry = repairBank[word] || { burst: 0, chunk: 0, added: Date.now() }
  entry[source] = (entry[source] || 0) + 1
  entry.expected = expected
  entry.pressed = pressed
  repairBank[word] = entry
  const keys = Object.keys(repairBank)
  if (keys.length > 300) {
    keys.sort((a, b) => repairBank[a].added - repairBank[b].added)
    delete repairBank[keys[0]]
  }
  saveBank()
}

function qualifies(entry) {
  return (entry.burst || 0) >= BANK_RULE.burst || (entry.chunk || 0) >= BANK_RULE.chunk
}

function bankWords() {
  return Object.keys(repairBank).filter(w => qualifies(repairBank[w]))
}

function bankSize() {
  return bankWords().length
}

function bankSize() {
  return Object.keys(repairBank).length
}

const ow = {
  words: [], index: 0, typed: "", startTime: null,
  reps: 0, targetReps: 6, done: 0, stats: {}, active: false,
}

function goToMode(mode) {
  document.querySelectorAll(".mode").forEach(b => b.classList.toggle("is-active", b.dataset.mode === mode))
  switchMode(mode)
}

function startOverwrite() {
  document.getElementById("overwriteEndScreen").style.display = "none"
  ow.words = shuffle(bankWords())
  ow.index = 0
  ow.done = 0
  ow.stats = {}
  ow.reps = 0
  ow.typed = ""
  ow.startTime = null
  ow.active = ow.words.length > 0
  renderOwWord()
  renderOwStatus()
}

function renderOwWord() {
  const el = document.getElementById("owWord")
  el.replaceChildren()
  const word = ow.words[ow.index]
  if (!word) { el.textContent = "Repair bank is empty"; return }
  ;[...word].forEach((ch, i) => {
    const span = document.createElement("span")
    span.className = "letter"
    span.textContent = ch
    if (i < ow.typed.length) span.classList.add("is-correct")
    if (i === ow.typed.length) span.classList.add("is-caret")
    el.appendChild(span)
  })
}

function renderOwStatus() {
  const reps = document.getElementById("owReps")
  reps.replaceChildren()
  for (let i = 0; i < ow.targetReps; i++) {
    const pip = document.createElement("div")
    pip.className = "pip" + (i < ow.reps ? " is-filled" : "")
    reps.appendChild(pip)
  }
  const word = ow.words[ow.index]
  const entry = word && repairBank[word]
  document.getElementById("owNote").textContent =
    entry && entry.expected ? `you typed ${entry.pressed} instead of ${entry.expected}` : ""
  document.getElementById("owLeft").textContent = ow.words.length - ow.done
  document.getElementById("owDone").textContent = ow.done
}

function handleOverwriteKey(key) {
  if (!ow.active) return
  const word = ow.words[ow.index]
  if (!word) return
  if (key === "Backspace") {
    if (ow.typed.length) { ow.typed = ow.typed.slice(0, -1); renderOwWord() }
    return
  }
  if (key.length !== 1) return
  if (!ow.startTime) ow.startTime = performance.now()
  if (key !== word[ow.typed.length]) {
    playWrong()
    flash("miss")
    ow.reps = 0
    ow.typed = ""
    ow.startTime = null
    renderOwWord()
    renderOwStatus()
    return
  }
  ow.typed += key
  renderOwWord()
  if (ow.typed.length < word.length) return

  const wpm = attemptWpm(performance.now() - ow.startTime, word.length)
  if (!ow.stats[word]) ow.stats[word] = []
  ow.stats[word].push(wpm)
  ow.reps++
  playCorrect()
  if (ow.reps >= ow.targetReps) {
    overwriteWord(word)
  } else {
    ow.typed = ""
    ow.startTime = null
    renderOwWord()
    renderOwStatus()
  }
}

function overwriteWord(word) {
  playChargeUp()
  flash("unlock")
  delete repairBank[word]
  saveBank()
  ow.done++
  ow.index++
  ow.reps = 0
  ow.typed = ""
  ow.startTime = null
  if (ow.index >= ow.words.length) { finishOverwrite(); return }
  renderOwWord()
  renderOwStatus()
}

function finishOverwrite() {
  ow.active = false
  document.getElementById("owEndCount").textContent = ow.done
  const box = document.getElementById("owResults")
  box.replaceChildren()
  Object.entries(ow.stats).forEach(([word, list]) => {
    const row = document.createElement("div")
    row.className = "ow-row"
    const w = document.createElement("span")
    w.textContent = word
    const v = document.createElement("span")
    v.textContent = `${list[0]} → ${list[list.length - 1]} WPM`
    row.append(w, v)
    box.appendChild(row)
  })
  document.getElementById("overwriteEndScreen").style.display = "flex"
}
const BANK_NEEDED = 6

function updateBankBadge() {
  const badge = document.getElementById("bankBadge")
  if (!badge) return
  const n = bankSize()
  badge.textContent = `${Math.min(n, BANK_NEEDED)}/${BANK_NEEDED}`
  badge.classList.toggle("is-ready", n >= BANK_NEEDED)
  const btn = badge.closest("button")
  if (btn) {
    btn.disabled = n < BANK_NEEDED
    btn.title = n < BANK_NEEDED ? "Miss a few words in Burst or Chunk to unlock" : "Practice the words you miss"
  }
}
const state = {
  words: [],
  index: 0,
  typed: "",
  startTime: null,
  charge: 0,
  targetWpm: 90,
  unlockN: 5,
  burstSelectedTime: 300,
  burstTimeLeft: 300,
  burstLastActivity: 0,
  burstRunning: false,
  burstTimer: null,
  lastMiss: null,
}

const chunkState = {
  allLetters: [],
  position: 0,
  startTime: null,
  timer: null,
  timeLeft: 30,
  wordPool: [],
  poolIndex: 0,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
    missCounts: {},
  streak: 0,
  bestStreak: 0,
  cleanChunks: 0,
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

function mergeSyllables(parts, n) {
  const chunks = parts.slice()
  while (chunks.length > n) {
    let best = 0, bestLen = Infinity
    for (let i = 0; i < chunks.length - 1; i++) {
      const len = chunks[i].length + chunks[i + 1].length
      if (len < bestLen) { bestLen = len; best = i }
    }
    chunks.splice(best, 2, chunks[best] + chunks[best + 1])
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

function renderStats() {
  document.getElementById("statMiss").textContent =
    state.lastMiss ? `${state.lastMiss.expected} → ${state.lastMiss.pressed}` : "—"
}
function renderCharge() {
  chargeEl.replaceChildren()
  chargeEl.setAttribute("aria-valuemax", String(state.unlockN))
  chargeEl.setAttribute("aria-valuenow", String(state.charge))
  chargeCountEl.textContent = `${state.charge} / ${state.unlockN}`
  for (let i = 0; i < state.unlockN; i++) {
    const pip = document.createElement("div")
    pip.className = "pip" + (i < state.charge ? " is-filled" : "") + (i === state.charge - 1 ? " is-new" : "")
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
    state.words = shuffle(state.words)
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
  state.burstAttempts++
  kind === "slow" ? playSlow() : playWrong()
  renderCharge()
  showSpeed(wpmText, kind)
  flash("miss")
  resetAttempt()
  renderStats()
}

function succeedAttempt(wpm) {
  state.charge++
  state.burstAttempts++
  state.burstWords++
  state.burstWpmSum += wpm
  playCorrect()
  showSpeed(String(wpm), "good")
  renderCharge()
  renderStats()
  if (state.charge >= state.unlockN) {
    fullChargeEffect()
    return
  }
  resetAttempt()
}

let burstLocked = false
let unlockTimeout = null

const STORAGE_BEST = "typewise.bestWpm."
let bestWpm = {}

function loadBest() {
  try {
    bestWpm = JSON.parse(localStorage.getItem(STORAGE_BEST + burstListName)) || {}
  } catch (e) {
    bestWpm = {}
  }
}

function saveBest(word, wpm) {
  if ((bestWpm[word] || 0) >= wpm) return
  bestWpm[word] = wpm
  if (burstListName === "custom") return
  try {
    localStorage.setItem(STORAGE_BEST + burstListName, JSON.stringify(bestWpm))
  } catch (e) {}
}

function clearedCount(target) {
  return Object.values(bestWpm).filter(v => v >= target).length
}

function fullChargeEffect() {
  burstLocked = true
  flash("unlock")
  playChargeUp()
  chargeEl.classList.add("is-full")
  wordEl.classList.add("is-surge")
  ;[...wordEl.children].forEach((el, i) => {
    el.style.animationDelay = `${i * 35}ms`
  })
  burstSparks()
  unlockTimeout = setTimeout(() => {
    chargeEl.classList.remove("is-full")
    wordEl.classList.remove("is-surge")
    burstLocked = false
    nextWord()
  }, 800)
}

function burstSparks() {
  const rect = wordEl.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  const ring = document.createElement("span")
  ring.className = "shock-ring"
  ring.style.left = cx + "px"
  ring.style.top = cy + "px"
  ring.addEventListener("animationend", () => ring.remove())
  document.body.appendChild(ring)

  const colors = ["#e8b86d", "#fff3d6", "#7dd3fc"]
  for (let i = 0; i < 28; i++) {
    const p = document.createElement("span")
    p.className = "spark"
    const angle = Math.random() * Math.PI * 2
    const dist = 90 + Math.random() * 170
    p.style.left = cx + "px"
    p.style.top = cy + "px"
    p.style.setProperty("--dx", Math.cos(angle) * dist + "px")
    p.style.setProperty("--dy", Math.sin(angle) * dist + "px")
    p.style.background = colors[i % colors.length]
    p.style.animationDuration = 600 + Math.random() * 400 + "ms"
    p.addEventListener("animationend", () => p.remove())
    document.body.appendChild(p)
  }
}


function handleBurstKey(key) {
    if (burstLocked) return
    const word = currentWord()
    if (!word) return
    state.burstLastActivity = performance.now()
    if (!state.burstRunning) startBurstTimer()
        if (key === "Backspace") {
            if (state.typed.length > 0) {
                state.typed = state.typed.slice(0, -1)
                renderWord()
            }
            return
        }
        if (key.length !== 1) return
        if (key === " ") {
            state.lastMiss = { expected: word[state.typed.length], pressed: "space" }
                   addToBank(word, state.lastMiss.expected, state.lastMiss.pressed, "burst")
            setGauge(0)
            failAttempt("miss", "miss")
            return
        }
        if (!state.startTime) state.startTime = performance.now()
            if (key !== word[state.typed.length]) {
                state.lastMiss = { expected: word[state.typed.length], pressed: key }
                       addToBank(word, state.lastMiss.expected, state.lastMiss.pressed, "burst")
                setGauge(0)
                failAttempt("miss", "miss")
                return
            }
            state.typed += key
            renderWord()
            updateLiveGauge()
            if (state.typed.length === word.length) {
                const elapsed = performance.now() - state.startTime
                const wpm = attemptWpm(elapsed, word.length)
                saveBest(word, wpm)
                setGauge(wpm)
                wpm >= state.targetWpm ? succeedAttempt(wpm) : failAttempt("slow", String(wpm))
            }
        }
        // ── CHUNK MODE ────────────────────────────────────────
        function buildWordSpan(word) {
            const wordDiv = document.createElement("span")
            wordDiv.style.cssText = "display:inline-flex; align-items:baseline; margin-right:16px;"
              wordDiv.dataset.word = word.replace(/-/g, "")
            const chunks = mergeSyllables(word.split("-"), numChunks)
            chunks.forEach((chunk, ci) => {
                const chunkSpan = document.createElement("span")
                chunkSpan.className = "chunk"
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
                    dot.className = "chunk-dot"
                    dot.textContent = "·"
                    wordDiv.appendChild(dot)
                }
            })
            const space = document.createElement("span")
            space.className = "chunk-letter chunk-space"
            space.textContent = " "
            wordDiv.appendChild(space)
            chunkState.allLetters.push(space)
            return wordDiv
        }
        
        function nextPoolWord() {
            if (chunkState.poolIndex >= chunkState.wordPool.length) {
                chunkState.wordPool = shuffle(chunkState.wordPool)
                chunkState.poolIndex = 0
            }
            return chunkState.wordPool[chunkState.poolIndex++]
        }
        
        function appendChunkWords(count) {
            const container = document.getElementById("chunkLine")
            for (let i = 0; i < count; i++) {
                container.appendChild(buildWordSpan(nextPoolWord()))
            }
        }
        
        function renderChunkLine() {
            const container = document.getElementById("chunkLine")
            container.innerHTML = ""
            chunkState.allLetters = []
            appendChunkWords(30)
            if (chunkState.allLetters.length > 0) {
                chunkState.allLetters[0].classList.add("is-caret")
            }
        }
        async function startChunkMode() {
            document.getElementById("chunkEndScreen").style.display = "none"
            chunkState.position = 0
            chunkState.startTime = null
            chunkState.timeLeft = selectedTime
            chunkState.totalKeystrokes = 0
            chunkState.correctKeystrokes = 0
            chunkState.missCounts = {}
            chunkState.streak = 0
            chunkState.bestStreak = 0
            chunkState.cleanChunks = 0
            clearInterval(chunkState.timer)
            document.getElementById("chunkTimer").textContent = `${selectedTime}s`
            document.getElementById("chunkWpm").textContent = "— WPM"
            document.getElementById("chunkLine").textContent = "Loading words…"
            try {
                const words = await loadChunkWords(chunkListName)
                chunkState.wordPool = shuffle(words)
                chunkState.poolIndex = 0
                renderChunkLine()
            } catch (err) {
                document.getElementById("chunkLine").textContent = "Couldn't load word list. Check the words/ folder and that you're using Live Server."
                console.error(err)
            }
        }
        
        function updateChunkLive() {
          const elapsed = selectedTime - chunkState.timeLeft
          if (elapsed < 3) return
          const correct = chunkState.allLetters.filter(l => l.classList.contains("is-correct")).length
          const wpm = Math.round((correct / 5) / (elapsed / 60))
          const acc = chunkState.totalKeystrokes
            ? Math.round((chunkState.correctKeystrokes / chunkState.totalKeystrokes) * 100)
            : 100
          document.getElementById("chunkWpm").textContent = `${wpm} WPM · ${acc}%`
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
        } else {
          updateChunkLive()
        }      }
    , 1000)
  }

  if (chunkState.timeLeft <= 0) return
  if (key.length !== 1) return

  const current = chunkState.allLetters[chunkState.position]
  current.classList.remove("is-caret")

  chunkState.totalKeystrokes++
  if (key === current.textContent || (key === " " && current.classList.contains("chunk-space"))) {
    current.classList.add("is-correct")
    chunkState.correctKeystrokes++
    playCorrect()
    popChunkIfDone(current)
  } else {
    current.classList.add("is-wrong")
    playWrong()
        const expected = current.classList.contains("chunk-space") ? "space" : current.textContent
    chunkState.missCounts[expected] = (chunkState.missCounts[expected] || 0) + 1
    chunkState.streak = 0
    if (current.parentElement.classList.contains("chunk")) current.parentElement.dataset.missed = "1"
        const owner = current.closest("[data-word]")
        if (owner && expected !== "space") addToBank(owner.dataset.word, expected, key === " " ? "space" : key, "chunk")
  }
      

  chunkState.position++

  if (chunkState.allLetters.length - chunkState.position < 15) {
    appendChunkWords(20)
  }

  if (chunkState.position < chunkState.allLetters.length) {
    chunkState.allLetters[chunkState.position].classList.add("is-caret")
  }
}

function popChunkIfDone(letter) {
  const chunkEl = letter.parentElement
  if (!chunkEl.classList.contains("chunk")) return
  if (chunkEl.lastElementChild !== letter) return
  if (chunkEl.dataset.missed) return
  if (![...chunkEl.children].every(l => l.classList.contains("is-correct"))) return
  if (!chunkEl.dataset.counted) {
    chunkEl.dataset.counted = "1"
    chunkState.cleanChunks++
    chunkState.streak++
    chunkState.bestStreak = Math.max(chunkState.bestStreak, chunkState.streak)
  }
  chunkEl.classList.remove("is-popped")
  void chunkEl.offsetWidth
  chunkEl.classList.add("is-popped")
}
// ── MODE SWITCHING ────────────────────────────────────

function switchMode(mode) {
  currentMode = mode
    document.getElementById("overwriteEndScreen").style.display = "none"
  clearInterval(chunkState.timer)
  clearInterval(state.burstTimer)
  clearTimeout(unlockTimeout)
  state.burstRunning = false
  burstLocked = false
  chargeEl.classList.remove("is-full")
  wordEl.classList.remove("is-surge")

  const controlsFor = {
    burst: ["targetControl", "unlockControl", "burstTimeControl", "listControl"],
    chunk: ["chunkListControl", "chunkControl", "timerControl"],
    overwrite: ["owRepsControl"],
  }
  const allControls = ["targetControl", "unlockControl", "burstTimeControl", "listControl",
    "chunkListControl", "chunkControl", "timerControl", "owRepsControl"]
  allControls.forEach(id => {
    document.getElementById(id).style.display = controlsFor[mode].includes(id) ? "flex" : "none"
  })
  document.getElementById("burstMode").style.display = mode === "burst" ? "flex" : "none"
  document.getElementById("chunkMode").style.display = mode === "chunk" ? "flex" : "none"
  document.getElementById("overwriteMode").style.display = mode === "overwrite" ? "flex" : "none"

  if (mode === "burst") {
    if (!burstStarted) {
      burstStarted = true
      restart()
    } else {
      if (state.charge >= state.unlockN) nextWord()
      else resetAttempt()
      updateBurstTimerDisplay(true)
    }
  } else if (mode === "chunk") {
    startChunkMode()
  } else if (mode === "overwrite") {
    startOverwrite()
  }
}
 
function endChunkRound() {
  const correctChars = chunkState.allLetters.filter(l => l.classList.contains("is-correct")).length
  const wpm = Math.round((correctChars / 5) / (selectedTime / 60))
  const accuracy = chunkState.totalKeystrokes > 0
    ? Math.round((chunkState.correctKeystrokes / chunkState.totalKeystrokes) * 100)
    : 100

  document.getElementById("chunkWpm").textContent = `${wpm} WPM`
  document.getElementById("endWpm").textContent = wpm
  document.getElementById("endAccuracy").textContent = `${accuracy}%`
  document.getElementById("endStreak").textContent = chunkState.bestStreak
  document.getElementById("endChunks").textContent = chunkState.cleanChunks
  document.getElementById("endSetup").textContent =
    `${selectedTime >= 120 ? "2 min" : selectedTime + "s"} · ${chunkListName.replace("english_", "")} words · up to ${numChunks} chunks`

  const top = Object.entries(chunkState.missCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)
  const box = document.getElementById("endMisses")
  box.replaceChildren()
  if (!top.length) {
    box.textContent = "No misses. Clean round."
  } else {
    top.forEach(([letter, count]) => {
      const chip = document.createElement("span")
      chip.className = "miss-chip"
      chip.textContent = `${letter} ×${count}`
      box.appendChild(chip)
    })
  }

  document.getElementById("chunkEndScreen").style.display = "flex"
}

// ── SETTINGS ─────────────────────────────────────────
function loadSettings() {
  const wpm = Number(localStorage.getItem(STORAGE_WPM))
  const n = Number(localStorage.getItem(STORAGE_N))
  if (wpm >= 30 && wpm <= 300) state.targetWpm = wpm
  if ([3, 5, 10].includes(n)) state.unlockN = n
}

function saveSettings() {
  localStorage.setItem(STORAGE_WPM, String(state.targetWpm))
  localStorage.setItem(STORAGE_N, String(state.unlockN))
}

function commitCustomWpm() {
  if (customWpmInput.hidden) return
  const v = Number(customWpmInput.value)
  if (customWpmInput.value !== "" && !Number.isNaN(v)) {
    state.targetWpm = Math.max(30, Math.min(180, Math.round(v)))
    saveSettings()
  }
  customWpmInput.hidden = true
  customWpmChip.hidden = false
  syncChips()
  stageEl.focus()
}

customWpmChip.addEventListener("click", () => {
  customWpmChip.hidden = true
  customWpmInput.hidden = false
  customWpmInput.value = [60, 90, 120].includes(state.targetWpm) ? "" : state.targetWpm
  customWpmInput.focus()
})

customWpmInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); commitCustomWpm() }
  if (e.key === "Escape") { customWpmInput.value = ""; commitCustomWpm() }
})
customWpmInput.addEventListener("blur", commitCustomWpm)

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
  document.querySelectorAll("[data-burst-time]").forEach(c =>
    c.classList.toggle("is-active", Number(c.dataset.burstTime) === state.burstSelectedTime))
      document.querySelectorAll("[data-list]").forEach(c =>
    c.classList.toggle("is-active", c.dataset.list === burstListName))
      const isPreset = [60, 90, 120].includes(state.targetWpm)
  document.querySelectorAll("[data-reps]").forEach(c =>
    c.classList.toggle("is-active", Number(c.dataset.reps) === ow.targetReps))
  customWpmChip.classList.toggle("is-active", !isPreset)
  customWpmChip.textContent = isPreset ? "Custom" : String(state.targetWpm)

}

async function restart() {
  clearTimeout(unlockTimeout)
  clearInterval(state.burstTimer)
  burstLocked = false
  state.burstRunning = false
  chargeEl.classList.remove("is-full")
  wordEl.classList.remove("is-surge")
  state.burstTimeLeft = state.burstSelectedTime
  state.lastMiss = null
  updateBurstTimerDisplay()
  state.index = 0
  state.charge = 0
  showSpeed("—", "")
  renderCharge()
  renderStats()
  setGauge(0)
  if (burstListName === "custom") {
    state.words = shuffle(state.words)
  } else {
    try {
      state.words = shuffle(await loadBurstWords(burstListName))
    } catch (err) {
      wordEl.textContent = "Couldn't load words"
      console.error(err)
      return
    }
  }
  resetAttempt()
  stageEl.focus()
}
function updateBurstTimerDisplay(paused) {
  const m = Math.floor(state.burstTimeLeft / 60)
  const s = state.burstTimeLeft % 60
  document.getElementById("burstTimer").textContent = `${m}:${String(s).padStart(2, "0")}`
  document.getElementById("burstTimer").style.opacity = paused ? "0.4" : "1"
}

function startBurstTimer() {
  state.burstRunning = true
  state.burstTimer = setInterval(() => {
    const idle = performance.now() - state.burstLastActivity > 2000
    if (!idle) {
      state.burstTimeLeft--
      updateBurstTimerDisplay(false)
      if (state.burstTimeLeft <= 0) {
        clearInterval(state.burstTimer)
      }
    } else {
      updateBurstTimerDisplay(true)
    }
  }, 1000)
}

// ── OVERLAY ───────────────────────────────────────────
function openOverlay() {
  document.getElementById("overlay").style.display = "flex"
}

function closeOverlay() {
  document.getElementById("overlay").style.display = "none"
}

function openIntro() {
  document.getElementById("introOverlay").style.display = "flex"
}

function closeIntro() {
  document.getElementById("introOverlay").style.display = "none"
  localStorage.setItem(STORAGE_INTRO, "1")
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
      if (event.target?.tagName === "INPUT") return
  if (document.getElementById("introOverlay").style.display === "flex") return
  if (document.getElementById("overlay").style.display === "flex") return
  if (document.getElementById("chunkEndScreen").style.display === "flex") return
    if (document.getElementById("overwriteEndScreen").style.display === "flex") return
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const tag = event.target?.tagName
  if (tag === "BUTTON" && event.key === "Enter") return
  if (event.key === "Tab") return
  const isChar = event.key.length === 1 || event.key === "Backspace"
  if (!isChar) return
  event.preventDefault()
    if (currentMode === "chunk") handleChunkKey(event.key)
  else if (currentMode === "overwrite") handleOverwriteKey(event.key)
  else handleBurstKey(event.key)
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

document.getElementById("burstTimeChips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-burst-time]")
  if (!chip) return
  state.burstSelectedTime = Number(chip.dataset.burstTime)
  syncChips()
  restart()
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
  burstListName = chip.dataset.list
  loadBest()
  syncChips()
  restart()
})

document.getElementById("listChips").addEventListener("click", (e) => {
  if (currentMode !== "burst") return
  const chip = e.target.closest("[data-list]")
  if (!chip) return
  if (chip.dataset.list === "custom") { openOverlay(); return }
    burstListName = chip.dataset.list
  loadBest()
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
document.getElementById("closeIntro").addEventListener("click", closeIntro)
document.getElementById("introBtn").addEventListener("click", openIntro)

document.getElementById("applyCustom").addEventListener("click", () => {
  const input = document.getElementById("overlayWords").value.trim()
  if (!input) return
    burstListName = "custom"
  bestWpm = {}
  state.words = input.split(/[\s\n]+/).filter(w => w.length > 0)
  state.index = 0
  state.charge = 0
  renderWord()
  renderCharge()
  syncChips()
  closeOverlay()
})

document.getElementById("owRepsChips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-reps]")
  if (!chip) return
  ow.targetReps = Number(chip.dataset.reps)
  syncChips()
  startOverwrite()
})

document.getElementById("owDoneBtn").addEventListener("click", () => goToMode("chunk"))

restartEl.addEventListener("click", () => {
  if (currentMode === "chunk") startChunkMode()
  else if (currentMode === "overwrite") startOverwrite()
  else restart()
})
document.getElementById("tryAgainBtn").addEventListener("click", () => {
  startChunkMode()
})

const GAUGE_MAX = 180
const GAUGE_STEP = 2
let gaugeTicks = []

function buildGauge() {
  const g = document.getElementById("dialTicks")
  g.replaceChildren()
  gaugeTicks = []
  const cx = 300, cy = 300
  for (let v = 0; v <= GAUGE_MAX; v += GAUGE_STEP) {
    const deg = 225 - 270 * (v / GAUGE_MAX)
    const a = (deg * Math.PI) / 180
    const major = v % 30 === 0
    const r1 = major ? 248 : 258
    const r2 = 272
    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line")
    tick.setAttribute("x1", cx + r1 * Math.cos(a))
    tick.setAttribute("y1", cy - r1 * Math.sin(a))
    tick.setAttribute("x2", cx + r2 * Math.cos(a))
    tick.setAttribute("y2", cy - r2 * Math.sin(a))
    tick.setAttribute("class", major ? "tick tick-major" : "tick")
    g.appendChild(tick)
    gaugeTicks.push({ v, el: tick })
  }
}
function setGauge(wpm) {
  gaugeTicks.forEach(t => t.el.classList.toggle("is-lit", t.v <= wpm))
  document.getElementById("dial").classList.toggle("is-hot", wpm > 0 && wpm >= state.targetWpm)
}

function updateLiveGauge() {
  if (state.typed.length === 1) { setGauge(0); return }
  if (state.typed.length < 2 || !state.startTime) return
  const minutes = (performance.now() - state.startTime) / 60000
  setGauge(Math.min(GAUGE_MAX, Math.round((state.typed.length / 5) / minutes)))
}

// ── INIT ─────────────────────────────────────────────
loadSettings()
buildGauge()
setGauge(87)
syncChips()
setGauge(0)
loadBest()
loadBank()
updateBankBadge()
switchMode("chunk")
if (localStorage.getItem(STORAGE_INTRO)) {
  document.getElementById("introOverlay").style.display = "none"
}