/* =============================================================
   LE SEUL FICHIER À MODIFIER AU QUOTIDIEN
   -------------------------------------------------------------
   Toute la page est générée à partir d'ici. Pas de HTML à toucher.

   Ce site n'est que la PAGE D'ACCUEIL. Tout le reste est son site
   Adobe Portfolio, https://inkanostudio.com : les livres, le menu,
   le bouton de contact et le pied de page y mènent. Si elle renomme
   une page sur Adobe Portfolio, mettre son adresse à jour ici.

   ⚠️  Les TEXTES sont repris mot pour mot de son site. Rien n'a été
       inventé.
   ============================================================= */

/* Son site Adobe Portfolio. Aujourd'hui sur inkanostudio.com ; quand cette
   page d'accueil prendra inkanostudio.com, ses pages passeront sur
   portfolio.inkanostudio.com. On le déduit de l'adresse où cette page est
   servie : rien à changer le jour de la bascule. */
const SITE = /(^|\.)inkanostudio\.com$/.test(location.hostname)
  ? "https://portfolio.inkanostudio.com"
  : "https://inkanostudio.com";

const PORTFOLIO = {

  /* --- Identité -------------------------------------------- */
  artiste: {
    prenom: "Manon",
    nom: "Manon Amen",
    studio: "Inkano Studio",                    // signature de son pied de page
    site: SITE + "/",
    titre: "Hello, moi c'est Manon !",
    intro:
      "Je suis illustratrice et graphiste spécialisée en édition. Je dessine depuis " +
      "toujours, je lis depuis toujours et un jour j'ai réalisé que je pouvais faire " +
      "les deux en même temps. Ce que je fais : des illustrations jeunesse et des " +
      "couvertures de livres qui donnent envie de lire.",
    email: "",                                  // pas d'email public : sa page Contact a un formulaire
    logo: "assets/images/logo.png",             // son portrait au pinceau (outils/preparer_images.py)
    reseaux: {
      linkedin:  "https://www.linkedin.com/in/manon-amen-b93523399/",
      instagram: "https://www.instagram.com/inkano_studio/",
      tiktok:    "https://www.tiktok.com/@inkano_studio",
    },
    // liens du pied de page, comme sur son site
    legal: [
      { label: "Mentions légales",             lien: SITE + "/mentions-legales-1" },
      { label: "Politique de confidentialité", lien: SITE + "/copie-de-mentions-legales" },
    ],
  },

  /* --- Menu de navigation : le même que sur son site --------- */
  navigation: [
    { label: "Accueil",              lien: "index.html" },
    { label: "Littérature générale", lien: SITE + "/edition-adulte-1" },
    { label: "Littérature jeunesse", lien: SITE + "/edition-jeunesse-1" },
    { label: "À propos",             lien: SITE + "/a-propos" },
    { label: "Contact",              lien: SITE + "/contact" },
  ],

  /* --- LES LIVRES DE L'ÉTAGÈRE ------------------------------
     Ils sont posés au CENTRE de la tablette, entourés de livres de
     décor. Chacun mène à sa page sur son site. Pour en ajouter un :
     copier un bloc ci-dessous et le coller à la suite. L'étagère se
     recentre et retire automatiquement des livres de décor.

     lien      : URL de sa page sur son site
     dos       : son dessin du dos du livre (image verticale)
     couverture: son dessin de la couverture
     hauteur / epaisseur : garder le MÊME rapport que l'image du dos,
                 sinon son dessin est déformé. Ses dos font 591×2480 px,
                 soit épaisseur = hauteur × 0,238 (360 → 86).
     couleur   : teinte de repli (sans dessin du dos)
  ----------------------------------------------------------- */
  categories: [
    {
      id: "litterature-generale",
      titre: "Littérature générale",
      soustitre: "Couvertures",
      lien: SITE + "/edition-adulte-1",
      couleur: "#21403a", encre: "#e3c27a",
      hauteur: 360, epaisseur: 86,
      dos: "assets/images/dos-litterature-generale.jpg",
      couverture: "assets/images/couv-litterature-generale.jpg",
    },
    {
      id: "litterature-jeunesse",
      titre: "Littérature jeunesse",
      soustitre: "Illustration",
      lien: SITE + "/edition-jeunesse-1",
      couleur: "#6fb6e4", encre: "#f26522",
      hauteur: 360, epaisseur: 86,
      dos: "assets/images/dos-litterature-jeunesse.jpg",
      couverture: "assets/images/couv-litterature-jeunesse.jpg",
    },
  ],

  /* --- Services (repris de sa page, mot pour mot) ----------
     Seule retouche : la majuscule en tête de chaque description, qui
     commence une ligne à part entière dans la mise en page. `picto` :
     petit dessin au trait (assets/js/ornements.js). Pas de numéros : ce
     sont des prestations, pas des étapes dans l'ordre.
  ----------------------------------------------------------- */
  services: {
    titre: "Services",
    intro: "Que tu sois éditeur, directeur artistique ou auteur auto-édité, je peux " +
           "intervenir à différentes étapes de ton projet :",
    liste: [
      { nom: "Couvertures", picto: "couverture",
        texte: "Conception et illustration de couvertures pour la littérature adulte, YA " +
               "et jeunesse, dans tous les registres." },
      { nom: "Illustrations intérieures", picto: "interieur",
        texte: "Vignettes, illustrations de début de chapitre, spreads pour albums jeunesse." },
      { nom: "Illustrations", picto: "marquepage",
        texte: "Illustrations pour affiches, marque-pages, goodies, jeux et autres supports " +
               "autour de ton univers." },
      { nom: "Mise en page", picto: "miseenpage",
        texte: "Mise en page de tes supports éditoriaux." },
      { nom: "Visuels promotionnels", picto: "promo",
        texte: "Visuels pour annoncer, promouvoir et faire rayonner ton livre sur les " +
               "réseaux et ailleurs." },
    ],
    // la fin de la phrase devient un lien vers l'appel à contact, juste dessous
    conclusion: ["Devis gratuit et personnalisé selon ton projet, ", "écris-moi pour qu'on en parle", "."],
  },

  /* --- Le personnage de l'étagère : ses dessins ---------------
     Tirés de assets/images/originaux/ (Personnage, manon bras tendu,
     manon bras tendu arrosoir) par outils/preparer_images.py. Leur
     géométrie est dans assets/js/dessins-geometrie.js (généré par le même
     script).
  ----------------------------------------------------------- */
  personnage: {
    actif: true,
    repos:        "assets/images/manon-repos.png",          // elle salue
    corps:        "assets/images/manon-corps.png",          // bras tendu : le corps…
    bras:         "assets/images/manon-bras.png",           // … et le bras, qui pivote
    brasArrosoir: "assets/images/manon-bras-arrosoir.png",  // le bras qui tient l'arrosoir
    // Sa taille par rapport aux livres : unités par pixel d'image
    // (1 unité = 1 px à l'échelle 1 ; un livre fait 360 unités de haut).
    taille: 0.47,
    // De combien elle se baisse au repos (on voit sa tête et sa main qui salue).
    baisse: 45,
  },

  /* --- Ornements (true = affiché, false = retiré) ------------
     Minette et les plantes sont ses dessins (assets/images/originaux/) ;
     le pinceau et les griffonnages, des SVG dans son style (placeholders,
     voir assets/js/ornements.js).
  ----------------------------------------------------------- */
  ornements: {
    chat: true,          // Minette, sur une pile de livres à droite des rayons — Manon vient la caresser
    plante: true,        // la monstera, à droite après Minette — Manon l'arrose, elle reverdit
    succulente: true,    // à gauche des rayons — Manon l'arrose aussi
    pinceau: true,       // coup de pinceau bleu sous le titre
    griffonnages: false, // petits dessins de carnet autour de l'accroche — retirés : Manon ne les aime pas
  },

  /* --- Comment ça se passe ----------------------------------
     Une vraie séquence, dans l'ordre de sa page Contact : on écrit,
     elle répond sous 48h, puis vient l'appel découverte. Les textes
     sont les siens ; seuls les titres courts sont ajoutés.
  ----------------------------------------------------------- */
  methode: [
    { n: "01", picto: "ecrire", titre: "Tu m'écris",
      texte: "Même un petit mot suffit pour démarrer la discussion." },
    { n: "02", picto: "reponse", titre: "Je te réponds sous 48h",
      // (« dans les 48h » répétait le titre)
      texte: "Je te recontacte dans les deux jours qui suivent ton message." },
    { n: "03", picto: "appel", titre: "Un appel découverte",
      texte: "Gratuit, 20 à 30 minutes, pour qu'on apprenne à se connaître et qu'on parle de ce que tu as en tête. Et si tu n'es pas à l'aise avec les appels ou les visios, on peut échanger à l'écrit." },
  ],

  /* --- Livres de décor (non cliquables) ---------------------
     Format : [hauteur, épaisseur, couleur]. Ils remplissent la
     tablette de part et d'autre, autant qu'il y a de place.
  ----------------------------------------------------------- */
  decoratifs: [
    [306, 34, "#c5d5e6"], [344, 46, "#8fa9c4"], [284, 52, "#e7ecf2"],
    [360, 24, "#1a1f26"], [316, 60, "#b4c7dc"], [292, 30, "#6d8bab"],
    [336, 40, "#dde5ee"], [272, 54, "#9db5cd"], [326, 32, "#2b3947"],
    [352, 26, "#7fa3c7"], [300, 64, "#eef2f6"], [322, 44, "#526a83"],
    [280, 48, "#c9d7e5"], [366, 30, "#a6bbd1"], [310, 68, "#e2e9f0"],
    [288, 36, "#3d4d5e"],
  ],
};
