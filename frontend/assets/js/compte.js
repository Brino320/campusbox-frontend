// =====================================================
// MON PROFIL – VERSION FINALE + UPLOAD PHOTO + BIM
// =====================================================

const token = localStorage.getItem("token");
if (!token) window.location.href = "authentification.html";

const $ = (id) => document.getElementById(id);

const DOM = {
  avatarContainer: $("avatarContainer"),
  avatarInput: $("avatarInput"),
  avatarMessage: $("avatarMessage"),
  avatarName: $("avatarName"),
  avatarEmail: $("avatarEmail"),
  avatarInitials: $("avatarInitials"),
  sidebarUserName: $("sidebarUserName"),
  toggleSidebarBtn: $("toggleSidebarBtn"),
  burgerBtn: $("burgerBtn"),
  logoutBtnSidebar: $("logoutBtnSidebar"),

  profilForm: $("profilForm"),
  prenom: $("prenom"),
  nom: $("nom"),
  email: $("email"),
  pays: $("pays"),
  telephone: $("telephone"),
  type_etude: $("type_etude"),
  username: $("username"),
  usernameStatus: $("usernameStatus"),
  usernameMessage: $("usernameMessage"),
  profilMessage: $("profilMessage"),

  passwordForm: $("passwordForm"),
  oldPassword: $("oldPassword"),
  newPassword: $("newPassword"),
  confirmNewPassword: $("confirmNewPassword"),
  passwordMessage: $("passwordMessage"),

  filiere_etudiant: $("filiere_etudiant"),
  classe_etudiant: $("classe_etudiant"),
  date_inscription: $("date_inscription"),
  etudiantMessage: $("etudiantMessage"),

  statQuiz: $("statQuiz"),
  statDevoirs: $("statDevoirs"),
  statMoyenne: $("statMoyenne"),
  statChapitres: $("statChapitres"),
  progressionMatieres: $("progressionMatieres"),
  activiteMessage: $("activiteMessage"),

  codeParrainage: $("codeParrainage"),
  copyCodeBtn: $("copyCodeBtn"),
  filleulsList: $("filleulsList"),
  parrainageMessage: $("parrainageMessage"),

  presentationForm: $("presentationForm"),
  bio: $("bio"),
  centres_interet: $("centres_interet"),
  objectif_pro: $("objectif_pro"),
  presentationPreview: $("presentationPreview"),
  presentationMessage: $("presentationMessage"),

  // BIM
  bimSolde: $("bimSolde"),
  bimStatFilleuls: $("bimStatFilleuls"),
  bimStatGagnes: $("bimStatGagnes"),
  bimStatUtilises: $("bimStatUtilises"),
  bimStatTotal: $("bimStatTotal"),
  bimHistorique: $("bimHistorique"),
  bimMesDemandes: $("bimMesDemandes"),
  bimMessage: $("bimMessage"),
  btnObtenirBim: $("btnObtenirBim"),
  btnParrainerBim: $("btnParrainerBim"),
  bimModal: $("bimModal"),
  bimModalCloseBtn: $("bimModalCloseBtn"),
  bimOffresList: $("bimOffresList"),
  bimOffreMessage: $("bimOffreMessage"),
};

