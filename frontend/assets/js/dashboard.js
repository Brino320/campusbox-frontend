// =====================================================
// DASHBOARD – Version complète avec graphique Chart.js
// + Filtre Semestre 1 / Semestre 2
// + Support mobile (burger menu)
// =====================================================

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

function getUserData() {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);
  return { prenom: "Mark", nom: "R.", filiere: "DGL", classe: "L1" };
}

function afficherInfosUtilisateur() {
  const user = getUserData();
  const welcomeSpan = document.getElementById("welcomeUser");
  const sidebarSpan = document.getElementById("sidebarUserName");
  if (welcomeSpan) welcomeSpan.innerText = user.prenom || "Étudiant";
  const niveau = user.classe || "L1";
  if (sidebarSpan)
    sidebarSpan.innerText = `${user.prenom} ${user.nom} (${niveau})`;
}

function initDeconnexion() {
  const btn = document.getElementById("logoutBtnSidebar");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "../index.html";
    });
  }
}

function verifierAuthentification() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (!token || !user) {
    window.location.href = "authentification.html";
    return false;
  }
  return true;
}

// =====================================================
// SEMESTRE ACTUEL (1 par défaut)
// =====================================================
let semestreActuel = 1;

// =====================================================
// CHARGEMENT DES MATIÈRES (avec filtre par semestre)
// =====================================================
async function chargerMatieres() {
  const container = document.getElementById("matieresList");
  if (!container) return;
  const token = localStorage.getItem("token");
  if (!token) {
    container.innerHTML = "<p>Veuillez vous reconnecter.</p>";
    return;
  }

  container.innerHTML = "<p>Chargement du programme...</p>";

  try {
    const response = await fetch(
      `${window.API_BASE}/matieres?semestre=${semestreActuel}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) throw new Error("Erreur chargement matières");
    const matieres = await response.json();
    container.innerHTML = "";

    // Mettre à jour le titre du programme
    const user = getUserData();
    const titreSection = document.querySelector(".programme-section h2");
    if (titreSection) {
      const niveauLabel =
        user.classe === "L1"
          ? "Licence 1"
          : user.classe === "L2"
            ? "Licence 2"
            : user.classe === "L3"
              ? "Licence 3"
              : "Licence 1";
      titreSection.innerText = `📚 Programme – ${niveauLabel} (${user.filiere}) – Semestre ${semestreActuel}`;
    }

    if (matieres.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:2rem; color:#64748b;">
          <p style="font-size:1.1rem;">📭 Aucune matière disponible pour le Semestre ${semestreActuel}.</p>
          <p style="font-size:0.9rem; margin-top:0.5rem;">Le programme de ce semestre sera bientôt disponible.</p>
        </div>`;
      return;
    }

    matieres.forEach((m) => {
      const div = document.createElement("div");
      div.className = "matiere-item";
      div.setAttribute("data-matiere-id", m.id);
      div.innerHTML = `
        <div class="matiere-nom">${escapeHtml(m.nom)}</div>
        <div class="matiere-desc">${escapeHtml(m.description || "")}</div>
      `;
      div.addEventListener("click", () => {
        window.location.href = `cours.html?matiere_id=${m.id}`;
      });
      container.appendChild(div);
    });

    // Recharger la progression sur les nouvelles matières affichées
    await chargerProgression();
  } catch (error) {
    container.innerHTML = "<p>Erreur chargement des matières.</p>";
    console.error(error);
  }
}

// =====================================================
// GESTION DES ONGLETS S1 / S2
// =====================================================
function initSemestreTabs() {
  const tabs = document.querySelectorAll(".semestre-tab");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", async () => {
      const s = parseInt(tab.dataset.semestre, 10);
      if (s === semestreActuel) return;
      semestreActuel = s;
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      await chargerMatieres();
    });
  });
}

