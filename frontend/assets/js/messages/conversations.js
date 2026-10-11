// =============================================
// GESTION DES CONVERSATIONS
// =============================================

import { getConversations } from "./api.js";
import { showToast } from "./main.js";

let conversations = [];
let currentConvId = null;
let activeFilter = "all";
let conversationListEl = null;
let searchInputEl = null;

export function initConversations(listId, searchId) {
  conversationListEl = document.getElementById(listId);
  searchInputEl = document.getElementById(searchId);
  if (!conversationListEl) return;
  chargerConversations();
  initEvents();
}

function initEvents() {
  if (searchInputEl) {
    searchInputEl.addEventListener("input", afficherConversations);
  }
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", function () {
      document
        .querySelectorAll(".filter-chip")
        .forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
      activeFilter = this.dataset.filter;
      afficherConversations();
    });
  });
}

async function chargerConversations() {
  try {
    conversations = await getConversations();
    afficherConversations();
  } catch (error) {
    showToast("❌ Erreur chargement conversations: " + error.message, "error");
  }
}

export function afficherConversations() {
  if (!conversationListEl) return;
  let filtered = [...conversations];
  if (activeFilter === "unread")
    filtered = filtered.filter((c) => c.unread > 0);
  else if (activeFilter === "pinned")
    filtered = filtered.filter((c) => c.pinned);

  const search = searchInputEl?.value.toLowerCase().trim() || "";
  if (search)
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(search));

  if (filtered.length === 0) {
    conversationListEl.innerHTML = `
      <div class="empty-state">
        <span class="icon">💬</span>
        <h3>Aucune conversation</h3>
        <p>${search ? "Aucun résultat." : "Commencez une discussion."}</p>
      </div>
    `;
    return;
  }

  let html = "";
  filtered.forEach((c) => {
    const activeClass = c.id === currentConvId ? "active" : "";
    const unreadBadge =
      c.unread > 0 ? `<span class="badge-unread">${c.unread}</span>` : "";
    const pinIcon = c.pinned ? `<span class="pin-icon">📌</span>` : "";
    html += `
      <div class="conversation-item ${activeClass}" data-id="${c.id}">
        <div class="avatar ${c.type === "group" ? "group" : ""}">${c.avatar || "👤"}</div>
        <div class="info">
          <div class="name">${c.name} ${unreadBadge} ${pinIcon}</div>
          <div class="last-msg">${c.lastMsg || "Aucun message"}</div>
        </div>
        <div class="time">${c.time || "Hier"}</div>
      </div>
    `;
  });
  conversationListEl.innerHTML = html;

  document.querySelectorAll(".conversation-item").forEach((el) => {
    el.addEventListener("click", () => {
      const id = parseInt(el.dataset.id);
      openConversation(id);
    });
  });
}

export function addConversation(conv) {
  conversations.unshift(conv);
  afficherConversations();
}

export function getCurrentConversation() {
  return conversations.find((c) => c.id === currentConvId);
}

export function setCurrentConversationId(id) {
  currentConvId = id;
}

export function getCurrentConversationId() {
  return currentConvId;
}

export function updateConversationLastMsg(convId, msg, time) {
  const conv = conversations.find((c) => c.id === convId);
  if (conv) {
    conv.lastMsg = msg;
    conv.time = time || "Maintenant";
    afficherConversations();
  }
}
