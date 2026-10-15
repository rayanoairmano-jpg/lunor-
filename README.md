# Nightgild

Bijoux dorés et argentés pour femme et homme, à moins de 35 €. Site statique hébergé chez Hostinger, paiement PayPal (compte PayPal ou carte bancaire). Aucune dépendance à une plateforme e-commerce.

## Identité

- Logo : « NIGHTGILD » en capitales Bodoni Moda très espacées, un filet fin au-dessus et « BIJOUX » entre deux filets. Monogramme « N » entre deux filets pour l'icône d'onglet et les réseaux. Fichiers dans `assets/brand/` : `nightgild-logo.svg` (or), `nightgild-logo-encre.svg`, PNG sur fond nuit, transparent clair, transparent encre, `nightgild-mark.svg/.png` (monogramme) et image de partage 1200 × 630. Les lettres sont vectorisées : aucune police n'est nécessaire pour afficher le logo.
- Couleurs : encre de nuit `#0C1022`, bleu lapis `#1E2A5A`, or feuille `#D4AF5F`, or clair `#EBD49A`, ivoire `#F1EBDD`.
- Typographies : Bodoni Moda (titres, logo) et Jost (texte), via Google Fonts.

## Fichiers

| Fichier | Contenu |
|---|---|
| `index.html` | Le site Nightgild : catalogue de 40 bijoux (tableau `RAW`), filtres, idées cadeaux, guide des tailles, panier, boutons PayPal |
| `assets/produits/` | Photos des bijoux (`<nom>.webp`, noms repris de `RAW`) |
| `assets/brand/` | Logo et image de partage |
| `api/commande.php` | Crée la commande chez PayPal avec les prix du serveur, encaisse, enregistre et t'envoie la commande par email |
| `api/catalogue.php` | Prix de référence (généré depuis `RAW`) |
| `api/config.php` | Identifiants PayPal, email de réception, frais de livraison |
| `api/commandes/` | Commandes enregistrées (une fiche JSON par commande, non lisible depuis le web) |
| `outils/recuperer-photos.mjs` | À lancer une fois pour copier les photos dans `assets/produits/`, puis à supprimer |
| `concept-bague-3d.html` | Concept homme avec bague 3D WebGL |

## Mise en ligne chez Hostinger

1. **Photos** (une seule fois) : dans le dossier du site, `node outils/recuperer-photos.mjs`. Il doit annoncer 80 photos copiées.
2. **PayPal** : sur developer.paypal.com, *Apps & Credentials*, créer une application. Copier le *Client ID* et la *Secret key* (onglet Sandbox pour tester, Live pour vendre).
3. **Configurer** :
   - `index.html` : `PAYPAL.clientId` = le Client ID (il est public) ; `SHIPPING` = mêmes frais que le serveur.
   - `api/config.php` : `mode`, `client_id`, `client_secret`, `email_commandes`, `email_expediteur`, `livraison`, `livraison_offerte_des`.
   - Conseillé : enregistrer ce fichier sous le nom `nightgild-config.php` **à côté** du dossier `public_html` (hors web) ; il remplace alors `api/config.php`.
4. **Envoyer** : hPanel > Fichiers > Gestionnaire de fichiers > `public_html`, puis déposer `index.html`, `assets/`, `api/` (ou un .zip à extraire dans `public_html`). `index.html` doit être directement dans `public_html`.
5. **Tester en Sandbox** avec un compte acheteur fictif (developer.paypal.com > Sandbox accounts), vérifier l'email de commande, puis passer `mode` à `live` avec les identifiants Live.

## Ajouter ou modifier un bijou

1. Une ligne dans `RAW` (`index.html`) : référence, titre, genre `f`/`h`, catégorie, prix, deux noms de photo, description, options éventuelles.
2. Les deux photos en `.webp` dans `assets/produits/`.
3. La même référence, le même prix et les mêmes options dans `api/catalogue.php` : le serveur refuse tout article ou prix qu'il ne connaît pas.

## Après une commande

L'email « Commande NG-XXXXXX payée » contient les articles, le montant encaissé et l'adresse de livraison. Passer alors la commande chez le fournisseur avec cette adresse. Le remboursement éventuel se fait depuis le compte PayPal.

## Lancer en local

```bash
php -S localhost:8000      # site + api/commande.php
```

---

## Concept bague 3D (`concept-bague-3d.html`)

Concept de vitrine homme : un site statique (HTML/CSS/JS, aucune étape de build) pensé comme une vitrine de savoir-faire front-end.

- **Bague 3D en WebGL** (Three.js) : anneau « confort » modélisé par révolution d'un profil, métal physique avec reflets studio (PMREM), rotation à la souris / au doigt, changement de métal en direct. Repli SVG automatique si WebGL n'est pas disponible.
- **Visuels produits générés en SVG** (`assets/js/visuals.js`) : chaque bijou est dessiné selon sa forme et son métal.
- **Collection** filtrable et triable, **fiche produit** avec aperçu de gravure en direct, **panier** persistant, **guide des tailles** interactif.
- Les produits sont des données de démonstration dans `assets/js/catalog.js`.