// =====================================================
// PROGRESSION (exercices réussis)
// =====================================================
async function chargerProgression() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const response = await fetch(`${window.API_BASE}/progression`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const progressionData = await response.json();
    if (response.ok) {
      progressionData.forEach((prog) => {
        const matiereCard = document.querySelector(
          `.matiere-item[data-matiere-id="${prog.matiere_id}"]`,
        );
        if (matiereCard) {
          let statsSpan = matiereCard.querySelector(".progression-stats");
          if (!statsSpan) {
            statsSpan = document.createElement("div");
            statsSpan.className = "progression-stats";
            statsSpan.style.fontSize = "0.75rem";
            statsSpan.style.marginTop = "0.3rem";
            statsSpan.style.color = "#2563eb";
            matiereCard.appendChild(statsSpan);
          }
          statsSpan.innerText = `📊 ${prog.exercices_reussis}/${prog.total_exercices} exercices réussis`;
        }
      });
    }
  } catch (error) {
    console.error("Erreur chargement progression", error);
  }
}

// =====================================================
// STATISTIQUES QUIZ + GRAPHIQUE
// =====================================================
let chartInstance = null;

async function chargerStatsQuiz() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const response = await fetch(`${window.API_BASE}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const stats = await response.json();
      const progressionCard = document.querySelector(
        ".stat-card:nth-child(1) .stat-value",
      );
      const quizReussisCard = document.querySelector(
        ".stat-card:nth-child(2) .stat-value",
      );
      const moyenneCard = document.querySelector(
        ".stat-card:nth-child(3) .stat-value",
      );
      if (progressionCard) progressionCard.innerText = `${stats.progression}%`;
      if (quizReussisCard)
        quizReussisCard.innerText = `${stats.quiz_reussis}/${stats.total_quiz}`;
      if (moyenneCard) moyenneCard.innerText = `${stats.moyenne}%`;
      if (typeof Chart !== "undefined") {
        dessinerGraphique(stats);
      } else {
        console.warn("Chart.js non chargé");
      }
    }
  } catch (error) {
    console.error("Erreur chargement stats quiz", error);
  }
}

function dessinerGraphique(stats) {
  const ctx = document.getElementById("quizChart");
  if (!ctx) {
    console.warn("Canvas #quizChart introuvable");
    return;
  }
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Progression", "Quiz réussis (%)", "Moyenne"],
      datasets: [
        {
          label: "Pourcentage (%)",
          data: [
            stats.progression,
            stats.total_quiz > 0
              ? (stats.quiz_reussis / stats.total_quiz) * 100
              : 0,
            stats.moyenne,
          ],
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // ✅ essentiel pour respecter la hauteur du wrapper
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: "Pourcentage" },
        },
      },
      plugins: {
        tooltip: { callbacks: { label: (ctx) => `${ctx.raw}%` } },
      },
    },
  });
}

// =====================================================
// SIDEBAR TOGGLE (desktop + mobile) + MODE SOMBRE
// =====================================================
function initSidebarToggle() {
  const toggleBtn = document.getElementById("toggleSidebarBtn");
  const burgerBtn = document.getElementById("burgerBtn"); // ✅ Bouton mobile
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

  // Bouton dans l'en-tête de la sidebar (visible sur toutes tailles)
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (sidebar.classList.contains("open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  // ✅ Bouton burger flottant (uniquement mobile)
  if (burgerBtn) {
    burgerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      openSidebar();
    });
  }

  // Clic sur l'overlay → fermer
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  // Repasser en desktop → fermer la sidebar mobile
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      closeSidebar();
    }
  });
}

function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

// =====================================================
// INITIALISATION
// =====================================================
async function init() {
  if (!verifierAuthentification()) return;
  afficherInfosUtilisateur();
  initDeconnexion();
  initSemestreTabs();
  await chargerMatieres();
  await chargerStatsQuiz();
  initSidebarToggle();
  applySavedTheme();
}

init();
