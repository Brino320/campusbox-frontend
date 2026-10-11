// =====================================================
// ADMIN : Gestion des matières
// =====================================================

const API_BASE = window.API_BASE
  ? `${window.API_BASE}/admin`
  : "http://localhost:3000/api/admin";
const token = localStorage.getItem("token");
if (!token) window.location.href = "../pages/authentification.html";

let filieres = [];
let groupes = [];
let matieres = [];

// ✅ Filtres actuels
let filtreSemestre = "";
let filtreNiveau = "";

// === Éléments DOM ===
const tableBody = document.getElementById("matieresBody");
const modal = document.getElementById("matiereModal");
const form = document.getElementById("matiereForm");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const newMatiereBtn = document.getElementById("newMatiereBtn");

const matiereId = document.getElementById("matiereId");
const nom = document.getElementById("nom");
const description = document.getElementById("description");
const ordre_affiche = document.getElementById("ordre_affiche");
const semestre = document.getElementById("semestre");
const coefficient_matiere = document.getElementById("coefficient_matiere");
const niveau = document.getElementById("niveau");
const groupe_id = document.getElementById("groupe_id");
const filieresCheckboxes = document.getElementById("filieresCheckboxes");
const actif = document.getElementById("actif");

// === Charger les filières ===
async function chargerFilieres() {
  try {
    const res = await fetch(`${API_BASE}/filieres`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    filieres = await res.json();
    // Remplir les checkboxes
    filieresCheckboxes.innerHTML = "";
    filieres.forEach((f) => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" value="${f.id}" class="filiere-check"> ${f.nom}`;
      filieresCheckboxes.appendChild(label);
    });
  } catch (error) {
    console.error("Erreur chargement filières", error);
  }
}

// === Charger les groupes ===
async function chargerGroupes() {
  try {
    const res = await fetch(`${API_BASE}/groupes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    groupes = await res.json();
    const select = document.getElementById("groupe_id");
    select.innerHTML = '<option value="">-- Aucun --</option>';
    groupes.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = `${g.nom} (coeff ${g.coefficient})`;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error("Erreur chargement groupes", error);
  }
}

// === Charger les matières ===
async function chargerMatieres() {
  try {
    const res = await fetch(`${API_BASE}/matieres`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    matieres = await res.json();
    afficherMatieres();
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="11">❌ Erreur de chargement</td></tr>`;
  }
}

// === Afficher les matières dans le tableau (avec filtres + colonne semestre) ===
async function afficherMatieres() {
  // Récupérer les associations matière-filière
  const assocRes = await fetch(`${API_BASE}/matieres-filieres`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const associations = await assocRes.json();

  // ✅ Appliquer les filtres
  let matieresFiltrees = matieres;
  if (filtreSemestre) {
    matieresFiltrees = matieresFiltrees.filter(
      (m) => String(m.semestre) === String(filtreSemestre),
    );
  }
  if (filtreNiveau) {
    matieresFiltrees = matieresFiltrees.filter(
      (m) => (m.niveau || "L1") === filtreNiveau,
    );
  }

  if (matieresFiltrees.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="11">Aucune matière.</td></tr>`;
    return;
  }

  let html = "";
  matieresFiltrees.forEach((m) => {
    // Récupérer les filières associées
    const filieresIds = associations
      .filter((a) => a.matiere_id === m.id)
      .map((a) => a.filiere_id);
    const filieresNoms =
      filieres
        .filter((f) => filieresIds.includes(f.id))
        .map((f) => f.nom)
        .join(", ") || "—";
    const groupeNom = groupes.find((g) => g.id === m.groupe_id)?.nom || "—";
    const actifBadge =
      m.actif === 1
        ? '<span class="badge-actif">Actif</span>'
        : '<span class="badge-inactif">Inactif</span>';
    const semestreBadge = `<span class="badge-semestre">S${m.semestre || 1}</span>`;

    html += `
            <tr>
                <td>${m.id}</td>
                <td>${escapeHtml(m.nom)}</td>
                <td>${escapeHtml(m.description || "—")}</td>
                <td>${m.ordre_affiche}</td>
                <td>${m.coefficient_matiere}</td>
                <td>${m.niveau || "L1"}</td>
                <td>${semestreBadge}</td>
                <td>${groupeNom}</td>
                <td><div class="filiere-tags">${filieresNoms
                  .split(", ")
                  .map((f) => `<span class="filiere-tag">${f}</span>`)
                  .join("")}</div></td>
                <td>${actifBadge}</td>
                <td>
                    <button class="btn-warning edit-btn" data-id="${m.id}">✏️</button>
                    <button class="btn-danger delete-btn" data-id="${m.id}">🗑️</button>
                </td>
            </tr>
        `;
  });
  tableBody.innerHTML = html;

  // Événements des boutons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => ouvrirModal(btn.dataset.id));
  });
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => supprimerMatiere(btn.dataset.id));
  });
}

// === Ouvrir le modal pour ajouter/modifier ===
async function ouvrirModal(id = null) {
  modal.classList.add("active");
  form.reset();
  document.getElementById("matiereId").value = "";
  document
    .querySelectorAll(".filiere-check")
    .forEach((cb) => (cb.checked = false));

  if (id) {
    modalTitle.textContent = "Modifier la matière";
    try {
      const res = await fetch(`${API_BASE}/matieres/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      matiereId.value = data.id;
      nom.value = data.nom;
      description.value = data.description || "";
      ordre_affiche.value = data.ordre_affiche;
      semestre.value = data.semestre || 1;
      coefficient_matiere.value = data.coefficient_matiere;
      niveau.value = data.niveau || "L1";
      groupe_id.value = data.groupe_id || "";
      actif.value = data.actif;

      // Cocher les filières associées
      const assocRes = await fetch(`${API_BASE}/matieres-filieres`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const associations = await assocRes.json();
      const matiereFilieres = associations
        .filter((a) => a.matiere_id == id)
        .map((a) => a.filiere_id);
      document.querySelectorAll(".filiere-check").forEach((cb) => {
        cb.checked = matiereFilieres.includes(parseInt(cb.value));
      });
    } catch (error) {
      alert("Erreur chargement de la matière");
    }
  } else {
    modalTitle.textContent = "Ajouter une matière";
  }
}

// === Fermer le modal ===
function fermerModal() {
  modal.classList.remove("active");
}

closeModalBtn.addEventListener("click", fermerModal);
cancelModalBtn.addEventListener("click", fermerModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) fermerModal();
});

