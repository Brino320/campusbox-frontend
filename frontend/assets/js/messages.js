// =====================================================
// MESSAGES – Version finale + Surnoms + Invitations + Admins
// =====================================================

const token = localStorage.getItem("token");
if (!token) window.location.href = "authentification.html";

const API_BASE = window.API_BASE || "http://localhost:3000/api";

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
// PING
// =============================================
function envoyerPing() {
  if (!token) return;
  fetch(`${API_BASE}/user/ping`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}
setInterval(envoyerPing, 30000);
envoyerPing();
document.addEventListener("click", envoyerPing);
document.addEventListener("keydown", envoyerPing);

// =============================================
// DOM
// =============================================
const $ = (id) => document.getElementById(id);

const DOM = {
  toggleSidebarBtn: $("toggleSidebarBtn"),
  burgerBtn: $("burgerBtn"),
  logoutBtnSidebar: $("logoutBtnSidebar"),
  sidebarUserName: $("sidebarUserName"),
  sidebarUserAvatar: $("sidebarUserAvatar"),
  listPanel: $("listPanel"),
  conversationPanel: $("conversationPanel"),
  backToListBtn: $("backToListBtn"),
  searchConvInput: $("searchConvInput"),
  filterChips: $("filterChips"),
  conversationList: $("conversationList"),
  newMessageBtn: $("newMessageBtn"),
  createGroupBtn: $("createGroupBtn"),
  createRoomBtn: $("createRoomBtn"),
  invitationsBtn: $("invitationsBtn"),
  chatName: $("chatName"),
  chatAvatar: $("chatAvatar"),
  chatStatus: $("chatStatus"),
  chatMessages: $("chatMessages"),
  msgInput: $("msgInput"),
  sendBtn: $("sendBtn"),
  emojiBtn: $("emojiBtn"),
  fileBtn: $("fileBtn"),
  fileInput: $("fileInput"),
  chatOptionsBtn: $("chatOptionsBtn"),
  emojiPicker: $("emojiPicker"),
  emojiContainer: $("emojiContainer"),
  newMessageModal: $("newMessageModal"),
  searchUserInput: $("searchUserInput"),
  searchResults: $("searchResults"),
  closeNewMsgModal: $("closeNewMsgModal"),
  chatOptionsModal: $("chatOptionsModal"),
  pinConvBtn: $("pinConvBtn"),
  muteConvBtn: $("muteConvBtn"),
  viewMembersBtn: $("viewMembersBtn"),
  clearConvBtn: $("clearConvBtn"),
  deleteConvBtn: $("deleteConvBtn"),
  closeChatOptions: $("closeChatOptions"),
  toast: $("toast"),
  createGroupModal: $("createGroupModal"),
  groupNameInput: $("groupNameInput"),
  groupDescInput: $("groupDescInput"),
  groupMembersInput: $("groupMembersInput"),
  closeGroupModal: $("closeGroupModal"),
  saveGroupBtn: $("saveGroupBtn"),
  createRoomModal: $("createRoomModal"),
  roomNameInput: $("roomNameInput"),
  roomDescInput: $("roomDescInput"),
  roomLimitInput: $("roomLimitInput"),
  roomVisibilityInput: $("roomVisibilityInput"),
  roomCodeInput: $("roomCodeInput"),
  generateCodeBtn: $("generateCodeBtn"),
  closeRoomModal: $("closeRoomModal"),
  saveRoomBtn: $("saveRoomBtn"),
  profilePanel: $("userProfilePanel"),
  profileOverlay: $("profileOverlay"),
  closeProfileBtn: $("closeProfilePanel"),
  profilePic: $("profilePic"),
  profileName: $("profileName"),
  profileUsername: $("profileUsername"),
  profileStatus: $("profileStatus"),
  profileFiliere: $("profileFiliere"),
  profilePays: $("profilePays"),
  profileBio: $("profileBio"),
  profileSendMsg: $("profileSendMsg"),
  profileNickname: $("profileNickname"),
  profileInviteGroup: $("profileInviteGroup"),
  profileInviteRoom: $("profileInviteRoom"),
  profileBlock: $("profileBlock"),
  profileReport: $("profileReport"),
  chatUserInfo: $("chatUserInfo"),
  micBtn: $("micBtn"),
  recordingIndicator: $("recordingIndicator"),
  recTime: $("recTime"),
  cancelRecBtn: $("cancelRecBtn"),
  sendRecBtn: $("sendRecBtn"),
  nicknameModal: $("nicknameModal"),
  nicknameTarget: $("nicknameTarget"),
  nicknameInput: $("nicknameInput"),
  closeNicknameModal: $("closeNicknameModal"),
  saveNicknameBtn: $("saveNicknameBtn"),
  removeNicknameBtn: $("removeNicknameBtn"),
  membersModal: $("membersModal"),
  inviteFormGroup: $("inviteFormGroup"),
  inviteUsernameInput: $("inviteUsernameInput"),
  sendInviteBtn: $("sendInviteBtn"),
  membersListContainer: $("membersListContainer"),
  shareGroupBtn: $("shareGroupBtn"),
  leaveGroupBtn: $("leaveGroupBtn"),
  closeMembersModal: $("closeMembersModal"),
  shareLinkContainer: $("shareLinkContainer"),
  invitationsModal: $("invitationsModal"),
  invitationsListContainer: $("invitationsListContainer"),
  closeInvitationsModal: $("closeInvitationsModal"),
};

// =============================================
// ÉMOJIS
// =============================================
const emojis = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😃",
  "😄",
  "😅",
  "😆",
  "😉",
  "😊",
  "😋",
  "😎",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "☺️",
  "🙂",
  "🤗",
  "🤩",
  "🤔",
  "🤨",
  "😐",
  "😑",
  "😶",
  "🙄",
  "😏",
  "😣",
  "😥",
  "😮",
  "🤐",
  "😯",
  "😪",
  "😫",
  "😴",
  "😌",
  "😛",
  "😜",
  "😝",
  "🤤",
  "😒",
  "😓",
  "😔",
  "😕",
  "🙃",
  "🤑",
  "😲",
  "☹️",
  "🙁",
  "😖",
  "😞",
  "😟",
  "😤",
  "😢",
  "😭",
  "😦",
  "😧",
  "😨",
  "😩",
  "🤯",
  "😬",
  "😰",
  "😱",
  "🥵",
  "🥶",
  "😳",
  "🤪",
  "😵",
  "😡",
  "😠",
  "🤬",
  "👍",
  "👎",
  "👊",
  "✊",
  "🤛",
  "🤜",
  "👏",
  "🙌",
  "👐",
  "🤲",
  "🤝",
  "🙏",
  "✌️",
  "🤟",
  "🤘",
  "👌",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "💔",
  "💕",
  "💞",
  "💓",
  "💗",
  "💖",
  "✨",
  "🌟",
  "⭐",
  "🌙",
  "☀️",
  "⚡",
  "🔥",
  "💧",
  "🌈",
  "☁️",
  "❄️",
  "⛄",
  "🌊",
  "🎉",
  "🎊",
  "🎁",
  "🎈",
  "🎀",
  "🎂",
  "🎄",
  "🎃",
  "🎆",
  "🎇",
  "🎵",
  "🎶",
  "🎤",
  "🎧",
  "📱",
  "💻",
  "⌨️",
  "🖥️",
  "🖱️",
  "🖨️",
  "📷",
  "📸",
  "📹",
  "🎥",
  "📽️",
  "🎞️",
  "📞",
  "📠",
  "📡",
  "🔋",
  "🔌",
  "💡",
  "🔦",
  "🕯️",
  "🚀",
];

