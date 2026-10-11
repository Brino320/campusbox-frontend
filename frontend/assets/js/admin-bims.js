// =====================================================
// ADMIN BIM — Gestion du système de monnaie virtuelle
// =====================================================

const token = localStorage.getItem("token");
if (!token) window.location.href = "../pages/authentification.html";

const $ = (id) => document.getElementById(id);

let etudiantsCache = [];
let soldesCache = {};
let offreEnEdition = null;
let actionCible = null;
let sortSolde = "desc";

// =====================================================
// UTILITAIRES
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

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showMsg(el, text, type = "success") {
  if (!el) return;
  el.textContent = text;
  el.className = `message ${type}`;
  el.style.display = "block";
  if (type === "success") setTimeout(() => (el.style.display = "none"), 3000);
}

// =====================================================
// KPIs
// =====================================================
async function chargerKPIs() {
  try {
    const [resEtudiants, resDemandes, resPar] = await Promise.all([
      fetch(`${window.API_BASE}/admin/etudiants`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${window.API_BASE}/admin/bims/demandes?statut=en_attente`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${window.API_BASE}/admin/bims/parrainages`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const etudiants = await resEtudiants.json();
    etudiantsCache = etudiants;

    let total = 0;
    await Promise.all(
      etudiants.map(async (e) => {
        try {
          const r = await fetch(
            `${window.API_BASE}/admin/bims/etudiants/${e.id}/bim`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (r.ok) {
            const d = await r.json();
            soldesCache[e.id] = d.user.bim_balance || 0;
            total += soldesCache[e.id];
          }
        } catch {}
      }),
    );

    $("kpiTotalSolde").textContent = total;

    if (resDemandes.ok) {
      const dem = await resDemandes.json();
      $("kpiDemandesAttente").textContent = dem.length || 0;
    }

    if (resPar.ok) {
      const par = await resPar.json();
      $("kpiParrainages").textContent = par.length || 0;
      $("kpiRewardes").textContent = par.filter((p) => p.rewarded === 1).length;
    }
  } catch (err) {
    console.error("❌ chargerKPIs:", err);
  }
}

// =====================================================
// ÉTUDIANTS & SOLDES
// =====================================================
async function chargerEtudiants() {
  const tbody = $("etudiantsBody");
  tbody.innerHTML =
    '<tr><td colspan="6" class="empty-state">Chargement...</td></tr>';

  try {
    const res = await fetch(`${window.API_BASE}/admin/etudiants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const etudiants = await res.json();
    etudiantsCache = etudiants;

    await Promise.all(
      etudiants.map(async (e) => {
        try {
          const r = await fetch(
            `${window.API_BASE}/admin/bims/etudiants/${e.id}/bim`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (r.ok) {
            const d = await r.json();
            soldesCache[e.id] = d.user.bim_balance || 0;
          } else soldesCache[e.id] = 0;
        } catch {
          soldesCache[e.id] = 0;
        }
      }),
    );

    afficherEtudiants(etudiants);
  } catch (err) {
    console.error("❌ chargerEtudiants:", err);
    tbody.innerHTML =
      '<tr><td colspan="6" class="empty-state">Erreur.</td></tr>';
  }
}

function afficherEtudiants(etudiants) {
  const tbody = $("etudiantsBody");
  const search = ($("searchEtudiant")?.value || "").toLowerCase().trim();

  let list = etudiants;
  if (search) {
    list = list.filter(
      (e) =>
        (e.nom || "").toLowerCase().includes(search) ||
        (e.prenom || "").toLowerCase().includes(search) ||
        (e.email || "").toLowerCase().includes(search) ||
        (e.username || "").toLowerCase().includes(search),
    );
  }

  if (sortSolde === "desc") {
    list = [...list].sort(
      (a, b) => (soldesCache[b.id] || 0) - (soldesCache[a.id] || 0),
    );
  } else if (sortSolde === "asc") {
    list = [...list].sort(
      (a, b) => (soldesCache[a.id] || 0) - (soldesCache[b.id] || 0),
    );
  }

  if (!list.length) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="empty-state">Aucun étudiant.</td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map((e) => {
      const solde = soldesCache[e.id] ?? 0;
      return `
        <tr>
          <td>${e.id}</td>
          <td><strong>${escapeHtml(e.prenom)} ${escapeHtml(e.nom)}</strong>${e.username ? `<br><small style="color:#94a3b8">@${escapeHtml(e.username)}</small>` : ""}</td>
          <td>${escapeHtml(e.email)}</td>
          <td>${escapeHtml(e.filiere || "—")} ${e.classe ? `<br><small style="color:#94a3b8">${e.classe}</small>` : ""}</td>
          <td><span class="solde-badge">${solde} BIM</span></td>
          <td>
            <div class="actions-cell" style="justify-content:flex-end">
              <button class="btn btn-sm btn-primary" data-action="histo" data-id="${e.id}" title="Historique">📜</button>
              <button class="btn btn-sm btn-success" data-action="credit" data-id="${e.id}" title="Créditer">➕</button>
              <button class="btn btn-sm btn-danger" data-action="debit" data-id="${e.id}" title="Débiter">➖</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id, 10);
      const action = btn.dataset.action;
      if (action === "histo") ouvrirHistorique(id);
      else if (action === "credit") ouvrirAction(id, "credit");
      else if (action === "debit") ouvrirAction(id, "debit");
    });
  });
}

// =====================================================
// Modal crédit/débit
// =====================================================
function ouvrirAction(userId, mode) {
  const user = etudiantsCache.find((e) => e.id === userId);
  if (!user) return;
  actionCible = { userId, mode, userNom: `${user.prenom} ${user.nom}` };
  $("modalActionTitle").textContent =
    mode === "credit"
      ? "💳 Créditer des BIM"
      : "🛠️ Débiter des BIM (correction)";
  $("modalActionUser").textContent =
    `Étudiant : ${user.prenom} ${user.nom} — Solde actuel : ${soldesCache[userId] || 0} BIM`;
  $("actionAmount").value = "";
  $("actionMotif").value = "";
  $("modalActionMessage").style.display = "none";
  $("modalAction").classList.add("active");
}

function fermerModalAction() {
  $("modalAction").classList.remove("active");
  actionCible = null;
}

async function confirmerAction() {
  if (!actionCible) return;
  const amount = parseInt($("actionAmount").value, 10);
  const motif = $("actionMotif").value.trim();
  const msgEl = $("modalActionMessage");

  if (!amount || amount <= 0)
    return showMsg(msgEl, "❌ Montant invalide (min 1)", "error");
  if (!motif || motif.length < 3)
    return showMsg(msgEl, "❌ Motif obligatoire", "error");
  if (actionCible.mode === "debit" && motif.length < 10)
    return showMsg(
      msgEl,
      "❌ Correction : motif plus détaillé (10 car. min)",
      "error",
    );

  const url =
    actionCible.mode === "credit"
      ? `${window.API_BASE}/admin/bims/etudiants/${actionCible.userId}/credit`
      : `${window.API_BASE}/admin/bims/etudiants/${actionCible.userId}/correction`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, motif }),
    });
    const data = await res.json();
    if (res.ok) {
      showMsg(msgEl, "✅ " + data.message, "success");
      setTimeout(() => {
        fermerModalAction();
        chargerEtudiants();
        chargerKPIs();
      }, 1000);
    } else {
      showMsg(msgEl, "❌ " + (data.error || "Erreur"), "error");
    }
  } catch (err) {
    console.error(err);
    showMsg(msgEl, "❌ Erreur réseau", "error");
  }
}