// =============================================
// UPLOAD PHOTO DE PROFIL (via label natif)
// =============================================
function initAvatarUpload() {
  const input = DOM.avatarInput;
  if (!input) {
    console.error("❌ avatarInput introuvable dans le DOM");
    return;
  }

  console.log("✅ Avatar upload initialisé (mode label natif)");

  input.addEventListener("change", async function () {
    console.log("📎 change déclenché");
    const file = this.files[0];
    if (!file) return;

    console.log("📎 Fichier :", file.name, file.size, file.type);

    if (file.size > 5 * 1024 * 1024) {
      showAvatarMessage("❌ Fichier trop volumineux (5 Mo max)", "error");
      this.value = "";
      return;
    }

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowed.includes(file.type)) {
      showAvatarMessage(
        "❌ Format non supporté (JPG, PNG, WEBP, GIF uniquement)",
        "error",
      );
      this.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (DOM.avatarInitials) {
        DOM.avatarInitials.innerHTML = `<img src="${e.target.result}" alt="" />`;
      }
    };
    reader.readAsDataURL(file);

    showAvatarMessage("⏳ Upload en cours...", "info");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const url = `${window.API_BASE}/user/avatar`;
      console.log("📤 POST", url);

      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      console.log("📥 Status :", response.status);
      const data = await response.json();
      console.log("📥 Data :", data);

      if (response.ok) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.avatar_url = data.avatar_url;
        localStorage.setItem("user", JSON.stringify(user));

        showAvatarMessage("✅ Photo mise à jour !", "success");

        setTimeout(() => window.location.reload(), 1000);
      } else {
        showAvatarMessage("❌ " + (data.error || "Erreur upload"), "error");
      }
    } catch (error) {
      console.error("❌ Erreur upload avatar :", error);
      showAvatarMessage("❌ Erreur réseau", "error");
    }

    this.value = "";
  });
}

function showAvatarMessage(message, type = "success") {
  if (!DOM.avatarMessage) return;
  DOM.avatarMessage.textContent = message;
  DOM.avatarMessage.className = `message ${type}`;
  DOM.avatarMessage.style.display = "block";
  if (type === "success") {
    setTimeout(() => {
      DOM.avatarMessage.style.display = "none";
    }, 4000);
  }
}

function afficherAvatar(user) {
  if (!DOM.avatarInitials) return;
  if (user.avatar_url) {
    DOM.avatarInitials.innerHTML = `<img src="${user.avatar_url}" alt="Avatar" />`;
    DOM.avatarInitials.style.background = "transparent";
  } else {
    const initials = (user.prenom?.[0] || "") + (user.nom?.[0] || "");
    DOM.avatarInitials.textContent = initials.toUpperCase() || "👤";
    DOM.avatarInitials.style.background = "#3b82f6";
  }
}

// =============================================
// SIDEBAR ET LOGOUT
// =============================================
function initSidebar() {
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

  if (DOM.toggleSidebarBtn) {
    DOM.toggleSidebarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
    });
  }
  if (DOM.burgerBtn) {
    DOM.burgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openSidebar();
    });
  }
  if (overlay) overlay.addEventListener("click", closeSidebar);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeSidebar();
  });
}

