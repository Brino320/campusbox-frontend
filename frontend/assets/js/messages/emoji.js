// =============================================
// GESTION DES ÉMOJIS
// =============================================

import { EMOJIS } from "./config.js";

let emojiContainer = null;
let msgInput = null;
let emojiPicker = null;

export function initEmojis(containerId, inputId, pickerId) {
  emojiContainer = document.getElementById(containerId);
  msgInput = document.getElementById(inputId);
  emojiPicker = document.getElementById(pickerId);
  if (!emojiContainer) return;
  genererEmojis();
}

function genererEmojis() {
  if (!emojiContainer) return;
  emojiContainer.innerHTML = "";
  EMOJIS.forEach((emoji) => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.style.cursor = "pointer";
    span.style.padding = "0.15rem";
    span.style.borderRadius = "4px";
    span.addEventListener("click", () => {
      msgInput.value += emoji;
      msgInput.focus();
      emojiPicker.classList.remove("open");
    });
    emojiContainer.appendChild(span);
  });
}

export function toggleEmojiPicker() {
  if (!emojiPicker) return;
  emojiPicker.classList.toggle("open");
}

export function closeEmojiPicker() {
  if (!emojiPicker) return;
  emojiPicker.classList.remove("open");
}
