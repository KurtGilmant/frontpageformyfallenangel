/* Les ornements, tirés de son univers et de ses propres mots :
     - Minette, son chat  « Mon chat supervise tout ça de très près. »
     - deux plantes, la pile de livres à plat : une vraie étagère habitée
     - le coup de pinceau : le vocabulaire du cadre de son logo
     - les griffonnages  « je griffonne dans mon carnet »
   Minette et les plantes sont SES dessins (assets/images/originaux/). Le
   reste est dessiné en SVG dans son style (aplats, contour noir, son bleu) :
   ce sont des PLACEHOLDERS.

   Chaque ornement de l'étagère déclare sa largeur, sa hauteur et la part
   qui pend sous le plateau (`pend`), en unités — 1 unité = 1 px à
   l'échelle 1, comme les livres. */

const ORNEMENTS = (function () {
  const BLEU = "#1268c4";

  /* ---------- Ses dessins sur l'étagère : Minette et les plantes ----------
     Images tirées de ses originaux par outils/preparer_images.py ; leurs
     tailles et repères sont dans assets/js/dessins-geometrie.js. */
  const G = typeof DESSINS_GEOMETRIE !== "undefined" ? DESSINS_GEOMETRIE : null;
  const IMG = "assets/images/";
  const pct = (v, total) => (v / total * 100).toFixed(2) + "%";

  /* Minette (son dessin « Minette 2 »), couchée sur une pile de livres
     posés à plat. En calques, pour l'animer : la queue oscille, les yeux
     clignent, et selon ce que fait Manon —
       elle attrape un livre : Minette tourne la tête vers elle, pupilles
         dilatées ;
       elle la caresse : yeux fermés, la tête tendue vers sa main, un cœur.
     Les pupilles et les yeux fermés sont en SVG, par-dessus son dessin. */
  const PILE = { largeur: 172, hauteur: 86 };         // viewBox 172 × 86, à l'échelle de Minette
  const chat = G && (function () {
    const C = G.chat;
    const largeur = Math.max(PILE.largeur, C.largeur);
    const hauteur = PILE.hauteur + C.hauteur;         // couchée sur le haut de la pile
    const gauche = (largeur - C.largeur) / 2;
    const origine = (p) => pct(p[0], C.largeur) + " " + pct(p[1], C.hauteur);
    const calque = (nom, style) =>
      `<img class="chat-${nom}" src="${IMG}chat-${nom}.png" alt=""${style ? ` style="${style}"` : ""}>`;
    const vb = `viewBox="0 0 ${C.largeur} ${C.hauteur}"`;
    const pupilles = C.pupilles.map((p) =>
      `<ellipse class="pupille" cx="${p.c[0]}" cy="${p.c[1]}" rx="${p.r[0]}" ry="${p.r[1]}"/>`).join("");
    // yeux fermés de plaisir : un trait clair en arc sous chaque œil
    const fermes = C.pupilles.map(({ oeil: [x, y, r] }) =>
      `<path d="M${x - r * .8} ${y} q${r * .8} ${r * .75} ${r * 1.6} 0"/>`).join("");
    return {
      largeur, hauteur, pend: 0,
      // le haut de son crâne (x depuis la gauche, hauteur au-dessus du
      // plateau, en unités) : Manon y pose la main
      crane: [gauche + C.crane[0], hauteur - C.crane[1]],
      html: `
<svg class="pile" viewBox="0 128 172 86" aria-hidden="true"
     style="width:${pct(PILE.largeur, largeur)};height:${pct(PILE.hauteur, hauteur)}">
  <defs>
    <linearGradient id="ombre-pile" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".22"/>
      <stop offset=".5" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".22"/>
    </linearGradient>
  </defs>
  <g>
    <rect x="4"  y="180" width="164" height="34" rx="3" fill="#1a1f26"/>
    <rect x="4"  y="180" width="164" height="34" rx="3" fill="url(#ombre-pile)"/>
    <path d="M18 186 V208 M154 186 V208" stroke="${BLEU}" stroke-width="2"/>
    <rect x="14" y="152" width="146" height="28" rx="3" fill="#8fa9c4"/>
    <rect x="14" y="152" width="146" height="28" rx="3" fill="url(#ombre-pile)"/>
    <rect x="8"  y="128" width="152" height="24" rx="3" fill="#e7ecf2"/>
    <rect x="8"  y="128" width="152" height="24" rx="3" fill="url(#ombre-pile)"/>
    <path d="M22 140 H70" stroke="#b9c7d6" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>
<div class="chat-dessin" style="left:${pct(gauche, largeur)};width:${pct(C.largeur, largeur)};height:${pct(C.hauteur, hauteur)}">
  ${calque("queue", "transform-origin:" + origine(C.pivotQueue))}
  ${calque("corps")}
  <div class="chat-tete" style="transform-origin:${origine(C.pivotTete)}">
    ${calque("tete")}
    <div class="chat-yeux" style="transform-origin:50% ${pct(C.pupilles[0].oeil[1], C.hauteur)}">
      ${calque("yeux")}
      <svg ${vb} aria-hidden="true"><g fill="#111">${pupilles}</g></svg>
    </div>
    <svg class="chat-yeux-fermes" ${vb} aria-hidden="true">
      <g fill="none" stroke="#dfe2e6" stroke-width="1.4" stroke-linecap="round">${fermes}</g>
    </svg>
  </div>
  <!-- petit cœur qui s'envole quand Manon la caresse -->
  <svg class="chat-coeur" viewBox="0 0 26 22" aria-hidden="true"
       style="left:${pct(C.crane[0] + 26, C.largeur)};top:${pct(C.crane[1] - 4, C.hauteur)};width:${pct(22, C.largeur)}">
    <path d="M13 21 L3 11 C-3 4 6 -3 13 5 C20 -3 29 4 23 11 Z" fill="${BLEU}"/>
  </svg>
</div>`,
    };
  })();

  /* Les plantes. `profil` : hauteur du feuillage au-dessus du plateau, de
     gauche à droite (21 points sur la largeur du dessin) — c'est là que
     Manon vise avec l'arrosoir. `pend` : ce qui passe sous le plateau (une
     feuille de la monstera retombe devant la tablette).
     `debord` : part du dessin qui déborde sur les livres voisins (le dessin
     est plus large que la place qu'il prend sur l'étagère ; ses feuilles
     passent devant les livres). */
  const plante = (nom, calques, debord = 0) => {
    const P = G && G.plantes[nom];
    if (!P) return null;
    const place = 1 - debord;
    const cadre = debord ? ` style="width:${(100 / place).toFixed(2)}%;left:${(-50 * debord / place).toFixed(2)}%"` : "";
    return {
      largeur: P.largeur * place, hauteur: P.hauteur, pend: P.pend,
      largeurDessin: P.largeur, profil: P.profil, arrosable: true, debord: debord > 0,
      html: calques.map(([fichier, classe]) =>
        `<img class="plante-calque ${classe}" src="${IMG}${fichier}" alt=""${cadre}>`).join(""),
    };
  };
  // la monstera : couleurs d'automne au repos ; arrosée, elle reverdit
  // (même dessin, en vert, par-dessus — voir style.css). Elle prend 55 % de
  // sa largeur sur l'étagère : le reste de ses feuilles passe sur les livres.
  const monstera = plante("monstera", [["plante-monstera.png", "plante-base"],
                                        ["plante-monstera-verte.png", "plante-verte"]], 0.45);
  const succulente = plante("succulente", [["plante-succulente.png", "plante-base"]]);

  /* ---------- Le coup de pinceau sous le titre ---------- */
  const pinceau = `
<svg class="orn orn-pinceau" viewBox="0 0 420 28" preserveAspectRatio="none" aria-hidden="true">
  <path pathLength="1" d="M6 18 C86 7 186 5 266 11 S378 21 414 9"
        fill="none" stroke="${BLEU}" stroke-width="9" stroke-linecap="round"/>
  <path pathLength="1" d="M40 22 C120 14 210 13 300 17"
        fill="none" stroke="${BLEU}" stroke-width="3" stroke-linecap="round" opacity=".45"/>
</svg>`;

  /* ---------- Griffonnages de carnet, dans les marges de l'accroche ---------- */
  const trait = `fill="none" stroke="${BLEU}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
  const griffonnages = [
    // étincelle
    { cote: "gauche", haut: "8%",  decale: "-15%", taille: 38, rot: -8,
      svg: `<svg viewBox="0 0 40 40"><path ${trait} d="M20 3 C21 14 26 19 37 20 C26 21 21 26 20 37 C19 26 14 21 3 20 C14 19 19 14 20 3 Z"/></svg>` },
    // spirale
    { cote: "droite", haut: "2%",  decale: "-13%", taille: 44, rot: 10,
      svg: `<svg viewBox="0 0 44 44"><path ${trait} d="M22 22 c0-3 4-3 4 0 c0 5-8 5-8 0 c0-8 12-8 12 0 c0 11-16 11-16 0 c0-14 20-14 20 0"/></svg>` },
    // petit crayon
    { cote: "droite", haut: "62%", decale: "-17%", taille: 54, rot: -24,
      svg: `<svg viewBox="0 0 60 24"><path ${trait} d="M4 12 L14 6 L52 6 L52 18 L14 18 Z M14 6 L14 18 M44 6 L44 18"/><path d="M4 12 L9 9 L9 15 Z" fill="${BLEU}"/></svg>` },
    // trois points et une boucle
    { cote: "gauche", haut: "66%", decale: "-11%", taille: 50, rot: 4,
      svg: `<svg viewBox="0 0 56 30"><path ${trait} d="M4 20 C12 4 20 4 20 16 C20 26 30 26 34 14"/><circle cx="42" cy="12" r="2" fill="${BLEU}"/><circle cx="48" cy="16" r="2" fill="${BLEU}"/><circle cx="54" cy="12" r="2" fill="${BLEU}"/></svg>` },
  ];

  /* ---------- Pictogrammes des trois étapes ---------- */
  const pictos = {
    ecrire: `<svg viewBox="0 0 48 40"><path ${trait} d="M5 9 C5 7 6 6 8 6 L40 6 C42 6 43 7 43 9 L43 31 C43 33 42 34 40 34 L8 34 C6 34 5 33 5 31 Z"/><path ${trait} d="M6 8 L24 22 L42 8"/></svg>`,
    reponse: `<svg viewBox="0 0 44 44"><path ${trait} d="M22 5 C32 5 39 12 39 22 C39 32 32 39 22 39 C12 39 5 32 5 22 C5 12 12 5 22 5 Z"/><path ${trait} d="M22 12 L22 22 L29 27"/></svg>`,
    // services
    couverture: `<svg viewBox="0 0 48 44"><path ${trait} d="M13 4 H37 C39 4 40 5 40 7 V37 C40 39 39 40 37 40 H13 C10 40 9 39 9 36 V8 C9 5 10 4 13 4 Z"/><path ${trait} d="M15 4 V40"/><path ${trait} d="M21 12 H34 V24 H21 Z"/><path ${trait} d="M22 31 H33"/></svg>`,
    interieur: `<svg viewBox="0 0 48 44"><path ${trait} d="M24 10 C18 6 10 6 4 8 V36 C10 34 18 34 24 38 C30 34 38 34 44 36 V8 C38 6 30 6 24 10 Z"/><path ${trait} d="M24 10 V38"/><path ${trait} d="M9 27 L14 20 L18 25 L20 23 L22 27"/><path ${trait} d="M35 15 C36 18 37 19 40 20 C37 21 36 22 35 25 C34 22 33 21 30 20 C33 19 34 18 35 15 Z"/></svg>`,
    marquepage: `<svg viewBox="0 0 48 44"><path ${trait} d="M16 4 H32 V40 L24 33 L16 40 Z"/><path ${trait} d="M24 11 C25 14 26 15 29 16 C26 17 25 18 24 21 C23 18 22 17 19 16 C22 15 23 14 24 11 Z"/></svg>`,
    miseenpage: `<svg viewBox="0 0 48 44"><path ${trait} d="M10 4 H38 V40 H10 Z"/><path ${trait} d="M15 10 H33"/><path ${trait} d="M15 16 H22 V27 H15 Z"/><path ${trait} d="M26 16 H33 M26 21 H33 M26 26 H33 M15 32 H33"/></svg>`,
    promo: `<svg viewBox="0 0 48 44"><path ${trait} d="M7 17 V27 H13 L31 36 V8 L13 17 Z"/><path ${trait} d="M13 27 L16 37 H21 L19 28"/><path ${trait} d="M37 14 L42 11 M37 22 H43 M37 30 L42 33"/></svg>`,
    appel: `<svg viewBox="0 0 48 44"><path ${trait} d="M8 8 C8 6 9 5 11 5 L37 5 C39 5 40 6 40 8 L40 26 C40 28 39 29 37 29 L20 29 L11 37 L12 29 L11 29 C9 29 8 28 8 26 Z"/><path ${trait} d="M16 15 L32 15 M16 21 L27 21"/></svg>`,
  };

  return { chat, plante: monstera, succulente, pinceau, griffonnages, pictos };
})();
