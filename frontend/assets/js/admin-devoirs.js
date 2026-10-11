// =====================================================
// ADMIN-DEVOIRS.JS - Gestion complète des devoirs
// =====================================================

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
  formDiv: $("devoirFormDiv"),
  formTitle: $("formTitle"),
  devoirId: $("devoirId"),
  matiereSelect: $("matiere_id"),
  titre: $("titre"),
  description: $("description"),
  noteMax: $("note_max"),
  duree: $("duree"),
  questionsContainer: $("questionsContainer"),
  addQuestionBtn: $("addQuestionBtn"),
  btnSaveDevoir: $("btnSaveDevoir"),
  btnCancelDevoir: $("btnCancelDevoir"),
  btnNouveauDevoir: $("btnNouveauDevoir"),
  devoirsList: $("devoirsList"),
  filterMatiere: $("filterMatiere"),
  btnFiltrer: $("btnFiltrer"),
  statTotal: $("statTotal"),
  statActifs: $("statActifs"),
};

// === ÉTAT GLOBAL ===
let state = {
  editingId: null,
  questionCounter: 0,
  allMatieres: [],
  allDevoirs: [],
  matieresMap: {},
};

// =====================================================
// 1. CHARGEMENT DES MATIÈRES
// =====================================================
async function chargerMatieres() {
  try {
    const res = await fetch(`${API_BASE}/matieres`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur chargement matières");
    const matieres = await res.json();
    state.allMatieres = matieres;
    state.matieresMap = matieres.reduce((acc, m) => {
      acc[m.id] = m.nom;
      return acc;
    }, {});

    // Remplir les selects
    const options = matieres
      .map((m) => `<option value="${m.id}">${escapeHtml(m.nom)}</option>`)
      .join("");
    dom.matiereSelect.innerHTML = `<option value="">-- Sélectionner une matière --</option>${options}`;
    dom.filterMatiere.innerHTML = `<option value="">-- Toutes les matières --</option>${options}`;
  } catch (error) {
    console.error("Erreur chargement matières :", error);
  }
}

// =====================================================
// 2. CHARGEMENT DES DEVOIRS
// =====================================================
async function chargerDevoirs(filtreMatiere = null) {
  dom.devoirsList.innerHTML =
    '<p class="empty-state">Chargement des devoirs...</p>';
  try {
    let url = "/devoir";
    if (filtreMatiere) {
      url += `?matiere_id=${filtreMatiere}`;
    }
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur chargement devoirs");
    const devoirs = await res.json();
    state.allDevoirs = devoirs;
    afficherDevoirs(devoirs);
    mettreAJourStats(devoirs);
  } catch (error) {
    console.error("Erreur chargement devoirs :", error);
    dom.devoirsList.innerHTML =
      '<p class="empty-state">❌ Erreur de chargement.</p>';
  }
}

// =====================================================
// 3. AFFICHER LES DEVOIRS
// =====================================================
function afficherDevoirs(devoirs) {
  if (!devoirs || devoirs.length === 0) {
    dom.devoirsList.innerHTML =
      '<p class="empty-state">Aucun devoir créé pour le moment.</p>';
    return;
  }

  let html = "";
  devoirs.forEach((d) => {
    const matiereNom = state.matieresMap[d.matiere_id] || "Matière inconnue";
    const nbQuestions = d.questions ? d.questions.length : 0;
    const actifBadge =
      d.actif === 1
        ? '<span class="badge" style="background:#d1fae5; color:#065f46;">✅ Actif</span>'
        : '<span class="badge" style="background:#fee2e2; color:#991b1b;">⛔ Inactif</span>';

    html += `
      <div class="devoir-item" data-id="${d.id}">
        <div class="info">
          <div class="titre">${escapeHtml(d.titre)}</div>
          <div class="meta">
            <span>📚 ${escapeHtml(matiereNom)}</span>
            <span>📝 ${nbQuestions} question${nbQuestions > 1 ? "s" : ""}</span>
            <span>📊 ${d.note_max || 20} pts</span>
            ${d.duree ? `<span>⏱️ ${d.duree} min</span>` : ""}
            ${actifBadge}
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-edit edit-devoir" data-id="${d.id}">✏️ Modifier</button>
          <button class="btn btn-delete delete-devoir" data-id="${d.id}">🗑️ Supprimer</button>
        </div>
      </div>
    `;
  });
  dom.devoirsList.innerHTML = html;

  // Événements
  document.querySelectorAll(".edit-devoir").forEach((btn) => {
    btn.addEventListener("click", () => editerDevoir(btn.dataset.id));
  });
  document.querySelectorAll(".delete-devoir").forEach((btn) => {
    btn.addEventListener("click", () => supprimerDevoir(btn.dataset.id));
  });
}

// =====================================================
// 4. STATISTIQUES
// =====================================================
function mettreAJourStats(devoirs) {
  dom.statTotal.textContent = devoirs.length;
  const actifs = devoirs.filter((d) => d.actif === 1).length;
  dom.statActifs.textContent = actifs;
}

// =====================================================
// 5. GESTION DU FORMULAIRE
// =====================================================
function resetFormulaire() {
  dom.devoirId.value = "";
  dom.titre.value = "";
  dom.description.value = "";
  dom.noteMax.value = 20;
  dom.duree.value = "";
  dom.matiereSelect.value = "";
  dom.questionsContainer.innerHTML = "";
  state.questionCounter = 0;
  dom.formTitle.textContent = "➕ Nouveau devoir";
  state.editingId = null;
}

function afficherFormulaire(mode = "add") {
  resetFormulaire();
  dom.formDiv.style.display = "block";
  dom.formDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  if (mode === "add") {
    dom.formTitle.textContent = "➕ Nouveau devoir";
    dom.devoirId.value = "";
    // Ajouter une question par défaut
    ajouterQuestion();
  }
}

function masquerFormulaire() {
  dom.formDiv.style.display = "none";
  resetFormulaire();
}

// =====================================================
// 6. GESTION DES QUESTIONS
// =====================================================
function ajouterQuestion(questionData = null) {
  const container = dom.questionsContainer;
  const idx = state.questionCounter++;

  const div = document.createElement("div");
  div.className = "question-block";
  div.dataset.questionIndex = idx;

  div.innerHTML = `
    <div class="q-header">
      <span class="q-number">Question ${state.questionCounter}</span>
      <button type="button" class="remove-q" data-index="${idx}">✕ Supprimer</button>
    </div>
    <input type="hidden" class="q-id" value="${questionData?.id || ""}" />
    <div class="form-group">
      <label>Texte de la question *</label>
      <textarea class="q-text" rows="2" placeholder="Ex: Quelle est la capitale du Mali ?">${escapeHtml(questionData?.text || "")}</textarea>
    </div>
    <div class="form-group">
      <label>Points</label>
      <input type="number" class="q-points" value="${questionData?.points || 1}" min="1" />
    </div>
    <div class="form-group">
      <label>Réponses</label>
      <div class="q-reponses"></div>
      <button type="button" class="btn btn-success btn-sm add-reponse" data-index="${idx}">➕ Ajouter une réponse</button>
    </div>
  `;

  container.appendChild(div);

  // Ajouter les réponses existantes ou 2 par défaut
  const reponsesContainer = div.querySelector(".q-reponses");
  if (questionData?.reponses && questionData.reponses.length > 0) {
    questionData.reponses.forEach((r) => {
      ajouterReponse(reponsesContainer, r);
    });
  } else {
    ajouterReponse(reponsesContainer);
    ajouterReponse(reponsesContainer);
  }

  // Gestion de la suppression de la question
  div.querySelector(".remove-q").addEventListener("click", function () {
    const container = this.closest(".question-block");
    if (dom.questionsContainer.children.length > 1) {
      container.remove();
      renumberQuestions();
    } else {
      alert("Un devoir doit avoir au moins une question.");
    }
  });

  // Gestion de l'ajout de réponse
  div.querySelector(".add-reponse").addEventListener("click", function () {
    const repContainer =
      this.closest(".question-block").querySelector(".q-reponses");
    ajouterReponse(repContainer);
  });
}

function ajouterReponse(container, reponseData = null) {
  const div = document.createElement("div");
  div.className = "reponse-row";
  div.innerHTML = `
    <input type="text" class="rep-text" placeholder="Réponse..." value="${escapeHtml(reponseData?.text || "")}" />
    <label>
      <input type="checkbox" class="rep-correcte" ${reponseData?.est_correcte ? "checked" : ""} /> Correcte
    </label>
    <button type="button" class="remove-rep" title="Supprimer cette réponse">✕</button>
  `;
  container.appendChild(div);

  div.querySelector(".remove-rep").addEventListener("click", function () {
    const container = this.closest(".q-reponses");
    if (container.children.length > 2) {
      this.closest(".reponse-row").remove();
    } else {
      alert("Une question doit avoir au moins 2 réponses.");
    }
  });
}

function renumberQuestions() {
  const blocks = dom.questionsContainer.querySelectorAll(".question-block");
  blocks.forEach((block, idx) => {
    block.querySelector(".q-number").textContent = `Question ${idx + 1}`;
  });
}

// =====================================================
// 7. COLLECTER LES DONNÉES DU FORMULAIRE
// =====================================================
function collecterDonnees() {
  const questions = [];
  const questionBlocks =
    dom.questionsContainer.querySelectorAll(".question-block");

  questionBlocks.forEach((block) => {
    const text = block.querySelector(".q-text").value.trim();
    if (!text) return;

    const points = parseInt(block.querySelector(".q-points").value) || 1;
    const reponses = [];
    const repRows = block.querySelectorAll(".reponse-row");

    repRows.forEach((row) => {
      const repText = row.querySelector(".rep-text").value.trim();
      if (repText) {
        reponses.push({
          texte: repText,
          est_correcte: row.querySelector(".rep-correcte").checked,
        });
      }
    });

    if (reponses.length >= 2) {
      questions.push({
        id: block.querySelector(".q-id").value || null,
        texte: text,
        points: points,
        reponses: reponses,
      });
    }
  });

  return {
    matiere_id: parseInt(dom.matiereSelect.value),
    titre: dom.titre.value.trim(),
    description: dom.description.value.trim(),
    note_max: parseInt(dom.noteMax.value) || 20,
    duree: parseInt(dom.duree.value) || null,
    questions: questions,
  };
}

// =====================================================
// 8. ENREGISTRER LE DEVOIR
// =====================================================
async function enregistrerDevoir(e) {
  e.preventDefault();

  const data = collecterDonnees();
  const id = dom.devoirId.value;

  // Validations
  if (!data.matiere_id) {
    alert("Veuillez sélectionner une matière.");
    return;
  }
  if (!data.titre) {
    alert("Le titre est requis.");
    return;
  }
  if (data.questions.length === 0) {
    alert("Ajoutez au moins une question complète (avec texte et 2 réponses).");
    return;
  }

  // Vérifier que chaque question a au moins une réponse correcte
  for (let q of data.questions) {
    const hasCorrect = q.reponses.some((r) => r.est_correcte);
    if (!hasCorrect) {
      alert(
        `La question "${q.texte.substring(0, 30)}..." doit avoir au moins une réponse correcte.`,
      );
      return;
    }
  }

  const url = id ? `${API_BASE}/devoir/${id}` : `${API_BASE}/devoir`;
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de l'enregistrement");
    }

    alert(id ? "✅ Devoir mis à jour !" : "✅ Devoir créé avec succès !");
    masquerFormulaire();
    await chargerDevoirs(dom.filterMatiere.value || null);
  } catch (error) {
    alert("❌ Erreur : " + error.message);
  }
}

