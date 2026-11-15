const $ = (id) => document.getElementById(id);
let selectedEvent = 1;
let questionIndex = 0;
let answered = false;

function renderTimeline() {
  const filter = $("turnFilter").value;
  const events = REPLAY.events.filter(e => filter === "all" || String(e.turn) === filter);
  $("timeline").innerHTML = events.map(e => `
    <button class="event ${e.id === selectedEvent ? "selected" : ""}" data-id="${e.id}">
      <span class="time">${e.time}</span>
      <span><span class="dot ${e.kind}"></span><span class="event-title">${e.title}</span></span>
      <span class="turn">${e.player} · Turn ${e.turn}</span>
    </button>`).join("");
  document.querySelectorAll(".event").forEach(button => {
    button.addEventListener("click", () => {
      selectedEvent = Number(button.dataset.id);
      renderTimeline();
      renderDetail();
    });
  });
}
function renderDetail() {
  const e = REPLAY.events.find(x => x.id === selectedEvent);
  if (!e) return;
  const label = e.kind === "commentary" ? "Creator commentary" : e.kind === "inference" ? "Card-logic inference" : "Replay action / visible text";
  $("stepDetail").innerHTML = `
    <p class="eyebrow">${e.player.toUpperCase()} · TURN ${e.turn} · ${e.time}</p>
    <h2>${e.title}</h2>
    <p class="source-type">${label}</p>
    <p>${e.detail}</p>
    <div class="setup"><strong>What this sets up next</strong><br>${e.setup}</div>
    <div class="row"><button class="secondary" id="previousEvent">Previous step</button><button class="primary" id="nextEvent">Next step</button></div>`;
  $("previousEvent").addEventListener("click", () => moveEvent(-1));
  $("nextEvent").addEventListener("click", () => moveEvent(1));
}
function moveEvent(direction) {
  const index = REPLAY.events.findIndex(e => e.id === selectedEvent);
  selectedEvent = REPLAY.events[Math.max(0, Math.min(REPLAY.events.length - 1, index + direction))].id;
  $("turnFilter").value = "all";
  renderTimeline(); renderDetail();
}
function renderLessons() {
  $("lessonList").innerHTML = REPLAY.lessons.map((l,i) => `
    <article class="lesson"><strong>${i+1}. ${l.title}</strong><p>${l.text}</p></article>`).join("");
}
function renderQuestion() {
  const q = REPLAY.questions[questionIndex];
  answered = false;
  $("quiz").innerHTML = `<div class="question">${questionIndex+1}. ${q.q}</div>
    <div class="answers">${q.a.map((a,i) => `<button class="answer" data-answer="${i}">${a}</button>`).join("")}</div>
    <div id="feedback"></div>`;
  $("quiz").querySelectorAll(".answer").forEach(button => button.addEventListener("click", () => {
    if (answered) return;
    answered = true;
    const choice = Number(button.dataset.answer);
    $("quiz").querySelectorAll(".answer").forEach((b,i) => {
      b.disabled = true;
      if (i === q.correct) b.classList.add("correct");
      if (i === choice && choice !== q.correct) b.classList.add("incorrect");
    });
    $("feedback").innerHTML = `<div class="feedback"><strong>${choice === q.correct ? "Correct." : "Not quite."}</strong> ${q.why}</div>`;
  }));
  $("quizProgress").textContent = `Question ${questionIndex+1} of ${REPLAY.questions.length}`;
}
function nextQuestion() { questionIndex = (questionIndex + 1) % REPLAY.questions.length; renderQuestion(); }
function initTabs() {
  document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
    document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === tab.dataset.view));
  }));
}
function initNotes() {
  $("notesText").value = localStorage.getItem("snakeEyeTrainerNotes") || "";
  $("saveNotes").addEventListener("click", () => {
    localStorage.setItem("snakeEyeTrainerNotes", $("notesText").value);
    $("notesStatus").textContent = "Saved on this device.";
  });
  $("clearNotes").addEventListener("click", () => {
    $("notesText").value = "";
    localStorage.removeItem("snakeEyeTrainerNotes");
    $("notesStatus").textContent = "Notes cleared.";
  });
}
$("turnFilter").addEventListener("change", () => {
  const visible = REPLAY.events.filter(e => $("turnFilter").value === "all" || String(e.turn) === $("turnFilter").value);
  if (!visible.some(e => e.id === selectedEvent)) selectedEvent = visible[0]?.id ?? 1;
  renderTimeline(); renderDetail();
});
$("nextQuestion").addEventListener("click", nextQuestion);
$("restartQuiz").addEventListener("click", () => { questionIndex = 0; renderQuestion(); });
initTabs(); initNotes(); renderTimeline(); renderDetail(); renderLessons(); renderQuestion();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
