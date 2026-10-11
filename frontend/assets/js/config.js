// =====================================================
// Configuration API – Détecte automatiquement l'hôte
// Fonctionne en local ET sur ngrok
// =====================================================

(function () {
  const origin = window.location.origin;
  const port = window.location.port;

  // Cas 1 : Live Server ou frontend séparé (ex: :5500)
  // → l'API est sur localhost:3000
  const isSeparateFrontend = port && port !== "3000" && port !== "";

  if (isSeparateFrontend) {
    window.API_BASE = "http://localhost:3000/api";
  } else {
    // Cas 2 : servi par le backend (localhost:3000) ou ngrok
    // → l'API est sur la même origine
    window.API_BASE = `${origin}/api`;
  }

  console.log("🔧 API_BASE =", window.API_BASE);
})();