// =====================================================
// 9. ÉDITER UN DEVOIR
// =====================================================
async function editerDevoir(id) {
  try {
    const res = await fetch(`${API_BASE}/devoir/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Devoir non trouvé");
    const data = await res.json();

    dom.devoirId.value = data.id;
    dom.titre.value = data.titre;
    dom.description.value = data.description || "";
    dom.noteMax.value = data.note_max || 20;
    dom.duree.value = data.duree || "";
    dom.matiereSelect.value = data.matiere_id;
    dom.formTitle.textContent = "✏️ Modifier le devoir";
    dom.questionsContainer.innerHTML = "";
    state.questionCounter = 0;

    // Ajouter les questions existantes
    if (data.questions && data.questions.length > 0) {
      data.questions.forEach((q) => {
        ajouterQuestion(q);
      });
    } else {
      ajouterQuestion();
    }

    dom.formDiv.style.display = "block";
    dom.formDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    alert("❌ Erreur chargement du devoir : " + error.message);
  }
}

// =====================================================
// 10. SUPPRIMER UN DEVOIR
// =====================================================
async function supprimerDevoir(id) {
  if (!confirm("Supprimer définitivement ce devoir et toutes ses questions ?"))
    return;

  try {
    const res = await fetch(`${API_BASE}/devoir/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("✅ Devoir supprimé");
      await chargerDevoirs(dom.filterMatiere.value || null);
    } else {
      const err = await res.json();
      alert("❌ Erreur suppression : " + (err.error || "Inconnue"));
    }
  } catch (error) {
    alert("❌ Erreur réseau");
  }
}

// =====================================================
// 11. ÉVÉNEMENTS
// =====================================================

// Nouveau devoir
dom.btnNouveauDevoir.addEventListener("click", () => {
  afficherFormulaire("add");
});

// Annuler
dom.btnCancelDevoir.addEventListener("click", masquerFormulaire);

// Ajouter une question
dom.addQuestionBtn.addEventListener("click", ajouterQuestion);

// Enregistrer
dom.btnSaveDevoir.addEventListener("click", enregistrerDevoir);

// Filtrer
dom.btnFiltrer.addEventListener("click", () => {
  const matiereId = dom.filterMatiere.value;
  chargerDevoirs(matiereId || null);
});

// =====================================================
// 12. UTILITAIRES
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
// 13. MODE SOMBRE
// =====================================================
function applyTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") document.body.classList.add("dark-mode");
  else document.body.classList.remove("dark-mode");
}
applyTheme();

// =====================================================
// 14. INITIALISATION
// =====================================================
async function init() {
  await chargerMatieres();
  await chargerDevoirs();
}

init();
