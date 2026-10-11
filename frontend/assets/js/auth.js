// =====================================================
// SCRIPT POUR L'AUTHENTIFICATION (connexion)
// =====================================================

const form = document.getElementById("formAuthentification");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("motDePasse");

function validerFormulaire() {
  let erreurs = [];
  if (!emailInput.value.trim()) erreurs.push("Email requis");
  if (!passwordInput.value) erreurs.push("Mot de passe requis");
  if (erreurs.length > 0) {
    alert("❌ Erreurs :\n- " + erreurs.join("\n- "));
    return false;
  }
  return true;
}

async function authentifierUtilisateur(email, password) {
  const url = `${window.API_BASE}/login`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        window.location.href = "../admin/index.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } else {
      alert(
        "❌ Échec de l'authentification : " +
          (data.message || "Identifiants invalides"),
      );
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
    alert(
      "❌ Impossible de contacter le serveur. Vérifie que le backend est lancé.",
    );
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (validerFormulaire()) {
    authentifierUtilisateur(emailInput.value.trim(), passwordInput.value);
  }
});