function genererEmojis() {
  if (!DOM.emojiContainer) return;
  DOM.emojiContainer.innerHTML = "";
  emojis.forEach((emoji) => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.style.cursor = "pointer";
    span.style.padding = "0.15rem";
    span.style.borderRadius = "4px";
    span.addEventListener("click", () => {
      DOM.msgInput.value += emoji;
      DOM.msgInput.focus();
      DOM.emojiPicker.classList.remove("open");
    });
    DOM.emojiContainer.appendChild(span);
  });
}

if (DOM.emojiBtn) {
  DOM.emojiBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    DOM.emojiPicker.classList.toggle("open");
  });
}
document.addEventListener("click", () => {
  if (DOM.emojiPicker) DOM.emojiPicker.classList.remove("open");
});

// =============================================
// SIDEBAR
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
    if (DOM.sidebarUserAvatar) {
      if (user.avatar_url) {
        DOM.sidebarUserAvatar.innerHTML = `<img src="${escapeHtml(user.avatar_url)}" alt="" />`;
        DOM.sidebarUserAvatar.style.background = "transparent";
      } else {
        const initials = (user.prenom?.[0] || "") + (user.nom?.[0] || "");
        DOM.sidebarUserAvatar.textContent = initials.toUpperCase() || "👤";
        DOM.sidebarUserAvatar.style.background = "#3b82f6";
      }
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
// MODALES
// =============================================
function openModal(modal) {
  if (modal) modal.style.display = "flex";
}
function closeModal(modal) {
  if (modal) modal.style.display = "none";
}

document.querySelectorAll(".modal-overlay").forEach((m) => {
  m.addEventListener("click", (e) => {
    if (e.target === m) closeModal(m);
  });
});

// Listeners fermeture modales
if (DOM.closeNewMsgModal)
  DOM.closeNewMsgModal.addEventListener("click", () =>
    closeModal(DOM.newMessageModal),
  );
if (DOM.closeChatOptions)
  DOM.closeChatOptions.addEventListener("click", () =>
    closeModal(DOM.chatOptionsModal),
  );
if (DOM.closeGroupModal)
  DOM.closeGroupModal.addEventListener("click", () =>
    closeModal(DOM.createGroupModal),
  );
if (DOM.closeRoomModal)
  DOM.closeRoomModal.addEventListener("click", () =>
    closeModal(DOM.createRoomModal),
  );
if (DOM.closeNicknameModal)
  DOM.closeNicknameModal.addEventListener("click", () =>
    closeModal(DOM.nicknameModal),
  );
if (DOM.closeMembersModal)
  DOM.closeMembersModal.addEventListener("click", () =>
    closeModal(DOM.membersModal),
  );
if (DOM.closeInvitationsModal)
  DOM.closeInvitationsModal.addEventListener("click", () =>
    closeModal(DOM.invitationsModal),
  );

// =============================================
// PROFIL UTILISATEUR
// =============================================
let profileUserId = null;

function openUserProfile(userId) {
  profileUserId = userId;
  fetch(`${API_BASE}/user/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((user) => {
      if (user.avatar_url) {
        DOM.profilePic.innerHTML = `<img src="${escapeHtml(user.avatar_url)}" alt="" />`;
        DOM.profilePic.style.background = "transparent";
      } else {
        const initials = (user.prenom?.[0] || "") + (user.nom?.[0] || "");
        DOM.profilePic.textContent = initials.toUpperCase() || "👤";
        DOM.profilePic.style.background = "#3b82f6";
      }

      DOM.profileName.textContent =
        `${user.prenom || ""} ${user.nom || ""}`.trim();
      DOM.profileUsername.textContent = `@${user.username || ""}`;
      DOM.profileStatus.textContent = user.online
        ? "🟢 En ligne"
        : "⚪ Hors ligne";
      DOM.profileStatus.style.color = user.online ? "#10b981" : "#94a3b8";
      DOM.profileFiliere.textContent = user.filiere || "Non renseignée";
      DOM.profilePays.textContent = user.pays || "Non renseigné";
      DOM.profileBio.textContent = user.bio || "Aucune bio";
      DOM.profileSendMsg.dataset.userId = user.id;
      if (DOM.profileNickname) {
        DOM.profileNickname.dataset.userId = user.id;
        DOM.profileNickname.dataset.userName =
          `${user.prenom || ""} ${user.nom || ""}`.trim();
      }
      DOM.profileInviteGroup.dataset.userId = user.id;
      DOM.profileInviteGroup.dataset.username = user.username || "";
      DOM.profileInviteRoom.dataset.userId = user.id;
      DOM.profileBlock.dataset.userId = user.id;
      DOM.profileReport.dataset.userId = user.id;
      DOM.profilePanel.style.right = "0";
      DOM.profileOverlay.style.display = "block";
    })
    .catch((err) => {
      showToast("❌ Erreur chargement du profil", "error");
      console.error(err);
    });
}

function closeUserProfile() {
  DOM.profilePanel.style.right = "-400px";
  DOM.profileOverlay.style.display = "none";
}

if (DOM.closeProfileBtn)
  DOM.closeProfileBtn.addEventListener("click", closeUserProfile);
if (DOM.profileOverlay)
  DOM.profileOverlay.addEventListener("click", closeUserProfile);

if (DOM.chatUserInfo) {
  DOM.chatUserInfo.addEventListener("click", function () {
    if (currentConvId) {
      const conv = getConversationById(currentConvId);
      if (conv && conv.other_user_id) openUserProfile(conv.other_user_id);
    }
  });
}

if (DOM.profileSendMsg) {
  DOM.profileSendMsg.addEventListener("click", function () {
    const userId = this.dataset.userId;
    closeUserProfile();
    createPrivateConversation(userId)
      .then((data) => {
        if (data.conversation_id) {
          chargerConversations();
          setTimeout(() => {
            const conv = getConversationById(data.conversation_id);
            if (conv) ouvrirConversation(conv.id);
          }, 500);
          showToast("💬 Conversation ouverte", "success");
        }
      })
      .catch((err) => showToast("❌ Erreur: " + err.message, "error"));
  });
}

if (DOM.profileNickname) {
  DOM.profileNickname.addEventListener("click", function () {
    const userId = parseInt(this.dataset.userId);
    const userName = this.dataset.userName;
    closeUserProfile();
    openNicknameModal(userId, userName);
  });
}

if (DOM.profileInviteGroup) {
  DOM.profileInviteGroup.addEventListener("click", function () {
    closeUserProfile();
    DOM.groupMembersInput.value = this.dataset.username
      ? `@${this.dataset.username}`
      : "";
    openModal(DOM.createGroupModal);
  });
}

if (DOM.profileInviteRoom) {
  DOM.profileInviteRoom.addEventListener("click", function () {
    closeUserProfile();
    openModal(DOM.createRoomModal);
  });
}

if (DOM.profileBlock) {
  DOM.profileBlock.addEventListener("click", function () {
    showToast("🚫 Utilisateur bloqué (simulé)", "success");
  });
}

if (DOM.profileReport) {
  DOM.profileReport.addEventListener("click", function () {
    showToast("🚨 Signalement envoyé (simulé)", "success");
  });
}

// =============================================
// API
// =============================================
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const finalOptions = { ...defaultOptions, ...options };
  const response = await fetch(url, finalOptions);
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erreur serveur" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

function getConversations() {
  return apiFetch("/user/conversations");
}
function getMessages(convId) {
  return apiFetch(`/user/messages/${convId}`);
}
function sendMessage(convId, text) {
  return apiFetch("/user/messages", {
    method: "POST",
    body: JSON.stringify({ conversation_id: convId, text }),
  });
}
function createPrivateConversation(otherUserId) {
  return apiFetch("/user/conversations/private", {
    method: "POST",
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
}
function pinConversation(convId, pinned) {
  return apiFetch(`/user/conversations/${convId}/pin`, {
    method: "PUT",
    body: JSON.stringify({ pinned }),
  });
}
function muteConversation(convId, muted) {
  return apiFetch(`/user/conversations/${convId}/mute`, {
    method: "PUT",
    body: JSON.stringify({ muted }),
  });
}
function clearConversation(convId) {
  return apiFetch(`/user/conversations/${convId}/clear`, { method: "DELETE" });
}
function deleteConversation(convId) {
  return apiFetch(`/user/conversations/${convId}`, { method: "DELETE" });
}
function searchUsers(query) {
  return apiFetch(`/user/search?q=${encodeURIComponent(query)}`);
}
function createGroup(name, description, members) {
  return apiFetch("/user/conversations/group", {
    method: "POST",
    body: JSON.stringify({ name, description, members }),
  });
}
function createRoom(name, description, max_participants, is_public) {
  return apiFetch("/user/conversations/room", {
    method: "POST",
    body: JSON.stringify({ name, description, max_participants, is_public }),
  });
}
function sendAudioMessage(convId, audioBase64, duration) {
  return apiFetch("/user/messages/audio", {
    method: "POST",
    body: JSON.stringify({
      conversation_id: convId,
      audio: audioBase64,
      duration: duration,
    }),
  });
}

// =============================================
// CONVERSATIONS
// =============================================
let conversations = [];
let currentConvId = null;
let activeFilter = "all";
let pollingInterval = null;
let currentConversationType = "private";
let nicknames = {};

async function chargerNicknames() {
  try {
    const resp = await fetch(`${API_BASE}/user/nicknames`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) {
      nicknames = await resp.json();
    }
  } catch (e) {
    console.error("Erreur nicknames:", e);
  }
}

async function chargerConversations() {
  try {
    await chargerNicknames();
    conversations = await getConversations();
    afficherConversations();
  } catch (error) {
    showToast("❌ Erreur chargement conversations: " + error.message, "error");
  }
}

function getConversationById(id) {
  return conversations.find((c) => c.id === id);
}

function afficherConversations() {
  if (!DOM.conversationList) return;

  let filtered = [...conversations];

  if (activeFilter === "unread")
    filtered = filtered.filter((c) => c.unread > 0);
  else if (activeFilter === "pinned")
    filtered = filtered.filter((c) => c.pinned);
  else if (activeFilter === "official")
    filtered = filtered.filter((c) => c.is_official);

  const search = DOM.searchConvInput.value.toLowerCase().trim();
  if (search) {
    filtered = filtered.filter((c) => {
      const displayName =
        (c.other_user_id && nicknames[c.other_user_id]) || c.name;
      return (displayName || "").toLowerCase().includes(search);
    });
  }

  if (filtered.length === 0) {
    DOM.conversationList.innerHTML = `
      <div class="empty-state">
        <span class="icon">💬</span>
        <h3>Aucune conversation</h3>
        <p>${search ? "Aucun résultat." : "Commencez une discussion."}</p>
      </div>
    `;
    return;
  }

  filtered.sort((a, b) => {
    if (a.is_official !== b.is_official) return b.is_official ? 1 : -1;
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
    return 0;
  });

  let html = "";
  filtered.forEach((c) => {
    const activeClass = c.id === currentConvId ? "active" : "";
    const officialClass = c.is_official ? "official" : "";
    const unreadBadge =
      c.unread > 0 ? `<span class="badge-unread">${c.unread}</span>` : "";
    const pinIcon = c.pinned ? `<span class="pin-icon">📌</span>` : "";
    const officialBadge = c.is_official
      ? `<span class="official-badge">Officiel</span>`
      : "";

    // ✅ Surnom si présent
    const customNickname = c.other_user_id ? nicknames[c.other_user_id] : null;
    const displayName = customNickname || c.name;
    const realNameSuffix = customNickname
      ? `<span class="nickname-badge">(${escapeHtml(c.name)})</span>`
      : "";

    // ✅ Nom cliquable
    const nameHtml = c.other_user_id
      ? `<span class="conv-name" data-user-id="${c.other_user_id}" data-name="${escapeHtml(displayName)}" data-real-name="${escapeHtml(c.name)}">${escapeHtml(displayName)}</span>${realNameSuffix}`
      : escapeHtml(c.name);

    const usernameDisplay = c.username
      ? `<span style="color:#94a3b8;font-weight:400;font-size:0.75rem;">@${escapeHtml(c.username)}</span>`
      : "";
    const onlineDot = c.online
      ? `<span class="online-dot"></span>`
      : `<span class="online-dot offline"></span>`;
    const typeIcon = c.type === "group" ? "👥" : c.type === "room" ? "🏫" : "";
    const participantsCount = c.participants_count
      ? ` <span class="group-info-badge">${c.participants_count} membres</span>`
      : "";

    let avatarContent;
    if (c.avatar_url) {
      avatarContent = `<img src="${escapeHtml(c.avatar_url)}" alt="" />`;
    } else {
      avatarContent = c.avatar || "👤";
    }

    html += `
      <div class="conversation-item ${activeClass} ${officialClass}" data-id="${c.id}">
        <div class="avatar ${c.type === "group" ? "group" : ""}" style="cursor:pointer;position:relative;">
          ${avatarContent}
          ${c.type !== "group" ? onlineDot : ""}
          ${typeIcon ? `<span style="position:absolute; bottom:-4px; right:-4px; font-size:0.7rem;">${typeIcon}</span>` : ""}
        </div>
        <div class="info">
          <div class="name">${nameHtml} ${officialBadge}${participantsCount} ${usernameDisplay} ${unreadBadge} ${pinIcon}</div>
          <div class="last-msg">${escapeHtml(c.lastMsg || "Aucun message")}</div>
        </div>
        <div class="time">${c.time || "Hier"}</div>
      </div>
    `;
  });
  DOM.conversationList.innerHTML = html;

  // Clic sur conv
  document.querySelectorAll(".conversation-item").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest(".avatar") || e.target.closest(".conv-name")) return;
      const id = parseInt(el.dataset.id);
      ouvrirConversation(id);
    });
  });

  // Clic sur nom
  document.querySelectorAll(".conv-name").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const userId = parseInt(el.dataset.userId);
      const displayName = el.dataset.name;
      const realName = el.dataset.realName;
      if (!userId) return;
      openNicknameModal(userId, realName);
    });
  });
}

// =============================================
// MODALE SURNOM
// =============================================
let nicknameTargetId = null;

function openNicknameModal(userId, currentDisplayName) {
  nicknameTargetId = userId;
  if (DOM.nicknameTarget)
    DOM.nicknameTarget.textContent = currentDisplayName || "cet utilisateur";
  if (DOM.nicknameInput) {
    DOM.nicknameInput.value = nicknames[userId] || "";
  }
  openModal(DOM.nicknameModal);
}

if (DOM.saveNicknameBtn) {
  DOM.saveNicknameBtn.addEventListener("click", async () => {
    const nickname = DOM.nicknameInput.value.trim();
    if (!nickname) {
      showToast("❌ Surnom requis", "error");
      return;
    }
    try {
      const resp = await fetch(
        `${API_BASE}/user/nickname/${nicknameTargetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nickname }),
        },
      );
      if (resp.ok) {
        showToast("✅ Surnom enregistré", "success");
        closeModal(DOM.nicknameModal);
        await chargerConversations();
      } else {
        const err = await resp.json();
        showToast("❌ " + (err.error || "Erreur"), "error");
      }
    } catch (error) {
      showToast("❌ Erreur réseau", "error");
    }
  });
}

