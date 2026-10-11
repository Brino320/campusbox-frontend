// =====================================================
// ADMIN-QUIZ.JS - Gestion complète des quiz
// Version senior avec gestion d'erreurs robuste
// =====================================================

// === CONFIGURATION ===
const API_BASE = window.API_BASE
  ? `${window.API_BASE}/admin`
  : "http://localhost:3000/api/admin";

const token = localStorage.getItem("token");
if (!token) {
  alert("Session expirée. Veuillez vous reconnecter.");
  window.location.href = "../pages/authentification.html";
}

// === ÉLÉMENTS DOM ===
const $ = (id) => document.getElementById(id);

const dom = {
  // Filtres
  cycleSelect: $("cycleSelect"),
  classeSelect: $("classeSelect"),
  filiereSelect: $("filiereSelect"),
  matiereSelect: $("matiereSelect"),
  filterBtn: $("filterBtn"),

  // Quiz
  quizFormDiv: $("quizFormDiv"),
  quizFormTitle: $("quizFormTitle"),
  quizId: $("quizId"),
  quizTitre: $("quizTitre"),
  quizDescription: $("quizDescription"),
  quizNoteMax: $("quizNoteMax"),
  quizTempsLimite: $("quizTempsLimite"),
  saveQuizBtn: $("saveQuizBtn"),
  cancelQuizBtn: $("cancelQuizBtn"),
  newQuizBtn: $("newQuizBtn"),
  quizListContainer: $("quizListContainer"),

  // Classes et filières multiples
  classesContainer: $("classesContainer"),
  filieresContainer: $("filieresContainer"),

  // Questions
  questionsSection: $("questionsSection"),
  currentQuizTitle: $("currentQuizTitle"),
  addQuestionBtn: $("addQuestionBtn"),
  questionsList: $("questionsList"),
  questionForm: $("questionForm"),
  questionFormTitle: $("questionFormTitle"),
  currentQuestionId: $("currentQuestionId"),
  questionText: $("questionText"),
  questionType: $("questionType"),
  questionPoints: $("questionPoints"),
  reponsesContainer: $("reponsesContainer"),
  addReponseBtn: $("addReponseBtn"),
  saveQuestionBtn: $("saveQuestionBtn"),
  cancelQuestionBtn: $("cancelQuestionBtn"),
};

// === ÉTAT GLOBAL ===
let state = {
  currentQuizId: null,
  currentQuestionId: null,
  allClasses: [],
  allFilieres: [],
  allMatieres: [],
  quizList: [],
  editingQuestion: false,
  reponseCounter: 0,
};

// =====================================================
// 1. CHARGEMENT DES DONNÉES (CYCLES, CLASSES, FILIÈRES, MATIÈRES)
// =====================================================

async function fetchApi(url, options = {}) {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const finalOptions = { ...defaultOptions, ...options };
  const response = await fetch(`${API_BASE}${url}`, finalOptions);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  return response.json();
}

async function chargerCycles() {
  // Cycles statiques (ou depuis une table si existante)
  const cycles = [
    { id: 1, nom: "Université" },
    { id: 2, nom: "Lycée" },
    { id: 3, nom: "Fondamental" },
  ];
  dom.cycleSelect.innerHTML =
    '<option value="">-- Sélectionner un cycle --</option>';
  cycles.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nom;
    dom.cycleSelect.appendChild(opt);
  });
}

async function chargerClasses(cycleId) {
  try {
    // Si vous avez une table `classes` avec `cycle_id`, adaptez la route
    const classes = await fetchApi(`/classes-par-cycle/${cycleId}`);
    dom.classeSelect.innerHTML =
      '<option value="">-- Sélectionner une classe --</option>';
    classes.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.nom;
      dom.classeSelect.appendChild(opt);
    });
    // Recharger les filières et matières en cascade
    dom.filiereSelect.innerHTML =
      '<option value="">-- Sélectionner d\'abord une classe --</option>';
    dom.matiereSelect.innerHTML =
      '<option value="">-- Sélectionner d\'abord une filière --</option>';
  } catch (error) {
    console.error("Erreur chargement classes :", error);
    dom.classeSelect.innerHTML = '<option value="">❌ Erreur</option>';
  }
}

