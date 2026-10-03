"""Prépare les dessins de Manon pour le site, à partir de assets/images/originaux/.

  - les dos et couvertures des deux livres : redimensionnés et compressés
  - Manon : quatre calques détourés (fond blanc -> transparent) — au repos
    (elle salue), et bras tendu : le corps, le bras seul, le bras qui tient
    l'arrosoir. Les deux bras pivotent autour d'un point caché derrière la
    pile de livres qu'elle porte.
  - Minette (« Minette 2 ») : découpée en calques pour être animée
  - les plantes : la monstera (automne, et verte pour quand on l'arrose) et
    la succulente

Écrit aussi assets/js/dessins-geometrie.js (repères et tailles).

Relancer après toute modification des originaux :
    python3 outils/preparer_images.py
(nécessite Pillow, numpy et scipy)
"""
import json, pathlib, unicodedata
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

RACINE = pathlib.Path(__file__).resolve().parent.parent
ORIG = RACINE / "assets/images/originaux"
SORTIE = RACINE / "assets/images"

# ---------------------------------------------------------------- livres
LIVRES = {
    "dos-litterature-generale.jpg":  ("Tranche Littérature générale.JPG", 864),
    "dos-litterature-jeunesse.jpg":  ("Tranche Littérature jeunesse.JPG", 864),
    "couv-litterature-generale.jpg": ("Face littérature générale.JPG",    866),
    "couv-litterature-jeunesse.jpg": ("Face Littérature jeunesse.JPG",    866),
}

def preparer_livres():
    for cible, (source, hauteur) in LIVRES.items():
        im = Image.open(ORIG / source).convert("RGB")
        largeur = round(im.width * hauteur / im.height)
        im.resize((largeur, hauteur), Image.LANCZOS).save(
            SORTIE / cible, quality=86, optimize=True, progressive=True)
        print(f"{cible:32s} {largeur}x{hauteur}  (ratio {im.width / im.height:.4f})")

# ------------------------------------------------------------- outils
def original(nom):
    """Les noms de fichiers accentués sont stockés décomposés par macOS."""
    cible = unicodedata.normalize("NFC", nom)
    for f in ORIG.iterdir():
        if unicodedata.normalize("NFC", f.name) == cible:
            return f
    raise FileNotFoundError(nom)

def charger(nom, decalage=(0, 0)):
    """L'original sur une toile blanche, éventuellement décalé (px)."""
    im = Image.open(original(nom)).convert("RGB")
    if decalage != (0, 0):
        toile = Image.new("RGB", im.size, "white")
        toile.paste(im, decalage)
        im = toile
    return np.asarray(im)

def detourer(src, tout_le_blanc=False):
    """Fond blanc relié aux bords -> transparent ; liseré anti-crénelé
    converti en noir semi-transparent (tout est cerné de noir). Les
    poussières isolées (quelques pixels égarés sur le scan) sont retirées.
    `tout_le_blanc` : aussi le blanc enfermé par le trait (entre les tiges
    des plantes) — pas pour Minette, dont le plastron est blanc, ni pour
    Manon, dont les pages des livres le sont.
    Renvoie (rgb, alpha) en flottants."""
    a = src.astype(np.int16)
    mn, mx = a.min(-1), a.max(-1)
    blanc = (mn > 232) & (mx - mn < 20)
    etiq, _ = ndi.label(blanc)
    bords = np.unique(np.concatenate([etiq[0], etiq[-1], etiq[:, 0], etiq[:, -1]]))
    fond = np.isin(etiq, bords[bords > 0])
    if tout_le_blanc:
        fond |= ndi.binary_opening(blanc, iterations=2)

    dessin, n = ndi.label(~fond)
    tailles = ndi.sum(~fond, dessin, range(1, n + 1))
    poussieres = np.isin(dessin, 1 + np.nonzero(tailles < tailles.max() * 0.002)[0])
    fond |= poussieres

    a = a.astype(np.float32)
    alpha = np.where(fond, 0.0, 1.0)
    lisere = ndi.binary_dilation(fond, iterations=3) & ~fond
    alpha[lisere] = np.clip((255 - a.min(-1)[lisere]) / 255, 0, 1)
    rgb = a.copy()
    al = np.maximum(alpha[..., None], 1e-3)
    rgb[lisere] = np.clip((a[lisere] - 255 * (1 - alpha[lisere, None])) / al[lisere], 0, 255)
    return rgb, alpha

def rgba(rgb, alpha):
    return Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")

