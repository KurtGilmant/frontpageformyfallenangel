/* Manon, derrière l'étagère.
   =============================================================
   Ses dessins, en calques (outils/preparer_images.py) :
     - au repos : son dessin où elle salue, tel quel ;
     - bras tendu : le corps, et par-derrière le bras seul — ou le bras qui
       tient l'arrosoir. Les deux bras pivotent autour d'un point caché
       derrière la pile de livres qu'elle porte : la racine du bras ne se
       voit jamais.

   Selon ce que survole la souris :
     - un rayon   → elle se redresse et attrape le haut du livre ;
     - Minette    → elle se baisse et la caresse (va-et-vient de la main) ;
     - une plante → elle l'arrose ; la monstera reverdit.

   GÉOMÉTRIE — en unités (1 unité = 1 px à l'échelle 1 ; un livre fait 360
   unités de haut), à partir de DESSINS_GEOMETRIE.personnage :
     pivot  centre de rotation des bras   main  creux de la paume
     bec    bout de l'arrosoir            L     longueur pivot → main
   Pour poser la main sur un point à la hauteur H :
       d = hauteur du pivot − H        h = √(L² − d²)
       angle du bras = atan2(d, h), et elle se place à h du point.
   Pour Minette et les plantes (bas), elle se baisse d'abord.
   ============================================================= */

