// =============================================
// APPELS API
// =============================================

import { TOKEN, API_BASE } from "./config.js";

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
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

// Conversations
export function getConversations() {
  return apiFetch("/user/conversations");
}

export function getMessages(convId) {
  return apiFetch(`/user/messages/${convId}`);
}

export function sendMessage(convId, text, parentId = null) {
  return apiFetch("/user/messages", {
    method: "POST",
    body: JSON.stringify({
      conversation_id: convId,
      text,
      parent_id: parentId,
    }),
  });
}

export function createPrivateConversation(otherUserId) {
  return apiFetch("/user/conversations/private", {
    method: "POST",
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
}

export function pinConversation(convId, pinned) {
  return apiFetch(`/user/conversations/${convId}/pin`, {
    method: "PUT",
    body: JSON.stringify({ pinned }),
  });
}

export function muteConversation(convId, muted) {
  return apiFetch(`/user/conversations/${convId}/mute`, {
    method: "PUT",
    body: JSON.stringify({ muted }),
  });
}

export function clearConversation(convId) {
  return apiFetch(`/user/conversations/${convId}/clear`, {
    method: "DELETE",
  });
}

export function deleteConversation(convId) {
  return apiFetch(`/user/conversations/${convId}`, {
    method: "DELETE",
  });
}

export function searchUsers(query) {
  return apiFetch(`/user/search?q=${encodeURIComponent(query)}`);
}

export function sendFiles(convId, files) {
  const formData = new FormData();
  for (let file of files) formData.append("files[]", file);
  formData.append("conversation_id", convId);
  return fetch(`${API_BASE}/user/messages/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: formData,
  });
}

export function changePassword(oldPassword, newPassword) {
  return apiFetch("/user/change-password", {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export function updateProfile(data) {
  return apiFetch("/user/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
