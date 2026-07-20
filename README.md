# YM Media — refonte éditoriale

Site statique complet, conçu pour être déployé directement sur GitHub Pages.

## Lancer le site

Depuis le dossier du projet :

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Arborescence

- `index.html` — structure sémantique de la page d’accueil
- `css/style.css` — direction artistique, responsive et accessibilité
- `js/main.js` — navigation, préloader, newsletter de démonstration et animations
- `assets/logos/` — logos d’origine et variantes claires dérivées sans modification géométrique
- `assets/icons/` — 24 icônes extraites de la planche, plus variantes monochromes claires et sombres
- `assets/images/` — visuels du hero et de la section films
- `assets/merch/` — galerie merchandising optimisée
- `assets/popup/` — visuel du pop-up store
- `assets/brand-guide.pdf` — charte graphique fournie

## Correspondance des logos sources

Les noms des fichiers transmis étaient inversés par rapport au contenu visuel de la charte :

- `secondaire(8).png` contient le wordmark sans baseline : exporté en `logo-primary-*`
- `principal(10).png` contient le wordmark avec « Made of moments. » : exporté en `logo-secondary-*`
- `subark(9).png` contient le submark : exporté en `submark-*`

Aucun logo n’a été redessiné. Les variantes claires conservent exactement l’alpha et la géométrie des fichiers d’origine.

## Bibliothèques

GSAP, ScrollTrigger et Lenis sont chargés depuis jsDelivr. Le site reste lisible et utilisable si ces bibliothèques sont indisponibles : les contenus apparaissent avec une animation de repli légère et la navigation conserve le défilement natif.

## Newsletter et vidéo

Le formulaire valide l’adresse uniquement dans l’interface et n’envoie aucune donnée. La section film ne lance aucune URL fictive : elle affiche clairement que le fichier vidéo n’a pas encore été fourni.
