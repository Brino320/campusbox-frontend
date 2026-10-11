// =====================================================
// NOTES.JS — Bulletin étudiant avec rangs
// =====================================================

const API_BASE = window.API_BASE || "http://localhost:3000/api";
const token = localStorage.getItem("token");
if (!token) window.location.href = "authentification.html";

// =====================================================
// HELPERS
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

function noteClass(note) {
  if (note === null || note === undefined) return "";
  if (note >= 14) return "note-good";
  if (note >= 10) return "note-mid";
  return "note-bad";
}

function formatRang(rangInfo) {
  if (!rangInfo) return "—";
  const { rang, total } = rangInfo;
  const suffix = rang === 1 ? "ᵉʳ" : "ᵉ";
  return `${rang}${suffix} / ${total}`;
}

function formatRangShort(rangInfo) {
  if (!rangInfo) return "—";
  return `${rangInfo.rang}ᵉ`;
}

// =====================================================
// INFOS UTILISATEUR
// =====================================================
function afficherInfosUtilisateur() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;
  try {
    const user = JSON.parse(userStr);
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || "—";
    };
    set("studentNom", user.nom);
    set("studentPrenom", user.prenom);
    set("studentFiliere", user.filiere);
    set("studentClasse", user.classe || "L1");

    const sidebarName = document.getElementById("sidebarUserName");
    if (sidebarName)
      sidebarName.textContent = `${user.prenom || ""} ${user.nom || ""}`.trim();
  } catch (e) {}
}

// =====================================================
// MODE SOMBRE
// =====================================================
function applySavedTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

// =====================================================
// SIDEBAR
// =====================================================
function initSidebarToggle() {
  const toggleBtn = document.getElementById("toggleSidebarBtn");
  const burgerBtn = document.getElementById("burgerBtn");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (!sidebar) return;

  const open = () => {
    sidebar.classList.add("open");
    if (overlay) overlay.classList.add("active");
  };
  const close = () => {
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
  };

  if (toggleBtn)
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.contains("open") ? close() : open();
    });
  if (burgerBtn)
    burgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      open();
    });
  if (overlay) overlay.addEventListener("click", close);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) close();
  });
}

function initDeconnexion() {
  const btn = document.getElementById("logoutBtnSidebar");
  if (btn)
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "../index.html";
    });
}

// =====================================================
// CHARGER LE BULLETIN
// =====================================================
async function chargerBulletin() {
  const tbody = document.getElementById("bulletinBody");
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}/etudiant/bulletin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur chargement bulletin");
    const data = await res.json();

    // Rangs généraux
    if (data.rang) {
      const rClasse = data.rang.classe;
      const rFiliere = data.rang.filiere;
      const rGlobal = data.rang.global;

      document.getElementById("rangClasseValue").textContent = rClasse
        ? `${rClasse.rang}ᵉ`
        : "—";
      document.getElementById("rangClasseTotal").textContent = rClasse
        ? `sur ${rClasse.total} étudiant(s)`
        : "";

      document.getElementById("rangFiliereValue").textContent = rFiliere
        ? `${rFiliere.rang}ᵉ`
        : "—";
      document.getElementById("rangFiliereTotal").textContent = rFiliere
        ? `sur ${rFiliere.total} étudiant(s)`
        : "";

      document.getElementById("rangGlobalValue").textContent = rGlobal
        ? `${rGlobal.rang}ᵉ`
        : "—";
      document.getElementById("rangGlobalTotal").textContent = rGlobal
        ? `sur ${rGlobal.total} étudiant(s)`
        : "";
    }

    // Moyenne générale
    const moyEl = document.getElementById("moyenneGenerale");
    if (data.moyenne_generale !== null && data.moyenne_generale !== undefined) {
      moyEl.textContent = data.moyenne_generale.toFixed(2);
      moyEl.className = "value " + noteClass(data.moyenne_generale);
    } else {
      moyEl.textContent = "—";
    }

    // Tableau matières
    if (!data.matieres || data.matieres.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#64748b;">Aucune note disponible pour le moment.</td></tr>';
      return;
    }

    let html = "";
    data.matieres.forEach((m) => {
      const moy = m.moyenne_examen;
      const pond = m.contribution;
      const cls = noteClass(moy);

      html += `
        <tr>
          <td><strong>${escapeHtml(m.nom)}</strong></td>
          <td>${m.coefficient}</td>
          <td class="${cls}">${moy !== null ? moy.toFixed(2) : "—"}</td>
          <td>${pond !== null ? pond.toFixed(2) : "—"}</td>
          <td><span class="rang-inline">${formatRangShort(m.rang_classe)}</span></td>
          <td><span class="rang-inline">${formatRangShort(m.rang_filiere)}</span></td>
          <td><span class="rang-inline">${formatRangShort(m.rang_global)}</span></td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  } catch (error) {
    console.error("❌ chargerBulletin:", error);
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#ef4444;">Erreur de chargement du bulletin</td></tr>';
  }
}

// =====================================================
// INIT
// =====================================================
function init() {
  afficherInfosUtilisateur();
  applySavedTheme();
  initSidebarToggle();
  initDeconnexion();
  chargerBulletin();
}

init();