if (DOM.removeNicknameBtn) {
  DOM.removeNicknameBtn.addEventListener("click", async () => {
    if (!nicknameTargetId) return;
    try {
      const resp = await fetch(
        `${API_BASE}/user/nickname/${nicknameTargetId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (resp.ok) {
        showToast("🗑️ Surnom retiré", "success");
        closeModal(DOM.nicknameModal);
        await chargerConversations();
      }
    } catch (error) {
      showToast("❌ Erreur réseau", "error");
    }
  });
}

// =============================================
// FILTRES
// =============================================
if (DOM.filterChips) {
  DOM.filterChips.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    DOM.filterChips
      .querySelectorAll(".filter-chip")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter || "all";
    afficherConversations();
  });
}

if (DOM.searchConvInput) {
  DOM.searchConvInput.addEventListener("input", afficherConversations);
}

if (DOM.backToListBtn) {
  DOM.backToListBtn.addEventListener("click", () => {
    if (window.innerWidth <= 900) {
      DOM.listPanel.classList.remove("hidden");
      DOM.conversationPanel.classList.remove("active");
      arreterPolling();
    }
  });
}

// =============================================
// CRÉATION GROUPE / SALLE
// =============================================
if (DOM.createGroupBtn) {
  DOM.createGroupBtn.addEventListener("click", () => {
    DOM.groupNameInput.value = "";
    DOM.groupDescInput.value = "";
    DOM.groupMembersInput.value = "";
    openModal(DOM.createGroupModal);
  });
}

if (DOM.saveGroupBtn) {
  DOM.saveGroupBtn.addEventListener("click", async () => {
    const name = DOM.groupNameInput.value.trim();
    if (!name) {
      showToast("❌ Nom requis", "error");
      return;
    }
    const members = DOM.groupMembersInput.value
      .split(",")
      .map((s) => s.trim().replace("@", ""))
      .filter(Boolean);
    try {
      const data = await createGroup(
        name,
        DOM.groupDescInput.value.trim(),
        members,
      );
      if (data.conversation_id) {
        closeModal(DOM.createGroupModal);
        showToast(`✅ Groupe "${name}" créé`, "success");
        chargerConversations();
      } else {
        showToast("❌ Erreur création", "error");
      }
    } catch (error) {
      showToast("❌ Erreur: " + error.message, "error");
    }
  });
}

function genererCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++)
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  DOM.roomCodeInput.value = code;
}
if (DOM.generateCodeBtn)
  DOM.generateCodeBtn.addEventListener("click", genererCode);

if (DOM.createRoomBtn) {
  DOM.createRoomBtn.addEventListener("click", () => {
    DOM.roomNameInput.value = "";
    DOM.roomDescInput.value = "";
    DOM.roomLimitInput.value = 10;
    DOM.roomVisibilityInput.value = "public";
    genererCode();
    openModal(DOM.createRoomModal);
  });
}

if (DOM.saveRoomBtn) {
  DOM.saveRoomBtn.addEventListener("click", async () => {
    const name = DOM.roomNameInput.value.trim();
    if (!name) {
      showToast("❌ Nom requis", "error");
      return;
    }
    try {
      const data = await createRoom(
        name,
        DOM.roomDescInput.value.trim(),
        parseInt(DOM.roomLimitInput.value) || 10,
        DOM.roomVisibilityInput.value === "public",
      );
      if (data.conversation_id) {
        closeModal(DOM.createRoomModal);
        showToast(`✅ Salle "${name}" créée`, "success");
        chargerConversations();
      } else {
        showToast("❌ Erreur création", "error");
      }
    } catch (error) {
      showToast("❌ Erreur: " + error.message, "error");
    }
  });
}

// =============================================
// CHAT
// =============================================
function ouvrirConversation(id) {
  currentConvId = id;
  const conv = getConversationById(id);
  if (!conv) return;

  currentConversationType = conv.type || "private";

  const customNickname = conv.other_user_id
    ? nicknames[conv.other_user_id]
    : null;
  const displayName = customNickname || conv.name;

  DOM.chatName.textContent =
    displayName + (conv.username ? ` @${conv.username}` : "");

  if (conv.avatar_url) {
    DOM.chatAvatar.innerHTML = `<img src="${escapeHtml(conv.avatar_url)}" alt="" />`;
  } else {
    DOM.chatAvatar.textContent = conv.avatar || "👤";
  }

  DOM.chatStatus.textContent = conv.online ? "🟢 En ligne" : "⚪ Hors ligne";
  DOM.chatStatus.style.color = conv.online ? "#10b981" : "#94a3b8";

  if (window.innerWidth <= 900) {
    DOM.listPanel.classList.add("hidden");
    DOM.conversationPanel.classList.add("active");
  }

  conv.unread = 0;
  afficherConversations();
  demarrerPolling(id);
  chargerMessages(id);
}

function demarrerPolling(convId) {
  arreterPolling();
  pollingInterval = setInterval(() => {
    if (currentConvId === convId) chargerMessages(convId, true);
    else arreterPolling();
  }, 3000);
}

function arreterPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

let isLoadingMessages = false;

async function chargerMessages(convId, silent = false) {
  if (isLoadingMessages) return;
  isLoadingMessages = true;
  try {
    const messages = await getMessages(convId);
    if (currentConvId === convId) afficherMessages(messages);
    isLoadingMessages = false;
  } catch (error) {
    if (!silent) showToast("❌ Erreur chargement messages", "error");
    isLoadingMessages = false;
  }
}

function afficherMessages(messages) {
  if (!messages || messages.length === 0) {
    DOM.chatMessages.innerHTML = `
      <div class="empty-state">
        <span class="icon">💬</span>
        <h3>Pas encore de messages</h3>
        <p>Soyez le premier à envoyer un message !</p>
      </div>
    `;
    return;
  }

  let html = "";
  messages.forEach((msg) => {
    const cls = msg.sender === "me" ? "sent" : "received";
    const ticks = msg.read ? "✓✓" : "✓";

    let senderInfo = "";
    if (currentConversationType === "group" && msg.sender !== "me") {
      const displayName =
        msg.sender_prenom || msg.sender_username || "Utilisateur";
      const initials = escapeHtml(
        (
          (msg.sender_prenom?.[0] || "") + (msg.sender_nom?.[0] || "")
        ).toUpperCase() || "U",
      );
      const avatarInner = msg.sender_avatar_url
        ? `<img src="${escapeHtml(msg.sender_avatar_url)}" alt="" />`
        : initials;

      senderInfo = `
        <div class="msg-with-avatar">
          <div class="msg-sender-avatar">${avatarInner}</div>
          <div>
            <div style="font-size:0.7rem; font-weight:600; color:#64748b; margin-bottom:0.2rem;">${escapeHtml(displayName)}</div>
          </div>
        </div>
      `;
    }

    if (msg.type === "audio") {
      const duration = msg.duration || 0;
      const durationStr = formatTime(duration);
      html += `
        <div class="msg ${cls} audio">
          ${senderInfo}
          <div class="audio-player">
            <button class="play-btn" onclick="playAudio(this)" data-url="${escapeHtml(msg.audio_url)}">▶</button>
            <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
            <span class="duration"><span class="current-time">0:00</span>/<span class="total-time">${durationStr}</span></span>
            <button class="download-btn" onclick="downloadAudio('${escapeHtml(msg.audio_url)}')">⬇️</button>
          </div>
          <span class="time">${msg.time} ${ticks}</span>
        </div>
      `;
    } else {
      html += `
        <div class="msg ${cls}">
          ${senderInfo}
          ${escapeHtml(msg.text)}
          <span class="time">${msg.time} ${ticks}</span>
        </div>
      `;
    }
  });
  DOM.chatMessages.innerHTML = html;
  DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

function envoyerMessage() {
  const text = DOM.msgInput.value.trim();
  if (!text || !currentConvId) return;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const msgEl = document.createElement("div");
  msgEl.className = "msg sent";
  msgEl.innerHTML = `${escapeHtml(text)}<span class="time">${time} ✓</span>`;
  DOM.chatMessages.appendChild(msgEl);
  DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
  DOM.msgInput.value = "";

  sendMessage(currentConvId, text)
    .then(() => {
      const conv = getConversationById(currentConvId);
      if (conv) {
        conv.lastMsg = text;
        conv.time = "Maintenant";
        afficherConversations();
      }
      chargerMessages(currentConvId);
    })
    .catch((error) => {
      msgEl.remove();
      showToast("❌ Échec de l'envoi", "error");
    });
}

if (DOM.sendBtn) DOM.sendBtn.addEventListener("click", envoyerMessage);
if (DOM.msgInput) {
  DOM.msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") envoyerMessage();
  });
}

// =============================================
// ENREGISTREMENT VOCAL
// =============================================
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingTimer = null;
let recordedBlob = null;

if (DOM.micBtn) {
  DOM.micBtn.addEventListener("click", async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    startRecording();
  });
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    isRecording = true;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      recordedBlob = new Blob(audioChunks, { type: "audio/webm" });
      clearInterval(recordingTimer);
      if (DOM.recordingIndicator)
        DOM.recordingIndicator.classList.remove("active");
      if (DOM.micBtn) DOM.micBtn.textContent = "🎤";
      isRecording = false;
    };

    mediaRecorder.start();
    if (DOM.recordingIndicator) DOM.recordingIndicator.classList.add("active");
    if (DOM.micBtn) DOM.micBtn.textContent = "⏹️";

    let seconds = 0;
    clearInterval(recordingTimer);
    recordingTimer = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      if (DOM.recTime)
        DOM.recTime.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
      if (seconds >= 120) stopRecording();
    }, 1000);
  } catch (error) {
    showToast("❌ Impossible d'accéder au micro", "error");
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    clearInterval(recordingTimer);
    if (DOM.recordingIndicator)
      DOM.recordingIndicator.classList.remove("active");
    if (DOM.micBtn) DOM.micBtn.textContent = "🎤";
    if (mediaRecorder.stream) {
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  }
}

if (DOM.cancelRecBtn) {
  DOM.cancelRecBtn.addEventListener("click", () => {
    stopRecording();
    audioChunks = [];
    recordedBlob = null;
    if (DOM.recTime) DOM.recTime.textContent = "0:00";
    if (DOM.recordingIndicator)
      DOM.recordingIndicator.classList.remove("active");
    if (DOM.micBtn) DOM.micBtn.textContent = "🎤";
    showToast("🗑️ Enregistrement annulé", "info");
  });
}

if (DOM.sendRecBtn) {
  DOM.sendRecBtn.addEventListener("click", async () => {
    if (!recordedBlob || !currentConvId) {
      showToast("❌ Aucun enregistrement à envoyer", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(",")[1];
      const duration = DOM.recTime.textContent;

      try {
        await sendAudioMessage(currentConvId, base64, parseDuration(duration));

        recordedBlob = null;
        audioChunks = [];
        if (DOM.recTime) DOM.recTime.textContent = "0:00";
        if (DOM.recordingIndicator)
          DOM.recordingIndicator.classList.remove("active");
        if (DOM.micBtn) DOM.micBtn.textContent = "🎤";
        chargerMessages(currentConvId);
        showToast("✅ Message vocal envoyé", "success");
      } catch (error) {
        showToast("❌ Erreur envoi", "error");
      }
    };
    reader.readAsDataURL(recordedBlob);
  });
}

function parseDuration(str) {
  const parts = str.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// =============================================
// LECTURE AUDIO
// =============================================
let currentAudio = null;
let currentAudioBtn = null;

window.playAudio = function (btn) {
  const url = btn.dataset.url;
  const player = btn.closest(".audio-player");
  const progressFill = player.querySelector(".progress-fill");
  const currentTimeEl = player.querySelector(".current-time");
  const totalTimeEl = player.querySelector(".total-time");

  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    if (currentAudioBtn) currentAudioBtn.textContent = "▶";
  }

  if (currentAudio && currentAudio.src.includes(url) && currentAudio.paused) {
    currentAudio.play();
    btn.textContent = "⏸";
    currentAudioBtn = btn;
    return;
  }

  const audioUrl = `${API_BASE}/user/audio/${url.split("/").pop()}`;
  const audio = new Audio(audioUrl);
  currentAudio = audio;
  currentAudioBtn = btn;

  audio.addEventListener("loadedmetadata", () => {
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("ended", () => {
    btn.textContent = "▶";
    progressFill.style.width = "0%";
    currentTimeEl.textContent = "0:00";
  });

  audio.play();
  btn.textContent = "⏸";
};

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

window.downloadAudio = function (url) {
  const link = document.createElement("a");
  link.href = `${API_BASE}/user/audio/${url.split("/").pop()}`;
  link.download = `audio_${Date.now()}.mp3`;
  link.click();
};

// =============================================
// RECHERCHE UTILISATEUR
// =============================================
if (DOM.newMessageBtn) {
  DOM.newMessageBtn.addEventListener("click", () => {
    DOM.searchUserInput.value = "";
    DOM.searchResults.innerHTML =
      '<p style="color:#94a3b8;">Saisissez un nom...</p>';
    openModal(DOM.newMessageModal);
  });
}

let searchTimeout = null;
if (DOM.searchUserInput) {
  DOM.searchUserInput.addEventListener("input", async function () {
    clearTimeout(searchTimeout);
    const q = this.value.trim().replace("@", "");
    if (q.length < 2) {
      DOM.searchResults.innerHTML =
        '<p style="color:#94a3b8;">Saisissez au moins 2 caractères...</p>';
      return;
    }
    searchTimeout = setTimeout(async () => {
      try {
        const users = await searchUsers(q);
        if (users.length === 0) {
          DOM.searchResults.innerHTML =
            '<p style="color:#94a3b8;">Aucun utilisateur.</p>';
        } else {
          let html = "";
          users.forEach((u) => {
            const initials = escapeHtml(
              (u.prenom?.[0] || "") + (u.nom?.[0] || ""),
            );
            const avatarInner = u.avatar_url
              ? `<img src="${escapeHtml(u.avatar_url)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
              : initials;

            html += `
              <div style="display:flex; align-items:center; gap:0.5rem; padding:0.5rem; border-bottom:1px solid #e2e8f0;">
                <div style="width:36px;height:36px;border-radius:50%;background:#3b82f6;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;overflow:hidden;">${avatarInner}</div>
                <div style="flex:1;">
                  <div style="font-weight:500;">${escapeHtml(u.prenom)} ${escapeHtml(u.nom)}</div>
                  <div style="font-size:0.8rem; color:#64748b;">@${escapeHtml(u.username)}</div>
                </div>
                <button class="btn btn-primary search-user-btn" style="font-size:0.7rem; padding:0.2rem 0.8rem; border-radius:2rem; background:#3b82f6; color:white; border:none; cursor:pointer;" data-id="${u.id}" data-username="${escapeHtml(u.username)}">💬</button>
              </div>
            `;
          });
          DOM.searchResults.innerHTML = html;
          document
            .querySelectorAll("#searchResults .search-user-btn")
            .forEach((btn) => {
              btn.addEventListener("click", () => {
                const username = btn.dataset.username;
                const otherId = parseInt(btn.dataset.id);
                closeModal(DOM.newMessageModal);
                createPrivateConversation(otherId)
                  .then((data) => {
                    if (data.conversation_id) {
                      chargerConversations();
                      setTimeout(() => {
                        const conv = getConversationById(data.conversation_id);
                        if (conv) ouvrirConversation(conv.id);
                      }, 500);
                      showToast(`💬 Conversation avec @${username}`, "success");
                    }
                  })
                  .catch((error) => showToast("❌ Erreur", "error"));
              });
            });
        }
      } catch (error) {
        DOM.searchResults.innerHTML =
          '<p style="color:#ef4444;">Erreur recherche</p>';
      }
    }, 400);
  });
}