function initLogout() {
  if (DOM.logoutBtnSidebar) {
    DOM.logoutBtnSidebar.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
}

function mettreAJourAvatar(user) {
  const full = `${user.prenom || ""} ${user.nom || ""}`.trim();
  if (DOM.avatarName) DOM.avatarName.textContent = full || "Utilisateur";
  if (DOM.avatarEmail)
    DOM.avatarEmail.textContent = user.email || "email@exemple.com";
  if (DOM.sidebarUserName)
    DOM.sidebarUserName.textContent = full || "Utilisateur";
  afficherAvatar(user);
}

// =============================================
// VÉRIFICATION USERNAME
// =============================================
let usernameCheckTimeout = null;
let usernameAvailable = false;

async function verifierUsername(username) {
  if (!username || username.length < 3) {
    DOM.usernameStatus.textContent = "⚠️";
    DOM.usernameStatus.style.color = "#f59e0b";
    DOM.usernameMessage.textContent = "Minimum 3 caractères";
    DOM.usernameMessage.style.color = "#f59e0b";
    usernameAvailable = false;
    return;
  }
  try {
    const url = `${window.API_BASE}/user/check-username?username=${encodeURIComponent(username)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      DOM.usernameStatus.textContent = "⚠️";
      DOM.usernameStatus.style.color = "#f59e0b";
      DOM.usernameMessage.textContent = `Erreur serveur (${response.status})`;
      DOM.usernameMessage.style.color = "#f59e0b";
      usernameAvailable = false;
      return;
    }
    const data = await response.json();
    if (data.available) {
      DOM.usernameStatus.textContent = "✅";
      DOM.usernameStatus.style.color = "#10b981";
      DOM.usernameMessage.textContent = "Nom disponible !";
      DOM.usernameMessage.style.color = "#10b981";
      usernameAvailable = true;
    } else {
      DOM.usernameStatus.textContent = "❌";
      DOM.usernameStatus.style.color = "#ef4444";
      DOM.usernameMessage.textContent = "Ce nom est déjà pris";
      DOM.usernameMessage.style.color = "#ef4444";
      usernameAvailable = false;
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    DOM.usernameStatus.textContent = "⚠️";
    DOM.usernameStatus.style.color = "#f59e0b";
    DOM.usernameMessage.textContent = "Erreur réseau";
    DOM.usernameMessage.style.color = "#f59e0b";
    usernameAvailable = false;
  }
}

function mettreAJourStatusUsername(username) {
  if (username) {
    DOM.usernameStatus.textContent = "✅";
    DOM.usernameStatus.style.color = "#10b981";
    DOM.usernameMessage.textContent = "Nom actuel";
    DOM.usernameMessage.style.color = "#10b981";
    usernameAvailable = true;
  } else {
    DOM.usernameStatus.textContent = "";
    DOM.usernameMessage.textContent = "Choisissez un nom unique";
    DOM.usernameMessage.style.color = "#64748b";
    usernameAvailable = false;
  }
}

if (DOM.username) {
  DOM.username.addEventListener("input", function () {
    clearTimeout(usernameCheckTimeout);
    const val = this.value.trim();
    if (!val) {
      DOM.usernameStatus.textContent = "";
      DOM.usernameMessage.textContent = "Choisissez un nom unique";
      DOM.usernameMessage.style.color = "#64748b";
      usernameAvailable = false;
      return;
    }
    usernameCheckTimeout = setTimeout(() => verifierUsername(val), 400);
  });
}

// =============================================
// CHARGER LE PROFIL
// =============================================
async function chargerProfil() {
  try {
    const response = await fetch(`${window.API_BASE}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const err = await response.json();
      console.error("Chargement profil échoué:", err);
      alert("Impossible de charger le profil");
      return null;
    }
    const user = await response.json();
    console.log("✅ Profil chargé:", user);

    DOM.prenom.value = user.prenom || "";
    DOM.nom.value = user.nom || "";
    DOM.pays.value = user.pays || "France";
    DOM.telephone.value = user.telephone || "";
    DOM.username.value = user.username || "";
    mettreAJourStatusUsername(user.username || "");

    DOM.email.value = user.email || "";
    DOM.date_inscription.value = user.created_at
      ? new Date(user.created_at).toLocaleDateString("fr-FR")
      : "Non disponible";

    const typeMap = {
      universite: "Université",
      lycee: "Lycée",
      fondamental: "Fondamental",
    };
    DOM.type_etude.value =
      typeMap[user.type_etude] || user.type_etude || "Université";

    DOM.filiere_etudiant.value = user.filiere || "Non définie";
    DOM.classe_etudiant.value = user.classe || "Non définie";

    DOM.bio.value = user.bio || "";
    DOM.centres_interet.value = user.centres_interet || "";
    DOM.objectif_pro.value = user.objectif_pro || "";
    mettreAJourApercu();

    if (DOM.codeParrainage && user.code_parrainage) {
      DOM.codeParrainage.innerHTML = `
        <a href="../pages/inscription.html?ref=${user.code_parrainage}" target="_blank"
           style="color:#3b82f6; text-decoration:underline; font-size:1.2rem;">
          ${user.code_parrainage}
        </a>
      `;
    }

    mettreAJourAvatar(user);
    return user;
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Erreur réseau. Vérifiez votre connexion.");
    return null;
  }
}

// =============================================
// APERÇU PRÉSENTATION
// =============================================
function mettreAJourApercu() {
  const bio = DOM.bio.value.trim();
  const centres = DOM.centres_interet.value.trim();
  const objectif = DOM.objectif_pro.value.trim();
  if (!bio && !centres && !objectif) {
    DOM.presentationPreview.innerHTML =
      '<em style="color: #94a3b8;">Aucune présentation enregistrée.</em>';
    return;
  }
  let html = "";
  if (bio) html += `<p><strong>Bio :</strong> ${escapeHtml(bio)}</p>`;
  if (centres)
    html += `<p><strong>Centres d'intérêt :</strong> ${escapeHtml(centres)}</p>`;
  if (objectif)
    html += `<p><strong>Objectif professionnel :</strong> ${escapeHtml(objectif)}</p>`;
  DOM.presentationPreview.innerHTML = html;
}

