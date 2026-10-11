// =====================================================
// ADMIN - Gestion des examens (sans onclick inline)
// =====================================================

const API_BASE = `${window.API_BASE}/admin`;
const token = localStorage.getItem("token");
if (!token) window.location.href = "../pages/authentification.html";

console.log("🔧 admin-examens.js — API_BASE =", API_BASE);

let examens = [];

// =====================================================
// CHARGEMENT DES MATIÈRES
// =====================================================
async function loadMatieres() {
  try {
    const res = await fetch(`${API_BASE}/matieres`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const matieres = await res.json();
    const select = document.getElementById("matiere_id");
    select.innerHTML = '<option value="">-- Choisir --</option>';
    matieres.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.nom} (S${m.semestre || 1} - ${m.niveau || "L1"})`;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error("loadMatieres:", e);
  }
}

// =====================================================
// CHARGEMENT DES EXAMENS
// =====================================================
async function loadExamens() {
  const container = document.getElementById("examensList");
  try {
    const res = await fetch(`${API_BASE}/examens`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    examens = await res.json();

    if (!Array.isArray(examens) || examens.length === 0) {
      container.innerHTML = "<p>Aucun examen.</p>";
      return;
    }

    let html = "";
    examens.forEach((e) => {
      const badgeActif =
        e.actif === 1
          ? '<span style="color:#065f46; background:#d1fae5; padding:0.1rem 0.5rem; border-radius:1rem; font-size:0.75rem;">Actif</span>'
          : '<span style="color:#991b1b; background:#fee2e2; padding:0.1rem 0.5rem; border-radius:1rem; font-size:0.75rem;">Inactif</span>';

      html += `
        <div class="exam-item">
          <h3>${escapeHtml(e.titre)} ${badgeActif}</h3>
          <p><strong>Matière :</strong> ${escapeHtml(e.matiere_nom)}</p>
          <p>${escapeHtml(e.description || "")}</p>
          <div class="exam-meta">
            <span>📅 ${e.date_evaluation || "—"}</span>
            <span>⚖️ Coeff ${e.coefficient}</span>
            <span>📝 ${e.nb_questions} question(s)</span>
            <span>🎯 Sur ${e.note_max_sur}</span>
          </div>
          <div class="exam-actions">
            <button class="btn-success btn-questions" data-id="${e.id}">📝 Gérer les questions</button>
            <button class="btn-stats" data-id="${e.id}">📊 Stats</button>
            <button class="btn-edit" data-id="${e.id}">✏️ Modifier</button>
            <button class="btn-danger btn-delete" data-id="${e.id}">🗑️ Supprimer</button>
          </div>
          <div class="stats-box" id="stats-${e.id}" style="display:none;"></div>
        </div>
      `;
    });
    container.innerHTML = html;

    // ✅ Attacher les listeners après le rendu
    document.querySelectorAll(".btn-questions").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = `examen-questions.html?examen_id=${btn.dataset.id}`;
      });
    });

    document.querySelectorAll(".btn-stats").forEach((btn) => {
      btn.addEventListener("click", () => voirStats(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", () => editExam(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => deleteExam(parseInt(btn.dataset.id)));
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>❌ Erreur de chargement</p>";
  }
}

// =====================================================
// STATISTIQUES
// =====================================================
async function voirStats(id) {
  const box = document.getElementById(`stats-${id}`);
  if (box.style.display === "block") {
    box.style.display = "none";
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/examens/${id}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const stats = await res.json();
    box.innerHTML = `
      <strong>📊 Statistiques</strong><br>
      Questions : <b>${stats.total_questions}</b> | 
      Points totaux : <b>${stats.total_points}</b><br>
      Étudiants ayant passé : <b>${stats.nb_passages}</b> |
      Moyenne : <b>${stats.moyenne || "—"}/20</b> |
      Max : <b>${stats.max_note || "—"}</b> |
      Min : <b>${stats.min_note || "—"}</b>
    `;
    box.style.display = "block";
  } catch (e) {
    box.innerHTML = "❌ Erreur stats";
    box.style.display = "block";
  }
}

// =====================================================
// ÉDITER UN EXAMEN
// =====================================================
function editExam(id) {
  const exam = examens.find((e) => e.id === id);
  if (!exam) return;

  document.getElementById("examId").value = exam.id;
  document.getElementById("matiere_id").value = exam.matiere_id;
  document.getElementById("titre").value = exam.titre;
  document.getElementById("description").value = exam.description || "";
  document.getElementById("date_evaluation").value = exam.date_evaluation
    ? exam.date_evaluation.split("T")[0]
    : "";
  document.getElementById("coefficient").value = exam.coefficient;
  document.getElementById("note_max_sur").value = exam.note_max_sur;
  document.getElementById("actif").value = exam.actif;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// =====================================================
// SUPPRIMER UN EXAMEN
// =====================================================
async function deleteExam(id) {
  if (
    !confirm(
      "Supprimer cet examen ET toutes ses questions ? Action irréversible.",
    )
  )
    return;
  try {
    const res = await fetch(`${API_BASE}/examens/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("✅ Examen supprimé");
      loadExamens();
    } else {
      alert("❌ Erreur suppression");
    }
  } catch (e) {
    alert("❌ Erreur réseau");
  }
}

// =====================================================
// SOUMETTRE LE FORMULAIRE
// =====================================================
document.getElementById("examForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("examId").value;
  const body = {
    matiere_id: parseInt(document.getElementById("matiere_id").value),
    titre: document.getElementById("titre").value.trim(),
    description: document.getElementById("description").value.trim(),
    date_evaluation: document.getElementById("date_evaluation").value,
    coefficient:
      parseFloat(document.getElementById("coefficient").value) || 1.0,
    note_max_sur: parseInt(document.getElementById("note_max_sur").value) || 20,
    actif: parseInt(document.getElementById("actif").value),
  };

  if (!body.matiere_id || !body.titre || !body.date_evaluation) {
    alert("Champs requis : matière, titre, date");
    return;
  }

  const url = id ? `${API_BASE}/examens/${id}` : `${API_BASE}/examens`;
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
      alert(id ? "✅ Examen modifié" : "✅ Examen créé");
      document.getElementById("examForm").reset();
      document.getElementById("examId").value = "";
      loadExamens();
    } else {
      const err = await res.json();
      alert("❌ " + (err.error || "Erreur"));
    }
  } catch (e) {
    alert("❌ Erreur réseau");
  }
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("examForm").reset();
  document.getElementById("examId").value = "";
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
loadMatieres();
loadExamens();
