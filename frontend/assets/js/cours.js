// =====================================================
// COURS.JS - Affichage des chapitres et gestion des exercices
// Version avec marquage des chapitres terminés + support mobile
// =====================================================

function getMatiereId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("matiere_id");
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

// Mode sombre
function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

// =====================================================
// CHAPITRES TERMINÉS
// =====================================================
let completedChapitres = [];

async function loadCompletedChapitres() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const response = await fetch(`${window.API_BASE}/chapitres-completed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      completedChapitres = await response.json();
    }
  } catch (error) {
    console.error("Erreur chargement chapitres terminés", error);
  }
}

async function markChapitreComplete(chapitreId, buttonElement) {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const response = await fetch(`${window.API_BASE}/chapitre/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ chapitre_id: chapitreId }),
    });
    if (response.ok) {
      buttonElement.textContent = "✅ Terminé";
      buttonElement.disabled = true;
      buttonElement.style.background = "#10b981";
      if (!completedChapitres.includes(chapitreId)) {
        completedChapitres.push(chapitreId);
      }
    } else {
      const err = await response.json();
      alert("Erreur lors du marquage : " + (err.error || "Inconnue"));
    }
  } catch (error) {
    console.error(error);
    alert("Erreur réseau");
  }
}

// =====================================================
// AFFICHAGE DU COURS
// =====================================================
async function afficherCours(matiereId) {
  const titreEl = document.getElementById("coursTitre");
  const metaEl = document.getElementById("coursMeta");
  const container = document.getElementById("chapitresContainer");

  try {
    const response = await fetch(`${window.API_BASE}/cours/${matiereId}`);
    if (!response.ok) throw new Error("Cours non trouvé");
    const cours = await response.json();

    titreEl.innerText = cours.titre;
    metaEl.innerText = `Matière : ${cours.matiere}`;
    container.innerHTML = "";

    if (cours.chapitres.length === 0) {
      container.innerHTML =
        "<p>Aucun chapitre pour cette matière pour le moment.</p>";
      return;
    }

    cours.chapitres.forEach((chapitre, idx) => {
      const chapitreDiv = document.createElement("div");
      chapitreDiv.className = "chapitre-item";

      const titreDiv = document.createElement("div");
      titreDiv.className = "chapitre-titre";
      titreDiv.innerHTML = `<h2>${escapeHtml(chapitre.titre)}</h2><span class="icone">▼</span>`;

      const contenuDiv = document.createElement("div");
      contenuDiv.className = "chapitre-contenu";

      // --- Contenu HTML du chapitre ---
      const texteDiv = document.createElement("div");
      texteDiv.className = "contenu-texte";
      if (chapitre.contenu_html && chapitre.contenu_html.trim() !== "") {
        texteDiv.innerHTML = chapitre.contenu_html;
      } else {
        texteDiv.innerHTML =
          "<p><em>⚠️ Aucun contenu pour ce chapitre.</em></p>";
      }
      contenuDiv.appendChild(texteDiv);

      // --- Exercices ---
      if (chapitre.exercices && chapitre.exercices.length > 0) {
        const exoSection = document.createElement("div");
        exoSection.className = "exercices-section";
        exoSection.innerHTML = "<h3>📝 Exercices</h3>";
        chapitre.exercices.forEach((ex, exIdx) => {
          const exDiv = document.createElement("div");
          exDiv.className = "exercice";
          const exerciceId = ex.id;

          if (ex.type === "qcm") {
            let radiosHtml = "";
            ex.options.forEach((opt, optIdx) => {
              radiosHtml += `
                <label class="option-label">
                  <input type="radio" name="qcm_${idx}_${exIdx}" value="${optIdx}">
                  <span>${escapeHtml(opt)}</span>
                </label>`;
            });
            exDiv.innerHTML = `
              <p class="exercice-question"><strong>Exercice ${exIdx + 1} (QCM)</strong> : ${escapeHtml(ex.question)}</p>
              <div class="options">${radiosHtml}</div>
              <div class="exercice-actions">
                <button class="btn-valider">Valider</button>
                <button class="btn-correction">Voir la correction</button>
              </div>
              <div class="correction" style="display:none;">${escapeHtml(ex.correction)}</div>
              <div class="feedback"></div>
            `;
            const validerBtn = exDiv.querySelector(".btn-valider");
            validerBtn.addEventListener("click", async () => {
              const selected = exDiv.querySelector(
                `input[name="qcm_${idx}_${exIdx}"]:checked`,
              );
              if (!selected) {
                alert("Choisissez une réponse");
                return;
              }
              const reponse_qcm = parseInt(selected.value);
              const token = localStorage.getItem("token");
              try {
                const resp = await fetch(`${window.API_BASE}/reponse`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    exercice_id: exerciceId,
                    reponse_qcm,
                  }),
                });
                const data = await resp.json();
                const feedbackDiv = exDiv.querySelector(".feedback");
                if (data.correct) {
                  feedbackDiv.innerHTML = "✅ Bonne réponse !";
                  feedbackDiv.style.color = "green";
                } else {
                  feedbackDiv.innerHTML =
                    "❌ Mauvaise réponse. Voir la correction.";
                  feedbackDiv.style.color = "red";
                }
              } catch (err) {
                alert("Erreur lors de l'envoi");
              }
            });
          } else if (ex.type === "ouvert") {
            exDiv.innerHTML = `
              <p class="exercice-question"><strong>Exercice ${exIdx + 1} (Question ouverte)</strong> : ${escapeHtml(ex.question)}</p>
              <textarea class="reponse-texte" rows="3" placeholder="Votre réponse..."></textarea>
              <div class="exercice-actions">
                <button class="btn-valider">Soumettre</button>
                <button class="btn-correction">Voir la correction</button>
              </div>
              <div class="correction" style="display:none;">${escapeHtml(ex.correction)}</div>
              <div class="feedback"></div>
            `;
            const soumettreBtn = exDiv.querySelector(".btn-valider");
            soumettreBtn.addEventListener("click", async () => {
              const texte = exDiv.querySelector(".reponse-texte").value.trim();
              if (!texte) {
                alert("Veuillez écrire une réponse");
                return;
              }
              const token = localStorage.getItem("token");
              try {
                await fetch(`${window.API_BASE}/reponse`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    exercice_id: exerciceId,
                    reponse_texte: texte,
                  }),
                });
                const feedbackDiv = exDiv.querySelector(".feedback");
                feedbackDiv.innerHTML = "📝 Réponse enregistrée !";
                feedbackDiv.style.color = "blue";
              } catch (err) {
                alert("Erreur lors de l'envoi");
              }
            });
          }

          // Bouton "Voir la correction" (commun aux deux types)
          const correctionBtn = exDiv.querySelector(".btn-correction");
          if (correctionBtn) {
            correctionBtn.addEventListener("click", () => {
              const correctionDiv = exDiv.querySelector(".correction");
              if (correctionDiv.style.display === "none") {
                correctionDiv.style.display = "block";
                correctionBtn.textContent = "Masquer la correction";
              } else {
                correctionDiv.style.display = "none";
                correctionBtn.textContent = "Voir la correction";
              }
            });
          }

          exoSection.appendChild(exDiv);
        });
        contenuDiv.appendChild(exoSection);
      }

      // --- Bouton "Marquer comme terminé" ---
      const chapitreId = chapitre.id;
      const isCompleted = completedChapitres.includes(chapitreId);
      const completeButton = document.createElement("button");
      completeButton.textContent = isCompleted
        ? "✅ Terminé"
        : "🏁 Marquer comme terminé";
      completeButton.className = "btn-complete";
      if (isCompleted) {
        completeButton.disabled = true;
        completeButton.style.background = "#10b981";
        completeButton.style.color = "white";
      } else {
        completeButton.style.background = "#6b7280";
        completeButton.style.color = "white";
        completeButton.addEventListener("click", () =>
          markChapitreComplete(chapitreId, completeButton),
        );
      }
      contenuDiv.appendChild(completeButton);

      chapitreDiv.appendChild(titreDiv);
      chapitreDiv.appendChild(contenuDiv);
      container.appendChild(chapitreDiv);

      // Ouvrir / fermer le chapitre
      titreDiv.addEventListener("click", () => {
        const isOpen = contenuDiv.classList.contains("ouvert");
        contenuDiv.classList.toggle("ouvert");
        const icone = titreDiv.querySelector(".icone");
        icone.textContent = isOpen ? "▼" : "▲";
      });
    });
  } catch (error) {
    console.error(error);
    titreEl.innerText = "Cours non disponible";
    metaEl.innerText = "Le contenu n'a pas pu être chargé.";
    container.innerHTML = "<p>Veuillez réessayer plus tard.</p>";
  }
}

