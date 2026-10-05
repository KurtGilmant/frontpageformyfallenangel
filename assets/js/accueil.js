/* Remplit les sections de la page d'accueil à partir de data/livres.js. */

(function () {
  const A = PORTFOLIO.artiste;

  const titre = document.querySelector("[data-titre]");
  if (titre) titre.textContent = A.titre;

  const intro = document.querySelector("[data-intro]");
  if (intro) intro.textContent = A.intro;

  /* --- Ornements de l'accroche --- */
  const O = (typeof ORNEMENTS !== "undefined" && PORTFOLIO.ornements) || {};
  const accroche = document.querySelector(".accroche");

  if (titre && O.pinceau) titre.insertAdjacentHTML("afterend", ORNEMENTS.pinceau);

  if (accroche && O.griffonnages) {
    ORNEMENTS.griffonnages.forEach(function (g) {
      const el = document.createElement("span");
      el.className = "griffonnage";
      el.setAttribute("aria-hidden", "true");
      el.style.top = g.haut;
      el.style[g.cote === "gauche" ? "left" : "right"] = g.decale;
      el.style.width = g.taille + "px";
      el.style.transform = "rotate(" + g.rot + "deg)";
      el.innerHTML = g.svg;
      accroche.appendChild(el);
    });
  }

  /* --- Services --- */
  const sv = PORTFOLIO.services;
  const zone = document.querySelector(".services");
  if (zone && sv) {
    const pictos = (typeof ORNEMENTS !== "undefined" && ORNEMENTS.pictos) || {};
    zone.innerHTML =
      '<h2 class="titre-section" id="titre-services"></h2>' +
      '<p class="services-intro"></p><dl class="services-liste"></dl>' +
      '<p class="services-fin"></p>';
    zone.querySelector("h2").textContent = sv.titre;
    zone.querySelector(".services-intro").textContent = sv.intro;
    const liste = zone.querySelector("dl");
    sv.liste.forEach(function (s) {
      const ligne = document.createElement("div");
      ligne.className = "service";
      ligne.innerHTML =
        "<dt>" + (pictos[s.picto] ? '<span class="picto" aria-hidden="true">' + pictos[s.picto] + "</span>" : "") +
        "<span></span></dt><dd></dd>";
      ligne.querySelector("dt span:last-child").textContent = s.nom;
      ligne.querySelector("dd").textContent = s.texte;
      liste.appendChild(ligne);
    });
    const [avant, lien, apres] = sv.conclusion;
    const fin = zone.querySelector(".services-fin");
    const a = document.createElement("a");
    // directement à son formulaire de contact s'il est connu, sinon à l'appel
    const contact = (PORTFOLIO.navigation || []).find((n) => n.label === "Contact");
    a.href = (contact && contact.lien) || "#contact";
    a.textContent = lien;
    fin.append(avant, a, apres);
  }

  /* --- Comment ça se passe --- */
  const grille = document.querySelector(".methode .grille");
  if (grille) {
    PORTFOLIO.methode.forEach(function (e) {
      const el = document.createElement("article");
      el.className = "etape";
      const picto = (typeof ORNEMENTS !== "undefined" && e.picto && ORNEMENTS.pictos[e.picto]) || "";
      el.innerHTML =
        '<div class="tete-etape"><span class="num"></span>' +
        (picto ? '<span class="picto" aria-hidden="true">' + picto + "</span>" : "") +
        "</div><h3></h3><p></p>";
      el.querySelector(".num").textContent = e.n;
      el.querySelector("h3").textContent = e.titre;
      el.querySelector("p").textContent = e.texte;
      grille.appendChild(el);
    });
  }

})();