// =============================================
// OPTIONS CONVERSATION
// =============================================
if (DOM.chatOptionsBtn) {
  DOM.chatOptionsBtn.addEventListener("click", () => {
    if (!currentConvId) {
      showToast("❌ Aucune conversation", "error");
      return;
    }
    openModal(DOM.chatOptionsModal);
  });
}

if (DOM.pinConvBtn) {
  DOM.pinConvBtn.addEventListener("click", () => {
    if (!currentConvId) return;
    const conv = getConversationById(currentConvId);
    if (!conv) return;
    pinConversation(currentConvId, !conv.pinned)
      .then(() => {
        conv.pinned = !conv.pinned;
        afficherConversations();
        showToast(conv.pinned ? "📌 Épinglée" : "📌 Désépinglée", "success");
        closeModal(DOM.chatOptionsModal);
      })
      .catch((error) => showToast("❌ Erreur", "error"));
  });
}

if (DOM.muteConvBtn) {
  DOM.muteConvBtn.addEventListener("click", () => {
    if (!currentConvId) return;
    const conv = getConversationById(currentConvId);
    if (!conv) return;
    const newMuted = !conv.muted;
    muteConversation(currentConvId, newMuted)
      .then(() => {
        conv.muted = newMuted;
        showToast(newMuted ? "🔇 Sourdine" : "🔊 Son", "success");
        closeModal(DOM.chatOptionsModal);
      })
      .catch((error) => showToast("❌ Erreur", "error"));
  });
}