def boite_de(*alphas, marge=12):
    union = np.any([al > 0 for al in alphas], axis=0)
    ys, xs = np.nonzero(union)
    return (int(xs.min()) - marge, int(ys.min()) - marge,
            int(xs.max()) + marge, int(ys.max()) + marge)

def exporter(im, nom, boite, k):
    taille = (round((boite[2] - boite[0]) * k), round((boite[3] - boite[1]) * k))
    im = im.crop(boite).resize(taille, Image.LANCZOS)
    im.save(SORTIE / nom, optimize=True)
    return taille

# ------------------------------------------------------------ personnage
# Ses deux dessins « bras tendu » sont le même corps que celui « au repos »
# (elle salue) : seul le bras change. Celui à l'arrosoir est décalé sur sa
# feuille ; DECALAGE_ARROSOIR le recale (mesuré par corrélation sur la tête).
DECALAGE_ARROSOIR = (532, 5)
# Pivot des deux bras : derrière le livre vert de la pile qu'elle porte. Le
# bras sort de derrière la pile ; en pivotant là, la racine reste cachée.
PIVOT = (1400, 1080)
REDUCTION = 0.5          # l'original fait 2480 px de haut : largement de quoi

def bord_du_corps(yy):
    """Bord droit de son corps là où le bras en sort (px de l'original) :
    le bas de la manche, le bout du livre vert, le bord du livre rouge."""
    return np.where(yy < 1036, 1431, np.where(yy < 1103, 1441, 1422))

def separer_bras(rgb, alpha, bas):
    """Le bras (et ce qu'il tient) = ce qui dépasse à droite du corps, sous la
    manche. Plus les bouts de peau du bras coincés entre les livres de la pile
    et ce bord, sinon ils resteraient collés au corps quand le bras bouge."""
    h, w = alpha.shape
    yy, xx = np.mgrid[0:h, 0:w]
    # (sous la manche seulement près de l'épaule : plus loin, la main et
    #  l'arrosoir remontent plus haut)
    bras = (alpha > 0) & (xx > bord_du_corps(yy)) & ((yy > 1028) | (xx > 1500)) & (yy > 900) & (yy < bas)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    peau = (r > 215) & (g > 185) & (g < 238) & (b > 150) & (b < 218) & (r - b > 25)
    pres = (xx > 1412) & (yy > 1038) & (yy < 1140)
    etiq, _ = ndi.label(peau & (pres | bras))
    du_bras = np.unique(etiq[bras & peau])
    bras |= np.isin(etiq, du_bras[du_bras > 0]) & pres
    # le haut du trait du bras, jusqu'au coin de la manche
    bras |= (alpha > 0) & (rgb.max(-1) < 110) & (xx > 1428) & (yy >= 1028) & (yy <= 1042)
    return bras

def prolonger(rgb, alpha, x0=1335, xref=1452):
    """Recopie la section du bras vers la gauche, derrière la pile : quand
    le bras pivote, sa racine découpée ne doit jamais apparaître."""
    rgb, alpha = rgb.copy(), alpha.copy()
    for x in range(x0, xref):
        vide = alpha[:, x] == 0
        alpha[vide, x] = alpha[vide, xref]
        rgb[vide, x] = rgb[vide, xref]
    return rgb, alpha

def preparer_personnage():
    rgb_r, al_r = detourer(charger("Personnage.JPG"))
    rgb_t, al_t = detourer(charger("manon bras tendu.JPG"))
    rgb_a, al_a = detourer(charger("manon bras tendu arrosoir.JPG", DECALAGE_ARROSOIR))

    bras_t = separer_bras(rgb_t, al_t, 1250)
    bras_a = separer_bras(rgb_a, al_a, 1700)
    corps = (rgb_t, al_t * ~bras_t)
    bras = prolonger(rgb_t, al_t * bras_t)
    bras_arrosoir = prolonger(rgb_a, al_a * bras_a)

    boite = boite_de(al_r, al_t, al_a)
    k = REDUCTION
    taille = exporter(rgba(rgb_r, al_r), "manon-repos.png", boite, k)
    exporter(rgba(*corps), "manon-corps.png", boite, k)
    exporter(rgba(*bras), "manon-bras.png", boite, k)
    exporter(rgba(*bras_arrosoir), "manon-bras-arrosoir.png", boite, k)

    en_export = lambda x, y: [round((x - boite[0]) * k, 1), round((y - boite[1]) * k, 1)]
    # la main : le creux de la paume, à la naissance des doigts
    h, w = al_t.shape
    yy, xx = np.mgrid[0:h, 0:w]
    paume = bras_t & (xx > 1760) & (xx < 1800)
    main = (float(xx[paume].mean()), float(yy[paume].mean()))
    # le bec de l'arrosoir : le bout de la pomme (le noir le plus à droite)
    noir = bras_a & (rgb_a.max(-1) < 90)
    xmax = xx[noir].max()
    pomme = noir & (xx > xmax - 50)
    bec = (float(xx[pomme].mean()), float(yy[pomme].mean()))
    # largeur occupée par le corps (sans le bras) : pour la garder à l'écran
    xs = np.nonzero((al_r > 0).any(0))[0]
    return {
        "largeur": taille[0], "hauteur": taille[1],
        "pivot": en_export(*PIVOT), "main": en_export(*main), "bec": en_export(*bec),
        "corps": [en_export(xs.min(), 0)[0], en_export(xs.max(), 0)[0]],
    }