(function () {
  const CFG = PORTFOLIO.personnage || {};
  const GEO = typeof DESSINS_GEOMETRIE !== "undefined" ? DESSINS_GEOMETRIE : null;
  if (CFG.actif === false || !CFG.repos || !GEO) return;
  const ORN = typeof ORNEMENTS !== "undefined" ? ORNEMENTS : null;

  const G = GEO.personnage;
  const U = CFG.taille || 0.47;
  const BAISSE = CFG.baisse == null ? 45 : CFG.baisse;

  const LARGEUR = G.largeur * U;
  const HAUTEUR = G.hauteur * U;
  // repères en unités : x depuis la gauche de l'image, y au-dessus de ses pieds
  const en = (p) => ({ x: p[0] * U, y: (G.hauteur - p[1]) * U });
  const PIVOT = en(G.pivot), MAIN = en(G.main), BEC = en(G.bec);
  const CORPS = { gauche: G.corps[0] * U, droite: G.corps[1] * U };
  const L = Math.hypot(MAIN.x - PIVOT.x, MAIN.y - PIVOT.y);
  // direction du bras dans son dessin (repère écran : y vers le bas)
  const ANGLE_DESSIN = Math.atan2(-(MAIN.y - PIVOT.y), MAIN.x - PIVOT.x) * 180 / Math.PI;

  const LEVEE_LIVRE = 6;     // px : le livre survolé monte de 6 px (voir CSS)
  const INCLINAISON = 20;    // degrés : elle abaisse l'arrosoir pour verser
  const AU_DESSUS = 22;      // unités : le bec, au-dessus du feuillage
  const BRAS_LEVE = -55;     // degrés : le bras quand il sort ou rentre — dans
                             // le prolongement du salut de son dessin au repos
  const ETATS = ["attrape", "caresse", "arrose"];

  let perso, bras, brasArrosoir, gouttes, maison = null, piedsDebout = 0;
  let enCours = null, rentre = null;

  const echelle = () => parseFloat(getComputedStyle(document.documentElement)
    .getPropertyValue("--echelle")) || 1;
  const pct = (v, total) => (v / total * 100).toFixed(3) + "%";
  const tourner = (calque, angle) => { calque.style.transform = "rotate(" + angle.toFixed(1) + "deg)"; };

  /* ---------- Montage ---------- */

  function creer(rangee) {
    perso = document.createElement("div");
    perso.className = "perso";
    perso.setAttribute("aria-hidden", "true");
    const img = (classe, src) => src ? '<img class="' + classe + '" alt="" src="' + src + '">' : "";
    perso.innerHTML =
      '<div class="silhouette">' +
        img("perso-bras", CFG.bras) +
        img("perso-bras-arrosoir", CFG.brasArrosoir) +
        img("perso-corps", CFG.corps) +
        img("perso-repos", CFG.repos) +
        '<div class="gouttes"><i></i><i></i><i></i></div>' +
      "</div>";

    const e = echelle();
    perso.style.width = LARGEUR * e + "px";
    perso.style.height = HAUTEUR * e + "px";
    bras = perso.querySelector(".perso-bras");
    brasArrosoir = perso.querySelector(".perso-bras-arrosoir");
    gouttes = perso.querySelector(".gouttes");
    [bras, brasArrosoir].forEach(function (calque) {
      if (calque) calque.style.transformOrigin = pct(G.pivot[0], G.largeur) + " " + pct(G.pivot[1], G.hauteur);
    });
    rangee.insertBefore(perso, rangee.firstChild);

    // debout : le haut de l'image arrive au bord de la réserve
    const E = window.ETAGERE || { RESERVE: 180, PLUS_HAUT: 366 };
    piedsDebout = E.PLUS_HAUT + E.RESERVE - HAUTEUR;
  }

  /* ---------- Placement ---------- */

  /* Amène son pivot en x (px dans la rangée). Elle peut déborder dans la
     marge de la page, mais son corps reste à l'écran (son image est bien
     plus large que lui : le bras et l'arrosoir y ont leur place). */
  function amenerPivot(x, rangee) {
    const e = echelle();
    const marge = parseFloat(getComputedStyle(rangee.parentNode).paddingLeft) || 0;
    const min = -marge - CORPS.gauche * e;
    const max = rangee.scrollWidth + marge - CORPS.droite * e;
    deplacer(Math.max(min, Math.min(max, x - PIVOT.x * e)));
  }

  /* Pose la main en x (px dans la rangée), à H unités au-dessus du plateau,
     les pieds à la hauteur `pieds` (unités). */
  function poser(x, H, pieds, rangee) {
    const d = Math.max(-L * 0.96, Math.min(L * 0.96, pieds + PIVOT.y - H));
    const h = Math.sqrt(L * L - d * d);
    const angle = Math.atan2(d, h) * 180 / Math.PI;       // repère écran
    amenerPivot(x - h * echelle(), rangee);
    perso.style.setProperty("--pieds", pieds.toFixed(1));
    tourner(bras, angle - ANGLE_DESSIN);
  }

  // pour Minette : se baisser juste assez pour que la main arrive un peu
  // sous l'épaule (sans jamais monter plus haut que debout)
  const piedsPour = (H) => Math.min(piedsDebout, H + 0.45 * L - PIVOT.y);

  function etat(nom) {
    clearTimeout(rentre);
    ETATS.forEach((c) => perso.classList.remove(c));
    perso.classList.add(nom, "bras-sorti");
  }

  function attraperLivre(livre, rangee) {
    etat("attrape");
    // le livre survolé pivote sur son bord gauche et masque ce qui est
    // derrière lui : on vise son coin supérieur GAUCHE, pour que les doigts
    // restent visibles
    const H = (parseFloat(livre.style.getPropertyValue("--h")) || 360) + LEVEE_LIVRE / echelle();
    poser(livre.offsetLeft + livre.offsetWidth * 0.1, H, piedsDebout, rangee);
  }

  function caresserChat(chat, rangee) {
    etat("caresse");
    const [x, H] = ORN.chat.crane;
    poser(chat.offsetLeft + x * echelle(), H, piedsPour(H), rangee);
  }

  function arroserPlante(plante, rangee) {
    etat("arrose");
    document.querySelectorAll(".objet-plante.arrosee").forEach((p) => p !== plante && p.classList.remove("arrosee"));
    plante.classList.add("arrosee");
    const def = ORN[plante.dataset.ornement];

    // le bec, une fois le bras abaissé de INCLINAISON (repère écran)
    const a = INCLINAISON * Math.PI / 180;
    const vx = BEC.x - PIVOT.x, vy = -(BEC.y - PIVOT.y);
    const bec = { x: vx * Math.cos(a) - vy * Math.sin(a), y: vx * Math.sin(a) + vy * Math.cos(a) };
    // où verser : au-dessus du feuillage, le plus près possible du milieu,
    // mais là où il est assez bas pour qu'elle n'ait pas à se hisser hors de
    // l'étagère (la monstera est plus haute en son centre). Le feuillage
    // « local » = le plus haut des trois points voisins du profil.
    const P = def.profil, n = P.length - 1;
    const local = (i) => Math.max(P[Math.max(i - 1, 0)], P[i], P[Math.min(i + 1, n)]);
    const piedsPour = (i) => local(i) + AU_DESSUS + bec.y - PIVOT.y;
    const ordre = [...P.keys()].sort((i, j) => Math.abs(i - n / 2) - Math.abs(j - n / 2));
    const cible = ordre.find((i) => piedsPour(i) <= piedsDebout) ??
                  ordre.reduce((m, i) => (piedsPour(i) < piedsPour(m) ? i : m));
    const pieds = Math.min(piedsDebout, piedsPour(cible));
    // x de la cible : le dessin est centré sur sa place dans la rangée
    const x = plante.offsetLeft + plante.offsetWidth / 2 + (cible / n - 0.5) * def.largeurDessin * echelle();
    amenerPivot(x - bec.x * echelle(), rangee);
    perso.style.setProperty("--pieds", pieds.toFixed(1));
    tourner(brasArrosoir, INCLINAISON);
    tourner(bras, INCLINAISON);         // pour repartir de là au relâcher

    // les gouttes, sous le bec
    gouttes.style.left = pct(PIVOT.x + bec.x, LARGEUR);
    gouttes.style.top = pct(HAUTEUR - PIVOT.y + bec.y, HAUTEUR);
  }

  /* Le bras remonte vers la position du salut, puis on rend son dessin au
     repos. Le temps de ce mouvement, on garde le corps « bras tendu ». */
  function relacher() {
    const sorti = perso.classList.contains("bras-sorti");
    ETATS.forEach((c) => perso.classList.remove(c));
    document.querySelectorAll(".objet-plante.arrosee").forEach((p) => p.classList.remove("arrosee"));
    tourner(bras, BRAS_LEVE);
    if (brasArrosoir) tourner(brasArrosoir, 0);
    clearTimeout(rentre);
    if (sorti) rentre = setTimeout(() => perso.classList.remove("bras-sorti"), 430);
    perso.style.setProperty("--pieds", (piedsDebout - BAISSE).toFixed(1));
    if (maison !== null) deplacer(maison);
  }

  /* Un déplacement = une petite marche : `.marche` le temps du trajet. */
  function deplacer(x) {
    const avant = parseFloat(perso.style.left) || 0;
    perso.style.left = x + "px";
    if (Math.abs(x - avant) < 4) return;
    perso.classList.add("marche");
    clearTimeout(enCours);
    enCours = setTimeout(function () { perso.classList.remove("marche"); }, 620);
  }

  /* ---------- Branchement ---------- */

  function surSouris(el, action) {
    el.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "touch") action();
    });
  }

  function installer() {
    const rangee = document.querySelector(".rangee");
    if (!rangee) return;
    const ancien = rangee.querySelector(".perso");
    if (ancien) ancien.remove();
    creer(rangee);

    const livres = rangee.querySelectorAll(".livre.cliquable");
    if (!livres.length) return;
    livres.forEach(function (livre) {
      surSouris(livre, () => attraperLivre(livre, rangee));
      livre.addEventListener("focus", () => attraperLivre(livre, rangee));
    });

    const chat = rangee.querySelector(".objet-chat");
    if (chat && ORN && ORN.chat) surSouris(chat, () => caresserChat(chat, rangee));
    // Sur écran étroit, pas d'arrosage : il n'y a pas la place pour que
    // Manon se tienne à côté de la plante avec l'arrosoir tendu.
    const etroit = matchMedia("(max-width: 760px)").matches;
    if (brasArrosoir && ORN && !etroit) {
      rangee.querySelectorAll(".objet-plante").forEach(function (plante) {
        surSouris(plante, () => arroserPlante(plante, rangee));
      });
    }

    rangee.addEventListener("pointerleave", relacher);
    rangee.addEventListener("focusout", function (e) {
      if (!rangee.contains(e.relatedTarget)) relacher();
    });

    // au repos : juste à gauche du premier rayon
    maison = null;
    attraperLivre(livres[0], rangee);
    maison = parseFloat(perso.style.left) || 0;
    relacher();
    clearTimeout(rentre);
    perso.classList.remove("bras-sorti", "marche");
  }

  document.addEventListener("etagere-prete", installer);
  if (document.querySelector(".rangee .livre")) installer();
})();