// =====================================================
// Modal historique
// =====================================================
async function ouvrirHistorique(userId) {
  const user = etudiantsCache.find((e) => e.id === userId);
  if (!user) return;
  $("modalHistoTitle").textContent =
    `📜 Historique — ${user.prenom} ${user.nom}`;
  $("modalHistoSolde").textContent = "";
  $("historiqueContent").innerHTML = '<p class="empty-state">Chargement...</p>';
  $("modalHistorique").classList.add("active");

  try {
    const res = await fetch(
      `${window.API_BASE}/admin/bims/etudiants/${userId}/bim`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    $("modalHistoSolde").textContent =
      `Solde actuel : ${data.user.bim_balance} BIM — ${data.transactions.length} transaction(s)`;

    if (!data.transactions.length) {
      $("historiqueContent").innerHTML =
        '<p class="empty-state">Aucune transaction.</p>';
      return;
    }

    const TYPE_LABELS = {
      referral_reward: "🎁 Parrainage",
      exam_retake: "📝 Repasser examen",
      manual_credit: "💳 Crédit admin",
      manual_correction: "🛠️ Correction",
      purchase: "🛒 Achat",
    };

    let html = '<ul class="tx-list">';
    data.transactions.forEach((t) => {
      const isCredit = t.amount > 0;
      html += `
        <li class="tx-item">
          <div>
            <strong>${TYPE_LABELS[t.type] || t.type}</strong>
            <br><small style="color:#94a3b8">${formatDate(t.created_at)}</small>
            ${t.motif ? `<br><small style="color:#94a3b8;font-style:italic">« ${escapeHtml(t.motif)} »</small>` : ""}
          </div>
          <div style="text-align:right">
            <div class="${isCredit ? "tx-credit" : "tx-debit"}">${isCredit ? "+" : ""}${t.amount} BIM</div>
            <small style="color:#94a3b8">Solde : ${t.balance_after}</small>
          </div>
        </li>
      `;
    });
    html += "</ul>";
    $("historiqueContent").innerHTML = html;
  } catch (err) {
    console.error(err);
    $("historiqueContent").innerHTML = '<p class="empty-state">Erreur.</p>';
  }
}

// =====================================================
// Demandes
// =====================================================
async function chargerDemandes() {
  const tbody = $("demandesBody");
  tbody.innerHTML =
    '<tr><td colspan="6" class="empty-state">Chargement...</td></tr>';

  try {
    const statut = $("filtreStatutDemande")?.value || "";
    const url = statut
      ? `${window.API_BASE}/admin/bims/demandes?statut=${statut}`
      : `${window.API_BASE}/admin/bims/demandes`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const demandes = await res.json();

    if (!demandes.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="empty-state">Aucune demande.</td></tr>';
      return;
    }

    tbody.innerHTML = demandes
      .map(
        (d) => `
        <tr>
          <td>
            <strong>${escapeHtml(d.prenom)} ${escapeHtml(d.nom)}</strong>
            <br><small style="color:#94a3b8">${escapeHtml(d.email)}</small>
          </td>
          <td>${d.quantite} BIM</td>
          <td><strong>${d.prix_total} FCFA</strong></td>
          <td>${formatDate(d.created_at)}</td>
          <td>
            <span class="badge ${d.statut}">${d.statut.replace("_", " ")}</span>
            ${d.motif_admin ? `<br><small style="color:#94a3b8">${escapeHtml(d.motif_admin)}</small>` : ""}
          </td>
          <td style="text-align:right">
            ${
              d.statut === "en_attente"
                ? `<div class="actions-cell" style="justify-content:flex-end">
                    <button class="btn btn-sm btn-success" data-action="valider" data-id="${d.id}">✅</button>
                    <button class="btn btn-sm btn-danger" data-action="refuser" data-id="${d.id}">❌</button>
                  </div>`
                : `<small style="color:#94a3b8">—</small>`
            }
          </td>
        </tr>
      `,
      )
      .join("");

    tbody.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id, 10);
        if (btn.dataset.action === "valider") validerDemande(id);
        else refuserDemande(id);
      });
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="6" class="empty-state">Erreur.</td></tr>';
  }
}