// === Nouvelle matière ===
newMatiereBtn.addEventListener("click", () => ouvrirModal());

// === Soumettre le formulaire ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = matiereId.value;
  const data = {
    nom: nom.value.trim(),
    description: description.value,
    ordre_affiche: parseInt(ordre_affiche.value) || 0,
    semestre: parseInt(semestre.value) || 1,
    coefficient_matiere: parseFloat(coefficient_matiere.value) || 1.0,
    niveau: niveau.value,
    groupe_id: groupe_id.value || null,
    actif: parseInt(actif.value),
  };

  if (!data.nom) return alert("Le nom est requis");

  // Récupérer les filières cochées
  const selectedFilieres = [
    ...document.querySelectorAll(".filiere-check:checked"),
  ].map((cb) => parseInt(cb.value));

  let url, method;
  if (id) {
    url = `${API_BASE}/matieres/${id}`;
    method = "PUT";
  } else {
    url = `${API_BASE}/matieres`;
    method = "POST";
  }

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
      throw new Error(err.error || err.message || "Erreur");
    }

    const result = await res.json();
    const newId = id || result.id;

    // Supprimer toutes les anciennes associations pour cette matière
    await fetch(`${API_BASE}/matieres-filieres/${newId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    // On les recrée avec les nouvelles
    for (let fid of selectedFilieres) {
      await fetch(`${API_BASE}/matieres-filieres`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matiere_id: newId, filiere_id: fid }),
      });
    }

    alert(id ? "Matière modifiée" : "Matière créée");
    fermerModal();
    chargerMatieres();
  } catch (error) {
    alert("❌ Erreur : " + error.message);
  }
});

// === Supprimer une matière ===
async function supprimerMatiere(id) {
  if (!confirm("Supprimer définitivement cette matière ?")) return;
  try {
    const res = await fetch(`${API_BASE}/matieres/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("Matière supprimée");
      chargerMatieres();
    } else {
      alert("Erreur lors de la suppression");
    }
  } catch (error) {
    alert("Erreur réseau");
  }
}

// === Utilitaires ===
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, (m) => {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

// === Mode sombre ===
function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") document.body.classList.add("dark-mode");
  else document.body.classList.remove("dark-mode");
}
applySavedTheme();

// === Filtres : écouteurs ===
function initFiltres() {
  const filtreSemestreEl = document.getElementById("filtreSemestre");
  const filtreNiveauEl = document.getElementById("filtreNiveau");

  if (filtreSemestreEl) {
    filtreSemestreEl.addEventListener("change", (e) => {
      filtreSemestre = e.target.value;
      afficherMatieres();
    });
  }
  if (filtreNiveauEl) {
    filtreNiveauEl.addEventListener("change", (e) => {
      filtreNiveau = e.target.value;
      afficherMatieres();
    });
  }
}

// === Initialisation ===
async function init() {
  await chargerFilieres();
  await chargerGroupes();
  await chargerMatieres();
  initFiltres();
}
init();
