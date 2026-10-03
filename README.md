# Page d'accueil « étagère » — portfolio de Manon

Site statique aligné sur le système graphique du site existant : fond blanc,
bleu de marque, serif display en capitales espacées pour les titres, sans
géométrique pour le texte, boutons pilule noirs.

La page d'accueil est une étagère de livres. Les livres marqués de filets bleus
sont les rayons : ils s'ouvrent au survol et mènent à leur page. Derrière la
tablette, un personnage se redresse et vient attraper celui qu'on survole.

Tout tient dans l'écran : **pas de défilement horizontal**.

Pas de framework, pas d'étape de compilation, aucune dépendance à installer.

---

## ⚠️ À valider / compléter avant mise en ligne

Tout se trouve dans [`data/livres.js`](data/livres.js).

| Quoi | Où | État |
|---|---|---|
| Adresse email | `artiste.email` | **vide** → le bouton « Me contacter » reste masqué tant qu'il n'a ni email ni page Contact |
| LinkedIn / Instagram / TikTok | `artiste.reseaux` | **vides** (les icônes disparaissent tant qu'elles le sont) |
| URLs des pages du menu | `navigation` | **vides** → pointent vers le rayon du même nom ou vers la section de l'accueil |
| URL de sa page « Édition adulte » / « Édition jeunesse » | `categories[].lien` | **vides** → page de rayon locale |
| URL de sa page « À propos » | `navigation` | **vide** → le lien du menu ramène à l'accueil (le bloc « Qui suis-je ? » a été retiré de l'accueil) |
| Visuels des projets | `couverture` / `image` | vides → visuels d'attente générés |
| Nom des rayons | `categories[].titre` | **« Édition adulte / jeunesse » (son menu) alors que ses livres disent « Littérature générale / jeunesse »** — à trancher avec elle |

**Les textes, eux, sont les siens**, repris mot pour mot :

- l'accroche « Hello, moi c'est Manon ! » et son paragraphe → sa page Accueil
- le bloc « Services » (intro, cinq prestations, phrase de devis) → sa page
  Services ; seule retouche, une majuscule en tête de chaque description
- les descriptions des deux rayons → sa page À propos
- les trois étapes de « Comment ça se passe » → sa page Contact, dans son
  ordre à elle (on écrit, réponse sous 48h, puis appel découverte) ; seuls les
  titres courts des étapes sont ajoutés

Rien n'a été inventé de ce côté-là. En revanche **les deux polices sont une
approximation** (voir plus bas). Ses dessins — les deux livres, son personnage
(au repos, bras tendu, avec l'arrosoir), Minette et les plantes — sont
intégrés ; le coup de pinceau, les griffonnages et les pictos restent des
placeholders.

Son nom complet, **Manon Amen**, est repris de la signature de ses couvertures
(titre de la page, pied de page).

---

## L'étagère

### Ajouter un rayon

Les livres cliquables sont posés au **centre** de la tablette. Il y en a deux
pour l'instant : `Édition adulte` et `Édition jeunesse`. Pour en ajouter un,
copier un bloc de `categories` dans `data/livres.js` et le coller à la suite :

```js
{
  id: "beaux-livres",            // identifiant unique, sans accent ni espace
  titre: "Beaux livres",
  soustitre: "Couvertures",
  lien: "",                      // URL de sa vraie page, ou vide
  couleur: "#0e4e96", encre: "#ffffff",
  hauteur: 344, epaisseur: 82,   // hauteur 280-380, épaisseur 60-110
  couverture: "",
  description: "…",
  oeuvres: [ { titre: "…", meta: "…", image: "" } ],
}
```

L'étagère se recentre toute seule et retire des livres de décor pour faire de la
place. Deux rayons sont toujours séparés d'au moins la largeur d'un livre
ouvert, pour qu'une couverture dépliée ne recouvre jamais le rayon voisin. Même chose quand la fenêtre rétrécit : il y a simplement moins de décor.
Aucune autre modification n'est nécessaire.

Elle s'ajuste aussi à la **hauteur** de l'écran : les livres rapetissent (jusqu'à
60 % de leur taille) pour que la tablette entière soit visible dès l'arrivée sur
la page, sans faire défiler — y compris sur un portable 1280×720.

`lien` vide fait pointer le livre vers une page de rayon locale
(`categorie.html?cat=…`), pratique tant que sa vraie page n'existe pas. Dès
qu'elle existe, coller son URL dans `lien`.

### Ses dessins

Ses dessins d'origine sont dans `assets/images/originaux/`. Le script
[`outils/preparer_images.py`](outils/preparer_images.py) en tire les versions
du site ; **le relancer après toute modification d'un original** :

```bash
python3 outils/preparer_images.py
```

(il demande Pillow, numpy et scipy : `pip install pillow numpy scipy`).

**Les livres.** Ses dessins sont à plat ; ils sont plaqués sur les faces du
livre en 3D — le dos sur la face avant, la couverture sur le panneau qui se
déplie au survol. Un ombrage par-dessus arrondit le dos et creuse la charnière,
pour que le dessin épouse la forme du livre quand il pivote. Les proportions du
livre suivent **exactement** celles de ses images : `epaisseur = hauteur ×
0,238` pour le dos (591×2480 px), et la couverture prend d'elle-même le rapport
de son image. Si elle change le format d'un dessin, ajuster `hauteur` et
`epaisseur` dans `data/livres.js`, sinon il sera déformé.

**Le personnage.** Ses dessins sont des JPG sur fond blanc ; le script les
détoure et en tire **quatre calques**, tous sur la même toile :

- `manon-repos.png` — son dessin où elle salue, tel quel ;
- `manon-corps.png` — son dessin « bras tendu », sans le bras ;
- `manon-bras.png` — ce bras tendu seul, qui **pivote** ;
- `manon-bras-arrosoir.png` — le bras de son dessin à l'arrosoir (recalé sur
  le même corps : elle était décalée sur sa feuille).

