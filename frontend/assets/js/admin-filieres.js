const API_BASE = "http://localhost:3000/api/admin";
const token = localStorage.getItem("token");
if (!token) window.location.href = "../pages/authentification.html";

let toutesMatieres = [];
let filieres = [];

// Helper toast
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = isError ? "#dc2626" : "#10b981";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Charger toutes les matières pour les cases
async function chargerToutesMatieres() {
  const res = await fetch(`${API_BASE}/matieres`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  toutesMatieres = await res.json();
  afficherCheckboxesMatieres();
}

function afficherCheckboxesMatieres() {
  const container = document.getElementById("matieresCheckboxes");
  if (!container) return;
  container.innerHTML = "";
  toutesMatieres.forEach((m) => {
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "0.5rem";
    label.style.marginBottom = "0.5rem";
    label.innerHTML = `<input type="checkbox" value="${m.id}"> ${m.nom}`;
    container.appendChild(label);
  });
}

// Charger la liste des filières
async function chargerFilieres() {
  const res = await fetch(`${API_BASE}/filieres`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  filieres = await res.json();
  const tbody = document.querySelector("#filieresTable tbody");
  tbody.innerHTML = "";
  filieres.forEach((f) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = f.id;
    row.insertCell(1).innerText = f.nom;
    row.insertCell(2).innerText = f.description || "";
    const actions = row.insertCell(3);
    actions.className = "actions";
    actions.innerHTML = `<button class="edit" data-id="${f.id}">✏️</button>
                             <button class="delete" data-id="${f.id}">🗑️</button>`;
  });
  document
    .querySelectorAll(".edit")
    .forEach((btn) =>
      btn.addEventListener("click", () => ouvrirModaleEdition(btn.dataset.id)),
    );
  document
    .querySelectorAll(".delete")
    .forEach((btn) =>
      btn.addEventListener("click", () => supprimerFiliere(btn.dataset.id)),
    );
}

async function ouvrirModaleEdition(id) {
  const res = await fetch(`${API_BASE}/filieres/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const filiere = data.filiere;
  const matieresAssoc = data.matieres.map((m) => m.id);
  document.getElementById("filiereId").value = filiere.id;
  document.getElementById("nom").value = filiere.nom;
  document.getElementById("description").value = filiere.description || "";
  document.getElementById("modalTitle").innerText = "Modifier la filière";
  // Cocher les cases
  document.querySelectorAll("#matieresCheckboxes input").forEach((cb) => {
    cb.checked = matieresAssoc.includes(parseInt(cb.value));
  });
  document.getElementById("filiereModal").style.display = "flex";
}

async function supprimerFiliere(id) {
  if (!confirm("Supprimer cette filière ? Cette action est irréversible."))
    return;
  const res = await fetch(`${API_BASE}/filieres/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    showToast("Filière supprimée");
    chargerFilieres();
    if (document.getElementById("filiereId").value == id) fermerModal();
  } else {
    showToast("Erreur lors de la suppression", true);
  }
}

// Enregistrement
document.getElementById("filiereForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("filiereId").value;
  const nom = document.getElementById("nom").value.trim();
  const description = document.getElementById("description").value;
  if (!nom) return showToast("Le nom est requis", true);

  let filiereId;
  if (id) {
    const res = await fetch(`${API_BASE}/filieres/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nom, description }),
    });
    if (!res.ok) return showToast("Erreur mise à jour", true);
    filiereId = id;
    showToast("Filière modifiée");
  } else {
    const res = await fetch(`${API_BASE}/filieres`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nom, description }),
    });
    if (!res.ok) return showToast("Erreur création", true);
    const data = await res.json();
    filiereId = data.id;
    showToast("Filière créée");
  }

  // Gérer les associations matière-filière
  const selectedMatieres = [
    ...document.querySelectorAll("#matieresCheckboxes input:checked"),
  ].map((cb) => parseInt(cb.value));
  // Récupérer les associations existantes
  const assocRes = await fetch(`${API_BASE}/matieres-filieres`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const existing = await assocRes.json();
  const existingForFiliere = existing
    .filter((a) => a.filiere_id === filiereId)
    .map((a) => a.matiere_id);

  // Supprimer celles qui ne sont plus cochées
  for (let matId of existingForFiliere) {
    if (!selectedMatieres.includes(matId)) {
      await fetch(`${API_BASE}/matieres-filieres`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matiere_id: matId, filiere_id: filiereId }),
      });
    }
  }
  // Ajouter les nouvelles
  for (let matId of selectedMatieres) {
    if (!existingForFiliere.includes(matId)) {
      await fetch(`${API_BASE}/matieres-filieres`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matiere_id: matId, filiere_id: filiereId }),
      });
    }
  }

  chargerFilieres();
  fermerModal();
});

function fermerModal() {
  document.getElementById("filiereModal").style.display = "none";
  document.getElementById("filiereForm").reset();
  document.getElementById("filiereId").value = "";
  document.getElementById("modalTitle").innerText = "Ajouter une filière";
  document
    .querySelectorAll("#matieresCheckboxes input")
    .forEach((cb) => (cb.checked = false));
}

document.getElementById("openAddModal").addEventListener("click", () => {
  fermerModal(); // reset
  document.getElementById("filiereModal").style.display = "flex";
});
document
  .querySelectorAll(".close-modal, #cancelModal")
  .forEach((btn) => btn.addEventListener("click", fermerModal));
window.addEventListener("click", (e) => {
  if (e.target === document.getElementById("filiereModal")) fermerModal();
});

async function init() {
  await chargerToutesMatieres();
  await chargerFilieres();
}
init();