async function chargerFilieres(classeId) {
  try {
    const filieres = await fetchApi(`/filieres-par-classe/${classeId}`);
    dom.filiereSelect.innerHTML =
      '<option value="">-- Sélectionner une filière --</option>';
    filieres.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.nom;
      dom.filiereSelect.appendChild(opt);
    });
    dom.matiereSelect.innerHTML =
      '<option value="">-- Sélectionner d\'abord une filière --</option>';
  } catch (error) {
    console.error("Erreur chargement filières :", error);
    dom.filiereSelect.innerHTML = '<option value="">❌ Erreur</option>';
  }
}

async function chargerMatieres(filiereId, classeId) {
  try {
    const matieres = await fetchApi(
      `/matieres-par-filiere-classe?filiereId=${filiereId}&classeId=${classeId}`,
    );
    dom.matiereSelect.innerHTML =
      '<option value="">-- Sélectionner une matière --</option>';
    matieres.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.nom;
      dom.matiereSelect.appendChild(opt);
    });
  } catch (error) {
    console.error("Erreur chargement matières :", error);
    dom.matiereSelect.innerHTML = '<option value="">❌ Erreur</option>';
  }
}

// =====================================================
// 2. FILTRAGE EN CASCADE
// =====================================================

dom.cycleSelect.addEventListener("change", (e) => {
  const cycleId = e.target.value;
  if (cycleId) {
    chargerClasses(cycleId);
    // Réinitialiser les containers de checkboxes
    dom.classesContainer.innerHTML = "";
    dom.filieresContainer.innerHTML = "";
  } else {
    dom.classeSelect.innerHTML =
      '<option value="">-- Sélectionner d\'abord un cycle --</option>';
    dom.filiereSelect.innerHTML =
      '<option value="">-- Sélectionner d\'abord une classe --</option>';
    dom.matiereSelect.innerHTML =
      '<option value="">-- Sélectionner d\'abord une filière --</option>';
  }
});

dom.classeSelect.addEventListener("change", async (e) => {
  const classeId = e.target.value;
  if (classeId) {
    await chargerFilieres(classeId);
    // Charger toutes les classes disponibles pour les checkboxes
    await chargerToutesClasses();
    dom.filieresContainer.innerHTML = ""; // On les remplira plus tard
  } else {
    dom.filiereSelect.innerHTML =
      '<option value="">-- Sélectionner d\'abord une classe --</option>';
    dom.matiereSelect.innerHTML =
      '<option value="">-- Sélectionner d\'abord une filière --</option>';
  }
});

dom.filiereSelect.addEventListener("change", async (e) => {
  const filiereId = e.target.value;
  const classeId = dom.classeSelect.value;
  if (filiereId && classeId) {
    await chargerMatieres(filiereId, classeId);
    // Charger les filières pour les checkboxes
    await chargerToutesFilieres();
  } else {
    dom.matiereSelect.innerHTML =
      '<option value="">-- Sélectionner d\'abord une filière --</option>';
  }
});

// =====================================================
// 3. CHARGEMENT DES CHECKBOXES (CLASSES ET FILIÈRES)
// =====================================================

async function chargerToutesClasses() {
  try {
    const classes = await fetchApi("/classes");
    state.allClasses = classes;
    const container = dom.classesContainer;
    container.innerHTML = "";
    classes.forEach((c) => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" value="${c.id}" class="classe-check"> ${c.nom}`;
      container.appendChild(label);
    });
  } catch (error) {
    console.error("Erreur chargement classes :", error);
  }
}

async function chargerToutesFilieres() {
  try {
    const filieres = await fetchApi("/filieres");
    state.allFilieres = filieres;
    const container = dom.filieresContainer;
    container.innerHTML = "";
    filieres.forEach((f) => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" value="${f.id}" class="filiere-check"> ${f.nom}`;
      container.appendChild(label);
    });
  } catch (error) {
    console.error("Erreur chargement filières :", error);
  }
}

