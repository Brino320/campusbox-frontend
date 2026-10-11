// =====================================================
// PASSER EXAMEN - JS (avec détail des bonnes/mauvaises réponses)
// =====================================================

const API_BASE = window.API_BASE || "http://localhost:3000/api";
const token = localStorage.getItem("token");
if (!token) window.location.href = "authentification.html";

const urlParams = new URLSearchParams(window.location.search);
const evaluationId = urlParams.get("evaluation_id");
let currentExamenId = null;
let questionsData = [];

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
  const logoutBtn = document.getElementById("logoutBtnSidebar");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
}

// =====================================================
// CHARGER L'EXAMEN
// =====================================================
async function chargerExamen() {
  if (!evaluationId) {
    document.getElementById("examenTitre").innerText = "Examen non spécifié";
    return;
  }
  currentExamenId = evaluationId;

  try {
    const evalRes = await fetch(`${API_BASE}/evaluations/${evaluationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!evalRes.ok) throw new Error("Évaluation non trouvée");
    const evaluation = await evalRes.json();

    document.getElementById("examenTitre").innerText = evaluation.titre;
    document.getElementById("examenDescription").innerText =
      evaluation.description || "";

    const questionsRes = await fetch(
      `${API_BASE}/examens/${evaluationId}/questions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!questionsRes.ok) throw new Error("Questions non trouvées");
    questionsData = await questionsRes.json();

    if (questionsData.length === 0) {
      document.getElementById("examenTitre").innerText =
        "Aucune question pour cet examen";
      return;
    }

    const totalPoints = questionsData.reduce((s, q) => s + (q.points || 1), 0);
    const header = document.getElementById("examenTitre");
    if (header) {
      const meta = document.createElement("p");
      meta.style.cssText =
        "font-size:0.9rem; color:#64748b; margin-top:0.3rem;";
      meta.textContent = `${questionsData.length} questions — ${totalPoints} points — Note finale sur 20`;
      header.parentElement.insertBefore(meta, header.nextSibling);
    }

    afficherQuestions(questionsData);
  } catch (err) {
    console.error(err);
    document.getElementById("examenTitre").innerText =
      `Erreur : ${err.message}`;
  }
}

function afficherQuestions(questions) {
  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";

  questions.forEach((q, idx) => {
    const div = document.createElement("div");
    div.className = "question-item";

    const points = q.points || 1;
    const pointsLabel = points > 1 ? `${points} pts` : "1 pt";
    const pointsColor =
      points >= 3 ? "#ef4444" : points >= 2 ? "#f59e0b" : "#10b981";

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:start; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.5rem;">
        <p class="question-text" style="margin:0; flex:1;">
          <strong>Question ${idx + 1}</strong> : ${escapeHtml(q.question_text)}
        </p>
        <span style="background:${pointsColor}; color:white; padding:0.2rem 0.6rem; border-radius:1rem; font-size:0.75rem; font-weight:600; white-space:nowrap;">
          ${pointsLabel}
        </span>
      </div>
    `;

    const optionsDiv = document.createElement("div");
    optionsDiv.className = "options";

    if (q.type === "qcm" || q.type === "vrai_faux") {
      q.reponses.forEach((rep) => {
        const label = document.createElement("label");
        label.className = "option-label";
        label.innerHTML = `
          <input type="radio" name="q_${q.id}" value="${rep.id}">
          <span>${escapeHtml(rep.reponse_text)}</span>
        `;
        optionsDiv.appendChild(label);
      });
    }
    div.appendChild(optionsDiv);
    container.appendChild(div);
  });
}

// =====================================================
// SOUMETTRE L'EXAMEN
// =====================================================
function initSubmit() {
  const form = document.getElementById("examenForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const reponses = {};
    questionsData.forEach((q) => {
      const selected = document.querySelector(
        `input[name="q_${q.id}"]:checked`,
      );
      if (selected) reponses[q.id] = parseInt(selected.value);
    });

    try {
      const submitRes = await fetch(
        `${API_BASE}/examens/${currentExamenId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reponses, questions: questionsData }),
        },
      );
      const data = await submitRes.json();

      if (submitRes.ok) {
        const noteSur20 = data.note_sur_20 || (data.pourcentage / 100) * 20;

        document.getElementById("examenForm").style.display = "none";
        document.getElementById("examenResult").style.display = "block";
        document.getElementById("scoreSpan").innerText = data.score;
        document.getElementById("totalSpan").innerText = data.total;
        document.getElementById("pourcentageSpan").innerText = Math.round(
          data.pourcentage,
        );
        document.getElementById("noteSpan").innerText =
          parseFloat(noteSur20).toFixed(2);

        // ✅ Afficher le récap détaillé
        afficherRecapDetaille(data.details, reponses);
      } else {
        alert(data.error || "Erreur lors de la soumission");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau lors de la soumission");
    }
  });
}