Les deux bras pivotent autour d'un point placé *derrière* le livre vert de la
pile qu'elle porte : le bras sort de derrière la pile, et sa racine reste
toujours cachée. Le script prolonge le bras derrière la pile pour qu'aucune
découpe n'apparaisse quand il tourne.

Au repos elle est un peu baissée derrière l'étagère et **salue**. Selon ce que
survole la souris :

- **un rayon** — elle se redresse, marche jusqu'à lui et tend le bras vers le
  coin supérieur de son dos, pendant que le livre s'ouvre ;
- **Minette** — elle se baisse et la caresse ; Minette se tourne vers sa main,
  les yeux mi-clos, et un petit cœur s'envole ;
- **une plante** — elle prend l'arrosoir, l'incline au-dessus et l'arrose ; les
  gouttes tombent du bec. La monstera **reverdit** (voir plus bas).

Le placement est calculé : pour poser la main sur le haut d'un livre, avec `d`
la différence de hauteur entre le pivot du bras et le haut du livre et `L` la
longueur du bras, elle se place à `h = √(L² − d²)` du livre et le bras pivote
de `atan2(d, h)`. Pour arroser, l'arrosoir est incliné de 20° et elle se place
pour que le bec arrive juste au-dessus du feuillage. Réglages dans
`PORTFOLIO.personnage` :

```js
personnage: {
  taille: 0.47,   // sa taille par rapport aux livres
  baisse: 45,     // de combien elle se baisse au repos
}
```

Attention à `taille` : plus elle est grande, plus sa tête dépasse de la réserve
au-dessus des livres. Pour retirer le personnage : `personnage.actif: false`.

### Minette et les plantes

**Minette**, son chat (« Mon chat supervise tout ça de très près »), est couchée
sur une pile de livres à droite des rayons. C'est son dessin « Minette 2 »,
découpé par le script en calques pour être animé :

- la **queue** oscille (plus vite quand on la caresse) ;
- les **yeux** clignent de temps en temps ;
- quand Manon attrape un livre, Minette **tourne la tête** vers elle et ses
  **pupilles se dilatent** en la suivant ;
- quand Manon la caresse, elle **ferme les yeux**, tend la tête vers sa main,
  et un petit cœur s'envole.

Les pupilles et les yeux fermés sont redessinés en SVG par-dessus son dessin
(les pupilles sont ajustées exactement sur les siennes). Sous la tête, le
script rebouche le corps (pelage, plastron blanc) pour qu'elle puisse
s'incliner sans laisser de trou.

**Les plantes.** La monstera existe en deux couleurs, même dessin trait pour
trait : **automne au repos, et elle reverdit quand Manon l'arrose** — puis
reprend lentement ses couleurs d'automne une fois Manon partie. Le pot bleu
(celui de l'automne, son bleu) est gardé sur les deux versions. La succulente,
à gauche des rayons, s'arrose aussi. La monstera est plus grande (205 unités, un livre en
fait 360) et **déborde sur les livres voisins** : son dessin est plus large que
la place qu'elle prend sur l'étagère (`debord` dans `ornements.js`), et ses
feuilles passent devant les livres. Comme elle est trop haute en son centre
pour que Manon verse par-dessus sans sortir de l'étagère, Manon vise le point
du feuillage le plus proche du milieu qui reste à sa portée (le script exporte
le profil du feuillage).

### Les autres ornements

- **un coup de pinceau bleu** sous le titre, qui rappelle le cadre de son logo ;
- **des griffonnages de carnet** dans les marges de l'accroche (masqués sur
  petit écran, faute de marge) ;
- **des pictogrammes** pour les trois étapes de « Comment ça se passe ».

Ceux-là sont des SVG dans son style (placeholders), dans
[`assets/js/ornements.js`](assets/js/ornements.js).

Minette se pose à trois livres des rayons, la succulente au milieu des livres de
gauche, la monstera au milieu de ceux de droite. Sur un petit écran, la
monstera part la première, puis Minette. Réglages dans `PORTFOLIO.ornements` :

```js
ornements: {
  chat: true,          // Minette
  plante: true,        // la monstera
  succulente: true,
  pinceau: true,
  griffonnages: false, // false = retiré
}
```