async function validerDemande(id) {
  if (!confirm("Valider cette demande ? Le BIM sera crédité.")) return;
  try {
    const res = await fetch(
      `${window.API_BASE}/admin/bims/demandes/${id}/valider`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (res.ok) {
      alert("✅ " + data.message);
      chargerDemandes();
      chargerKPIs();
    } else alert("❌ " + (data.error || "Erreur"));
  } catch {
    alert("❌ Erreur réseau");
  }
}

async function refuserDemande(id) {
  const motif = prompt("Motif du refus (min 3 caractères) :");
  if (!motif || motif.trim().length < 3) return;
  try {
    const res = await fetch(
      `${window.API_BASE}/admin/bims/demandes/${id}/refuser`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motif: motif.trim() }),
      },
    );
    const data = await res.json();
    if (res.ok) {
      alert("✅ " + data.message);
      chargerDemandes();
      chargerKPIs();
    } else alert("❌ " + (data.error || "Erreur"));
  } catch {
    alert("❌ Erreur réseau");
  }
}

// =====================================================
// Parrainages
// =====================================================
async function chargerParrainages() {
  const tbody = $("parrainagesBody");
  tbody.innerHTML =
    '<tr><td colspan="4" class="empty-state">Chargement...</td></tr>';

  try {
    const res = await fetch(`${window.API_BASE}/admin/bims/parrainages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const par = await res.json();
    if (!par.length) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="empty-state">Aucun parrainage.</td></tr>';
      return;
    }
    tbody.innerHTML = par
      .map(
        (p) => `
        <tr>
          <td><strong>${escapeHtml(p.parrain_prenom)} ${escapeHtml(p.parrain_nom)}</strong></td>
          <td>${escapeHtml(p.filleul_prenom)} ${escapeHtml(p.filleul_nom)}</td>
          <td>${formatDate(p.created_at)}</td>
          <td>
            ${
              p.rewarded === 1
                ? `<span class="badge rewarded">✅ Versée</span><br><small style="color:#94a3b8">${formatDate(p.rewarded_at)}</small>`
                : `<span class="badge pending">⏳ En attente</span>`
            }
          </td>
        </tr>
      `,
      )
      .join("");
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="4" class="empty-state">Erreur.</td></tr>';
  }
}

// =====================================================
// Offres
// =====================================================
async function chargerOffres() {
  const tbody = $("offresBody");
  tbody.innerHTML =
    '<tr><td colspan="5" class="empty-state">Chargement...</td></tr>';

  try {
    const res = await fetch(`${window.API_BASE}/admin/bims/offres`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const offres = await res.json();
    if (!offres.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="empty-state">Aucune offre.</td></tr>';
      return;
    }
    tbody.innerHTML = offres
      .map(
        (o) => `
        <tr>
          <td><strong>${o.quantite} BIM</strong></td>
          <td>${o.prix_fcfa} FCFA</td>
          <td>${o.ordre}</td>
          <td>${
            o.actif === 1
              ? '<span class="badge rewarded">✅ Active</span>'
              : '<span class="badge refusee">❌ Inactive</span>'
          }</td>
          <td style="text-align:right">
            <div class="actions-cell" style="justify-content:flex-end">
              <button class="btn btn-sm btn-primary" data-action="edit" data-id="${o.id}">✏️</button>
              <button class="btn btn-sm ${o.actif === 1 ? "btn-danger" : "btn-success"}" data-action="toggle" data-id="${o.id}">${o.actif === 1 ? "🚫" : "✅"}</button>
            </div>
          </td>
        </tr>
      `,
      )
      .join("");

    tbody.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id, 10);
        const offre = offres.find((o) => o.id === id);
        if (btn.dataset.action === "edit") ouvrirModalOffre(offre);
        else toggleOffre(offre);
      });
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="5" class="empty-state">Erreur.</td></tr>';
  }
}

function ouvrirModalOffre(offre = null) {
  offreEnEdition = offre;
  $("modalOffreTitle").textContent = offre
    ? "✏️ Modifier l'offre"
    : "➕ Nouvelle offre";
  $("offreQuantite").value = offre ? offre.quantite : "";
  $("offrePrix").value = offre ? offre.prix_fcfa : "";
  $("offreOrdre").value = offre ? offre.ordre : 0;
  $("modalOffreMessage").style.display = "none";
  $("modalOffre").classList.add("active");
}

function fermerModalOffre() {
  $("modalOffre").classList.remove("active");
  offreEnEdition = null;
}

async function enregistrerOffre() {
  const quantite = parseInt($("offreQuantite").value, 10);
  const prix = parseInt($("offrePrix").value, 10);
  const ordre = parseInt($("offreOrdre").value, 10) || 0;
  const msgEl = $("modalOffreMessage");

  if (!quantite || quantite < 1)
    return showMsg(msgEl, "Quantité invalide", "error");
  if (isNaN(prix) || prix < 0) return showMsg(msgEl, "Prix invalide", "error");

  const url = offreEnEdition
    ? `${window.API_BASE}/admin/bims/offres/${offreEnEdition.id}`
    : `${window.API_BASE}/admin/bims/offres`;
  const method = offreEnEdition ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantite, prix_fcfa: prix, ordre, actif: 1 }),
    });
    const data = await res.json();
    if (res.ok) {
      showMsg(msgEl, "✅ Enregistré", "success");
      setTimeout(() => {
        fermerModalOffre();
        chargerOffres();
      }, 800);
    } else showMsg(msgEl, "❌ " + (data.error || "Erreur"), "error");
  } catch {
    showMsg(msgEl, "❌ Erreur réseau", "error");
  }
}

async function toggleOffre(offre) {
  const nouveauActif = offre.actif === 1 ? 0 : 1;
  try {
    const res = await fetch(
      `${window.API_BASE}/admin/bims/offres/${offre.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantite: offre.quantite,
          prix_fcfa: offre.prix_fcfa,
          ordre: offre.ordre,
          actif: nouveauActif,
        }),
      },
    );
    if (res.ok) chargerOffres();
  } catch (err) {
    console.error(err);
  }
}

