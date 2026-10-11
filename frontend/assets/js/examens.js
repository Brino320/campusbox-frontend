// =====================================================
// EXAMENS ÉTUDIANT - Liste disponibles + passés + retake BIM
// =====================================================

const API_BASE = window.API_BASE || "http://localhost:3000/api";
const token = localStorage.getItem("token");
if (!token) window.location.href = "authentification.html";

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
// SIDEBAR
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

  if (toggleBtn)
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
    });
  if (burgerBtn)
    burgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openSidebar();
    });
  if (overlay) overlay.addEventListener("click", closeSidebar);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeSidebar();
  });
}

function initDeconnexion() {
  const btn = document.getElementById("logoutBtnSidebar");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
}

function mettreAJourNomUtilisateur() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;
  try {
    const user = JSON.parse(userStr);
    const el = document.getElementById("sidebarUserName");
    if (el) el.textContent = `${user.prenom || ""} ${user.nom || ""}`.trim();
  } catch (e) {}
}

// =====================================================
// CHARGEMENT DES EXAMENS + BIM
// =====================================================
async function chargerExamens() {
  const container = document.getElementById("examensContainer");
  if (!container) return;

  try {
    // 3 appels en parallèle : dispos, passés, solde BIM
    const [resDispo, resPasses, resBim] = await Promise.all([
      fetch(`${API_BASE}/etudiant/examens-disponibles`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/etudiant/examens-passes`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/bims/mon-portefeuille`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null),
    ]);

    const dispo = await resDispo.json();
    const passes = await resPasses.json();
    let soldeBim = 0;
    if (resBim && resBim.ok) {
      const bimData = await resBim.json();
      soldeBim = bimData.solde || 0;
    }

    let html = "";

    // --- Bandeau solde BIM ---
    html += `
      <div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;padding:1rem 1.2rem;border-radius:1rem;margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
        <div>
          <div style="font-size:0.85rem;opacity:0.9;text-transform:uppercase;letter-spacing:0.05em;">Mon solde BIM</div>
          <div style="font-size:2rem;font-weight:800;line-height:1.1;">${soldeBim} BIM</div>
          <div style="font-size:0.8rem;opacity:0.85;margin-top:0.2rem;">1 BIM = 1 nouvelle tentative d'examen</div>
        </div>
        <a href="compte.html" style="background:white;color:#3b82f6;padding:0.5rem 1rem;border-radius:0.5rem;text-decoration:none;font-weight:600;font-size:0.9rem;">
          💎 Mon portefeuille
        </a>
      </div>
    `;

    // --- Section disponibles ---
    html += `<h2 style="margin-bottom:1rem;">🟢 Examens à passer</h2>`;
    if (!Array.isArray(dispo) || dispo.length === 0) {
      html += `<p style="color:#94a3b8;margin-bottom:2rem;">Aucun examen disponible.</p>`;
    } else {
      dispo.forEach((e) => {
        html += `
          <div class="exam-card">
            <h3>${escapeHtml(e.titre)}</h3>
            <p>Matière : <strong>${escapeHtml(e.matiere_nom)}</strong></p>
            <p>${escapeHtml(e.description || "")}</p>
            <p class="exam-date">📅 ${e.date_evaluation ? new Date(e.date_evaluation).toLocaleDateString("fr-FR") : "—"} — ${e.nb_questions} question(s) — Coefficient ${e.coefficient}</p>
            <button class="btn-passer-examen" data-id="${e.id}" data-retake="0">▶ Passer l'examen</button>
            <span class="badge-gratuit">🎁 1ère tentative gratuite</span>
          </div>
        `;
      });
    }

    // --- Section passés ---
    html += `<h2 style="margin:2rem 0 1rem;">✅ Examens déjà passés</h2>`;
    if (!Array.isArray(passes) || passes.length === 0) {
      html += `<p style="color:#94a3b8;">Aucun examen passé.</p>`;
    } else {
      passes.forEach((e) => {
        const noteSur20 =
          e.note_max_sur > 0
            ? ((e.note_obtenue / e.note_max_sur) * 20).toFixed(2)
            : e.note_obtenue;
        const noteColor =
          noteSur20 >= 14 ? "#10b981" : noteSur20 >= 10 ? "#f59e0b" : "#ef4444";
        const hasBim = soldeBim >= 1;

        html += `
          <div class="exam-card">
            <h3>${escapeHtml(e.titre)}</h3>
            <p>Matière : <strong>${escapeHtml(e.matiere_nom)}</strong></p>
            <p class="exam-date">📅 ${e.date_evaluation ? new Date(e.date_evaluation).toLocaleDateString("fr-FR") : "—"}</p>
            <p class="note" style="color:${noteColor}">🎯 Note : ${noteSur20}/20</p>
            ${
              hasBim
                ? `<button class="btn-passer-examen btn-retake" data-id="${e.id}" data-retake="1">
                    🔄 Repasser (1 BIM)
                  </button>
                  <span class="badge-solde">💎 Solde : ${soldeBim} BIM</span>`
                : `<button class="btn-passer-examen btn-retake btn-no-bim" data-id="${e.id}" data-retake="1">
                    🔄 Repasser (1 BIM)
                  </button>
                  <span class="badge-solde badge-no-bim">⚠️ Solde insuffisant</span>
                  <a href="compte.html" class="btn-obtenir-bim">💰 Obtenir des BIM</a>`
            }
          </div>
        `;
      });
    }

    container.innerHTML = html;

    // Bind listeners
    document.querySelectorAll(".btn-passer-examen").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const isRetake = btn.dataset.retake === "1";

        if (isRetake) {
          await handleRetake(id);
        } else {
          window.location.href = `passer-examen.html?evaluation_id=${id}`;
        }
      });
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>❌ Erreur de chargement des examens</p>";
  }
}

