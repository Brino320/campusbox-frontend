// =====================================================
// GESTION DU MENU HAMBURGER (pour mobile)
// =====================================================
// On récupère l'élément du menu hamburger et la liste des liens
const menuToggle = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");

// On vérifie que ces éléments existent sur la page (pour éviter les erreurs)
if (menuToggle && navLinks) {
  // On écoute l'événement "click" sur l'icône hamburger
  menuToggle.addEventListener("click", () => {
    // La méthode classList.toggle ajoute la classe "active" si elle n'existe pas,
    // sinon elle la retire. Cela permet d'afficher/cacher le menu.
    navLinks.classList.toggle("active");
  });
}

// =====================================================
// INTERACTION SUR LES CARTES FILIÈRES
// =====================================================
const cards = document.querySelectorAll(".card");
cards.forEach((card) => {
  card.addEventListener("click", () => {
    // On récupère le titre (h3) à l'intérieur de la carte cliquée
    const filiere = card.querySelector("h3").innerText;
    console.log(`Filière sélectionnée : ${filiere}`);
    // Plus tard, tu pourras rediriger vers le tableau de bord avec la filière choisie
    // Par exemple : localStorage.setItem("filiere", filiere);
    // puis window.location.href = "tableau-de-bord.html";
  });
});