---

## Le système graphique

Repris des captures de son site, regroupé dans le `:root` de
[`assets/css/style.css`](assets/css/style.css) :

```css
--bleu:       #1268c4;   /* logo, sous-titres, liens */
--noir:       #111318;   /* texte */
--gris:       #8a8a8a;   /* texte secondaire */
--gris-clair: #e6e8ec;   /* filets */
--fond-doux:  #f7f9fb;   /* bandeaux */
--serif: "Playfair Display", …   /* titres */
--sans:  "Jost", …               /* texte courant */
```

**Un écart volontaire** : son site utilise `#8a8a8a` pour le texte secondaire,
qui n'atteint que 3,45:1 de contraste sur blanc (le minimum d'accessibilité
WCAG AA est 4,5:1). Il est assombri à `#707070` (5:1) — la différence se voit à
peine. Pour revenir à l'original, une ligne dans `:root`.

**Les deux polices sont une approximation** lue sur les captures d'écran. Si
elle connaît les vraies (son éditeur de site les affiche dans les réglages de
typographie), il suffit de changer ces deux lignes et l'URL Google Fonts en
tête des deux fichiers HTML.

Le bleu, lui, a été prélevé sur le logo et sur ses sous-titres « Qui suis-je ? ».

---

## Mettre ses vraies images

1. Déposer les fichiers dans `assets/images/`.
2. Renseigner le chemin dans `data/livres.js` :

```js
{ id: "imaginaire", …, couverture: "assets/images/couv-imaginaire.jpg",
  oeuvres: [
    { titre: "Le Nom du livre", meta: "Couverture — 2025",
      image: "assets/images/nom-du-livre.jpg" },
  ]
}
```

Tant qu'un champ est vide, un visuel d'attente est généré dans le bleu du
rayon. Rien ne casse si les images manquent — elles peuvent arriver une par une.

Formats conseillés : **JPG ou WebP, 1600 px de large max, < 300 Ko**.
Les couvertures rendent mieux en portrait (ratio ~2:3).

---

## Voir le site en local

Double-cliquer sur `index.html` suffit. Pour un rendu identique à la mise en
ligne :

```bash
python3 -m http.server 4321
```

puis ouvrir http://localhost:4321.

---

## Mettre en ligne (GitHub Pages, gratuit)

```bash
git add -A && git commit -m "Page d'accueil" && git push -u origin main
```

Puis sur GitHub : **Settings → Pages → Source : `Deploy from a branch` →
Branch : `main` / `root` → Save**. Publié quelques minutes plus tard sur
`https://kurtgilmant.github.io/frontpageformyfallenangel/`.

---

## Comment c'est fait

```
index.html          accueil : accroche, étagère, qui suis-je, méthode, contact
categorie.html      gabarit unique des rayons (lit ?cat=… dans l'URL)
data/livres.js      LE contenu : identité, menu, sections, rayons, méthode
assets/css/style.css
assets/js/
  commun.js         en-tête, pied de page, bouton retour en haut
  accueil.js        remplit les sections de l'accueil
  etagere.js        construit et centre l'étagère, l'ajuste à la fenêtre
  personnage.js     Manon : placement, marche, ses trois gestes
  dessins-geometrie.js   généré par outils/preparer_images.py
  ornements.js      Minette, les plantes, le pinceau, les griffonnages, les pictos
  categorie.js      remplit la page rayon
  placeholder.js    visuels d'attente générés en SVG
assets/images/      les images du site (générées)
assets/images/originaux/  ses dessins d'origine
outils/preparer_images.py prépare les images depuis les originaux
```

### Le livre qui s'ouvre

Chaque livre est un élément en 3D CSS : le **dos** est dans le plan de l'écran,
la **couverture** est un panneau posé à angle droit (`rotateY(90deg)`, donc
invisible au repos). Au survol, le livre pivote de -46°, ce qui ramène la
couverture vers le lecteur.

Deux pièges rencontrés pendant le développement, à ne pas réintroduire :

- **La `perspective` est portée par chaque livre, pas par la rangée.** Sur une
  rangée de ~2 000 px de large, le point de fuite serait en son centre : les
  livres des extrémités sont alors vus sous un angle rasant et leur couverture
  se projette à une largeur nulle.
- **L'entrée en scène utilise une `transition`, pas une `@keyframes`.** Une
  animation CSS active sur `opacity` garde l'élément composité à plat et
  neutralise `transform-style: preserve-3d` : la couverture ne se déplie plus.

### Accessibilité

Le personnage réagit aussi au focus clavier : tabuler d'un livre à l'autre le
fait se déplacer et attraper, exactement comme à la souris.


Les livres cliquables sont de vrais liens : navigation au clavier (`Tab`), le
livre ciblé est ramené dans le champ de vision et s'ouvre au focus. `prefers-reduced-motion` coupe les animations. Sur écran tactile (pas de
survol), les livres restent droits — une couverture dépliée y serait masquée par
ses voisines — et le tap ouvre directement le rayon.