# ------------------------------------------------------------- Minette
# « Minette 2 » : son dessin de face, en aplats, sur fond transparent. Il est
# découpé en calques pour être animé comme le chat provisoire l'était :
#   queue    oscille (derrière le corps, sa base prolongée sous lui)
#   corps    immobile ; le trou laissé par la tête est rebouché (pelage,
#            plastron blanc sous le menton) pour qu'elle puisse s'incliner
#   tete     s'incline vers Manon ; les moustaches suivent
#   yeux     les iris seuls, sans pupilles : ils clignent (écrasés en hauteur)
# Les pupilles sont redessinées en SVG (ellipses ajustées sur les siennes)
# pour pouvoir se dilater et regarder de côté ; les yeux fermés aussi.
MINETTE = "Minette 2.png"
LARGEUR_CHAT = 145       # unités (un livre fait 360 de haut) — 190 : trop grande
PX_PAR_UNITE = 2.4       # résolution des images : nette sur écran Retina
O_CHAT = (1080, 1538)    # les repères ci-dessous sont relevés depuis ce coin
TETE = [(100, 0), (760, 0), (760, 430), (708, 432), (650, 462), (610, 475),
        (565, 494), (512, 526), (452, 553), (398, 553), (338, 526), (290, 490),
        (245, 474), (200, 460), (138, 436), (100, 430)]   # au ras de ses joues
PIVOT_TETE = (425, 545)  # sous le menton
QUEUE_X = 812            # la queue : tout ce qui est à droite du flanc
PIVOT_QUEUE = (812, 632)

