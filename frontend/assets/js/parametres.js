// =====================================================
// PARAMÈTRES – Version réelle + support mobile
// =====================================================

const token = localStorage.getItem("token");
if (!token) window.location.href = "authentification.html";

const $ = (id) => document.getElementById(id);

const DOM = {
  toggleSidebarBtn: $("toggleSidebarBtn"),
  burgerBtn: $("burgerBtn"),
  logoutBtnSidebar: $("logoutBtnSidebar"),
  sidebarUserName: $("sidebarUserName"),

  changePasswordBtn: $("changePasswordBtn"),
  twoFactorToggle: $("twoFactorToggle"),
  devicesBtn: $("devicesBtn"),
  logoutAllBtn: $("logoutAllBtn"),

  emailNotifToggle: $("emailNotifToggle"),
  reminderNotifToggle: $("reminderNotifToggle"),
  messageNotifToggle: $("messageNotifToggle"),
  courseNotifToggle: $("courseNotifToggle"),

  languageSelect: $("languageSelect"),
  visibilitySelect: $("visibilitySelect"),
  showCertificatesToggle: $("showCertificatesToggle"),
  downloadDataBtn: $("downloadDataBtn"),
  deleteAccountBtn: $("deleteAccountBtn"),

  themeSelect: $("themeSelect"),
  accentColorSelect: $("accentColorSelect"),

  termsBtn: $("termsBtn"),
  privacyBtn: $("privacyBtn"),
  supportBtn: $("supportBtn"),

  confirmModal: $("confirmModal"),
  modalTitle: $("modalTitle"),
  modalMessage: $("modalMessage"),
  modalConfirmBtn: $("modalConfirmBtn"),
  modalCancelBtn: $("modalCancelBtn"),

  toast: $("toast"),
};

// =============================================
// SIDEBAR (desktop + mobile)
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

function mettreAJourNomUtilisateur() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;
  try {
    const user = JSON.parse(userStr);
    if (DOM.sidebarUserName) {
      DOM.sidebarUserName.textContent =
        `${user.prenom || ""} ${user.nom || ""}`.trim() || "Utilisateur";
    }
  } catch (e) {}
}

// =============================================
// TOAST
// =============================================
let toastTimeout = null;

function showToast(message, type = "success") {
  if (!DOM.toast) return;
  DOM.toast.textContent = message;
  DOM.toast.className = `toast ${type}`;
  clearTimeout(toastTimeout);
  void DOM.toast.offsetWidth;
  DOM.toast.classList.add("show");
  toastTimeout = setTimeout(() => {
    DOM.toast.classList.remove("show");
  }, 4000);
}

// =============================================
// MODAL
// =============================================
let modalCallback = null;

function openModal(title, message, confirmText = "Confirmer", callback) {
  if (!DOM.confirmModal) return;
  DOM.modalTitle.textContent = title;
  DOM.modalMessage.textContent = message;
  DOM.modalConfirmBtn.textContent = confirmText;
  DOM.modalConfirmBtn.className = confirmText.includes("Supprimer")
    ? "btn btn-danger"
    : "btn btn-primary";
  modalCallback = callback;
  DOM.confirmModal.classList.add("active");
}

function closeModal() {
  if (!DOM.confirmModal) return;
  DOM.confirmModal.classList.remove("active");
  modalCallback = null;
}

if (DOM.modalCancelBtn)
  DOM.modalCancelBtn.addEventListener("click", closeModal);
if (DOM.confirmModal) {
  DOM.confirmModal.addEventListener("click", (e) => {
    if (e.target === DOM.confirmModal) closeModal();
  });
}
if (DOM.modalConfirmBtn) {
  DOM.modalConfirmBtn.addEventListener("click", () => {
    if (modalCallback) modalCallback();
    closeModal();
  });
}

// =============================================
// 1. SÉCURITÉ
// =============================================
if (DOM.changePasswordBtn) {
  DOM.changePasswordBtn.addEventListener("click", () => {
    window.location.href = "compte.html#tab-info";
  });
}