if (DOM.viewMembersBtn) {
  DOM.viewMembersBtn.addEventListener("click", () => {
    if (!currentConvId) return;
    const conv = getConversationById(currentConvId);
    if (!conv || conv.type === "private") {
      showToast("❌ Ceci n'est pas un groupe", "error");
      return;
    }
    closeModal(DOM.chatOptionsModal);
    openMembersModal(currentConvId);
  });
}

if (DOM.clearConvBtn) {
  DOM.clearConvBtn.addEventListener("click", () => {
    if (!currentConvId) return;
    if (!confirm("Effacer l'historique ?")) return;
    clearConversation(currentConvId)
      .then(() => {
        DOM.chatMessages.innerHTML =
          '<div class="empty-state"><span class="icon">🧹</span><h3>Historique effacé</h3></div>';
        showToast("🧹 Historique effacé", "success");
        closeModal(DOM.chatOptionsModal);
      })
      .catch((error) => showToast("❌ Erreur", "error"));
  });
}

if (DOM.deleteConvBtn) {
  DOM.deleteConvBtn.addEventListener("click", () => {
    if (!currentConvId) return;
    const conv = getConversationById(currentConvId);
    if (conv && conv.is_official) {
      showToast("🔒 Groupe officiel non supprimable", "error");
      closeModal(DOM.chatOptionsModal);
      return;
    }
    if (!confirm("Supprimer cette conversation ?")) return;
    deleteConversation(currentConvId)
      .then(() => {
        conversations = conversations.filter((c) => c.id !== currentConvId);
        currentConvId = null;
        DOM.chatName.textContent = "Sélectionnez une conversation";
        DOM.chatAvatar.textContent = "👤";
        DOM.chatMessages.innerHTML =
          '<div class="empty-state"><span class="icon">🗑️</span><h3>Conversation supprimée</h3></div>';
        afficherConversations();
        showToast("🗑️ Conversation supprimée", "success");
        closeModal(DOM.chatOptionsModal);
        if (window.innerWidth <= 900) {
          DOM.listPanel.classList.remove("hidden");
          DOM.conversationPanel.classList.remove("active");
        }
        arreterPolling();
      })
      .catch((error) => showToast("❌ Erreur", "error"));
  });
}