def preparer_chat():
    src = np.asarray(Image.open(original(MINETTE)).convert("RGBA")).astype(np.float32)
    rgb, alpha = src[..., :3].copy(), src[..., 3] / 255
    h, w = alpha.shape
    yy, xx = np.mgrid[0:h, 0:w]
    loc = lambda pts: [(x + O_CHAT[0], y + O_CHAT[1]) for x, y in pts]
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    PELAGE = np.median(rgb[(alpha > .9) & (rgb.max(-1) > 30) & (rgb.max(-1) < 60)], axis=0)
    BLANC = np.array([255.0, 255.0, 255.0])

    # --- la tête, et les moustaches qui débordent sur le corps
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).polygon(loc(TETE), fill=255)
    tete = (np.asarray(m) > 0) & (alpha > 0)
    clair = (alpha > .5) & (rgb.min(-1) > 150)
    bande = (yy > O_CHAT[1] + 380) & (yy < O_CHAT[1] + 540)
    # les moustaches : les traits clairs FINS (le plastron, épais, s'en va à
    # l'ouverture morphologique)
    fins = clair & ~ndi.binary_opening(clair, iterations=4)
    moustaches = ndi.binary_dilation(fins & bande & ~tete, iterations=2) & (alpha > 0) & ~tete
    tete |= moustaches

    # --- la queue
    queue = (alpha > 0) & (xx > O_CHAT[0] + QUEUE_X) & (yy < O_CHAT[1] + 720)

    # --- les yeux : les deux iris verts (et leur contour)
    vert = (alpha > .8) & (g > r + 25) & (g > b + 10)
    etiq, n = ndi.label(vert)
    tailles = ndi.sum(vert, etiq, range(1, n + 1))
    yeux, pupilles = np.zeros_like(vert), []
    for i in np.argsort(-tailles)[:2]:
        ys, xs = np.nonzero(etiq == i + 1)
        cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
        rayon = (xs.max() - xs.min()) / 2
        disque = (xx - cx) ** 2 + (yy - cy) ** 2 <= (rayon + 7) ** 2
        yeux |= disque
        dedans = ((xx - cx) ** 2 + (yy - cy) ** 2 <= (rayon - 3) ** 2) & (rgb.max(-1) < 90)
        py, px = np.nonzero(dedans)
        pupilles.append({"cx": float(px.mean()), "cy": float(py.mean()),
                         "rx": float((px.max() - px.min() + 1) / 2), "ry": float((py.max() - py.min() + 1) / 2),
                         "oeil": [float(cx), float(cy), float(rayon)]})
        # l'iris sans pupille : on la repeint en vert
        rgb[dedans] = np.median(rgb[etiq == i + 1], axis=0)
    pupilles.sort(key=lambda p: p["cx"])

    def calque(masque, rgb_=rgb):
        return rgba(rgb_, alpha * masque)

    # corps : tout sauf tête et queue ; le trou de la tête rebouché
    rgb_corps, alpha_corps = src[..., :3].copy(), alpha * ~(tete | queue)
    # Toute la moitié basse de sa tête est rebouchée de pelage noir : quand
    # elle s'incline, le bas de ses joues (sous les moustaches) découvre
    # ce qui est derrière — sans ça, un trou blanc. Le plastron blanc ne
    # remonte que juste sous le menton.
    cx_, cy_ = xx - O_CHAT[0], yy - O_CHAT[1]
    trou = tete & (cy_ > 380)
    rgb_corps[trou] = PELAGE
    rgb_corps[trou & (cx_ > 320) & (cx_ < 530) & (cy_ > 510)] = BLANC
    alpha_corps = np.where(trou, 1.0, alpha_corps)
    # tête : les yeux remplacés par le pelage (les iris sont un calque à part)
    rgb_tete = src[..., :3].copy()
    rgb_tete[yeux] = PELAGE
    # queue : prolongée sous le corps, vers la gauche
    rgb_q, al_q = src[..., :3].copy(), alpha * queue
    xref = O_CHAT[0] + QUEUE_X + 8
    for x in range(xref - 70, xref):
        vide = al_q[:, x] == 0
        al_q[vide, x] = al_q[vide, xref]
        rgb_q[vide, x] = rgb_q[vide, xref]

    ys, xs = np.nonzero(alpha > 0)
    sol = int(ys.max())
    marge = 60                                # place pour que la tête s'incline
    boite = (int(xs.min()) - marge, int(ys.min()) - marge, int(xs.max()) + marge, sol + 4)
    unites = LARGEUR_CHAT / (xs.max() - xs.min())
    k = unites * PX_PAR_UNITE
    exporter(rgba(rgb_q, al_q), "chat-queue.png", boite, k)
    exporter(rgba(rgb_corps, alpha_corps), "chat-corps.png", boite, k)
    exporter(rgba(rgb_tete, np.where(yeux & tete, 1.0, alpha * tete)), "chat-tete.png", boite, k)
    exporter(rgba(rgb, alpha * yeux), "chat-yeux.png", boite, k)

    u = lambda x, y: [round((x - boite[0]) * unites, 2), round((y - boite[1]) * unites, 2)]
    crane_x = O_CHAT[0] + PIVOT_TETE[0]
    crane_y = int(np.nonzero(alpha[:, crane_x] > 0)[0].min())
    return {
        "largeur": round((boite[2] - boite[0]) * unites, 2),
        "hauteur": round((boite[3] - boite[1]) * unites, 2),
        "pivotTete": u(O_CHAT[0] + PIVOT_TETE[0], O_CHAT[1] + PIVOT_TETE[1]),
        "pivotQueue": u(O_CHAT[0] + PIVOT_QUEUE[0], O_CHAT[1] + PIVOT_QUEUE[1]),
        "crane": u(crane_x, crane_y),
        "pupilles": [{"c": u(p["cx"], p["cy"]), "r": [round(p["rx"] * unites, 2), round(p["ry"] * unites, 2)],
                      "oeil": u(p["oeil"][0], p["oeil"][1]) + [round(p["oeil"][2] * unites, 2)]}
                     for p in pupilles],
    }

# ------------------------------------------------------------- plantes
# Hauteur au-dessus du plateau, en unités. Elles restent basses : Manon doit
# pouvoir verser l'arrosoir par-dessus sans sortir de la réserve de l'étagère.
PLANTES = {
    # la monstera est plus grande : ses feuilles débordent sur les livres
    # voisins, et Manon arrose là où le feuillage est plus bas (voir `profil`)
    "monstera":   {"hauteur": 205},
    "succulente": {"hauteur": 150, "fichier": "plante aloe verra.JPG"},
}

