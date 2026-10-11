// =====================================================
// QUIZ ÉTUDIANT – Version corrigée + support mobile
// =====================================================

const API_BASE = window.API_BASE || "http://localhost:3000/api";
const token = localStorage.getItem("token");
if (!token) window.location.href = "authentification.html";

// =====================================================
// VARIABLES GLOBALES
// =====================================================
let currentQuizId = null;
let questionsData = [];
let completedQuizIds = [];
let timerInterval = null;
let timeRemaining = 0;
let totalTime = 0;
let answeredQuestions = new Set();
let isQuizSubmitted = false;

// =====================================================
// UTILITAIRE
// =====================================================
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, (m) => {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

// =====================================================
// MODE SOMBRE
// =====================================================
function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") document.body.classList.add("dark-mode");
  else document.body.classList.remove("dark-mode");
}

// =====================================================
// INFOS UTILISATEUR
// =====================================================
function afficherInfosUtilisateur() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;
  try {
    const user = JSON.parse(userStr);
    const sidebarName = document.getElementById("sidebarUserName");
    if (sidebarName) sidebarName.innerText = `${user.prenom} ${user.nom}`;
  } catch (e) {
    console.error("Erreur parsing user:", e);
  }
}

// =====================================================
// SIDEBAR TOGGLE (desktop + mobile)
// =====================================================
function initSidebarToggle() {
  const toggleBtn = document.getElementById("toggleSidebarBtn");
  const burgerBtn = document.getElementById("burgerBtn");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!sidebar) return;

  function openSidebar() {
    sidebar.classList.add("open");
    if (overlay) overlay.classList.add("active");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
    });
  }

  if (burgerBtn) {
    burgerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      openSidebar();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeSidebar();
  });
}

// =====================================================
// DÉCONNEXION
// =====================================================
function initDeconnexion() {
  const logoutBtn = document.getElementById("logoutBtnSidebar");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
}