// =====================================================
// 4. LISTE DES QUIZ
// =====================================================

async function chargerQuiz() {
  dom.quizListContainer.innerHTML = "Chargement des quiz...";
  try {
    const quiz = await fetchApi("/quiz-list");
    state.quizList = quiz;
    afficherQuiz(quiz);
  } catch (error) {
    console.error("Erreur chargement quiz :", error);
    dom.quizListContainer.innerHTML =
      '<p style="color:red;">❌ Erreur chargement des quiz</p>';
  }
}

function afficherQuiz(quiz) {
  if (!quiz || quiz.length === 0) {
    dom.quizListContainer.innerHTML =
      "<p>Aucun quiz pour le moment. Créez-en un !</p>";
    return;
  }

  let html = "";
  quiz.forEach((q) => {
    const classes =
      q.classes?.map((c) => c.nom).join(", ") || "Toutes les classes";
    const filieres =
      q.filieres?.map((f) => f.nom).join(", ") || "Toutes les filières";
    html += `
      <div class="quiz-item" data-id="${q.id}">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
          <div>
            <strong>${escapeHtml(q.titre)}</strong>
            <span style="color:#64748b; font-size:0.85rem; margin-left:1rem;">
              ${q.matiere_nom} • ${q.note_max || 10} pts
              ${q.temps_limite ? `• ⏱️ ${q.temps_limite} min` : ""}
            </span>
          </div>
          <div>
            <button class="edit-quiz-btn btn-warning" data-id="${q.id}">✏️</button>
            <button class="delete-quiz-btn btn-danger" data-id="${q.id}">🗑️</button>
          </div>
        </div>
        <div style="font-size:0.85rem; color:#475569; margin-top:0.3rem;">
          ${escapeHtml(q.description || "")}
        </div>
        <div style="font-size:0.75rem; color:#64748b; margin-top:0.3rem;">
          🏷️ Classes : ${classes} • Filières : ${filieres}
        </div>
      </div>
    `;
  });
  dom.quizListContainer.innerHTML = html;

  // Événements boutons
  document.querySelectorAll(".edit-quiz-btn").forEach((btn) => {
    btn.addEventListener("click", () => editerQuiz(btn.dataset.id));
  });
  document.querySelectorAll(".delete-quiz-btn").forEach((btn) => {
    btn.addEventListener("click", () => supprimerQuiz(btn.dataset.id));
  });
}

// =====================================================
// 5. CRUD QUIZ
// =====================================================

dom.newQuizBtn.addEventListener("click", () => {
  resetQuizForm();
  dom.quizFormDiv.style.display = "block";
  dom.questionsSection.style.display = "none";
  dom.quizFormTitle.textContent = "➕ Nouveau quiz";
  dom.quizId.value = "";
  dom.quizTitre.value = "";
  dom.quizDescription.value = "";
  dom.quizNoteMax.value = 10;
  dom.quizTempsLimite.value = "";
  // Décocher toutes les checkboxes
  document
    .querySelectorAll(".classe-check, .filiere-check")
    .forEach((cb) => (cb.checked = false));
});

function resetQuizForm() {
  dom.quizFormDiv.style.display = "none";
  dom.questionsSection.style.display = "none";
  dom.questionForm.style.display = "none";
  dom.currentQuizTitle.textContent = "";
}

dom.cancelQuizBtn.addEventListener("click", resetQuizForm);

