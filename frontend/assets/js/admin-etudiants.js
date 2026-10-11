// =====================================================
// ADMIN — Gestion des étudiants + BIM + détails complets
// =====================================================

const API_BASE = `${window.API_BASE}/admin`;
const token = localStorage.getItem("token");
if (!token) window.location.href = "../pages/authentification.html";

let allStudents = [];
let soldesCache = {};
let bimCible = null;

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

function formatDate(d, withTime = false) {
  if (!d) return "—";
  const opts = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  if (withTime) {
    opts.hour = "2-digit";
    opts.minute = "2-digit";
  }
  return new Date(d).toLocaleDateString("fr-FR", opts);
}

function formatLastSeen(d) {
  if (!d) return "Jamais connecté";
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // secondes

  if (diff < 60) return "🟢 En ligne";
  if (diff < 3600) return `🟢 Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `🟡 Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `⚪ Il y a ${Math.floor(diff / 86400)} j`;
  return `⚪ ${formatDate(d)}`;
}

// =====================================================
// CHARGEMENT DES ÉTUDIANTS + SOLDES BIM
// =====================================================
async function loadStudents() {
  const tbody = document.getElementById("studentsBody");
  tbody.innerHTML =
    '<tr><td colspan="12" class="empty-state">Chargement...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/etudiants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur chargement");
    allStudents = await res.json();

    // Charger les soldes BIM en parallèle
    await Promise.all(
      allStudents.map(async (s) => {
        try {
          const r = await fetch(
            `${window.API_BASE}/admin/bims/etudiants/${s.id}/bim`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (r.ok) {
            const d = await r.json();
            soldesCache[s.id] = d.user.bim_balance || 0;
          } else {
            soldesCache[s.id] = 0;
          }
        } catch {
          soldesCache[s.id] = 0;
        }
      }),
    );

    updateStats();
    renderStudents(allStudents);
  } catch (err) {
    console.error("❌ loadStudents:", err);
    tbody.innerHTML =
      '<tr><td colspan="12" class="empty-state">Erreur de chargement</td></tr>';
  }
}

function updateStats() {
  document.getElementById("statTotal").textContent = allStudents.length;
  document.getElementById("statActifs").textContent = allStudents.filter(
    (s) => s.is_email_confirmed === 1,
  ).length;
  document.getElementById("statAdmins").textContent = allStudents.filter(
    (s) => s.role === "admin",
  ).length;
  document.getElementById("statDGL").textContent = allStudents.filter(
    (s) => s.filiere === "DGL",
  ).length;
  document.getElementById("statRIT").textContent = allStudents.filter(
    (s) => s.filiere === "RIT",
  ).length;
}