// 2FA
if (DOM.twoFactorToggle) {
  DOM.twoFactorToggle.addEventListener("change", async function () {
    try {
      const response = await fetch(`${window.API_BASE}/user/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ two_factor_enabled: this.checked }),
      });
      if (response.ok) {
        showToast(
          `🔒 2FA ${this.checked ? "activée" : "désactivée"}`,
          "success",
        );
      } else {
        this.checked = !this.checked;
        showToast("❌ Erreur de sauvegarde", "error");
      }
    } catch (error) {
      this.checked = !this.checked;
      showToast("❌ Erreur réseau", "error");
    }
  });
}

// Appareils connectés
if (DOM.devicesBtn) {
  DOM.devicesBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`${window.API_BASE}/user/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const devices = await response.json();
        if (!devices || devices.length === 0) {
          showToast("📱 Aucun appareil enregistré", "info");
          return;
        }
        let msg = "📱 Appareils connectés :\n";
        devices.forEach((d, i) => {
          msg += `${i + 1}. ${d.name} - ${d.last_activity}\n`;
        });
        alert(msg);
      } else {
        showToast("⚠️ Fonctionnalité bientôt disponible", "info");
      }
    } catch (error) {
      showToast("❌ Erreur réseau", "error");
    }
  });
}

// Déconnexion tous appareils
if (DOM.logoutAllBtn) {
  DOM.logoutAllBtn.addEventListener("click", () => {
    openModal(
      "🚪 Déconnexion totale",
      "Vous serez déconnecté de tous vos appareils.",
      "Déconnecter tout",
      async () => {
        try {
          const response = await fetch(`${window.API_BASE}/user/logout-all`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            localStorage.clear();
            showToast("🔒 Déconnecté de tous les appareils", "success");
            setTimeout(() => (window.location.href = "../index.html"), 1000);
          } else {
            showToast("❌ Erreur", "error");
          }
        } catch (error) {
          showToast("❌ Erreur réseau", "error");
        }
      },
    );
  });
}

// =============================================
// 2. NOTIFICATIONS
// =============================================
function saveNotificationSettings() {
  if (
    !DOM.emailNotifToggle ||
    !DOM.reminderNotifToggle ||
    !DOM.messageNotifToggle ||
    !DOM.courseNotifToggle
  ) {
    return;
  }
  const body = {
    notifications_email: DOM.emailNotifToggle.checked,
    notifications_reminder: DOM.reminderNotifToggle.checked,
    notifications_message: DOM.messageNotifToggle.checked,
    notifications_course: DOM.courseNotifToggle.checked,
  };

  fetch(`${window.API_BASE}/user/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (response.ok) showToast("✅ Notifications sauvegardées", "success");
      else showToast("❌ Erreur de sauvegarde", "error");
    })
    .catch(() => showToast("❌ Erreur réseau", "error"));
}

[
  DOM.emailNotifToggle,
  DOM.reminderNotifToggle,
  DOM.messageNotifToggle,
  DOM.courseNotifToggle,
].forEach((toggle) => {
  if (toggle) toggle.addEventListener("change", saveNotificationSettings);
});

// =============================================
// 3. LANGUE
// =============================================
if (DOM.languageSelect) {
  const savedLang = localStorage.getItem("language") || "fr";
  DOM.languageSelect.value = savedLang;

  DOM.languageSelect.addEventListener("change", function () {
    localStorage.setItem("language", this.value);
    showToast(
      `🌍 Langue : ${this.options[this.selectedIndex].text}`,
      "success",
    );
  });
}

// =============================================
// 4. CONFIDENTIALITÉ
// =============================================
function savePrivacySettings() {
  if (!DOM.visibilitySelect || !DOM.showCertificatesToggle) return;
  const body = {
    profile_visibility: DOM.visibilitySelect.value,
    show_certificates: DOM.showCertificatesToggle.checked,
  };
  fetch(`${window.API_BASE}/user/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (response.ok) showToast("✅ Confidentialité sauvegardée", "success");
      else showToast("❌ Erreur", "error");
    })
    .catch(() => showToast("❌ Erreur réseau", "error"));
}

if (DOM.visibilitySelect)
  DOM.visibilitySelect.addEventListener("change", savePrivacySettings);
if (DOM.showCertificatesToggle)
  DOM.showCertificatesToggle.addEventListener("change", savePrivacySettings);

// Télécharger données
if (DOM.downloadDataBtn) {
  DOM.downloadDataBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`${window.API_BASE}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const user = await response.json();
        const data = {
          user,
          date: new Date().toISOString(),
          platform: "CampusBox",
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `campusbox-data-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("✅ Données téléchargées", "success");
      } else {
        showToast("❌ Erreur", "error");
      }
    } catch (error) {
      showToast("❌ Erreur réseau", "error");
    }
  });
}

