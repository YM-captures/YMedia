# YM Media — Refonte du site

Site statique (HTML/CSS/JS natif) prêt pour GitHub Pages. Aucune compilation nécessaire :
ouvrez `index.html` via un serveur local ou publiez le dossier tel quel.

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

(Ouvrir `index.html` directement en double-clic fonctionne aussi, mais un serveur local
évite les restrictions CORS de certains navigateurs.)

## Publier sur GitHub Pages

1. Poussez tout le contenu de ce dossier à la racine du repo (ou dans `/docs`).
2. Activez GitHub Pages sur la branche correspondante.
3. Tous les chemins sont relatifs : aucun réglage supplémentaire n'est nécessaire.

## Arborescence

```
/
├── index.html              Page unique, toutes les sections
├── css/
│   └── style.css           Design tokens + styles de toutes les sections
├── js/
│   └── main.js             Préloader, curseur, nav, Lenis + GSAP ScrollTrigger, formulaires
└── assets/
    ├── logos/               principal / secondaire / subark — variantes noir & blanc
    ├── icons/                24 icônes extraites individuellement de la planche fournie
    │   └── white/            variantes blanches des icônes noires (usage sur fond sombre)
    ├── images/               (libre — réservé à de futurs ajouts éditoriaux)
    ├── merch/                4 visuels merchandising (fournis, recompressés en .jpg)
    └── popup/                visuel du futur pop-up store
```

## Icônes

Extraites automatiquement depuis `Icones.png` (grille 6×4), recadrées individuellement sans
résidu des icônes voisines. Les icônes à traits noirs disposent d'une variante blanche dans
`assets/icons/white/` pour rester visibles sur fond `#111111` :
`fuji-mountain`, `tokyo-tower`, `torii-gate`, `mountain-road`, `map-pin`, `notepad`,
`bridge-stamp`, `coastal-road-stamp`.
Les icônes déjà colorées (rouge / bleu / vert) sont utilisées telles quelles, leur contraste
sur fond sombre étant déjà suffisant.

## Logos

`principal`, `secondaire` et `subark` sont fournis en version noire d'origine et en version
blanche générée par seuillage alpha (aucune déformation, ratio conservé). Le header et le
footer utilisent la version blanche sur fond `#111111`.

## Images éditoriales

Les photographies de reportage (paddock du Mans, portrait de céramiste, Mont Fuji, course de
nuit) proviennent du site YM existant (Unsplash) et ont été conservées à l'identique, comme
autorisé, faute d'équivalent fourni dans les fichiers transmis. Toutes les autres images
(merch, pop-up store, logos, icônes) sont les fichiers fournis.

## Contenu éditorial

Les textes (manifeste, titres de reportages, légendes d'archives, citation) sont repris et
adaptés du site existant : https://ym-captures.github.io/YMedia/. Aucune information factuelle
non communiquée (prix, dates, adresses) n'a été inventée.

## Stack technique

- HTML5 sémantique, CSS3 natif (custom properties), JavaScript natif (IIFE, sans bundler).
- GSAP + ScrollTrigger + Lenis chargés via CDN (cdnjs) pour les animations et le scroll fluide.
- Curseur personnalisé désactivé automatiquement sur tactile et si `prefers-reduced-motion`
  est actif ; toutes les animations GSAP sont alors neutralisées et le contenu reste visible
  et utilisable sans JavaScript (dégradation progressive : `[data-reveal]` reste opaque grâce
  à `@media (prefers-reduced-motion: reduce)`).

## Vérifications effectuées

- Tous les chemins locaux (`assets/…`, `css/…`, `js/…`) référencés dans `index.html` existent.
- Toutes les ancres (`#reportages`, `#films`, etc.) correspondent à un `id` présent sur la page.
- CSS : accolades équilibrées. JS : syntaxe validée (`node --check`).
- Icônes noires jamais posées sur fond noir (variante blanche utilisée à la place) ; icônes
  colorées conservées telles quelles.