// =====================================================
// CHARGER LES QUIZ DÉJÀ FAITS
// =====================================================
async function loadCompletedQuizzes() {
  try {
    const response = await fetch(`${API_BASE}/user/completed-quizzes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      completedQuizIds = await response.json();
    }
  } catch (error) {
    console.error("Erreur chargement quiz déjà faits :", error);
  }
}

// =====================================================
// CHARGER LA LISTE DES QUIZ
// =====================================================
async function chargerQuizList() {
  const container = document.getElementById("quizListContainer");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/quiz/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const quizList = await response.json();

    if (quizList.length === 0) {
      container.innerHTML =
        '<p class="empty-msg">Aucun quiz disponible pour le moment.</p>';
      return;
    }

    let html = '<ul class="quiz-list">';
    for (let q of quizList) {
      const isCompleted = completedQuizIds.includes(q.id);
      html += `
        <li class="quiz-card">
          <div class="quiz-card-title">${escapeHtml(q.titre)}</div>
          <div class="quiz-card-desc">${escapeHtml(q.description || "")}</div>
          ${
            isCompleted
              ? '<div class="quiz-badge-done">✅ Déjà fait</div>'
              : `<button class="btn-start-quiz" data-id="${q.id}">▶ Commencer</button>`
          }
        </li>
      `;
    }
    html += "</ul>";
    container.innerHTML = html;

    document.querySelectorAll(".btn-start-quiz").forEach((btn) => {
      btn.addEventListener("click", () => demarrerQuiz(btn.dataset.id));
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p class="error-msg">❌ Erreur de chargement : ${error.message}</p>`;
  }
}

// =====================================================
// DÉMARRER UN QUIZ
// =====================================================
async function demarrerQuiz(quizId) {
  if (timerInterval) clearInterval(timerInterval);
  localStorage.removeItem(`quiz_timer_${quizId}`);
  isQuizSubmitted = false;
  currentQuizId = quizId;
  answeredQuestions = new Set();

  try {
    const response = await fetch(`${API_BASE}/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Quiz introuvable");
    const quiz = await response.json();

    // Cacher la liste, afficher le quiz
    document.getElementById("quizListContainer").style.display = "none";
    document.getElementById("quizActive").style.display = "block";
    document.getElementById("quizResult").style.display = "none";
    document.getElementById("quizTitre").innerText = quiz.titre;
    document.getElementById("quizDescription").innerText =
      quiz.description || "";

    // Réinitialiser la progression
    document.getElementById("progressText").innerText = "0/0";
    document.getElementById("progressFill").style.width = "0%";

    // Afficher les questions
    const questionsDiv = document.getElementById("questionsContainer");
    questionsDiv.innerHTML = "";
    questionsData = quiz.questions;

    if (!questionsData || questionsData.length === 0) {
      questionsDiv.innerHTML = "<p>⚠️ Ce quiz ne contient aucune question.</p>";
      return;
    }

    questionsData.forEach((q, idx) => {
      const div = document.createElement("div");
      div.className = "question-item";
      div.dataset.questionId = q.id;
      div.innerHTML = `<p class="question-text"><strong>Question ${idx + 1}</strong> : ${escapeHtml(q.text)}</p>`;

      const optionsDiv = document.createElement("div");
      optionsDiv.className = "options";

      if (q.type === "qcm") {
        if (
          !q.reponses ||
          !Array.isArray(q.reponses) ||
          q.reponses.length === 0
        ) {
          optionsDiv.innerHTML =
            "<p>⚠️ Aucune réponse disponible pour cette question.</p>";
        } else {
          q.reponses.forEach((rep) => {
            const label = document.createElement("label");
            label.className = "option-label";
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `q_${q.id}`;
            input.value = rep.id;

            const estCorrecte =
              rep.est_correcte === 1 ||
              rep.est_correcte === true ||
              rep.est_correcte === "1" ||
              rep.est_correcte === "true";

            input.addEventListener("change", () => {
              let feedbackDiv = div.querySelector(".feedback-instant");
              if (!feedbackDiv) {
                feedbackDiv = document.createElement("div");
                feedbackDiv.className = "feedback-instant";
                div.appendChild(feedbackDiv);
              }
              if (estCorrecte) {
                feedbackDiv.innerHTML = "✅ Bonne réponse !";
                feedbackDiv.style.color = "green";
              } else {
                feedbackDiv.innerHTML =
                  "❌ Mauvaise réponse. Voir correction à la fin.";
                feedbackDiv.style.color = "red";
              }
              answeredQuestions.add(q.id);
              updateProgress();
            });

            const span = document.createElement("span");
            span.textContent = escapeHtml(rep.text);

            label.appendChild(input);
            label.appendChild(span);
            optionsDiv.appendChild(label);
          });
        }
      } else {
        optionsDiv.innerHTML = `<p>Type de question non géré : ${q.type}</p>`;
      }

      div.appendChild(optionsDiv);
      questionsDiv.appendChild(div);
    });

    updateProgress();

    // Timer
    const timerDisplay = document.getElementById("timerDisplay");
    const timerValue = document.getElementById("timerValue");
    const tempsLimite = quiz.temps_limite;

    if (tempsLimite !== null && tempsLimite !== undefined && tempsLimite > 0) {
      totalTime = tempsLimite * 60;
      const savedTime = localStorage.getItem(`quiz_timer_${quizId}`);
      if (savedTime) {
        timeRemaining = parseInt(savedTime, 10);
        if (timeRemaining <= 0) {
          alert("⏰ Le temps est déjà écoulé. Le quiz va être soumis.");
          soumettreQuiz();
          return;
        }
      } else {
        timeRemaining = totalTime;
      }
      startTimer();
    } else {
      timerValue.innerText = "∞";
      timerDisplay.classList.add("no-limit");
      if (timerInterval) clearInterval(timerInterval);
    }
  } catch (error) {
    console.error("Erreur chargement du quiz :", error);
    alert(`❌ Erreur chargement du quiz : ${error.message}`);
  }
}

// =====================================================
// MISE À JOUR DE LA PROGRESSION
// =====================================================
function updateProgress() {
  const total = questionsData.length;
  const answered = answeredQuestions.size;
  document.getElementById("progressText").innerText = `${answered}/${total}`;
  const percentage = total > 0 ? (answered / total) * 100 : 0;
  document.getElementById("progressFill").style.width = `${percentage}%`;
}

// =====================================================
// TIMER
// =====================================================
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    localStorage.setItem(`quiz_timer_${currentQuizId}`, timeRemaining);
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert("⏰ Temps écoulé ! Le quiz va être soumis automatiquement.");
      soumettreQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timerValue = document.getElementById("timerValue");
  timerValue.innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const timerDisplay = document.getElementById("timerDisplay");
  if (timeRemaining < 30) {
    timerDisplay.classList.add("urgent");
  } else {
    timerDisplay.classList.remove("urgent");
  }
}

// =====================================================
// SOUMETTRE LE QUIZ
// =====================================================
async function soumettreQuiz() {
  if (isQuizSubmitted) return;
  isQuizSubmitted = true;

  if (timerInterval) clearInterval(timerInterval);
  localStorage.removeItem(`quiz_timer_${currentQuizId}`);

  const reponses = {};
  questionsData.forEach((q) => {
    const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
    if (selected) reponses[q.id] = parseInt(selected.value);
  });

  const total = questionsData.length;
  const answered = Object.keys(reponses).length;
  if (answered < total) {
    const confirmSubmit = confirm(
      `Vous avez répondu à ${answered}/${total} questions. Voulez-vous vraiment soumettre ?`,
    );
    if (!confirmSubmit) {
      isQuizSubmitted = false;
      return;
    }
  }

  try {
    const response = await fetch(`${API_BASE}/quiz/${currentQuizId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reponses }),
    });
    const data = await response.json();
    if (response.ok) {
      await loadCompletedQuizzes();
      document.getElementById("quizActive").style.display = "none";
      document.getElementById("quizResult").style.display = "block";
      document.getElementById("scoreSpan").innerText = data.score;
      document.getElementById("totalSpan").innerText = data.total;
      document.getElementById("pourcentageSpan").innerText = Math.round(
        data.pourcentage,
      );
    } else {
      alert(data.error || "Erreur lors de la soumission");
      isQuizSubmitted = false;
    }
  } catch (error) {
    alert("Erreur réseau");
    isQuizSubmitted = false;
  }
}

// =====================================================
// RETOUR À LA LISTE
// =====================================================
function retourListe() {
  document.getElementById("quizResult").style.display = "none";
  document.getElementById("quizListContainer").style.display = "block";
  if (timerInterval) clearInterval(timerInterval);
  localStorage.removeItem(`quiz_timer_${currentQuizId}`);
  chargerQuizList();
}

// =====================================================
// INITIALISATION
// =====================================================
function init() {
  applySavedTheme();
  afficherInfosUtilisateur();
  initSidebarToggle();
  initDeconnexion();

  const quizForm = document.getElementById("quizForm");
  if (quizForm) {
    quizForm.addEventListener("submit", (e) => {
      e.preventDefault();
      soumettreQuiz();
    });
  }

  const backBtn = document.getElementById("backToListBtn");
  if (backBtn) backBtn.addEventListener("click", retourListe);

  // Charger les données
  (async () => {
    await loadCompletedQuizzes();
    await chargerQuizList();
  })();
}

init();
