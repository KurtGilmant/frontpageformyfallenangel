/* Page catégorie : lit ?cat=… dans l'URL et affiche la galerie
   correspondante à partir de data/livres.js. */

(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get("cat");
  const liste = PORTFOLIO.categories;
  const index = liste.findIndex((c) => c.id === id);
  const cat = index >= 0 ? liste[index] : liste[0];

  document.title = cat.titre + " — " + PORTFOLIO.artiste.nom;


  document.querySelector(".cat-entete .fil").textContent = cat.soustitre;
  document.querySelector(".cat-entete h1").textContent = cat.titre;
  document.querySelector(".cat-entete .chapeau").textContent = cat.description;

  // sa couverture du rayon, en tête de page
  if (cat.couverture) {
    const couv = document.createElement("img");
    couv.className = "cat-couv";
    couv.src = cat.couverture;
    couv.alt = "Couverture du rayon " + cat.titre;
    document.querySelector(".cat-entete .fil").before(couv);
  }
  
  /* --- Galerie --- */
  const galerie = document.querySelector(".galerie");
  cat.oeuvres.forEach(function (o, i) {
    const src = o.image || placeholderSVG(cat.id + "-" + i + "-" + o.titre, cat.couleur, 800, 1000);
    const fig = document.createElement("figure");
    fig.className = "oeuvre";
    fig.innerHTML =
      '<div class="cadre"><img loading="lazy" alt="" src="' + src + '"></div>' +
      "<h2></h2><p></p>";
    fig.querySelector("img").alt = o.titre + " — " + cat.titre;
    fig.querySelector("h2").textContent = o.titre;
    fig.querySelector("p").textContent = o.meta;
    galerie.appendChild(fig);
  });

  /* --- Les autres rayons ---
     À deux rayons, « précédent » et « suivant » mèneraient au même
     endroit : on n'affiche alors qu'un seul lien. */
  const zone = document.querySelector(".voisines");
  const lien = (c) => "categorie.html?cat=" + c.id;

  if (liste.length < 2) {
    zone.remove();
  } else if (liste.length === 2) {
    const autre = liste[(index + 1) % 2];
    zone.classList.add("seule");
    zone.innerHTML =
      '<a href="' + lien(autre) + '"><span class="etiq">L\'autre rayon</span>' +
      '<span class="nom-cat"></span></a>';
    zone.querySelector(".nom-cat").textContent = autre.titre;
  } else {
    const prec = liste[(index - 1 + liste.length) % liste.length];
    const suiv = liste[(index + 1) % liste.length];
    zone.innerHTML =
      '<a href="' + lien(prec) + '"><span class="etiq">Précédent</span><span class="nom-cat"></span></a>' +
      '<a href="' + lien(suiv) + '" style="text-align:right"><span class="etiq">Suivant</span><span class="nom-cat"></span></a>';
    zone.querySelectorAll(".nom-cat")[0].textContent = prec.titre;
    zone.querySelectorAll(".nom-cat")[1].textContent = suiv.titre;
  }

})();
