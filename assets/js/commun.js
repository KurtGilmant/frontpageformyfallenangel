/* En-tête, pied de page et bouton « retour en haut », construits une seule
   fois pour toutes les pages à partir de data/livres.js. */

(function () {
  const A = PORTFOLIO.artiste;

  /* --- Icônes réseaux -------------------------------------- */
  const ICONES = {
    linkedin:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.2 8.4h4.56V24H.2zM8.34 8.4h4.37v2.13h.06c.61-1.15 2.1-2.37 4.32-2.37 4.62 0 5.47 3.04 5.47 6.99V24h-4.56v-7.94c0-1.9-.03-4.33-2.64-4.33-2.64 0-3.046 2.06-3.046 4.19V24H8.34z"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.39C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.39 2.12.66.67 1.33 1.09 2.12 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.39.67-.66 1.09-1.33 1.39-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.39-2.12-.66-.67-1.33-1.09-2.12-1.39-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 0h-3.4v16.1a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1v-3.4a6.3 6.3 0 1 0 5.4 6.2V7.6a7.6 7.6 0 0 0 4.4 1.4V5.6a4.4 4.4 0 0 1-4.4-4.4V0z"/></svg>',
  };

  function blocReseaux() {
    const liens = Object.entries(A.reseaux || {})
      .filter(([, url]) => url)
      .map(([res, url]) =>
        '<a href="' + url + '" target="_blank" rel="noopener" aria-label="' + res + '">' +
        (ICONES[res] || "") + "</a>");
    return liens.length ? '<div class="reseaux">' + liens.join("") + "</div>" : "<span></span>";
  }

  /* Logo : son fichier s'il est fourni, sinon un monogramme bleu. */
  function blocLogo() {
    const contenu = A.logo
      ? '<img src="' + A.logo + '" alt="' + A.nom + '">'
      : '<svg viewBox="0 0 100 100" role="img" aria-label="' + A.nom + '">' +
        '<circle cx="50" cy="50" r="48" fill="#1268c4"/>' +
        '<text x="50" y="50" fill="#fff" font-family="Playfair Display, Georgia, serif" ' +
        'font-size="46" text-anchor="middle" dominant-baseline="central">' +
        A.prenom.charAt(0) + "</text></svg>";
    return '<a class="logo" href="index.html" aria-label="' + A.nom + ' — accueil">' + contenu + "</a>";
  }

  /* Un lien de menu laissé vide ne doit pas mener nulle part : on le fait
     pointer vers l'équivalent le plus proche sur ce site — le rayon du même
     nom, ou la section de l'accueil (« Contact » -> #contact). Sans
     équivalent (« À propos », tant que l'URL de sa page n'est pas
     renseignée) : l'accueil. */
  function lienParDefaut(label) {
    const nom = label.toLowerCase();
    const rayon = PORTFOLIO.categories.find((c) => c.titre.toLowerCase() === nom);
    if (rayon) return rayon.lien || "categorie.html?cat=" + encodeURIComponent(rayon.id);
    const ancre = { "contact": "contact" }[nom];
    if (ancre) return (document.getElementById(ancre) ? "" : "index.html") + "#" + ancre;
    return "index.html";
  }

  function estPageCourante(href) {
    const cible = new URL(href, location.href);
    return !cible.hash && cible.pathname === location.pathname && cible.search === location.search;
  }

  function blocNav(pageActive) {
    const liens = (PORTFOLIO.navigation || []).map(function (item) {
      const href = item.lien || lienParDefaut(item.label);
      // un lien de repli vers l'accueil ne fait pas de l'entrée la page courante
      const repli = !item.lien && href === "index.html";
      const actif = item.label.toLowerCase() === (pageActive || "").toLowerCase()
                 || (!repli && estPageCourante(href));
      return '<a href="' + href + '"' + (actif ? ' aria-current="page"' : "") + ">" +
             item.label + "</a>";
    });
    return "<nav>" + liens.join("") + "</nav>";
  }

  /* --- Montage --------------------------------------------- */
  const entete = document.querySelector("[data-entete]");
  if (entete) {
    // une seule ligne : logo à gauche (retour à l'accueil), menu au centre,
    // réseaux à droite. Sur mobile, menu et réseaux passent dans un panneau
    // ouvert par le bouton « Menu » (masqué sur grand écran).
    entete.innerHTML = blocLogo() +
      '<button class="bouton-menu" type="button" aria-expanded="false" aria-controls="menu-principal">' +
        '<span class="burger" aria-hidden="true"><i></i><i></i><i></i></span>Menu</button>' +
      '<div class="menu" id="menu-principal">' + blocNav(entete.dataset.entete) + blocReseaux() + "</div>";

    const bouton = entete.querySelector(".bouton-menu");
    const ouvrir = (oui) => {
      entete.classList.toggle("ouvert", oui);
      bouton.setAttribute("aria-expanded", String(oui));
    };
    bouton.addEventListener("click", () => ouvrir(!entete.classList.contains("ouvert")));
    // on le referme : lien choisi, toucher ailleurs, Échap, retour au grand écran
    entete.querySelectorAll(".menu a").forEach((a) => a.addEventListener("click", () => ouvrir(false)));
    document.addEventListener("click", (e) => { if (!entete.contains(e.target)) ouvrir(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && entete.classList.contains("ouvert")) { ouvrir(false); bouton.focus(); }
    });
    matchMedia("(min-width: 761px)").addEventListener("change", () => ouvrir(false));
  }

  const pied = document.querySelector("[data-pied]");
  if (pied) {
    const mail = A.email
      ? '<a href="mailto:' + A.email + '">' + A.email + "</a>"
      : "<span></span>";
    pied.innerHTML =
      "<span>© " + new Date().getFullYear() + " " + A.nom + "</span>" +
      mail + blocReseaux();
  }

  /* --- Boutons « Me contacter » ------------------------------
     Vers sa page Contact si elle est renseignée, sinon vers son email.
     Sans l'un ni l'autre, le bouton est masqué plutôt que de ne mener
     nulle part. */
  const pageContact = (PORTFOLIO.navigation || []).find((n) => n.label === "Contact");
  const versContact = (pageContact && pageContact.lien) || (A.email ? "mailto:" + A.email : "");
  document.querySelectorAll("[data-contact]").forEach(function (b) {
    if (versContact) b.href = versContact; else b.hidden = true;
  });

  /* --- Retour en haut -------------------------------------- */
  const bouton = document.createElement("button");
  bouton.className = "haut-de-page";
  bouton.type = "button";
  bouton.setAttribute("aria-label", "Retour en haut de page");
  bouton.innerHTML = "↑";
  bouton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(bouton);
  const majBouton = () => bouton.classList.toggle("visible", window.scrollY > 400);
  window.addEventListener("scroll", majBouton, { passive: true });
  majBouton();
})();
