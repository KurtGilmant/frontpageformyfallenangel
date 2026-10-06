"""Vérifie que tous les liens de data/livres.js vers son site Adobe Portfolio
répondent. À lancer quand elle renomme ou supprime une page sur Adobe
Portfolio : une page renommée change d'adresse, et l'ancien lien mène alors à
une erreur 404 (Adobe Portfolio la remplace par sa page d'arrivée).

    python3 outils/verifier_liens.py
"""
import pathlib, re, sys, urllib.request, urllib.error

RACINE = pathlib.Path(__file__).resolve().parent.parent
DOMAINE = "https://inkanostudio.com"   # adresse actuelle de son site Portfolio

texte = (RACINE / "data/livres.js").read_text()
chemins = sorted(set(re.findall(r'SITE \+ "(/[^"]*)"', texte)))
liens = [DOMAINE + c for c in chemins]
liens += sorted(set(re.findall(r'"(https://www\.(?:linkedin|instagram|tiktok)\.com/[^"]+)"', texte)))

erreurs = 0
for url in liens:
    req = urllib.request.Request(url, method="GET", headers={"User-Agent": "Mozilla/5.0"})
    try:
        code = urllib.request.urlopen(req, timeout=15).status
    except urllib.error.HTTPError as e:
        code = e.code
    except Exception as e:          # réseau, délai…
        code = type(e).__name__
    ok = code == 200 or (code in (429, 999) and "inkanostudio" not in url)  # réseaux sociaux : anti-robots
    erreurs += not ok
    print(("ok   " if ok else "ÉCHEC"), code, url)

print("\nTous les liens répondent." if not erreurs else f"\n{erreurs} lien(s) à corriger dans data/livres.js.")
sys.exit(1 if erreurs else 0)