// =====================================================
// RÉCAP DÉTAILLÉ
// =====================================================
function afficherRecapDetaille(details, reponsesUtilisateur) {
  if (!details || details.length === 0) return;

  const container = document.getElementById("examenResult");
  let okCount = 0;
  let koCount = 0;

  let html = `
    <hr style="margin: 1.5rem 0;">
    <h2 style="margin-bottom: 1rem;">📋 Récapitulatif détaillé</h2>
    <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
      <div style="background: #d1fae5; color: #065f46; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600;">
        ✅ Bonnes réponses : <span id="okCount">0</span>
      </div>
      <div style="background: #fee2e2; color: #991b1b; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600;">
        ❌ Mauvaises réponses : <span id="koCount">0</span>
      </div>
    </div>
  `;

  details.forEach((d, idx) => {
    if (d.est_correcte) okCount++;
    else koCount++;

    const bgColor = d.est_correcte ? "#ecfdf5" : "#fef2f2";
    const borderColor = d.est_correcte ? "#10b981" : "#ef4444";
    const icon = d.est_correcte ? "✅" : "❌";

    html += `
      <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem; flex-wrap: wrap;">
          <strong style="flex: 1;">${icon} Question ${idx + 1} — ${escapeHtml(d.question_text)}</strong>
          <span style="background: ${borderColor}; color: white; padding: 0.15rem 0.5rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">
            ${d.points} pt${d.points > 1 ? "s" : ""}
          </span>
        </div>
        <div style="margin-top: 0.5rem; font-size: 0.9rem;">
    `;

    // Afficher les réponses avec indication
    if (d.reponses && d.reponses.length > 0) {
      d.reponses.forEach((r) => {
        const estLaBonne = r.id === d.bonne_reponse_id;
        const estChoisie = r.id === d.reponse_donnee_id;

        let label = "";
        let style = "color: #475569;";
        if (estLaBonne) {
          label = " ✅ (bonne réponse)";
          style = "color: #065f46; font-weight: 600;";
        }
        if (estChoisie && !estLaBonne) {
          label = " ❌ (votre choix)";
          style =
            "color: #991b1b; font-weight: 600; text-decoration: line-through;";
        }
        if (estChoisie && estLaBonne) {
          label = " ✅ (votre choix — correct)";
        }

        html += `
          <div style="${style} padding: 0.2rem 0;">
            • ${escapeHtml(r.reponse_text)}${label}
          </div>
        `;
      });
    }

    // Cas où l'étudiant n'a pas répondu
    if (!d.reponse_donnee_id) {
      html += `<div style="color: #f59e0b; font-style: italic; margin-top: 0.3rem;">⚠️ Aucune réponse donnée</div>`;
    }

    html += `</div></div>`;
  });

  // Ajouter au container après le bloc résultat
  const recapDiv = document.createElement("div");
  recapDiv.innerHTML = html;
  container.appendChild(recapDiv);

  // Mettre à jour les compteurs
  const okEl = document.getElementById("okCount");
  const koEl = document.getElementById("koCount");
  if (okEl) okEl.textContent = okCount;
  if (koEl) koEl.textContent = koCount;

  // Scroll vers le récap
  recapDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initBackBtn() {
  const btn = document.getElementById("backToListBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "examens.html";
    });
  }
}

function init() {
  initSidebarToggle();
  initDeconnexion();
  initSubmit();
  initBackBtn();
  chargerExamen();
}

init();
