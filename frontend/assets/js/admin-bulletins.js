// =====================================================
// ADMIN : Visualisation du bulletin d'un étudiant
// =====================================================

const API_BASE = window.API_BASE || "http://localhost:3000/api";
const token = localStorage.getItem("token");
if (!token) window.location.href = "../pages/authentification.html";

// Récupérer l'ID depuis l'URL
const params = new URLSearchParams(window.location.search);
const userId = params.get("user_id");
if (!userId) {
  alert("Aucun étudiant sélectionné.");
  window.location.href = "etudiants.html";
}

// Charger les infos de l'étudiant
async function chargerInfosEtudiant() {
  try {
    const res = await fetch(`${API_BASE}/admin/utilisateur/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    document.getElementById("sNom").textContent = data.nom || "—";
    document.getElementById("sPrenom").textContent = data.prenom || "—";
    document.getElementById("sClasse").textContent = data.classe || "—";
    document.getElementById("sFiliere").textContent = data.filiere || "—";
    document.getElementById("studentInfo").style.display = "flex";
  } catch (error) {
    console.error(error);
  }
}

// Charger le bulletin
async function chargerBulletin() {
  const tbody = document.getElementById("bulletinBody");
  const moyenneDiv = document.getElementById("moyenneGenerale");

  try {
    const res = await fetch(`${API_BASE}/admin/bulletin/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur chargement");
    const data = await res.json();

    if (!data.matieres || data.matieres.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6">Aucune note pour cet étudiant.</td></tr>';
      moyenneDiv.innerHTML = "";
      return;
    }

    let html = "";
    data.matieres.forEach((m) => {
      const devoir =
        m.moyenne_devoir !== null ? m.moyenne_devoir.toFixed(2) : "—";
      const examen =
        m.moyenne_examen !== null ? m.moyenne_examen.toFixed(2) : "—";
      const finale = m.note_finale !== null ? m.note_finale.toFixed(2) : "—";
      const ponderee =
        m.contribution !== null ? m.contribution.toFixed(2) : "—";
      html += `
                <tr>
                    <td>${escapeHtml(m.nom)}</td>
                    <td>${m.coefficient}</td>
                    <td>${devoir}</td>
                    <td>${examen}</td>
                    <td><strong>${finale}</strong></td>
                    <td>${ponderee}</td>
                </tr>
            `;
    });
    tbody.innerHTML = html;
    moyenneDiv.innerHTML = `📈 Moyenne générale : ${data.moyenne_generale || "—"} / 20`;
  } catch (error) {
    console.error(error);
    tbody.innerHTML = '<tr><td colspan="6">Erreur de chargement</td></tr>';
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, (m) =>
    m === "&" ? "&amp;" : m === "<" ? "&lt;" : "&gt;",
  );
}

// Retour
document.getElementById("btnRetour").addEventListener("click", () => {
  window.location.href = "etudiants.html";
});

// Export PDF (à implémenter avec html2pdf.js)
document.getElementById("btnExportPDF").addEventListener("click", () => {
  alert("Fonctionnalité à venir.");
});

// Mode sombre
function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") document.body.classList.add("dark-mode");
  else document.body.classList.remove("dark-mode");
}
applySavedTheme();

// Initialisation
chargerInfosEtudiant();
chargerBulletin();
