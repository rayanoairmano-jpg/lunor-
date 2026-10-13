# Lunoré — Bijoux Homme

Nouvelle vitrine pour la boutique Lunoré : un site statique (HTML/CSS/JS, aucune étape de build)
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