// =====================================================
// CHARGER LES DEVOIRS DE FIN DE LEÇON
// =====================================================
async function chargerDevoirs(matiereId) {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const response = await fetch(
      `${window.API_BASE}/etudiant/devoirs/${matiereId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const devoirs = await response.json();
    const container = document.getElementById("devoirsContainer");
    if (!container) return;
    if (!devoirs || devoirs.length === 0) {
      container.innerHTML = "";
      return;
    }
    let html = `<div class="devoirs-section">
      <h3>📝 Devoirs de fin de leçon</h3>`;
    devoirs.forEach((d) => {
      html += `
        <div class="devoir-item">
          <strong>${escapeHtml(d.titre)}</strong>
          <p>${escapeHtml(d.description || "")}</p>
          <button class="btn-passer-devoir btn-primary" data-id="${d.id}">▶ Passer le devoir</button>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;

    document.querySelectorAll(".btn-passer-devoir").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = `passer-devoir.html?devoir_id=${btn.dataset.id}`;
      });
    });
  } catch (error) {
    console.error("Erreur chargement devoirs", error);
  }
}

// =====================================================
// SIDEBAR TOGGLE (desktop + mobile)
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

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
    });
  }

  if (burgerBtn) {
    burgerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      openSidebar();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      closeSidebar();
    }
  });
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

function initUserInfo() {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    const sidebarName = document.getElementById("sidebarUserName");
    if (sidebarName) sidebarName.innerText = `${user.prenom} ${user.nom}`;
    const welcomeSpan = document.getElementById("welcomeUser");
    if (welcomeSpan) welcomeSpan.innerText = user.prenom;
  }
}

// =====================================================
// INITIALISATION
// =====================================================
async function init() {
  applySavedTheme();
  initUserInfo();
  initSidebarToggle();
  initDeconnexion();

  const matiereId = getMatiereId();
  if (matiereId) {
    await loadCompletedChapitres();
    await afficherCours(matiereId);
    await chargerDevoirs(matiereId);
  } else {
    document.getElementById("coursTitre").innerText = "Aucun cours sélectionné";
    document.getElementById("chapitresContainer").innerHTML =
      "<p>Veuillez choisir une matière depuis le tableau de bord.</p>";
  }
}

init();