// Supprimer compte
if (DOM.deleteAccountBtn) {
  DOM.deleteAccountBtn.addEventListener("click", () => {
    openModal(
      "🗑️ Supprimer mon compte",
      "Cette action est irréversible. Toutes vos données seront supprimées.",
      "Supprimer définitivement",
      async () => {
        try {
          const response = await fetch(`${window.API_BASE}/user/account`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            localStorage.clear();
            showToast("🗑️ Compte supprimé", "success");
            setTimeout(() => (window.location.href = "../index.html"), 1500);
          } else {
            const data = await response.json();
            showToast("❌ " + (data.message || "Erreur"), "error");
          }
        } catch (error) {
          showToast("❌ Erreur réseau", "error");
        }
      },
    );
  });
}

// =============================================
// 5. PRÉFÉRENCES
// =============================================
if (DOM.themeSelect) {
  DOM.themeSelect.addEventListener("change", function () {
    const theme = this.value;
    localStorage.setItem("theme", theme);
    applyTheme(theme);
    showToast(
      `🎨 Mode ${
        theme === "light" ? "clair" : theme === "dark" ? "sombre" : "système"
      }`,
      "success",
    );
  });
}

function applyTheme(theme) {
  const dark =
    theme === "dark" ||
    (theme === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.body.classList.toggle("dark-mode", dark);
}

const savedTheme = localStorage.getItem("theme") || "light";
if (DOM.themeSelect) DOM.themeSelect.value = savedTheme;
applyTheme(savedTheme);

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (DOM.themeSelect && DOM.themeSelect.value === "auto") applyTheme("auto");
  });

if (DOM.accentColorSelect) {
  const savedAccent = localStorage.getItem("accentColor") || "#3b82f6";
  DOM.accentColorSelect.value = savedAccent;
  document.documentElement.style.setProperty("--accent-color", savedAccent);

  DOM.accentColorSelect.addEventListener("change", function () {
    localStorage.setItem("accentColor", this.value);
    document.documentElement.style.setProperty("--accent-color", this.value);
    showToast("🎨 Couleur d'accent mise à jour", "success");
  });
}

// =============================================
// 6. À PROPOS
// =============================================
// ⚠️ Les fichiers terms.html et privacy.html n'existent pas encore.
// On affiche une info au lieu d'ouvrir un 404.

if (DOM.termsBtn) {
  DOM.termsBtn.addEventListener("click", () => {
    showToast("📄 Conditions d'utilisation : bientôt disponibles", "info");
  });
}
if (DOM.privacyBtn) {
  DOM.privacyBtn.addEventListener("click", () => {
    showToast("🔒 Politique de confidentialité : bientôt disponible", "info");
  });
}
if (DOM.supportBtn) {
  DOM.supportBtn.addEventListener("click", () => {
    window.location.href = "mailto:support@campusbox.com";
  });
}

// =============================================
// 7. CHARGER LES PARAMÈTRES DEPUIS LE BACKEND
// =============================================
async function chargerParametres() {
  try {
    const response = await fetch(`${window.API_BASE}/user/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const settings = await response.json();
      if (DOM.emailNotifToggle)
        DOM.emailNotifToggle.checked = settings.notifications_email !== false;
      if (DOM.reminderNotifToggle)
        DOM.reminderNotifToggle.checked =
          settings.notifications_reminder !== false;
      if (DOM.messageNotifToggle)
        DOM.messageNotifToggle.checked =
          settings.notifications_message !== false;
      if (DOM.courseNotifToggle)
        DOM.courseNotifToggle.checked = settings.notifications_course !== false;
      if (DOM.visibilitySelect)
        DOM.visibilitySelect.value = settings.profile_visibility || "public";
      if (DOM.showCertificatesToggle)
        DOM.showCertificatesToggle.checked =
          settings.show_certificates !== false;
      if (DOM.twoFactorToggle)
        DOM.twoFactorToggle.checked = settings.two_factor_enabled || false;
    } else {
      console.warn("⚠️ Impossible de charger les paramètres depuis le backend");
    }
  } catch (error) {
    console.error("❌ Erreur chargement paramètres:", error);
  }
}

// =============================================
// 8. INIT
// =============================================
async function init() {
  initSidebar();
  initLogout();
  mettreAJourNomUtilisateur();
  await chargerParametres();
}

init();
