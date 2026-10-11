// =====================================================
// ADMIN - Gestion des questions d'un examen
// =====================================================

const API_BASE = `${window.API_BASE}/admin`;
const token = localStorage.getItem("token");
if (!token) window.location.href = "../pages/authentification.html";

let currentExamenId = null;
let allExamens = [];
let questionsCache = [];

// =====================================================
// CHARGEMENT DE LA LISTE DES EXAMENS
// =====================================================
async function loadExamens() {
  try {
    const res = await fetch(`${API_BASE}/examens`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    allExamens = await res.json();
    const select = document.getElementById("examenSelect");
    select.innerHTML = '<option value="">-- Choisir un examen --</option>';
    allExamens.forEach((e) => {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = `${e.titre} (${e.matiere_nom}) — ${e.nb_questions} questions`;
      select.appendChild(opt);
    });

    // Auto-sélection si ?examen_id= dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const presetId = urlParams.get("examen_id");
    if (presetId) {
      select.value = presetId;
      select.dispatchEvent(new Event("change"));
    }
  } catch (e) {
    console.error(e);
  }
}

// =====================================================
// CHANGEMENT D'EXAMEN
// =====================================================
document.getElementById("examenSelect").addEventListener("change", function () {
  currentExamenId = this.value;
  if (!currentExamenId) {
    document.getElementById("questionsArea").style.display = "none";
    document.getElementById("examInfo").style.display = "none";
    return;
  }
  document.getElementById("questionsArea").style.display = "block";
  const exam = allExamens.find((e) => e.id == currentExamenId);
  if (exam) {
    document.getElementById("examInfo").style.display = "block";
    document.getElementById("examInfoTitre").textContent = exam.titre;
    document.getElementById("examInfoMatiere").textContent = exam.matiere_nom;
  }
  loadQuestions();
});

// =====================================================
// CHARGEMENT DES QUESTIONS
// =====================================================
async function loadQuestions() {
  try {
    const res = await fetch(
      `${API_BASE}/examens/${currentExamenId}/questions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    questionsCache = await res.json();
    displayQuestions(questionsCache);
  } catch (e) {
    console.error(e);
  }
}

function displayQuestions(questions) {
  const container = document.getElementById("questionsList");
  document.getElementById("totalQuestions").textContent = questions.length;

  if (questions.length === 0) {
    container.innerHTML = "<p>Aucune question. Ajoutez-en une.</p>";
    return;
  }

  container.innerHTML = "";
  questions.forEach((q, idx) => {
    const div = document.createElement("div");
    div.className = "question-item";

    let reponsesHtml = q.reponses
      .map(
        (r) =>
          `<div class="q-rep ${r.est_correcte ? "correct" : ""}">
            ${r.est_correcte ? "✅" : "⬜"} ${escapeHtml(r.reponse_text)}
          </div>`,
      )
      .join("");

    div.innerHTML = `
      <div class="q-head">
        <strong>Q${idx + 1} — ${q.points} pt${q.points > 1 ? "s" : ""} (${q.type})</strong>
        <div>
          <button class="btn-secondary" onclick="editQuestion(${q.id})">✏️</button>
          <button class="btn-danger" onclick="deleteQuestion(${q.id})">🗑️</button>
        </div>
      </div>
      <div class="q-text">${escapeHtml(q.question_text)}</div>
      ${reponsesHtml}
    `;
    container.appendChild(div);
  });
}

// =====================================================
// OUVRIR LE FORMULAIRE (AJOUT)
// =====================================================
document.getElementById("addQuestionBtn").addEventListener("click", () => {
  document.getElementById("questionId").value = "";
  document.getElementById("questionText").value = "";
  document.getElementById("questionType").value = "qcm";
  document.getElementById("questionPoints").value = 1;
  document.getElementById("reponsesContainer").innerHTML = "";
  addReponseRow();
  addReponseRow();
  document.getElementById("formTitle").innerText = "Ajouter une question";
  document.getElementById("questionForm").style.display = "block";
  document
    .getElementById("questionForm")
    .scrollIntoView({ behavior: "smooth" });
});

// =====================================================
// ÉDITER UNE QUESTION
// =====================================================
window.editQuestion = function (id) {
  const q = questionsCache.find((x) => x.id === id);
  if (!q) return;

  document.getElementById("questionId").value = q.id;
  document.getElementById("questionText").value = q.question_text;
  document.getElementById("questionType").value = q.type;
  document.getElementById("questionPoints").value = q.points;
  document.getElementById("reponsesContainer").innerHTML = "";

  q.reponses.forEach((r) => addReponseRow(r.reponse_text, r.est_correcte));

  document.getElementById("formTitle").innerText = "Modifier la question";
  document.getElementById("questionForm").style.display = "block";
  document
    .getElementById("questionForm")
    .scrollIntoView({ behavior: "smooth" });
};

// =====================================================
// SUPPRIMER UNE QUESTION
// =====================================================
window.deleteQuestion = async function (id) {
  if (!confirm("Supprimer cette question ?")) return;
  try {
    const res = await fetch(`${API_BASE}/examens/questions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      loadQuestions();
    } else alert("Erreur suppression");
  } catch (e) {
    alert("Erreur réseau");
  }
};

// =====================================================
// AJOUTER UNE LIGNE DE RÉPONSE
// =====================================================
function addReponseRow(text = "", estCorrecte = false) {
  const div = document.createElement("div");
  div.className = "reponse-item";
  div.innerHTML = `
    <input type="text" placeholder="Texte de la réponse" value="${escapeHtml(text)}">
    <label>
      <input type="checkbox" ${estCorrecte ? "checked" : ""}> Correcte
    </label>
    <button type="button" class="btn-danger" style="padding:0.3rem 0.6rem;">🗑️</button>
  `;
  document.getElementById("reponsesContainer").appendChild(div);
  div
    .querySelector(".btn-danger")
    .addEventListener("click", () => div.remove());
}

document
  .getElementById("addReponseBtn")
  .addEventListener("click", () => addReponseRow());

// =====================================================
// SAUVEGARDER LA QUESTION
// =====================================================
document
  .getElementById("saveQuestionBtn")
  .addEventListener("click", async () => {
    const id = document.getElementById("questionId").value;
    const question_text = document.getElementById("questionText").value.trim();
    const type = document.getElementById("questionType").value;
    const points =
      parseInt(document.getElementById("questionPoints").value) || 1;

    if (!question_text) return alert("Texte de la question requis");

    const reponses = [];
    document
      .querySelectorAll("#reponsesContainer .reponse-item")
      .forEach((div) => {
        const input = div.querySelector('input[type="text"]');
        const checkbox = div.querySelector('input[type="checkbox"]');
        if (input.value.trim()) {
          reponses.push({
            text: input.value.trim(),
            est_correcte: checkbox.checked,
          });
        }
      });

    if (type !== "vrai_faux" && reponses.length < 2) {
      return alert("Au moins 2 réponses");
    }
    if (!reponses.some((r) => r.est_correcte)) {
      return alert("Cochez au moins une bonne réponse");
    }

    const body = {
      examen_id: currentExamenId,
      question_text,
      type,
      points,
      reponses,
    };

    const url = id
      ? `${API_BASE}/examens/questions/${id}`
      : `${API_BASE}/examens/questions`;
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        document.getElementById("questionForm").style.display = "none";
        loadQuestions();
        // Refresh la liste pour le compteur
        loadExamens();
      } else {
        const err = await res.json();
        alert("❌ " + (err.error || "Erreur"));
      }
    } catch (e) {
      alert("Erreur réseau");
    }
  });

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("questionForm").style.display = "none";
});