// =====================================================
// Statistiques
// =====================================================
async function chargerStats() {
  // Top soldes
  const top = [...etudiantsCache]
    .map((e) => ({ ...e, solde: soldesCache[e.id] || 0 }))
    .sort((a, b) => b.solde - a.solde)
    .slice(0, 10);

  $("topSoldes").innerHTML = top.length
    ? top
        .map(
          (e, i) => `
        <li>
          <span><span class="rank">#${i + 1}</span>${escapeHtml(e.prenom)} ${escapeHtml(e.nom)}</span>
          <strong style="color:#3b82f6">${e.solde} BIM</strong>
        </li>
      `,
        )
        .join("")
    : '<li class="empty-state">Aucune donnée.</li>';

  // Top parrains
  try {
    const res = await fetch(`${window.API_BASE}/admin/bims/parrainages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const par = await res.json();

    const counts = {};
    par.forEach((p) => {
      const key = p.parrain_id;
      if (!counts[key]) {
        counts[key] = {
          nom: `${p.parrain_prenom} ${p.parrain_nom}`,
          count: 0,
          rewarded: 0,
        };
      }
      counts[key].count++;
      if (p.rewarded === 1) counts[key].rewarded++;
    });

    const topPar = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    $("topParrains").innerHTML = topPar.length
      ? topPar
          .map(
            (p, i) => `
        <li>
          <span><span class="rank">#${i + 1}</span>${escapeHtml(p.nom)}</span>
          <strong style="color:#10b981">${p.count} filleul(s) — ${p.rewarded} BIM</strong>
        </li>
      `,
          )
          .join("")
      : '<li class="empty-state">Aucun parrain.</li>';
  } catch (err) {
    console.error(err);
  }
}

// =====================================================
// Export CSV
// =====================================================
function exporterCSV() {
  if (!etudiantsCache.length) return alert("Aucune donnée à exporter");
  let csv = "ID;Nom;Prénom;Email;Username;Filière;Classe;Solde BIM\n";
  etudiantsCache.forEach((e) => {
    csv += `${e.id};${e.nom};${e.prenom};${e.email};${e.username || ""};${e.filiere || ""};${e.classe || ""};${soldesCache[e.id] || 0}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bims_export_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// =====================================================
// Tabs
// =====================================================
function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      const target = document.getElementById(`tab-${tab.dataset.tab}`);
      if (target) target.classList.add("active");

      const t = tab.dataset.tab;
      if (t === "etudiants") chargerEtudiants();
      else if (t === "demandes") chargerDemandes();
      else if (t === "parrainages") chargerParrainages();
      else if (t === "offres") chargerOffres();
      else if (t === "stats") chargerStats();
    });
  });
}