// =============================================
// SAUVEGARDER LE PROFIL PERSONNEL
// =============================================
if (DOM.profilForm) {
  DOM.profilForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const prenom = DOM.prenom.value.trim();
    const nom = DOM.nom.value.trim();
    if (!prenom || !nom) {
      DOM.profilMessage.textContent =
        "❌ Le prénom et le nom sont obligatoires";
      DOM.profilMessage.className = "message error";
      return;
    }
    const newUsername = DOM.username.value.trim();
    if (newUsername && newUsername.length < 3) {
      DOM.profilMessage.textContent =
        "❌ Le nom d'utilisateur doit avoir au moins 3 caractères";
      DOM.profilMessage.className = "message error";
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (
      newUsername &&
      newUsername !== currentUser.username &&
      !usernameAvailable
    ) {
      DOM.profilMessage.textContent =
        "❌ Ce nom d'utilisateur n'est pas disponible";
      DOM.profilMessage.className = "message error";
      return;
    }
    const body = {
      prenom,
      nom,
      pays: DOM.pays.value.trim() || "France",
      telephone: DOM.telephone.value.trim(),
      username: newUsername || null,
    };
    try {
      const response = await fetch(`${window.API_BASE}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        DOM.profilMessage.textContent = "✅ Profil mis à jour !";
        DOM.profilMessage.className = "message success";
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        Object.assign(user, body);
        localStorage.setItem("user", JSON.stringify(user));
        mettreAJourAvatar(user);
        mettreAJourStatusUsername(body.username || "");
      } else {
        DOM.profilMessage.textContent =
          "❌ Erreur : " + (data.message || "Échec");
        DOM.profilMessage.className = "message error";
      }
    } catch (error) {
      console.error("Erreur enregistrement profil:", error);
      DOM.profilMessage.textContent =
        "❌ Erreur réseau. Vérifiez votre connexion.";
      DOM.profilMessage.className = "message error";
    }
  });
}

// =============================================
// CHANGER LE MOT DE PASSE
// =============================================
if (DOM.passwordForm) {
  DOM.passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const oldPassword = DOM.oldPassword.value;
    const newPassword = DOM.newPassword.value;
    const confirmNew = DOM.confirmNewPassword.value;
    if (newPassword !== confirmNew) {
      DOM.passwordMessage.textContent =
        "❌ Les mots de passe ne correspondent pas";
      DOM.passwordMessage.className = "message error";
      return;
    }
    if (newPassword.length < 6) {
      DOM.passwordMessage.textContent = "❌ Minimum 6 caractères";
      DOM.passwordMessage.className = "message error";
      return;
    }
    try {
      const response = await fetch(`${window.API_BASE}/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        DOM.passwordMessage.textContent = "✅ Mot de passe modifié !";
        DOM.passwordMessage.className = "message success";
        DOM.passwordForm.reset();
      } else {
        DOM.passwordMessage.textContent =
          "❌ Erreur : " + (data.message || "Échec");
        DOM.passwordMessage.className = "message error";
      }
    } catch (error) {
      DOM.passwordMessage.textContent = "❌ Erreur réseau";
      DOM.passwordMessage.className = "message error";
    }
  });
}

