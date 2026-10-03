/* Génère une image d'attente (SVG) tant qu'aucune vraie illustration
   n'est fournie. Déterministe : le même titre donne toujours le même
   motif, donc la page ne "bouge" pas d'un rechargement à l'autre.
   Dès que vous renseignez `image:` dans data/livres.js, ce code n'est
   plus utilisé pour cette œuvre. */

function grainePRNG(texte) {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function eclaircir(hex, ratio) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, v = (n >> 8) & 255, b = n & 255;
  const m = (c) => Math.round(c + (255 - c) * ratio);
  return `rgb(${m(r)},${m(v)},${m(b)})`;
}

function placeholderSVG(graine, couleur, larg, haut) {
  const rnd = grainePRNG(graine);
  const fond = eclaircir(couleur, 0.80);
  let formes = "";

  // quelques masses organiques superposées
  for (let i = 0; i < 5; i++) {
    const cx = rnd() * larg;
    const cy = rnd() * haut;
    const rx = (0.18 + rnd() * 0.3) * larg;
    const ry = (0.18 + rnd() * 0.3) * haut;
    const op = (0.24 + rnd() * 0.4).toFixed(2);
    const rot = Math.round(rnd() * 180);
    formes += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${couleur}" opacity="${op}" transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
  }
  // un horizon + un disque, pour évoquer une composition
  const horizon = (0.55 + rnd() * 0.25) * haut;
  formes += `<path d="M0 ${horizon.toFixed(1)} Q ${(larg * 0.5).toFixed(1)} ${(horizon - 30 + rnd() * 60).toFixed(1)} ${larg} ${horizon.toFixed(1)} L ${larg} ${haut} L 0 ${haut} Z" fill="${couleur}" opacity="0.55"/>`;
  formes += `<circle cx="${(larg * (0.25 + rnd() * 0.5)).toFixed(1)}" cy="${(horizon * 0.45).toFixed(1)}" r="${(larg * 0.09).toFixed(1)}" fill="${couleur}" opacity="0.7"/>`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${larg} ${haut}" width="${larg}" height="${haut}">` +
    `<rect width="${larg}" height="${haut}" fill="${fond}"/>${formes}</svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