// =====================================================
// Init
// =====================================================
function init() {
  initTabs();

  $("modalActionClose")?.addEventListener("click", fermerModalAction);
  $("modalActionCancel")?.addEventListener("click", fermerModalAction);
  $("modalActionConfirm")?.addEventListener("click", confirmerAction);

  $("modalHistoriqueClose")?.addEventListener("click", () =>
    $("modalHistorique").classList.remove("active"),
  );

  $("modalOffreClose")?.addEventListener("click", fermerModalOffre);
  $("modalOffreCancel")?.addEventListener("click", fermerModalOffre);
  $("modalOffreConfirm")?.addEventListener("click", enregistrerOffre);
  $("btnNouvelleOffre")?.addEventListener("click", () =>
    ouvrirModalOffre(null),
  );

  $("btnExportCsv")?.addEventListener("click", exporterCSV);
  $("btnReloadEtudiants")?.addEventListener("click", chargerEtudiants);

  let searchTimeout = null;
  $("searchEtudiant")?.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => afficherEtudiants(etudiantsCache), 250);
  });

  $("sortSolde")?.addEventListener("change", (e) => {
    sortSolde = e.target.value;
    afficherEtudiants(etudiantsCache);
  });

  $("filtreStatutDemande")?.addEventListener("change", chargerDemandes);

  document.querySelectorAll(".modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m) m.classList.remove("active");
    });
  });

  chargerKPIs();
  chargerEtudiants();
}

init();