// =====================================================
// GESTION DU RETAKE (vérif BIM + confirm)
// =====================================================
async function handleRetake(examenId) {
  try {
    // 1. Vérifier avec le serveur
    const res = await fetch(`${API_BASE}/examens/${examenId}/peut-repasser`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // Route pas encore disponible → fallback : vérifier via le portefeuille
      const fallback = await verifierBimFallback();
      if (!fallback.hasBim) {
        return proposerObtentionBim(fallback.solde);
      }
      if (
        !confirm(
          `⚠️ Cette tentative coûtera 1 BIM.\n\nSolde : ${fallback.solde} BIM\n\nConfirmer ?`,
        )
      )
        return;
      window.location.href = `passer-examen.html?evaluation_id=${examenId}`;
      return;
    }

    const data = await res.json();

    // 2. Vérifier le solde
    if (!data.can_retake) {
      if (data.solde_bim < 1) {
        return proposerObtentionBim(data.solde_bim, data.attempts_done);
      }
      alert("❌ Vous ne pouvez pas repasser cet examen.");
      return;
    }

    // 3. Confirmation
    const msg =
      `⚠️ Cette tentative coûtera 1 BIM.\n\n` +
      `Solde actuel : ${data.solde_bim} BIM\n` +
      `Tentatives déjà faites : ${data.attempts_done}\n` +
      `Prochaine tentative : n°${data.next_attempt_number}\n\n` +
      `Confirmer ?`;

    if (!confirm(msg)) return;

    // 4. Rediriger vers la page d'examen
    window.location.href = `passer-examen.html?evaluation_id=${examenId}`;
  } catch (err) {
    console.error("❌ handleRetake:", err);
    // Fallback : demander au portefeuille
    const fallback = await verifierBimFallback();
    if (!fallback.hasBim) return proposerObtentionBim(fallback.solde);
    if (!confirm(`⚠️ Cette tentative coûtera 1 BIM.\n\nConfirmer ?`)) return;
    window.location.href = `passer-examen.html?evaluation_id=${examenId}`;
  }
}

async function verifierBimFallback() {
  try {
    const res = await fetch(`${API_BASE}/bims/mon-portefeuille`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { hasBim: false, solde: 0 };
    const data = await res.json();
    return { hasBim: (data.solde || 0) >= 1, solde: data.solde || 0 };
  } catch {
    return { hasBim: false, solde: 0 };
  }
}

function proposerObtentionBim(solde, attempts = null) {
  let msg = `❌ Vous devez avoir au moins 1 BIM pour repasser cet examen.\n\n`;
  msg += `Solde actuel : ${solde} BIM\n`;
  if (attempts !== null) {
    msg += `Tentatives déjà faites : ${attempts}\n`;
  }
  msg += `\nVoulez-vous aller sur votre portefeuille BIM pour en obtenir ?`;

  if (confirm(msg)) {
    window.location.href = "compte.html";
  }
}

// =====================================================
// INIT
// =====================================================
function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (
    theme === "dark" ||
    (theme === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

function init() {
  applySavedTheme();
  initSidebarToggle();
  initDeconnexion();
  mettreAJourNomUtilisateur();
  chargerExamens();
}

init();