// =====================================================
// IMPORT EN MASSE
// =====================================================
document.getElementById("bulkToggleBtn").addEventListener("click", () => {
  const box = document.getElementById("bulkBox");
  box.style.display = box.style.display === "block" ? "none" : "block";
});

document.getElementById("cancelBulkBtn").addEventListener("click", () => {
  document.getElementById("bulkBox").style.display = "none";
});

document.getElementById("importBulkBtn").addEventListener("click", async () => {
  const raw = document.getElementById("bulkText").value.trim();
  if (!raw) return alert("Collez d'abord du texte");

  const lines = raw.split("\n").filter((l) => l.trim());
  const questions = [];

  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length < 3) continue;
    const question_text = parts[0].trim();
    const options = parts[1].split(";").map((o) => o.trim());
    const correctIndex = parseInt(parts[2].trim()) - 1; // 1-based → 0-based

    if (!question_text || options.length < 2) continue;

    const reponses = options.map((text, i) => ({
      text,
      est_correcte: i === correctIndex,
    }));

    questions.push({
      question_text,
      type: "qcm",
      points: 1,
      reponses,
    });
  }

  if (questions.length === 0) {
    return alert("Aucune question valide détectée");
  }

  if (!confirm(`Importer ${questions.length} question(s) ?`)) return;

  try {
    const res = await fetch(`${API_BASE}/examens/questions/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ examen_id: currentExamenId, questions }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ " + data.message);
      document.getElementById("bulkText").value = "";
      document.getElementById("bulkBox").style.display = "none";
      loadQuestions();
      loadExamens();
    } else {
      alert("❌ " + (data.error || "Erreur"));
    }
  } catch (e) {
    alert("Erreur réseau");
  }
});

// =====================================================
// UTILITAIRE
// =====================================================
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (m) => {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    if (m === '"') return "&quot;";
    if (m === "'") return "&#39;";
    return m;
  });
}

// =====================================================
// INIT
// =====================================================
loadExamens();
