// =====================================================
// SCRIPT POUR L'INSCRIPTION
// (Politique confidentialité + Username + Code parrain)
// =====================================================

// ---------- 1. RÉCUPÉRATION DES ÉLÉMENTS ----------
const prenomInput = document.getElementById("prenom");
const nomInput = document.getElementById("nom");
const emailInput = document.getElementById("email");
const mdpInput = document.getElementById("motDePasse");
const confirmMdpInput = document.getElementById("confirmMotDePasse");
const classeSelect = document.getElementById("classe");
const paysInput = document.getElementById("pays");
const telephoneInput = document.getElementById("telephone");
const typeEtudeSelect = document.getElementById("typeEtude");
const optionSelect = document.getElementById("option");
const photoInput = document.getElementById("photoProfil");
const acceptPrivacy = document.getElementById("acceptPrivacy");
const privacyError = document.getElementById("privacyError");

// Nom d'utilisateur
const usernameInput = document.getElementById("username");
const usernameStatus = document.getElementById("usernameStatus");
const usernameMessage = document.getElementById("usernameMessage");
let usernameAvailable = false;
let usernameCheckTimeout = null;

// 🆕 Code parrain
const codeParrainInput = document.getElementById("codeParrain");

// ---------- 2. ÉLÉMENTS D'APERÇU ----------
const previewPrenom = document.getElementById("previewPrenom");
const previewNom = document.getElementById("previewNom");
const previewEmail = document.getElementById("previewEmail");
const previewMdp = document.getElementById("previewMdp");
const previewClasse = document.getElementById("previewClasse");
const previewOption = document.getElementById("previewOption");
const previewPays = document.getElementById("previewPays");
const previewTelephone = document.getElementById("previewTelephone");
const previewTypeEtude = document.getElementById("previewTypeEtude");
const previewUsername = document.getElementById("previewUsername");
const previewCodeParrain = document.getElementById("previewCodeParrain");

// ---------- 3. BOUTON D'INSCRIPTION ----------
const btnInscription = document.getElementById("btnInscription");

// ---------- 4. FONCTION DE MISE À JOUR DE L'APERÇU ----------
function mettreAJourApercu() {
  if (previewPrenom)
    previewPrenom.textContent = prenomInput?.value.trim() || "—";
  if (previewNom) previewNom.textContent = nomInput?.value.trim() || "—";
  if (previewEmail) previewEmail.textContent = emailInput?.value.trim() || "—";
  if (previewUsername)
    previewUsername.textContent = usernameInput?.value.trim() || "—";
  if (previewCodeParrain)
    previewCodeParrain.textContent =
      codeParrainInput?.value.trim().toUpperCase() || "—";

  if (mdpInput?.value.length > 0) {
    if (previewMdp)
      previewMdp.textContent = "•".repeat(Math.min(mdpInput.value.length, 8));
  } else {
    if (previewMdp) previewMdp.textContent = "••••••";
  }

  const classeTexte =
    classeSelect?.options[classeSelect.selectedIndex]?.text || "—";
  if (previewClasse)
    previewClasse.textContent = classeSelect?.value ? classeTexte : "—";

  const optionTexte =
    optionSelect?.options[optionSelect.selectedIndex]?.text || "—";
  if (previewOption)
    previewOption.textContent = optionSelect?.value ? optionTexte : "—";

  if (previewPays)
    previewPays.textContent = paysInput?.value.trim() || "France (défaut)";
  if (previewTelephone)
    previewTelephone.textContent =
      telephoneInput?.value.trim() || "Non renseigné";

  const typeTexte =
    typeEtudeSelect?.options[typeEtudeSelect.selectedIndex]?.text || "—";
  if (previewTypeEtude)
    previewTypeEtude.textContent = typeEtudeSelect?.value ? typeTexte : "—";
}