// =============================================
// ACTIVITÉ
// =============================================
async function chargerActivite() {
  try {
    const response = await fetch(`${window.API_BASE}/user/activity-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const stats = await response.json();
      DOM.statQuiz.textContent = stats.quiz_completes || 0;
      DOM.statDevoirs.textContent = stats.devoirs_rendus || 0;
      DOM.statMoyenne.textContent = (stats.moyenne_generale || 0) + "%";
      DOM.statChapitres.textContent = stats.chapitres_termines || 0;

      if (stats.matieres && stats.matieres.length > 0) {
        let html = "";
        stats.matieres.forEach((m) => {
          const progress =
            m.total > 0 ? Math.round((m.reussis / m.total) * 100) : 0;
          html += `
            <div class="progress-line">
              <div class="progress-line-header">
                <span>${escapeHtml(m.nom)}</span>
                <span>${progress}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${progress}%"></div>
              </div>
            </div>
          `;
        });
        DOM.progressionMatieres.innerHTML = html;
      } else {
        DOM.progressionMatieres.innerHTML =
          '<p class="muted">Aucune activité.</p>';
      }
    }
  } catch (error) {
    console.error("Erreur activité:", error);
  }
}

// =============================================
// PARRAINAGE
// =============================================
async function chargerParrainage() {
  try {
    const response = await fetch(`${window.API_BASE}/user/parrainage`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      if (DOM.codeParrainage && data.code) {
        DOM.codeParrainage.innerHTML = `
          <a href="../pages/inscription.html?ref=${data.code}" target="_blank"
             style="color:#3b82f6; text-decoration:underline; font-size:1.2rem;">
            ${data.code}
          </a>
        `;
      }
      if (data.filleuls && data.filleuls.length > 0) {
        let html = "<ul class='filleuls-list'>";
        data.filleuls.forEach((f) => {
          html += `<li>
            <span>${escapeHtml(f.prenom)} ${escapeHtml(f.nom)}</span>
            <span class="date">${f.date_inscription || ""}</span>
          </li>`;
        });
        html += "</ul>";
        DOM.filleulsList.innerHTML = html;
      } else {
        DOM.filleulsList.innerHTML = '<p class="muted">Aucun filleul.</p>';
      }
    }
  } catch (error) {
    console.error("Erreur parrainage:", error);
  }
}

// =============================================
// COPIER LE LIEN DE PARRAINAGE
// =============================================
if (DOM.copyCodeBtn) {
  DOM.copyCodeBtn.addEventListener("click", () => {
    const code = DOM.codeParrainage.textContent.trim();
    if (code && code !== "XXXX-XXXX") {
      const link = `${window.location.origin}/pages/inscription.html?ref=${code}`;
      const fallbackCopy = () => {
        const textarea = document.createElement("textarea");
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
        } catch (e) {
          console.error(e);
        }
        document.body.removeChild(textarea);
        DOM.copyCodeBtn.textContent = "✅ Lien copié !";
        setTimeout(() => {
          DOM.copyCodeBtn.textContent = "📋 Copier le lien";
        }, 3000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(link)
          .then(() => {
            DOM.copyCodeBtn.textContent = "✅ Lien copié !";
            setTimeout(() => {
              DOM.copyCodeBtn.textContent = "📋 Copier le lien";
            }, 3000);
          })
          .catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    }
  });
}

// =============================================
// PRÉSENTATION
// =============================================
if (DOM.presentationForm) {
  DOM.presentationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      bio: DOM.bio.value.trim(),
      centres_interet: DOM.centres_interet.value.trim(),
      objectif_pro: DOM.objectif_pro.value.trim(),
    };
    try {
      const response = await fetch(`${window.API_BASE}/user/presentation`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        DOM.presentationMessage.textContent = "✅ Présentation enregistrée !";
        DOM.presentationMessage.className = "message success";
        mettreAJourApercu();
      } else {
        DOM.presentationMessage.textContent =
          "❌ Erreur : " + (data.message || "Échec");
        DOM.presentationMessage.className = "message error";
      }
    } catch (error) {
      DOM.presentationMessage.textContent = "❌ Erreur réseau";
      DOM.presentationMessage.className = "message error";
    }
  });
}

if (DOM.bio) DOM.bio.addEventListener("input", mettreAJourApercu);
if (DOM.centres_interet)
  DOM.centres_interet.addEventListener("input", mettreAJourApercu);
if (DOM.objectif_pro)
  DOM.objectif_pro.addEventListener("input", mettreAJourApercu);

// =============================================
// BIM — PORTEFEUILLE
// =============================================

const BIM_TYPE_LABELS = {
  referral_reward: "🎁 Récompense parrainage",
  exam_retake: "📝 Repasser un examen",
  manual_credit: "💳 Crédit administrateur",
  manual_correction: "🛠️ Correction manuelle",
  purchase: "🛒 Achat de BIM",
};

async function chargerPortefeuilleBIM() {
  try {
    const res = await fetch(`${window.API_BASE}/bims/mon-portefeuille`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur chargement portefeuille");
    const data = await res.json();

    // Solde
    if (DOM.bimSolde) DOM.bimSolde.textContent = data.solde ?? 0;

    // Stats
    if (DOM.bimStatFilleuls)
      DOM.bimStatFilleuls.textContent = data.nb_filleuls ?? 0;
    if (DOM.bimStatGagnes)
      DOM.bimStatGagnes.textContent = data.bim_gagnes_parrainage ?? 0;

    const txs = data.transactions || [];
    const totalUtilises = txs
      .filter((t) => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    if (DOM.bimStatUtilises) DOM.bimStatUtilises.textContent = totalUtilises;
    if (DOM.bimStatTotal) DOM.bimStatTotal.textContent = txs.length;

    // Historique
    afficherHistoriqueBIM(txs);
  } catch (err) {
    console.error("❌ chargerPortefeuilleBIM:", err);
    if (DOM.bimHistorique)
      DOM.bimHistorique.innerHTML =
        '<p class="muted">Erreur de chargement.</p>';
  }
}

function afficherHistoriqueBIM(transactions) {
  if (!DOM.bimHistorique) return;
  if (!transactions || transactions.length === 0) {
    DOM.bimHistorique.innerHTML =
      '<p class="muted">Aucune transaction pour le moment.</p>';
    return;
  }
  let html = '<ul class="bim-tx-list">';
  transactions.forEach((t) => {
    const isCredit = t.amount > 0;
    const cls = isCredit ? "credit" : "debit";
    const sign = isCredit ? "+" : "";
    const label = BIM_TYPE_LABELS[t.type] || t.type;
    const date = t.created_at
      ? new Date(t.created_at).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
    html += `
      <li class="bim-tx-item">
        <div class="bim-tx-info">
          <span class="bim-tx-type">${label}</span>
          <span class="bim-tx-date">${date}</span>
          ${t.motif ? `<span class="bim-tx-motif">« ${escapeHtml(t.motif)} »</span>` : ""}
        </div>
        <div>
          <span class="bim-tx-amount ${cls}">${sign}${t.amount} BIM</span>
          <span class="bim-tx-balance">Solde : ${t.balance_after}</span>
        </div>
      </li>
    `;
  });
  html += "</ul>";
  DOM.bimHistorique.innerHTML = html;
}

async function chargerMesDemandesBIM() {
  if (!DOM.bimMesDemandes) return;
  try {
    const res = await fetch(`${window.API_BASE}/bims/mes-demandes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur");
    const demandes = await res.json();
    if (!demandes.length) {
      DOM.bimMesDemandes.innerHTML =
        '<p class="muted">Aucune demande pour le moment.</p>';
      return;
    }
    let html = "";
    demandes.forEach((d) => {
      const date = d.created_at
        ? new Date(d.created_at).toLocaleDateString("fr-FR")
        : "";
      html += `
        <div class="bim-tx-item">
          <div class="bim-tx-info">
            <span class="bim-tx-type">${d.quantite} BIM — ${d.prix_total} FCFA</span>
            <span class="bim-tx-date">Demandé le ${date}</span>
            ${d.motif_admin ? `<span class="bim-tx-motif">« ${escapeHtml(d.motif_admin)} »</span>` : ""}
          </div>
          <span class="bim-demande-badge ${d.statut}">
            ${d.statut.replace("_", " ")}
          </span>
        </div>
      `;
    });
    DOM.bimMesDemandes.innerHTML = html;
  } catch (err) {
    console.error("❌ chargerMesDemandesBIM:", err);
  }
}

async function ouvrirModalBIM() {
  if (!DOM.bimModal) return;
  DOM.bimModal.style.display = "flex";
  DOM.bimOffresList.innerHTML = '<p class="muted">Chargement...</p>';
  try {
    const res = await fetch(`${window.API_BASE}/bims/offres`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur");
    const offres = await res.json();
    if (!offres.length) {
      DOM.bimOffresList.innerHTML =
        '<p class="muted">Aucune offre disponible.</p>';
      return;
    }
    DOM.bimOffresList.innerHTML = offres
      .map(
        (o) => `
      <div class="bim-offre-card" data-id="${o.id}">
        <div>
          <div class="bim-offre-qty">${o.quantite} BIM</div>
          <div class="bim-offre-cta">Cliquer pour commander</div>
        </div>
        <div class="bim-offre-price">${o.prix_fcfa} FCFA</div>
      </div>
    `,
      )
      .join("");

    DOM.bimOffresList.querySelectorAll(".bim-offre-card").forEach((card) => {
      card.addEventListener("click", () => envoyerDemandeBIM(card.dataset.id));
    });
  } catch (err) {
    console.error("❌ ouvrirModalBIM:", err);
    DOM.bimOffresList.innerHTML =
      '<p class="muted">Erreur de chargement des offres.</p>';
  }
}

async function envoyerDemandeBIM(offreId) {
  if (!confirm("Confirmer votre demande d'achat ?")) return;
  try {
    const res = await fetch(`${window.API_BASE}/bims/demandes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ offre_id: parseInt(offreId, 10) }),
    });
    const data = await res.json();
    if (res.ok) {
      DOM.bimOffreMessage.textContent =
        "✅ Demande envoyée ! En attente de validation par l'administrateur.";
      DOM.bimOffreMessage.className = "message success";
      setTimeout(() => {
        DOM.bimModal.style.display = "none";
        DOM.bimOffreMessage.textContent = "";
        chargerMesDemandesBIM();
      }, 2000);
    } else {
      DOM.bimOffreMessage.textContent =
        "❌ " + (data.error || "Erreur lors de la demande");
      DOM.bimOffreMessage.className = "message error";
    }
  } catch (err) {
    console.error("❌ envoyerDemandeBIM:", err);
    DOM.bimOffreMessage.textContent = "❌ Erreur réseau";
    DOM.bimOffreMessage.className = "message error";
  }
}

function initBIM() {
  if (DOM.btnObtenirBim) {
    DOM.btnObtenirBim.addEventListener("click", ouvrirModalBIM);
  }
  if (DOM.bimModalCloseBtn) {
    DOM.bimModalCloseBtn.addEventListener("click", () => {
      DOM.bimModal.style.display = "none";
    });
  }
  if (DOM.bimModal) {
    DOM.bimModal.addEventListener("click", (e) => {
      if (e.target === DOM.bimModal) DOM.bimModal.style.display = "none";
    });
  }
  if (DOM.btnParrainerBim) {
    DOM.btnParrainerBim.addEventListener("click", () => {
      // Activer l'onglet Parrainage
      document.querySelectorAll(".tab-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.tab === "parrainage");
      });
      document.querySelectorAll(".tab-content").forEach((c) => {
        c.classList.toggle("active", c.id === "tab-parrainage");
      });
    });
  }
}

// =============================================
// ONGLETS
// =============================================
function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
      const target = document.getElementById(`tab-${this.dataset.tab}`);
      if (target) target.classList.add("active");
    });
  });
}

// =============================================
// UTILITAIRE
// =============================================
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

// =============================================
// MODE SOMBRE
// =============================================
function applySavedTheme() {
  document.body.classList.toggle(
    "dark-mode",
    localStorage.getItem("theme") === "dark",
  );
}

// =============================================
// INIT
// =============================================
async function init() {
  console.log("🚀 Initialisation du profil...");
  applySavedTheme();
  initSidebar();
  initLogout();
  initTabs();
  initAvatarUpload();
  initBIM();
  const user = await chargerProfil();
  if (user) {
    await Promise.all([
      chargerActivite(),
      chargerParrainage(),
      chargerPortefeuilleBIM(),
      chargerMesDemandesBIM(),
    ]);
  }
  console.log("✅ Profil prêt");
}

init();