function renderStudents(students) {
  const tbody = document.getElementById("studentsBody");

  if (!students || students.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="12" class="empty-state">Aucun étudiant</td></tr>';
    return;
  }

  tbody.innerHTML = students
    .map((s) => {
      const solde = soldesCache[s.id] ?? 0;
      const roleBadge =
        s.role === "admin"
          ? '<span class="badge-role admin">Admin</span>'
          : '<span class="badge-role user">Étudiant</span>';

      return `
        <tr>
          <td>${s.id}</td>
          <td><strong>${escapeHtml(s.nom || "—")}</strong></td>
          <td>${escapeHtml(s.prenom || "—")}</td>
          <td>${s.username ? `<span style="color:#3b82f6">@${escapeHtml(s.username)}</span>` : '<span style="color:#94a3b8">—</span>'}</td>
          <td style="font-size:0.8rem">${escapeHtml(s.email || "—")}</td>
          <td>${s.telephone ? escapeHtml(s.telephone) : '<span style="color:#94a3b8">—</span>'}</td>
          <td>${escapeHtml(s.filiere || "—")}</td>
          <td>${escapeHtml(s.classe || "—")}</td>
          <td><span class="solde-badge">${solde} BIM</span></td>
          <td>${roleBadge}</td>
          <td style="font-size:0.8rem">${formatDate(s.created_at)}</td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-sm btn-primary" data-action="detail" data-id="${s.id}" title="Voir les infos">👁️</button>
              <button class="btn btn-sm btn-success" data-action="credit" data-id="${s.id}" title="Créditer BIM">➕</button>
              <button class="btn btn-sm btn-danger" data-action="debit" data-id="${s.id}" title="Débiter BIM">➖</button>
              <button class="btn btn-sm btn-warning" data-action="edit" data-id="${s.id}" title="Modifier">✏️</button>
              <button class="btn btn-sm btn-outline" data-action="delete" data-id="${s.id}" title="Supprimer">🗑️</button>
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
      if (action === "detail") ouvrirDetail(id);
      else if (action === "credit") ouvrirBimModal(id, "credit");
      else if (action === "debit") ouvrirBimModal(id, "debit");
      else if (action === "edit") openEditModal(id);
      else if (action === "delete") deleteStudent(id);
    });
  });
}

// =====================================================
// FILTRES
// =====================================================
function applyFilters() {
  const filiere = document.getElementById("filterFiliere").value;
  const classe = document.getElementById("filterClasse").value;
  const role = document.getElementById("filterRole").value;
  const search = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  const filtered = allStudents.filter((s) => {
    if (filiere && s.filiere !== filiere) return false;
    if (classe && s.classe !== classe) return false;
    if (role && s.role !== role) return false;
    if (search) {
      const hay =
        `${s.nom || ""} ${s.prenom || ""} ${s.email || ""}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  renderStudents(filtered);
}

// =====================================================
// MODAL DÉTAIL ENRICHI
// =====================================================
async function ouvrirDetail(id) {
  const modal = document.getElementById("detailModal");
  const body = document.getElementById("detailBody");
  modal.classList.add("active");
  body.innerHTML = '<p class="empty-state">Chargement des détails...</p>';

  try {
    const res = await fetch(`${API_BASE}/etudiants/${id}/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erreur chargement détails");
    const data = await res.json();

    const u = data.user;
    document.getElementById("detailTitle").textContent =
      `📋 ${u.prenom} ${u.nom}`;

    // Initiales avatar
    const initials =
      ((u.prenom?.[0] || "") + (u.nom?.[0] || "")).toUpperCase() || "👤";
    const avatarHtml = u.avatar_url
      ? `<img src="${u.avatar_url}" alt="Avatar" />`
      : initials;

    let html = `
      <!-- Hero -->
      <div class="student-hero">
        <div class="student-avatar">${avatarHtml}</div>
        <div class="student-hero-info" style="flex:1">
          <h3>${escapeHtml(u.prenom)} ${escapeHtml(u.nom)}</h3>
          <div class="username">${u.username ? "@" + escapeHtml(u.username) : '<span style="color:#94a3b8">Sans username</span>'}</div>
          <div class="email">${escapeHtml(u.email)}</div>
          <div style="margin-top:0.4rem">
            ${u.role === "admin" ? '<span class="badge-tag red">👑 Admin</span>' : '<span class="badge-tag">🎓 Étudiant</span>'}
            ${u.is_email_confirmed === 1 ? '<span class="badge-tag green">✅ Email confirmé</span>' : '<span class="badge-tag red">❌ Non confirmé</span>'}
          </div>
        </div>
      </div>

      <!-- Solde BIM -->
      <div class="bim-hero">
        <div class="bim-label">Solde BIM</div>
        <div class="bim-solde">${u.bim_balance || 0} BIM</div>
      </div>

      <!-- Stats d'activité -->
      <div class="detail-section">
        <h4>📊 Statistiques d'activité</h4>
        <div class="stats-mini">
          <div class="stat-mini-card"><div class="val">${data.stats.quiz_total}</div><div class="lbl">Quiz passés</div></div>
          <div class="stat-mini-card orange"><div class="val">${data.stats.devoirs_total}</div><div class="lbl">Devoirs rendus</div></div>
          <div class="stat-mini-card"><div class="val">${data.stats.examens_total}</div><div class="lbl">Examens passés</div></div>
          <div class="stat-mini-card purple"><div class="val">${data.stats.chapitres_total}</div><div class="lbl">Chapitres terminés</div></div>
          <div class="stat-mini-card green"><div class="val">${data.stats.examens_moyenne}/20</div><div class="lbl">Moyenne examens</div></div>
          <div class="stat-mini-card orange"><div class="val">${data.stats.tentatives_total}</div><div class="lbl">Tentatives totales</div></div>
          <div class="stat-mini-card purple"><div class="val">${data.stats.messages_envoyes}</div><div class="lbl">Messages envoyés</div></div>
          <div class="stat-mini-card"><div class="val">${data.stats.quiz_moyenne}%</div><div class="lbl">Moyenne quiz</div></div>
        </div>
      </div>

      <!-- Informations personnelles -->
      <div class="detail-section">
        <h4>👤 Informations personnelles</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="label">Nom complet</div>
            <div class="value">${escapeHtml(u.prenom)} ${escapeHtml(u.nom)}</div>
          </div>
          <div class="detail-item">
            <div class="label">Username</div>
            <div class="value ${!u.username ? "muted" : ""}">${u.username ? "@" + escapeHtml(u.username) : "Non défini"}</div>
          </div>
          <div class="detail-item">
            <div class="label">Email</div>
            <div class="value">${escapeHtml(u.email)}</div>
          </div>
          <div class="detail-item">
            <div class="label">Téléphone</div>
            <div class="value ${!u.telephone ? "muted" : ""}">${u.telephone ? escapeHtml(u.telephone) : "Non renseigné"}</div>
          </div>
          <div class="detail-item">
            <div class="label">Pays</div>
            <div class="value ${!u.pays ? "muted" : ""}">${u.pays ? escapeHtml(u.pays) : "Non renseigné"}</div>
          </div>
          <div class="detail-item">
            <div class="label">Type d'étude</div>
            <div class="value">${escapeHtml(u.type_etude || "universite")}</div>
          </div>
          <div class="detail-item">
            <div class="label">Filière</div>
            <div class="value">${escapeHtml(u.filiere || "—")}</div>
          </div>
          <div class="detail-item">
            <div class="label">Classe</div>
            <div class="value">${escapeHtml(u.classe || "—")}</div>
          </div>
          <div class="detail-item">
            <div class="label">Rôle</div>
            <div class="value">${u.role === "admin" ? "👑 Administrateur" : "🎓 Étudiant"}</div>
          </div>
          <div class="detail-item">
            <div class="label">Email confirmé</div>
            <div class="value">${u.is_email_confirmed === 1 ? "✅ Oui" : "❌ Non"}</div>
          </div>
        </div>
      </div>

      <!-- Dates -->
      <div class="detail-section">
        <h4>📅 Dates importantes</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="label">Date d'inscription</div>
            <div class="value">${formatDate(u.created_at, true)}</div>
          </div>
          <div class="detail-item">
            <div class="label">Dernière connexion</div>
            <div class="value">${formatLastSeen(u.last_seen)}</div>
          </div>
          ${
            u.last_seen
              ? `<div class="detail-item">
                  <div class="label">Vu pour la dernière fois</div>
                  <div class="value">${formatDate(u.last_seen, true)}</div>
                </div>`
              : ""
          }
        </div>
      </div>

      <!-- Présentation -->
      ${
        u.bio || u.centres_interet || u.objectif_pro
          ? `
        <div class="detail-section">
          <h4>📝 Présentation</h4>
          <div class="detail-grid">
            ${
              u.bio
                ? `<div class="detail-item full">
                    <div class="label">Bio</div>
                    <div class="value" style="font-weight:400;line-height:1.5">${escapeHtml(u.bio)}</div>
                  </div>`
                : ""
            }
            ${
              u.centres_interet
                ? `<div class="detail-item full">
                    <div class="label">Centres d'intérêt</div>
                    <div class="value" style="font-weight:400">${escapeHtml(u.centres_interet)}</div>
                  </div>`
                : ""
            }
            ${
              u.objectif_pro
                ? `<div class="detail-item full">
                    <div class="label">Objectif professionnel</div>
                    <div class="value" style="font-weight:400">${escapeHtml(u.objectif_pro)}</div>
                  </div>`
                : ""
            }
          </div>
        </div>
      `
          : ""
      }

      <!-- Parrainage -->
      <div class="detail-section">
        <h4>🤝 Parrainage</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="label">Code de parrainage</div>
            <div class="value ${!u.code_parrainage ? "muted" : ""}" style="font-family:monospace;color:#3b82f6">${u.code_parrainage ? escapeHtml(u.code_parrainage) : "Non généré"}</div>
          </div>
          <div class="detail-item">
            <div class="label">Parrainé par</div>
            <div class="value ${!data.parrain ? "muted" : ""}">
              ${data.parrain ? `${escapeHtml(data.parrain.prenom)} ${escapeHtml(data.parrain.nom)} <span style="color:#94a3b8;font-weight:400">(@${escapeHtml(data.parrain.username || "?")})</span>` : "Aucun parrain"}
            </div>
          </div>
          <div class="detail-item">
            <div class="label">Nombre de filleuls</div>
            <div class="value">${data.filleuls.length} personne(s)</div>
          </div>
          <div class="detail-item">
            <div class="label">Récompenses versées</div>
            <div class="value">${data.filleuls.filter((f) => f.rewarded === 1).length} BIM</div>
          </div>
        </div>
        ${
          data.filleuls.length > 0
            ? `
          <ul class="filleuls-list">
            ${data.filleuls
              .map(
                (f) => `
              <li>
                <span>
                  <strong>${escapeHtml(f.prenom)} ${escapeHtml(f.nom)}</strong>
                  ${f.username ? `<span style="color:#3b82f6">@${escapeHtml(f.username)}</span>` : ""}
                </span>
                <span class="date">
                  ${f.rewarded === 1 ? '<span class="badge-tag green">✅ Récompensé</span>' : '<span class="badge-tag orange">⏳ En attente</span>'}
                  &nbsp; ${formatDate(f.created_at)}
                </span>
              </li>
            `,
              )
              .join("")}
          </ul>
        `
            : ""
        }
      </div>

      <!-- Historique BIM -->
      <div class="detail-section">
        <h4>💎 Historique BIM (20 dernières transactions)</h4>
        ${
          data.bim_transactions.length > 0
            ? `
          <ul class="tx-list">
            ${data.bim_transactions
              .map((t) => {
                const isCredit = t.amount > 0;
                const TYPE_LABELS = {
                  referral_reward: "🎁 Parrainage",
                  exam_retake: "📝 Repasser examen",
                  manual_credit: "💳 Crédit admin",
                  manual_correction: "🛠️ Correction",
                  purchase: "🛒 Achat",
                };
                return `
                <li class="tx-item">
                  <div>
                    <strong>${TYPE_LABELS[t.type] || t.type}</strong>
                    <br><small style="color:#94a3b8">${formatDate(t.created_at, true)}</small>
                    ${t.motif ? `<br><small style="color:#94a3b8;font-style:italic">« ${escapeHtml(t.motif)} »</small>` : ""}
                  </div>
                  <div style="text-align:right">
                    <div class="${isCredit ? "tx-credit" : "tx-debit"}">${isCredit ? "+" : ""}${t.amount} BIM</div>
                    <small style="color:#94a3b8">Solde : ${t.balance_after}</small>
                  </div>
                </li>
              `;
              })
              .join("")}
          </ul>
        `
            : '<p class="empty-state" style="padding:1rem">Aucune transaction BIM.</p>'
        }
      </div>

      <!-- Notes récentes -->
      <div class="detail-section">
        <h4>📋 Dernières notes (10)</h4>
        ${
          data.notes_recentes.length > 0
            ? `
          <table class="notes-table">
            <thead>
              <tr>
                <th>Évaluation</th>
                <th>Matière</th>
                <th>Type</th>
                <th>Note</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${data.notes_recentes
                .map((n) => {
                  const noteSur20 =
                    n.note_max_sur > 0
                      ? ((n.note_obtenue / n.note_max_sur) * 20).toFixed(2)
                      : n.note_obtenue;
                  const cls =
                    noteSur20 >= 10 ? "note-positive" : "note-negative";
                  return `
                  <tr>
                    <td><strong>${escapeHtml(n.titre)}</strong></td>
                    <td>${escapeHtml(n.matiere_nom)}</td>
                    <td><span class="badge-tag ${n.type === "examen" ? "orange" : "green"}">${n.type}</span></td>
                    <td class="${cls}">${noteSur20}/20</td>
                    <td style="font-size:0.8rem;color:#94a3b8">${formatDate(n.date_attribution)}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        `
            : '<p class="empty-state" style="padding:1rem">Aucune note pour le moment.</p>'
        }
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:0.5rem;margin-top:1.5rem;flex-wrap:wrap">
        <button class="btn btn-success" id="detailCreditBtn">➕ Créditer BIM</button>
        <button class="btn btn-danger" id="detailDebitBtn">➖ Débiter BIM</button>
        <button class="btn btn-warning" id="detailEditBtn">✏️ Modifier les infos</button>
        <button class="btn btn-outline" id="detailBulletinBtn">📊 Voir le bulletin</button>
      </div>
    `;

    body.innerHTML = html;

    // Boutons d'action
    document.getElementById("detailCreditBtn").addEventListener("click", () => {
      modal.classList.remove("active");
      ouvrirBimModal(id, "credit");
    });
    document.getElementById("detailDebitBtn").addEventListener("click", () => {
      modal.classList.remove("active");
      ouvrirBimModal(id, "debit");
    });
    document.getElementById("detailEditBtn").addEventListener("click", () => {
      modal.classList.remove("active");
      openEditModal(id);
    });
    document
      .getElementById("detailBulletinBtn")
      .addEventListener("click", () => {
        window.open(`bulletins.html?user_id=${id}`, "_blank");
      });
  } catch (err) {
    console.error("❌ ouvrirDetail:", err);
    body.innerHTML =
      '<p class="empty-state">Erreur de chargement des détails.</p>';
  }
}

// =====================================================
// MODAL BIM
// =====================================================
function ouvrirBimModal(id, mode) {
  const user = allStudents.find((s) => s.id === id);
  if (!user) return;
  bimCible = { userId: id, nom: `${user.prenom} ${user.nom}`, mode };

  document.getElementById("bimModalTitle").textContent =
    mode === "credit"
      ? "💳 Créditer des BIM"
      : "🛠️ Débiter des BIM (correction)";
  document.getElementById("bimModalUser").textContent =
    `Étudiant : ${user.prenom} ${user.nom} — Solde : ${soldesCache[id] || 0} BIM`;
  document.getElementById("bimAmount").value = "";
  document.getElementById("bimMotif").value = "";
  document.getElementById("bimMessage").style.display = "none";
  document.getElementById("bimModal").classList.add("active");
}

function fermerBimModal() {
  document.getElementById("bimModal").classList.remove("active");
  bimCible = null;
}

async function confirmerBim() {
  if (!bimCible) return;
  const amount = parseInt(document.getElementById("bimAmount").value, 10);
  const motif = document.getElementById("bimMotif").value.trim();
  const msgEl = document.getElementById("bimMessage");

  if (!amount || amount <= 0) {
    msgEl.textContent = "❌ Montant invalide (min 1)";
    msgEl.className = "message error";
    msgEl.style.display = "block";
    return;
  }
  if (!motif || motif.length < 3) {
    msgEl.textContent = "❌ Motif obligatoire (3 caractères min)";
    msgEl.className = "message error";
    msgEl.style.display = "block";
    return;
  }
  if (bimCible.mode === "debit" && motif.length < 10) {
    msgEl.textContent =
      "❌ Correction : motif plus détaillé requis (10 car. min)";
    msgEl.className = "message error";
    msgEl.style.display = "block";
    return;
  }

  const url =
    bimCible.mode === "credit"
      ? `${window.API_BASE}/admin/bims/etudiants/${bimCible.userId}/credit`
      : `${window.API_BASE}/admin/bims/etudiants/${bimCible.userId}/correction`;

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
      msgEl.textContent = "✅ " + data.message;
      msgEl.className = "message success";
      msgEl.style.display = "block";
      setTimeout(() => {
        fermerBimModal();
        loadStudents();
      }, 1200);
    } else {
      msgEl.textContent = "❌ " + (data.error || "Erreur");
      msgEl.className = "message error";
      msgEl.style.display = "block";
    }
  } catch (err) {
    console.error(err);
    msgEl.textContent = "❌ Erreur réseau";
    msgEl.className = "message error";
    msgEl.style.display = "block";
  }
}

// =====================================================
// AJOUT / ÉDITION / SUPPRESSION
// =====================================================
function openAddModal() {
  document.getElementById("modalTitle").textContent = "Ajouter un étudiant";
  document.getElementById("studentForm").reset();
  document.getElementById("studentId").value = "";
  document.getElementById("sPassword").required = true;
  document.getElementById("studentModal").classList.add("active");
}

function openEditModal(id) {
  const s = allStudents.find((x) => x.id === id);
  if (!s) return;
  document.getElementById("modalTitle").textContent = "Modifier un étudiant";
  document.getElementById("studentId").value = s.id;
  document.getElementById("sPrenom").value = s.prenom || "";
  document.getElementById("sNom").value = s.nom || "";
  document.getElementById("sEmail").value = s.email || "";
  document.getElementById("sPassword").value = "";
  document.getElementById("sPassword").required = false;
  document.getElementById("sFiliere").value = s.filiere || "";
  document.getElementById("sClasse").value = s.classe || "";
  document.getElementById("sRole").value = s.role || "user";
  document.getElementById("studentModal").classList.add("active");
}

function closeStudentModal() {
  document.getElementById("studentModal").classList.remove("active");
}

async function submitStudent(e) {
  e.preventDefault();
  const id = document.getElementById("studentId").value;
  const body = {
    prenom: document.getElementById("sPrenom").value.trim(),
    nom: document.getElementById("sNom").value.trim(),
    email: document.getElementById("sEmail").value.trim(),
    filiere: document.getElementById("sFiliere").value,
    classe: document.getElementById("sClasse").value,
    role: document.getElementById("sRole").value,
  };
  const pwd = document.getElementById("sPassword").value;
  if (pwd) body.password = pwd;

  const url = id ? `${API_BASE}/etudiants/${id}` : `${API_BASE}/etudiants`;
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      alert(id ? "✅ Étudiant modifié" : "✅ Étudiant ajouté");
      closeStudentModal();
      loadStudents();
    } else {
      alert("❌ " + (data.error || data.message || "Erreur"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Erreur réseau");
  }
}

async function deleteStudent(id) {
  const s = allStudents.find((x) => x.id === id);
  if (!confirm(`Supprimer définitivement ${s?.prenom} ${s?.nom} ?`)) return;
  try {
    const res = await fetch(`${API_BASE}/etudiants/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("✅ Étudiant supprimé");
      loadStudents();
    } else {
      alert("❌ Erreur suppression");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Erreur réseau");
  }
}

// =====================================================
// INIT
// =====================================================
function init() {
  loadStudents();

  document
    .getElementById("btnAjouterEtudiant")
    .addEventListener("click", openAddModal);
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeStudentModal);
  document
    .getElementById("cancelModalBtn")
    .addEventListener("click", closeStudentModal);
  document
    .getElementById("studentForm")
    .addEventListener("submit", submitStudent);

  document.getElementById("closeDetailBtn").addEventListener("click", () => {
    document.getElementById("detailModal").classList.remove("active");
  });

  document
    .getElementById("closeBimBtn")
    .addEventListener("click", fermerBimModal);
  document
    .getElementById("bimCancelBtn")
    .addEventListener("click", fermerBimModal);
  document
    .getElementById("bimConfirmBtn")
    .addEventListener("click", confirmerBim);

  document.getElementById("btnFiltrer").addEventListener("click", applyFilters);
  document.getElementById("btnResetFiltres").addEventListener("click", () => {
    document.getElementById("filterFiliere").value = "";
    document.getElementById("filterClasse").value = "";
    document.getElementById("filterRole").value = "";
    document.getElementById("searchInput").value = "";
    renderStudents(allStudents);
  });

  document.querySelectorAll(".modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m) m.classList.remove("active");
    });
  });

  let st = null;
  document.getElementById("searchInput").addEventListener("input", () => {
    clearTimeout(st);
    st = setTimeout(applyFilters, 300);
  });
}

init();