// =============================================
// MEMBRES DU GROUPE
// =============================================
async function openMembersModal(groupId) {
  const container = DOM.membersListContainer;
  if (!container) return;
  container.innerHTML = '<p style="color: #94a3b8;">Chargement...</p>';
  if (DOM.shareLinkContainer) DOM.shareLinkContainer.style.display = "none";
  openModal(DOM.membersModal);

  try {
    const resp = await fetch(`${API_BASE}/user/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();

    if (!resp.ok) {
      container.innerHTML = `<p style="color: #ef4444;">${data.error || "Erreur"}</p>`;
      return;
    }

    if (DOM.inviteFormGroup) {
      DOM.inviteFormGroup.style.display = data.amIAdmin ? "block" : "none";
    }

    const conv = getConversationById(groupId);
    if (DOM.leaveGroupBtn) {
      DOM.leaveGroupBtn.style.display =
        conv && conv.is_official ? "none" : "inline-block";
    }

    let html = "";
    data.members.forEach((m) => {
      const initials = (
        (m.prenom?.[0] || "") + (m.nom?.[0] || "")
      ).toUpperCase();
      const avatar = m.avatar_url
        ? `<img src="${escapeHtml(m.avatar_url)}" alt="" />`
        : initials;
      const adminBadge = m.is_admin
        ? '<span class="admin-badge">Admin</span>'
        : "";

      let actions = "";
      if (data.amIAdmin) {
        if (!m.is_admin) {
          actions = `<button title="Promouvoir admin" onclick="promoteUser(${groupId}, ${m.id})">👑</button>`;
        } else {
          actions = `<button title="Retirer admin" onclick="demoteUser(${groupId}, ${m.id})">⬇️</button>`;
        }
      }

      html += `
        <div class="member-item">
          <div class="member-avatar">${avatar}</div>
          <div class="member-info">
            <div class="member-name">${escapeHtml(m.prenom)} ${escapeHtml(m.nom)} ${adminBadge}</div>
            <div class="member-username">@${escapeHtml(m.username || "")}</div>
          </div>
          <div class="member-actions">${actions}</div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<p style="color: #ef4444;">Erreur réseau</p>';
  }
}

window.promoteUser = async function (groupId, userId) {
  try {
    const resp = await fetch(
      `${API_BASE}/user/groups/${groupId}/promote/${userId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (resp.ok) {
      showToast("👑 Utilisateur promu admin", "success");
      openMembersModal(groupId);
    } else {
      const err = await resp.json();
      showToast("❌ " + (err.error || "Erreur"), "error");
    }
  } catch (error) {
    showToast("❌ Erreur réseau", "error");
  }
};

window.demoteUser = async function (groupId, userId) {
  try {
    const resp = await fetch(
      `${API_BASE}/user/groups/${groupId}/demote/${userId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (resp.ok) {
      showToast("✅ Admin retiré", "success");
      openMembersModal(groupId);
    } else {
      const err = await resp.json();
      showToast("❌ " + (err.error || "Erreur"), "error");
    }
  } catch (error) {
    showToast("❌ Erreur réseau", "error");
  }
};

if (DOM.sendInviteBtn) {
  DOM.sendInviteBtn.addEventListener("click", async () => {
    const username = DOM.inviteUsernameInput.value.trim();
    if (!username) {
      showToast("❌ Nom d'utilisateur requis", "error");
      return;
    }
    try {
      const resp = await fetch(
        `${API_BASE}/user/groups/${currentConvId}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username }),
        },
      );
      const data = await resp.json();
      if (resp.ok) {
        showToast("✅ Invitation envoyée", "success");
        DOM.inviteUsernameInput.value = "";
      } else {
        showToast("❌ " + (data.error || "Erreur"), "error");
      }
    } catch (error) {
      showToast("❌ Erreur réseau", "error");
    }
  });
}

if (DOM.shareGroupBtn) {
  DOM.shareGroupBtn.addEventListener("click", async () => {
    try {
      const resp = await fetch(
        `${API_BASE}/user/groups/${currentConvId}/share`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await resp.json();
      if (resp.ok) {
        const shareUrl = `${window.location.origin}/pages/messages.html?join=${data.share_code}`;
        const container = DOM.shareLinkContainer;
        container.style.display = "block";
        container.innerHTML = `
          <div class="share-link-box">
            <input type="text" value="${shareUrl}" readonly id="shareLinkInput" />
            <button class="btn btn-primary" id="copyShareLinkBtn">📋</button>
          </div>
        `;
        document
          .getElementById("copyShareLinkBtn")
          ?.addEventListener("click", () => {
            const inp = document.getElementById("shareLinkInput");
            inp.select();
            navigator.clipboard.writeText(inp.value).then(() => {
              showToast("✅ Lien copié !", "success");
            });
          });
      } else {
        showToast("❌ " + (data.error || "Erreur"), "error");
      }
    } catch (error) {
      showToast("❌ Erreur réseau", "error");
    }
  });
}

if (DOM.leaveGroupBtn) {
  DOM.leaveGroupBtn.addEventListener("click", async () => {
    if (!confirm("Voulez-vous vraiment quitter ce groupe ?")) return;
    try {
      const resp = await fetch(
        `${API_BASE}/user/groups/${currentConvId}/leave`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await resp.json();
      if (resp.ok) {
        showToast("🚪 Groupe quitté", "success");
        closeModal(DOM.membersModal);
        currentConvId = null;
        DOM.chatName.textContent = "Sélectionnez une conversation";
        DOM.chatAvatar.textContent = "👤";
        await chargerConversations();
      } else {
        showToast("❌ " + (data.error || "Erreur"), "error");
      }
    } catch (error) {
      showToast("❌ Erreur réseau", "error");
    }
  });
}

// =============================================
// INVITATIONS
// =============================================
if (DOM.invitationsBtn) {
  DOM.invitationsBtn.addEventListener("click", openInvitationsModal);
}

async function openInvitationsModal() {
  const container = DOM.invitationsListContainer;
  container.innerHTML = '<p style="color: #94a3b8;">Chargement...</p>';
  openModal(DOM.invitationsModal);

  try {
    const resp = await fetch(`${API_BASE}/user/groups/invitations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const invitations = await resp.json();

    if (!Array.isArray(invitations) || invitations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="icon">📭</span>
          <h3>Aucune invitation</h3>
          <p>Vous n'avez pas d'invitation en attente.</p>
        </div>
      `;
      return;
    }

    let html = "";
    invitations.forEach((inv) => {
      html += `
        <div class="member-item" style="flex-direction: column; align-items: stretch;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="member-avatar">
              ${inv.inviter_avatar ? `<img src="${escapeHtml(inv.inviter_avatar)}" alt="" />` : ((inv.inviter_prenom?.[0] || "") + (inv.inviter_nom?.[0] || "")).toUpperCase()}
            </div>
            <div class="member-info">
              <div class="member-name">${escapeHtml(inv.group_name)}</div>
              <div class="member-username">Invité par @${escapeHtml(inv.inviter_username || "")}</div>
            </div>
          </div>
          <div style="display: flex; gap: 0.4rem; margin-top: 0.5rem;">
            <button class="btn btn-success" onclick="respondInvitation(${inv.id}, 'accept')" style="flex: 1;">✅ Accepter</button>
            <button class="btn btn-outline" onclick="respondInvitation(${inv.id}, 'decline')" style="flex: 1;">❌ Refuser</button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<p style="color: #ef4444;">Erreur réseau</p>';
  }
}

window.respondInvitation = async function (inviteId, action) {
  try {
    const resp = await fetch(
      `${API_BASE}/user/groups/invitations/${inviteId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      },
    );
    const data = await resp.json();
    if (resp.ok) {
      showToast(action === "accept" ? "✅ Acceptée" : "❌ Refusée", "success");
      closeModal(DOM.invitationsModal);
      await chargerConversations();
    } else {
      showToast("❌ " + (data.error || "Erreur"), "error");
    }
  } catch (error) {
    showToast("❌ Erreur réseau", "error");
  }
};

// =============================================
// FICHIERS
// =============================================
if (DOM.fileBtn) {
  DOM.fileBtn.addEventListener("click", () => DOM.fileInput.click());
}

if (DOM.fileInput) {
  DOM.fileInput.addEventListener("change", function () {
    if (this.files.length > 0 && currentConvId) {
      const formData = new FormData();
      for (let file of this.files) formData.append("files[]", file);
      formData.append("conversation_id", currentConvId);
      fetch(`${API_BASE}/user/messages/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
        .then((res) => {
          if (res.ok) {
            showToast(
              `📎 ${this.files.length} fichier(s) envoyé(s)`,
              "success",
            );
            chargerMessages(currentConvId);
          } else showToast("❌ Erreur envoi", "error");
        })
        .catch(() => showToast("❌ Erreur réseau", "error"));
      this.value = "";
    }
  });
}

// =============================================
// REJOINDRE VIA LIEN
// =============================================
async function checkJoinLink() {
  const params = new URLSearchParams(window.location.search);
  const joinCode = params.get("join");
  if (!joinCode) return;

  try {
    const resp = await fetch(`${API_BASE}/user/groups/join/${joinCode}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    if (resp.ok) {
      showToast(data.message, "success");
      window.history.replaceState({}, "", window.location.pathname);
      await chargerConversations();
      if (data.group_id) ouvrirConversation(data.group_id);
    } else {
      showToast("❌ " + (data.error || "Lien invalide"), "error");
    }
  } catch (e) {
    console.error(e);
  }
}

// =============================================
// INIT
// =============================================
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

window.addEventListener("beforeunload", arreterPolling);

async function init() {
  applySavedTheme();
  initSidebar();
  initLogout();
  mettreAJourNomUtilisateur();
  genererEmojis();
  await chargerConversations();
  await checkJoinLink();
}

init();