def pot_et_bas(alpha, pot):
    """Le bas du pot = le niveau du plateau. Ce qui pend plus bas (une
    feuille de la monstera) passe devant la tranche de la tablette."""
    ys, xs = np.nonzero(alpha > 0)
    sol = int(np.nonzero(pot.any(1))[0].max()) if pot is not None else int(ys.max())
    return sol, (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))

def exporter_plante(nom, calques, pot):
    """calques : {fichier de sortie: (rgb, alpha)}, même toile."""
    ref = next(iter(calques.values()))[1]
    sol, (x0, y0, x1, y1) = pot_et_bas(ref, pot)
    unites = PLANTES[nom]["hauteur"] / (sol - y0)
    m = 6
    boite = (x0 - m, y0 - m, x1 + m, y1 + m)
    for sortie, (rgb, al) in calques.items():
        exporter(rgba(rgb, al), sortie, boite, unites * PX_PAR_UNITE)
    # profil du feuillage : hauteur du haut de la plante au-dessus du plateau,
    # pour 21 positions de gauche à droite (Manon y vise avec l'arrosoir)
    profil = []
    for i in range(21):
        x = int(boite[0] + (boite[2] - boite[0]) * i / 20)
        col = np.nonzero(ref[:, max(x - 6, 0):x + 7].max(1) > 0)[0]
        profil.append(round((sol - col.min()) * unites, 1) if len(col) else 0)
    return {
        "largeur": round((boite[2] - boite[0]) * unites, 1),
        "hauteur": round((boite[3] - boite[1]) * unites, 1),
        "pend": round((boite[3] - sol) * unites, 1),
        "profil": profil,
    }

def preparer_plantes():
    # La monstera existe en deux couleurs, même dessin trait pour trait :
    # l'automne au repos, et le vert qui revient quand Manon l'arrose. On
    # garde le pot bleu (celui de l'automne, son bleu à elle) sur les deux.
    rgb_v, al_v = detourer(charger("plante couleur verte.JPG"), True)
    rgb_a, al_a = detourer(charger("plante couleurs automne.JPG"), True)
    r, g, b = rgb_v[..., 0], rgb_v[..., 1], rgb_v[..., 2]
    pot_violet = ndi.binary_dilation((r > 130) & (b > 120) & (g < 120), iterations=2)
    rgb_v[pot_violet] = rgb_a[pot_violet]
    al_v = np.where(pot_violet, al_a, al_v)
    ra, ga, ba = rgb_a[..., 0], rgb_a[..., 1], rgb_a[..., 2]
    pot_bleu = (al_a > 0) & (ba > ra + 40) & (ba > 140)
    geo = {"monstera": exporter_plante("monstera", {
        "plante-monstera.png": (rgb_a, al_a),
        "plante-monstera-verte.png": (rgb_v, al_v)}, pot_bleu)}
    rgb_s, al_s = detourer(charger(PLANTES["succulente"]["fichier"]), True)
    geo["succulente"] = exporter_plante("succulente",
        {"plante-succulente.png": (rgb_s, al_s)}, None)
    return geo

# ---------------------------------------------------------------- logo
def preparer_logo():
    """Son logo (portrait sur coup de pinceau bleu) : une version pour
    l'en-tête (affiché ~72 px de haut, exporté au triple pour les écrans
    Retina) et l'icône d'onglet du navigateur."""
    im = Image.open(original("logo manon.png")).convert("RGBA")
    im = im.crop(im.getbbox())
    for nom, hauteur in (("logo.png", 216), ("favicon.png", 64)):
        largeur = round(im.width * hauteur / im.height)
        im.resize((largeur, hauteur), Image.LANCZOS).save(SORTIE / nom, optimize=True)

if __name__ == "__main__":
    preparer_livres()
    preparer_logo()
    geo = {"personnage": preparer_personnage(), "chat": preparer_chat(),
           "plantes": preparer_plantes()}
    print(json.dumps(geo, indent=1))
    # un .js plutôt qu'un .json : fetch() ne marche pas quand on ouvre
    # index.html par double-clic
    (RACINE / "assets/js/dessins-geometrie.js").write_text(
        "/* Généré par outils/preparer_images.py — ne pas modifier à la main.\n"
        "   personnage : px des images exportées (manon-*.png).\n"
        "   chat, plantes : unités de l'étagère (un livre fait 360 de haut). */\n"
        "const DESSINS_GEOMETRIE = " + json.dumps(geo, indent=1) + ";\n")
    print("-> assets/js/dessins-geometrie.js")
