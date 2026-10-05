/* Construit l'étagère à partir de data/livres.js.
   -------------------------------------------------------------
   Pas de défilement horizontal : la tablette tient entièrement dans
   l'écran. Les livres cliquables sont posés au CENTRE, et on complète
   de part et d'autre avec des livres de décor tant qu'il reste de la
   place. Sur un écran étroit, il y en a simplement moins. */

(function () {
  const piste  = document.querySelector(".piste");
  const rangee = document.querySelector(".rangee");
  if (!piste || !rangee) return;

  const ESPACE = 5;     // doit correspondre au `gap` de .rangee en CSS
  const RESERVE = 180;  // doit correspondre au padding-top de .piste en CSS

  /* L'étagère est l'élément signature de la page : elle doit tenir dans le
     premier écran. Sur un portable 1280×720, à l'échelle 1, les livres
     commençaient à 626 px — presque entièrement sous la ligne de
     flottaison. On réduit donc l'échelle pour que réserve + plus haut livre
     tiennent sous l'accroche, sans descendre sous 0,55, et sans jamais
     dépasser l'échelle fixée en CSS pour la largeur d'écran. */
  const PLUS_HAUT = Math.max(
    ...PORTFOLIO.categories.map((c) => c.hauteur),
    ...PORTFOLIO.decoratifs.map((d) => d[0]));

  let hautMesure = 0;

  // partagés avec personnage.js, qui cale la tête de Manon sous cette réserve
  window.ETAGERE = { RESERVE: RESERVE, PLUS_HAUT: PLUS_HAUT };

  function ajusterEchelle() {
    const racine = document.documentElement;
    racine.style.removeProperty("--echelle");          // repartir de la valeur CSS
    const selonLargeur = parseFloat(getComputedStyle(racine)
      .getPropertyValue("--echelle")) || 1;
    const haut = piste.getBoundingClientRect().top + window.scrollY;
    hautMesure = haut;
    const dispo = window.innerHeight - haut - 28;
    const e = Math.min(selonLargeur, Math.max(0.55, dispo / (RESERVE + PLUS_HAUT)));
    racine.style.setProperty("--echelle", e.toFixed(3));
  }

  function echelle() {
    return parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue("--echelle")) || 1;
  }

  function livreDecoratif([hauteur, epaisseur, couleur]) {
    const el = document.createElement("div");
    el.className = "livre decor";
    el.setAttribute("aria-hidden", "true");
    el.style.setProperty("--h", hauteur);
    el.style.setProperty("--e", epaisseur);
    el.style.setProperty("--c", couleur);
    el.innerHTML = '<div class="dos"><span class="tranche"></span></div>';
    return el;
  }

  function livreCategorie(cat) {
    const el = document.createElement("a");
    el.className = "livre cliquable";
    el.href = cat.lien || PORTFOLIO.artiste.site;   // sa page sur son site Adobe Portfolio
    el.setAttribute("aria-label", cat.titre + " — " + cat.soustitre);
    el.style.setProperty("--h", cat.hauteur);
    el.style.setProperty("--e", cat.epaisseur);
    el.style.setProperty("--c", cat.couleur);
    el.style.setProperty("--i", cat.encre);

    const largeurCouv = Math.round(cat.hauteur * 0.66);
    const src = cat.couverture || placeholderSVG(cat.id, cat.couleur, largeurCouv, cat.hauteur);

    // Son dessin du dos, plaqué sur la face avant du livre ; l'ombrage CSS
    // par-dessus lui donne sa rondeur. Sans dessin : dos uni + titre.
    if (cat.dos) {
      el.classList.add("illustre");
      // URL absolue : une url() relative passée par une variable CSS est
      // résolue depuis style.css (assets/css/…), pas depuis la page
      el.style.setProperty("--img-dos", 'url("' + new URL(cat.dos, document.baseURI).href + '")');
    }

    el.innerHTML =
      '<div class="dos"><span class="tranche"></span><span class="intitule"></span></div>' +
      '<div class="couv"><img alt="" src="' + src + '">' +
        // sa couverture porte déjà le titre : pas de légende par-dessus
        (cat.couverture ? "" : '<div class="legende"><strong></strong><span></span></div>') +
      "</div>";

    el.querySelector(".intitule").textContent = cat.titre;
    if (!cat.couverture) {
      el.querySelector(".legende strong").textContent = cat.titre;
      el.querySelector(".legende span").textContent = cat.soustitre;
    }

    // la couverture prend exactement les proportions de son dessin
    const img = el.querySelector(".couv img");
    const caler = () => img.naturalWidth &&
      el.style.setProperty("--rc", (img.naturalWidth / img.naturalHeight).toFixed(4));
    if (img.complete) caler(); else img.addEventListener("load", caler);
    return el;
  }

  /* Un ornement de l'étagère (Minette, les plantes) : voir ornements.js.
     Les plantes portent toutes la classe `objet-plante` : Manon les arrose. */
  function objet(nom, def) {
    const el = document.createElement("div");
    el.className = "objet objet-" + nom + (def.arrosable && nom !== "plante" ? " objet-plante" : "")
                 + (def.debord ? " deborde" : "");
    el.dataset.ornement = nom;
    el.setAttribute("aria-hidden", "true");
    el.style.setProperty("--l", def.largeur);
    el.style.setProperty("--hh", def.hauteur);
    el.style.setProperty("--pend", def.pend);
    el.innerHTML = def.html;
    return el;
  }

  /* ---------- Construction ---------- */

  function construire() {
    ajusterEchelle();
    const e = echelle();
    const style = getComputedStyle(piste);
    const dispo = piste.clientWidth
                - parseFloat(style.paddingLeft)
                - parseFloat(style.paddingRight);

    const deco = PORTFOLIO.decoratifs;
    const cats = PORTFOLIO.categories;

    // 1. le bloc central : les livres cliquables, séparés par des livres de
    //    décor. Ouvert, un rayon pivote de 46° et déplie sa couverture vers la
    //    droite : elle recouvrait le rayon suivant, qu'on ne pouvait plus
    //    atteindre sans ressortir de l'étagère. On écarte donc les rayons d'au
    //    moins la largeur d'un livre ouvert. (Au doigt, pas de couverture qui
    //    se déplie : un seul livre d'écart suffit.)
    const survol = matchMedia("(hover: hover)").matches;
    const ouvert = (cat) => {
      const rc = cat.couverture ? 0.71 : 0.66;
      const a = 46 * Math.PI / 180;
      // largeur projetée du dos + de la couverture tournés de 46°. Mesuré dans
      // le navigateur : 219 unités à l'échelle 1, 229 à 0,55 — ce calcul donne
      // 243, soit une petite marge de sécurité.
      return cat.epaisseur * Math.cos(a) + cat.hauteur * rc * Math.sin(a);
    };
    const centre = [];
    let iDeco = 0;
    cats.forEach(function (cat, i) {
      if (i > 0) {
        const precedent = cats[i - 1];
        const ecart = survol ? ouvert(precedent) - precedent.epaisseur + 16 : 0;
        let largeur = 0;
        do {
          const livre = deco[iDeco++ % deco.length];
          centre.push(livre);
          largeur += livre[1] + ESPACE / e;
        } while (largeur < ecart);
      }
      centre.push(cat);
    });

    const largeurDe = (x) => (Array.isArray(x) ? x[1] : x.epaisseur) * e;
    let total = centre.reduce((s, x) => s + largeurDe(x), 0)
              + Math.max(0, centre.length - 1) * ESPACE;

    // 2. les ornements — la succulente à gauche, Minette et la monstera à
    //    droite — s'il reste la place (sur un petit écran, la plante de droite
    //    part la première, puis Minette). Ils sont posés PRÈS des rayons, et non
    //    aux bouts de la tablette où ils passaient inaperçus : Minette doit
    //    être à côté quand Manon attrape un livre, puisqu'elle se redresse.
    const O = (typeof ORNEMENTS !== "undefined" && PORTFOLIO.ornements) || {};
    const bout = (nom) => (O[nom] && ORNEMENTS[nom] ? { nom, def: ORNEMENTS[nom] } : null);
    let aGauche = bout("succulente"), chat = bout("chat"), aDroite = bout("plante");
    const largeurObjet = (o) => (o ? o.def.largeur * e + ESPACE : 0);
    const avecObjets = () => total + largeurObjet(aGauche) + largeurObjet(chat) + largeurObjet(aDroite);
    if (aDroite && avecObjets() > dispo) aDroite = null;
    if (chat && avecObjets() > dispo) chat = null;
    if (aGauche && avecObjets() > dispo) aGauche = null;
    total = avecObjets();

    // 3. on étoffe de part et d'autre tant que ça rentre, en ajoutant toujours
    //    du côté le plus étroit : les livres de décor n'ont pas tous la même
    //    épaisseur, et une simple alternance gauche/droite faisait dériver les
    //    rayons hors du centre. Les ornements comptent dans la balance.
    const gauche = [], droite = [];
    let largeurG = largeurObjet(aGauche), largeurD = largeurObjet(chat) + largeurObjet(aDroite);
    while (iDeco < 400) {
      const candidat = deco[iDeco % deco.length];
      const ajout = largeurDe(candidat) + ESPACE;
      if (total + ajout > dispo) break;
      if (largeurG <= largeurD) { gauche.unshift(candidat); largeurG += ajout; }
      else                      { droite.push(candidat);    largeurD += ajout; }
      total += ajout;
      iDeco++;
    }

    // 4. montage
    rangee.innerHTML = "";
    let retard = 0;
    const poser = (x) => {
      const el = x.def ? objet(x.nom, x.def)
               : Array.isArray(x) ? livreDecoratif(x) : livreCategorie(x);
      el.style.setProperty("--retard", retard + "ms");
      retard += 26;
      rangee.appendChild(el);
    };
    // `gauche` va du bout vers le centre, `droite` du centre vers le bout
    // La plante de gauche (la succulente) : au milieu des livres de gauche,
    // mais jamais à moins de 4 livres des rayons. Trop près, elle cachait mal
    // Manon qui se tient juste à gauche du premier rayon ; trop près du bout,
    // Manon n'avait plus la place de se mettre à sa gauche pour l'arroser.
    // Minette : à 3 livres à droite des rayons (Manon tend le bras vers la
    // droite, elle a toute la place). La plante de droite (la monstera) :
    // plus loin, au milieu des livres de droite.
    const ECART_CHAT = 3;
    if (aGauche) {
      const milieu = Math.min(Math.floor(gauche.length / 2), gauche.length - 4);
      gauche.splice(Math.max(0, milieu), 0, aGauche);
    }
    if (aDroite) {
      const loin = Math.max(ECART_CHAT + 4, Math.floor(droite.length / 2) + 2);
      droite.splice(Math.min(loin, droite.length), 0, aDroite);
    }
    if (chat) droite.splice(Math.min(ECART_CHAT, droite.length), 0, chat);
    gauche.forEach(poser);
    centre.forEach(poser);
    droite.forEach(poser);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { rangee.classList.add("en-place"); });
    });

    document.dispatchEvent(new CustomEvent("etagere-prete"));
  }

  construire();

  /* Les polices Google arrivent après le premier rendu et changent la hauteur
     de l'accroche : si l'étagère a bougé, on refait la mesure. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      const haut = piste.getBoundingClientRect().top + window.scrollY;
      if (Math.abs(haut - hautMesure) > 4) construire();
    });
  }

  /* On reconstruit quand la fenêtre change : le nombre de livres de décor
     qui tiennent n'est plus le même, ni l'échelle. Sur écran tactile on
     ignore les variations de hauteur seules — la barre d'adresse qui
     apparaît et disparaît au défilement en déclencherait sans arrêt. */
  const tactile = matchMedia("(hover: none)").matches;
  let largeurConnue = piste.clientWidth;
  let hauteurConnue = window.innerHeight;
  let minuteur = null;
  window.addEventListener("resize", function () {
    const largeurChange = piste.clientWidth !== largeurConnue;
    const hauteurChange = !tactile && window.innerHeight !== hauteurConnue;
    if (!largeurChange && !hauteurChange) return;
    largeurConnue = piste.clientWidth;
    hauteurConnue = window.innerHeight;
    clearTimeout(minuteur);
    minuteur = setTimeout(construire, 180);
  });
})();