dom.saveQuizBtn.addEventListener("click", async () => {
  const id = dom.quizId.value;
  const titre = dom.quizTitre.value.trim();
  const description = dom.quizDescription.value.trim();
  const note_max = parseInt(dom.quizNoteMax.value) || 10;
  const temps_limite = parseInt(dom.quizTempsLimite.value) || null;
  const matiere_id = dom.matiereSelect.value;

  if (!titre) {
    alert("Le titre est requis.");
    return;
  }
  if (!matiere_id) {
    alert("Veuillez sélectionner une matière.");
    return;
  }

  // Récupérer les classes et filières cochées
  const classes = [...document.querySelectorAll(".classe-check:checked")].map(
    (cb) => parseInt(cb.value),
  );
  const filieres = [...document.querySelectorAll(".filiere-check:checked")].map(
    (cb) => parseInt(cb.value),
  );

  const body = {
    matiere_id: parseInt(matiere_id),
    titre,
    description,
    note_max,
    temps_limite,
    classes,
    filieres,
  };

  try {
    let result;
    if (id) {
      result = await fetchApi(`/quiz/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      alert("✅ Quiz mis à jour !");
    } else {
      result = await fetchApi("/quiz", {
        method: "POST",
        body: JSON.stringify(body),
      });
      alert("✅ Quiz créé !");
    }
    // Recharger la liste et réinitialiser
    await chargerQuiz();
    resetQuizForm();
    // Si un quiz vient d'être créé, on affiche ses questions
    if (!id && result.id) {
      dom.currentQuizTitle.textContent = titre;
      dom.questionsSection.style.display = "block";
      dom.quizId.value = result.id;
      chargerQuestions(result.id);
    }
  } catch (error) {
    alert("❌ Erreur : " + error.message);
  }
});

async function editerQuiz(id) {
  try {
    const quiz = await fetchApi(`/quiz/${id}`);
    if (!quiz) throw new Error("Quiz non trouvé");

    dom.quizId.value = quiz.id;
    dom.quizTitre.value = quiz.titre;
    dom.quizDescription.value = quiz.description || "";
    dom.quizNoteMax.value = quiz.note_max || 10;
    dom.quizTempsLimite.value = quiz.temps_limite || "";
    dom.quizFormTitle.textContent = "✏️ Modifier le quiz";
    dom.quizFormDiv.style.display = "block";

    // Pré-sélectionner la matière
    dom.matiereSelect.value = quiz.matiere_id;

    // Cocher les classes et filières associées
    const classeIds = (quiz.classes || []).map((c) => c.id);
    const filiereIds = (quiz.filieres || []).map((f) => f.id);

    // Attendre que les checkboxes soient chargées
    await chargerToutesClasses();
    await chargerToutesFilieres();

    document.querySelectorAll(".classe-check").forEach((cb) => {
      cb.checked = classeIds.includes(parseInt(cb.value));
    });
    document.querySelectorAll(".filiere-check").forEach((cb) => {
      cb.checked = filiereIds.includes(parseInt(cb.value));
    });

    // Afficher les questions
    dom.currentQuizTitle.textContent = quiz.titre;
    dom.questionsSection.style.display = "block";
    chargerQuestions(id);
  } catch (error) {
    alert("❌ Erreur chargement du quiz : " + error.message);
  }
}

async function supprimerQuiz(id) {
  if (!confirm("Supprimer définitivement ce quiz et toutes ses questions ?"))
    return;
  try {
    await fetchApi(`/quiz/${id}`, { method: "DELETE" });
    alert("✅ Quiz supprimé");
    await chargerQuiz();
    if (state.currentQuizId == id) resetQuizForm();
  } catch (error) {
    alert("❌ Erreur suppression : " + error.message);
  }
}

// =====================================================
// 6. GESTION DES QUESTIONS
// =====================================================

dom.addQuestionBtn.addEventListener("click", () => {
  dom.questionForm.style.display = "block";
  dom.questionFormTitle.textContent = "➕ Ajouter une question";
  dom.currentQuestionId.value = "";
  dom.questionText.value = "";
  dom.questionType.value = "qcm";
  dom.questionPoints.value = 1;
  dom.reponsesContainer.innerHTML = "";
  state.reponseCounter = 0;
  // Ajouter deux réponses par défaut pour un QCM
  ajouterChampReponse();
  ajouterChampReponse();
});

dom.cancelQuestionBtn.addEventListener("click", () => {
  dom.questionForm.style.display = "none";
});

dom.addReponseBtn.addEventListener("click", ajouterChampReponse);

function ajouterChampReponse() {
  const container = dom.reponsesContainer;
  const div = document.createElement("div");
  div.className = "reponse-item";
  div.dataset.index = state.reponseCounter++;
  div.innerHTML = `
    <input type="text" placeholder="Réponse..." class="reponse-text">
    <label style="display:flex; align-items:center; gap:0.3rem; font-weight:normal;">
      <input type="checkbox" class="reponse-correcte"> Correcte
    </label>
    <button type="button" class="btn-danger supprimer-reponse" style="padding:0.2rem 0.5rem;">✕</button>
  `;
  container.appendChild(div);
  // Écouter la suppression
  div.querySelector(".supprimer-reponse").addEventListener("click", () => {
    if (container.children.length > 2) {
      div.remove();
    } else {
      alert("Une question doit avoir au moins 2 réponses.");
    }
  });
}

dom.saveQuestionBtn.addEventListener("click", async () => {
  const quizId = dom.quizId.value;
  if (!quizId) {
    alert("Veuillez d'abord enregistrer le quiz.");
    return;
  }

  const questionText = dom.questionText.value.trim();
  if (!questionText) {
    alert("Le texte de la question est requis.");
    return;
  }

  const type = dom.questionType.value;
  const points = parseInt(dom.questionPoints.value) || 1;

  // Récupérer les réponses
  const reponseItems = dom.reponsesContainer.querySelectorAll(".reponse-item");
  const reponses = [];
  reponseItems.forEach((item) => {
    const text = item.querySelector(".reponse-text").value.trim();
    if (text) {
      const estCorrecte = item.querySelector(".reponse-correcte").checked;
      reponses.push({ reponse_text: text, est_correcte: estCorrecte });
    }
  });

  if (reponses.length < 2) {
    alert("Ajoutez au moins 2 réponses.");
    return;
  }

  // Vérifier qu'il y a au moins une réponse correcte
  const hasCorrect = reponses.some((r) => r.est_correcte);
  if (!hasCorrect) {
    alert("Cochez au moins une réponse correcte.");
    return;
  }

  const questionId = dom.currentQuestionId.value;
  const body = {
    quiz_id: parseInt(quizId),
    question_text: questionText,
    type,
    points,
    reponses,
  };

  try {
    let url, method;
    if (questionId) {
      url = `/quiz-questions/${questionId}`;
      method = "PUT";
    } else {
      url = "/quiz-questions";
      method = "POST";
    }
    await fetchApi(url, {
      method,
      body: JSON.stringify(body),
    });
    alert(questionId ? "✅ Question mise à jour" : "✅ Question ajoutée");
    dom.questionForm.style.display = "none";
    chargerQuestions(quizId);
  } catch (error) {
    alert("❌ Erreur : " + error.message);
  }
});

async function chargerQuestions(quizId) {
  try {
    const questions = await fetchApi(`/quiz-questions/${quizId}`);
    const container = dom.questionsList;
    if (!questions || questions.length === 0) {
      container.innerHTML = "<p>Aucune question pour ce quiz.</p>";
      return;
    }
    let html = "";
    questions.forEach((q, idx) => {
      const reponses = q.reponses || [];
      const reponsesHtml = reponses
        .map(
          (r) =>
            `<span style="background:${r.est_correcte ? "#d1fae5" : "#fee2e2"}; padding:0.1rem 0.4rem; border-radius:0.3rem; margin:0.1rem;">${escapeHtml(r.reponse_text)}</span>`,
        )
        .join(" ");
      html += `
        <div style="background:#f1f5f9; padding:0.5rem; border-radius:0.5rem; margin-bottom:0.5rem; border-left:3px solid #3b82f6;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>Q${idx + 1}:</strong> ${escapeHtml(q.question_text)}
            <span style="font-size:0.75rem; color:#64748b;">${q.points} pts</span>
          </div>
          <div style="font-size:0.8rem; margin-top:0.2rem;">${reponsesHtml}</div>
          <div style="margin-top:0.3rem;">
            <button class="edit-question-btn btn-warning" style="padding:0.1rem 0.5rem; font-size:0.75rem;" data-id="${q.id}">✏️ Modifier</button>
            <button class="delete-question-btn btn-danger" style="padding:0.1rem 0.5rem; font-size:0.75rem;" data-id="${q.id}">🗑️ Supprimer</button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;

    document.querySelectorAll(".edit-question-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        editerQuestion(btn.dataset.id, questions),
      );
    });
    document.querySelectorAll(".delete-question-btn").forEach((btn) => {
      btn.addEventListener("click", () => supprimerQuestion(btn.dataset.id));
    });
  } catch (error) {
    console.error("Erreur chargement questions :", error);
    dom.questionsList.innerHTML = "<p>❌ Erreur chargement des questions</p>";
  }
}

async function editerQuestion(id, questions) {
  const q = questions.find((q) => q.id == id);
  if (!q) return;

  dom.currentQuestionId.value = q.id;
  dom.questionText.value = q.question_text;
  dom.questionType.value = q.type || "qcm";
  dom.questionPoints.value = q.points || 1;
  dom.questionFormTitle.textContent = "✏️ Modifier la question";
  dom.questionForm.style.display = "block";

  // Afficher les réponses existantes
  dom.reponsesContainer.innerHTML = "";
  state.reponseCounter = 0;
  if (q.reponses && q.reponses.length > 0) {
    q.reponses.forEach((r) => {
      const div = document.createElement("div");
      div.className = "reponse-item";
      div.dataset.index = state.reponseCounter++;
      div.innerHTML = `
        <input type="text" placeholder="Réponse..." class="reponse-text" value="${escapeHtml(r.reponse_text)}">
        <label style="display:flex; align-items:center; gap:0.3rem; font-weight:normal;">
          <input type="checkbox" class="reponse-correcte" ${r.est_correcte ? "checked" : ""}> Correcte
        </label>
        <button type="button" class="btn-danger supprimer-reponse" style="padding:0.2rem 0.5rem;">✕</button>
      `;
      dom.reponsesContainer.appendChild(div);
      div.querySelector(".supprimer-reponse").addEventListener("click", () => {
        if (dom.reponsesContainer.children.length > 2) {
          div.remove();
        } else {
          alert("Une question doit avoir au moins 2 réponses.");
        }
      });
    });
  } else {
    ajouterChampReponse();
    ajouterChampReponse();
  }
}

async function supprimerQuestion(id) {
  if (!confirm("Supprimer cette question ?")) return;
  try {
    await fetchApi(`/quiz-questions/${id}`, { method: "DELETE" });
    alert("✅ Question supprimée");
    chargerQuestions(dom.quizId.value);
  } catch (error) {
    alert("❌ Erreur : " + error.message);
  }
}

// =====================================================
// 7. FILTRE APPLIQUÉ
// =====================================================

dom.filterBtn.addEventListener("click", async () => {
  // On recharge la liste avec les filtres actuels (déjà géré par le backend via les paramètres ?)
  // Pour simplifier, on recharge tous les quiz, mais on pourrait envoyer des filtres en query.
  await chargerQuiz();
});

// =====================================================
// 8. UTILITAIRES
// =====================================================

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, (m) =>
    m === "&" ? "&amp;" : m === "<" ? "&lt;" : "&gt;",
  );
}

// =====================================================
// 9. MODE SOMBRE (à intégrer selon votre système)
// =====================================================

function applyTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") document.body.classList.add("dark-mode");
  else document.body.classList.remove("dark-mode");
}
applyTheme();

// =====================================================
// 10. INITIALISATION
// =====================================================

async function init() {
  await chargerCycles();
  // Charger les classes et filières par défaut pour les checkboxes
  await chargerToutesClasses();
  await chargerToutesFilieres();
  await chargerQuiz();
}

init();
