# Kit d'installation Claude (création de sites et marketing)

Préparé le 15 octobre 2026. Les étapes marquées **À toi** se font dans ton compte ou sur ton ordinateur : Claude ne peut pas y accéder à ta place.

## Contenu de ce dossier

| Fichier | À quoi il sert |
|---|---|
| `humanizer.zip` | Compétence Humanizer v3.1.0 (dépôt officiel `blader/humanizer`, licence MIT), prête à importer |
| `audit-seo-lunore.pdf` | Test PDF et audit SEO : audit du site Lunoré |
| `suivi-prospects.xlsx` | Test Excel : suivi de prospection (statuts, relance automatique à 7 jours, synthèse) |
| `test-vite-react/` | Test Claude Code : page d'accueil Vite + React (`npm install` puis `npm run dev`) |
| `apercu-page-accueil.png` | Capture de cette page d'accueil |

## Étape 1 : réglages de base (À toi)

1. Clique sur ton nom en bas à gauche, puis sur **Réglages > Capacités** : active **Exécution de code et création de fichiers** (et **Autoriser l'accès réseau** s'il apparaît), ainsi que **Artefacts** s'il est listé.
2. **Réglages > Mémoire** (ou la section Mémoire de Capacités, sur l'ancienne interface) : active **Générer la mémoire à partir des conversations** et **Rechercher et référencer les conversations**. Le second réglage n'existe que sur les offres payantes.
3. **Recherche web** : il n'y a pas de bouton dans la nouvelle interface. Dans l'ancienne, active **Recherche web** via le **+** de la zone de saisie.

## Étape 2 : compétences intégrées (À toi)

Elles se trouvent dans **Personnaliser > Compétences** (*Customize > Skills*). L'exécution de code doit être activée pour que cet onglet apparaisse.

Vérifie que ces compétences sont activées : docx, pdf, pptx, xlsx, docs, google-workspace, skill-creator, import-memory et morning. Les autres noms de ta liste (pdf-reading, file-reading, frontend-design, deep-research, product-self-knowledge, chrome-browser, built-in-browser, computer-use) peuvent ne pas apparaître comme des compétences séparées : ce sont souvent des fonctions intégrées ou liées à une application précise (Chrome, Desktop). Si l'une d'elles est absente de la liste, ce n'est pas bloquant.

## Étape 3 : Humanizer (À toi, 1 minute)

J'ai vérifié le fichier SKILL.md (397 lignes). Il ne contient que des règles de réécriture : pas de script, pas d'appel réseau, pas d'instruction cachée.

1. Télécharge `humanizer.zip` depuis ce dossier.
2. Va dans **Personnaliser > Compétences**, clique sur **+**, puis **Créer une compétence > Importer une compétence**, et choisis le zip.
3. Vérification : « humanizer » apparaît dans la liste, activé. Colle ensuite un texte et demande « humanise ce texte ».

## Étape 4 : plugins Anthropic (À toi, offre payante requise)

Ce sont les plugins du dépôt `anthropics/knowledge-work-plugins`. J'ai vérifié que leurs compétences portent exactement les noms de ta liste.

1. Ouvre **Claude Desktop**, puis l'onglet **Cowork**.
2. Va dans **Personnaliser** (barre latérale), puis **Plugins > Découvrir**.
3. Ajoute **Marketing**, **Design** et **Cowork plugin management** avec le bouton **Ajouter**.
4. Vérification : tape `/` dans Cowork. Des commandes comme `/marketing:seo-audit` ou `/design:ux-copy` doivent apparaître.

Variante avec Claude Code :

```
claude plugin marketplace add anthropics/knowledge-work-plugins
claude plugin install marketing@knowledge-work-plugins
claude plugin install design@knowledge-work-plugins
claude plugin install cowork-plugin-management@knowledge-work-plugins
```

## Étape 5 : connecteurs (À toi)

Va dans **Réglages > Connecteurs**, puis **Parcourir les connecteurs**. Pour chacun : **Connecter**, puis connexion au compte du service.

- **Gmail** et **Google Drive** : fais attention, Claude peut créer des brouillons Gmail mais pas les envoyer à ta place.
- **Canva** et **Microsoft 365** (Outlook, OneDrive, SharePoint, Teams) : présents dans l'annuaire officiel.
- **Netlify** : cherche-le dans l'annuaire. S'il n'y est pas, utilise **Ajouter un connecteur personnalisé**, avec l'URL indiquée dans la documentation de Netlify (je n'ai pu la confirmer que par des sources tierces).
- Vérification : dans une conversation, le menu **+ > Connecteurs** liste chaque service avec un interrupteur actif.

## Étape 6 : applications (À toi)

- **Claude Desktop** et **Cowork** : à télécharger sur claude.com/download.
- **Claude Code** (offre Pro ou plus) : Node.js n'est plus obligatoire.
  - Mac : `curl -fsSL https://claude.ai/install.sh | bash`
  - Windows (PowerShell) : `irm https://claude.ai/install.ps1 | iex`
  - Ensuite, `claude --version` doit afficher un numéro de version. Pour le test Vite + React, installe Node.js 22 ou plus récent (nodejs.org), puis lance `npm create vite@latest`.
- **Claude in Chrome** (offres payantes) : à installer depuis le Chrome Web Store (« Ajouter à Chrome »), puis connexion et épinglage via l'icône puzzle.
- **Claude pour Excel, PowerPoint et Word** (Pro et plus) : sur Microsoft Marketplace, ouvre « Claude for Microsoft 365 (Excel, PowerPoint, and Word) », clique sur **Obtenir maintenant**, puis ouvre le complément dans Office et connecte-toi.
- **Application mobile** : « Claude by Anthropic » sur l'App Store ou Google Play.
- **Claude Design** : aperçu de recherche (Pro, Max, Team, Enterprise) déployé progressivement. Il peut ne pas être encore visible sur ton compte.

## Étape 7 : vérification

| Test | Résultat |
|---|---|
| PDF | ✅ `audit-seo-lunore.pdf` généré et relu |
| Excel | ✅ `suivi-prospects.xlsx` : formules recalculées, aucune erreur |
| Audit SEO | ✅ fait sur le code de Lunoré (3 priorités hautes : produits chargés en JS, titre sans mot-clé, pas de JSON-LD) |
| Claude Code + Vite/React | ✅ projet créé, `npm run build` et `npm run lint` passent, rendu vérifié |

## Tableau récapitulatif

| Élément | État |
|---|---|
| Recherche web, exécution de code, artefacts, mémoire, recherche dans les conversations | **À faire** (réglages du compte) |
| Compétences intégrées | **À faire** (vérifier les interrupteurs) |
| Humanizer | **Prêt** (zip vérifié), import **à faire** |
| Plugins Marketing, Design, Cowork plugin management | **À faire** (payant) |
| Connecteurs Gmail, Drive, Canva, Microsoft 365 | **À faire** |
| Connecteur Netlify | **À faire**, URL à confirmer |
| Claude Desktop + Cowork, Claude Code, Chrome, Office, mobile | **À faire** (installation sur tes appareils) |
| Claude Design | **Peut être indisponible** (déploiement progressif) |
| Tests PDF, Excel, SEO, page Vite + React | **Fait** |