// ---------- 5. VÉRIFICATION DU NOM D'UTILISATEUR (EN TEMPS RÉEL) ----------
async function verifierUsername(username) {
  if (!username || username.length < 3) {
    usernameStatus.textContent = "⚠️";
    usernameStatus.style.color = "#f59e0b";
    usernameMessage.textContent = "Minimum 3 caractères";
    usernameMessage.style.color = "#f59e0b";
    usernameAvailable = false;
    return;
  }

  try {
    const url = `${window.API_BASE}/check-username?username=${encodeURIComponent(username)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok && data.available) {
      usernameStatus.textContent = "✅";
      usernameStatus.style.color = "#10b981";
      usernameMessage.textContent = "Nom disponible !";
      usernameMessage.style.color = "#10b981";
      usernameAvailable = true;
    } else {
      usernameStatus.textContent = "❌";
      usernameStatus.style.color = "#ef4444";
      usernameMessage.textContent = "Ce nom est déjà pris";
      usernameMessage.style.color = "#ef4444";
      usernameAvailable = false;
    }
  } catch (error) {
    usernameStatus.textContent = "⚠️";
    usernameStatus.style.color = "#f59e0b";
    usernameMessage.textContent = "Erreur de vérification";
    usernameMessage.style.color = "#f59e0b";
    usernameAvailable = false;
  }
}

// Écouteur sur le champ username
usernameInput.addEventListener("input", function () {
  clearTimeout(usernameCheckTimeout);
  const val = this.value.trim();
  if (!val) {
    usernameStatus.textContent = "";
    usernameMessage.textContent = "Minimum 3 caractères";
    usernameMessage.style.color = "#64748b";
    usernameAvailable = false;
    return;
  }
  usernameCheckTimeout = setTimeout(() => verifierUsername(val), 400);
});

// ---------- 6. VALIDATION DES CHAMPS OBLIGATOIRES ----------
function validerFormulaire() {
  let erreurs = [];

  if (!prenomInput?.value.trim()) erreurs.push("Prénom requis");
  if (!nomInput?.value.trim()) erreurs.push("Nom requis");
  if (!emailInput?.value.trim()) erreurs.push("Email requis");

  // ✅ Mot de passe : minimum 6 caractères
  if (!mdpInput?.value) {
    erreurs.push("Mot de passe requis");
  } else if (mdpInput.value.length < 6) {
    erreurs.push("Le mot de passe doit contenir au moins 6 caractères");
  }
  if (mdpInput?.value !== confirmMdpInput?.value)
    erreurs.push("Les mots de passe ne correspondent pas");

  if (!classeSelect?.value) erreurs.push("Veuillez sélectionner une classe");
  if (!optionSelect?.value) erreurs.push("Veuillez sélectionner une option");
  if (typeEtudeSelect?.value !== "universite") {
    erreurs.push("Seul le type 'Université' est disponible pour le moment");
  }

  // Nom d'utilisateur
  const username = usernameInput?.value.trim();
  if (!username || username.length < 3) {
    erreurs.push("Nom d'utilisateur (min 3 caractères)");
  } else if (!usernameAvailable) {
    erreurs.push("Nom d'utilisateur non disponible");
  }

  // Politique de confidentialité
  if (!acceptPrivacy?.checked) {
    erreurs.push("Vous devez accepter la politique de confidentialité");
    privacyError.style.display = "block";
  } else {
    privacyError.style.display = "none";
  }

  if (erreurs.length > 0) {
    alert("❌ Erreurs :\n- " + erreurs.join("\n- "));
    return false;
  }
  return true;
}

async function envoyerInscription(donnees) {
  const base =
    window.API_BASE && window.API_BASE !== "undefined"
      ? window.API_BASE
      : "http://localhost:3000/api";
  const url = `${base.replace(/\/$/, "")}/register`;
  console.log("🔗 Envoi de l'inscription à :", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(donnees),
    });
    const result = await response.json();

    if (response.ok) {
      alert(
        "✅ Inscription réussie !\n\n" +
          "Un code à 6 chiffres a été envoyé à :\n" +
          donnees.email +
          "\n\nSaisissez-le sur la page suivante pour activer votre compte.",
      );
      window.location.href = `confirmation-email.html?email=${encodeURIComponent(donnees.email)}`;
    } else {
      let message = result.message;
      if (!message && result.errors && result.errors.length > 0) {
        message = result.errors.map((e) => e.msg).join("\n- ");
      }
      alert("❌ Erreur : " + (message || "Problème lors de l'inscription"));
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
    alert(
      "❌ Impossible de contacter le serveur. Vérifie que le backend est lancé (npm run dev).",
    );
  }
}

// ---------- 8. GESTION DU CLIC SUR "S'INSCRIRE" ----------
if (btnInscription) {
  btnInscription.addEventListener("click", () => {
    if (validerFormulaire()) {
      const donnees = {
        prenom: prenomInput.value.trim(),
        nom: nomInput.value.trim(),
        email: emailInput.value.trim(),
        username: usernameInput.value.trim(),
        password: mdpInput.value,
        confirmPassword: confirmMdpInput.value,
        filiere: optionSelect.value,
        classe: classeSelect.value,
        pays: paysInput?.value.trim() || "France",
        telephone: telephoneInput?.value.trim() || null,
        type_etude: typeEtudeSelect?.value || "universite",
        code_parrain: codeParrainInput?.value.trim() || null, // ✅ NOUVEAU
      };
      envoyerInscription(donnees);
    }
  });
}

// ---------- 9. ÉVÉNEMENTS POUR L'APERÇU EN DIRECT ----------
if (prenomInput) prenomInput.addEventListener("input", mettreAJourApercu);
if (nomInput) nomInput.addEventListener("input", mettreAJourApercu);
if (emailInput) emailInput.addEventListener("input", mettreAJourApercu);
if (usernameInput) usernameInput.addEventListener("input", mettreAJourApercu);
if (codeParrainInput)
  codeParrainInput.addEventListener("input", mettreAJourApercu);
if (mdpInput) mdpInput.addEventListener("input", mettreAJourApercu);
if (confirmMdpInput) {
  confirmMdpInput.addEventListener("input", () => {
    if (mdpInput.value !== confirmMdpInput.value) {
      confirmMdpInput.style.borderColor = "red";
    } else {
      confirmMdpInput.style.borderColor = "#cbd5e1";
    }
    mettreAJourApercu();
  });
}
if (classeSelect) classeSelect.addEventListener("change", mettreAJourApercu);
if (optionSelect) optionSelect.addEventListener("change", mettreAJourApercu);
if (paysInput) paysInput.addEventListener("input", mettreAJourApercu);
if (telephoneInput) telephoneInput.addEventListener("input", mettreAJourApercu);
if (typeEtudeSelect)
  typeEtudeSelect.addEventListener("change", mettreAJourApercu);

// ---------- 10. GESTION DU MODAL POLITIQUE DE CONFIDENTIALITÉ ----------
const openModalBtn = document.getElementById("openPrivacyModal");
const modal = document.getElementById("privacyModal");
const closeModalBtn = document.getElementById("closePrivacyModal");

if (openModalBtn && modal) {
  openModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "flex";
  });
}
if (closeModalBtn && modal) {
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// ---------- 11. AUTO-REMPLISSAGE DU CODE PARRAIN DEPUIS L'URL ----------
(function autoFillCodeParrain() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref && codeParrainInput) {
    codeParrainInput.value = ref.toUpperCase();
    console.log("🤝 Code parrain détecté dans l'URL :", ref);
    mettreAJourApercu();
  }
})();

// ---------- 12. INITIALISATION DE L'APERÇU ----------
mettreAJourApercu();
