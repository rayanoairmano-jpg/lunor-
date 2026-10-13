# Lunoré

## Fichiers

| Fichier | Contenu |
|---|---|
| `index.html` | **Version nuit** du site Lunoré (40 bijoux femme et homme, synchronisés avec la boutique Shopify) |
| `version-jour.html` | Version ivoire d'origine, gardée pour comparer |
| `concept-bague-3d.html` | Concept homme avec bague 3D WebGL (voir plus bas) |

### Version nuit (`index.html`)

Un seul fichier, sans build. Même contenu, même catalogue et même panier que la version jour, posés sur un ciel animé :

- **Ciel étoilé en canvas** fixe derrière toute la page : trois profondeurs d'étoiles qui scintillent
  et glissent en parallaxe avec la souris et le défilement.
- **Étoiles filantes** de temps en temps, et une à chaque clic dans le ciel du hero (« faire un vœu »).
- **La Grande Ourse** qui se trace au chargement ; le nom de chaque étoile apparaît au survol.
- **Poussière d'étoiles** qui suit le curseur.
- **Lune réelle** : « Ce soir : premier croissant · lune éclairée à 7 % » est calculé à partir de la date du jour.
- Lune et arches en parallaxe au défilement avec GSAP ScrollTrigger.
- `prefers-reduced-motion` respecté : ciel fixe, sans filantes ni traînée.

---

## Concept bague 3D (`concept-bague-3d.html`)

Concept de vitrine homme : un site statique (HTML/CSS/JS, aucune étape de build)
pensé comme une vitrine de savoir-faire front-end.

## Ce qu'il y a dedans

- **Bague 3D en WebGL** (Three.js) : anneau « confort » modélisé par révolution d'un profil,
  métal physique avec reflets studio (PMREM), rotation à la souris / au doigt, changement de métal en direct.
  Repli SVG automatique si WebGL n'est pas disponible.
- **Visuels produits générés en SVG** (`assets/js/visuals.js`) : chaque bijou est dessiné selon sa forme
  et son métal, donc changer argent / or / noir sur une carte redessine la pièce sans aucune image.
- **Collection** filtrable et triable, cartes avec inclinaison 3D et reflet qui suit la souris.
- **Fiche produit** : choix du métal, de la taille, et **aperçu de gravure en direct** qui suit la courbe de l'anneau.
- **Panier** persistant (localStorage), barre de progression vers la livraison offerte.
- **Section « Lignes »** en défilement horizontal épinglé (GSAP ScrollTrigger), une phase de lune par ligne.
- **Guide des tailles** interactif : tour de doigt → taille FR, US, UK et diamètre.
- **Lune réelle** : le logo affiche la progression de lecture en phase lunaire ; la newsletter montre la phase
  du jour et le pied de page la date de la prochaine nouvelle lune.
- Accessibilité : navigation clavier, `prefers-reduced-motion` respecté, contenu visible sans JavaScript d'animation.

## Lancer en local

```bash
npx serve .        # ou : python3 -m http.server
```

## Brancher sur Shopify

Les produits sont dans `assets/js/catalog.js` (données de démonstration).
Pour passer en production : remplacer ce fichier par un appel à la Storefront API
(ou à `/products.json` de la boutique), et brancher le bouton « Passer commande »
sur `cart/add` + `/checkout`. La structure peut aussi être portée en sections Liquid d'un thème Online Store 2.0.
