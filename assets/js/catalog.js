/* LUNOR — catalogue
   Données de démonstration : remplace-les par tes vrais produits
   (ou branche-les sur /products.json / Storefront API, voir README). */

window.LUNOR_METALS = {
  argent: { label: "Argent 925", short: "Argent", swatch: "linear-gradient(135deg,#f4f5f7,#9da3ae 55%,#e6e8ec)" },
  or:     { label: "Vermeil or 18k", short: "Or", swatch: "linear-gradient(135deg,#fbe7b5,#c99a45 55%,#f2d590)" },
  noir:   { label: "Acier 316L noirci", short: "Noir", swatch: "linear-gradient(135deg,#6b6f78,#1d1f25 55%,#4a4e57)" }
};

window.LUNOR_CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "bagues", label: "Bagues" },
  { key: "chevalieres", label: "Chevalières" },
  { key: "chaines", label: "Chaînes" },
  { key: "bracelets", label: "Bracelets" },
  { key: "pendentifs", label: "Pendentifs & créoles" }
];

/* shape = type de visuel généré (voir visuals.js)
   sizes : "ring" (tailles FR), "chain" (longueurs cm), "bracelet" (tours de poignet cm) */
window.LUNOR_PRODUCTS = [
  { id: "eclipse", name: "Chevalière Éclipse", cat: "chevalieres", shape: "signet", stone: "onyx",
    price: 149, metals: ["argent", "or"], tag: "Best-seller", engravable: true, sizes: "ring", line: "eclipse",
    desc: "Plateau ovale serti d’onyx noir, épaules biseautées à la main. La pièce qui signe une silhouette.",
    specs: { "Plateau": "14 × 11 mm", "Poids": "≈ 9,4 g", "Finition": "Poli miroir" } },
  { id: "orbite", name: "Bague Orbite", cat: "bagues", shape: "band",
    price: 59, metals: ["noir", "argent"], tag: "Nouveau", engravable: true, sizes: "ring", line: "nouvelle",
    desc: "Anneau confort de 6 mm en acier brossé. Ne noircit pas, ne raye presque pas, se porte tous les jours.",
    specs: { "Largeur": "6 mm", "Épaisseur": "2,1 mm", "Poids": "≈ 5,2 g" } },
  { id: "croissant", name: "Bague Croissant", cat: "bagues", shape: "hammered",
    price: 89, metals: ["argent", "or"], engravable: true, sizes: "ring", line: "quartier",
    desc: "Argent martelé au marteau à panne ronde : chaque facette accroche la lumière comme un cratère.",
    specs: { "Largeur": "5 mm", "Poids": "≈ 6,8 g", "Finition": "Martelée" } },
  { id: "selene", name: "Chevalière Sélène", cat: "chevalieres", shape: "signet", stone: "metal",
    price: 189, metals: ["or", "argent"], tag: "Gravable", engravable: true, sizes: "ring", line: "pleine",
    desc: "Chevalière pleine prête à recevoir tes initiales. Gravure laser profonde offerte, jusqu’à 3 lettres.",
    specs: { "Plateau": "15 × 13 mm", "Poids": "≈ 11,2 g", "Gravure": "Offerte" } },
  { id: "nocturne", name: "Gourmette Nocturne", cat: "chaines", shape: "chain", link: "curb",
    price: 79, metals: ["noir", "argent", "or"], tag: "Best-seller", sizes: "chain", line: "nouvelle",
    desc: "Maille gourmette diamantée de 5 mm. Fermoir mousqueton renforcé, tient sous une chemise ouverte.",
    specs: { "Maille": "Gourmette 5 mm", "Fermoir": "Mousqueton", "Poids (55 cm)": "≈ 21 g" } },
  { id: "maree", name: "Chaîne Marée", cat: "chaines", shape: "chain", link: "cable",
    price: 99, metals: ["argent", "or"], sizes: "chain", line: "quartier",
    desc: "Maille forçat de 3 mm, discrète et lumineuse. La chaîne qui va avec tout, y compris un pendentif.",
    specs: { "Maille": "Forçat 3 mm", "Fermoir": "Anneau ressort", "Poids (55 cm)": "≈ 12 g" } },
  { id: "halo", name: "Chaîne Halo", cat: "chaines", shape: "chain", link: "rope",
    price: 159, metals: ["or", "argent"], tag: "Nouveau", sizes: "chain", line: "pleine",
    desc: "Maille corde torsadée de 4 mm. Elle tourne la lumière à chaque mouvement.",
    specs: { "Maille": "Corde 4 mm", "Fermoir": "Mousqueton", "Poids (55 cm)": "≈ 18 g" } },
  { id: "gravite", name: "Bracelet Gravité", cat: "bracelets", shape: "cuban",
    price: 89, metals: ["noir", "argent", "or"], tag: "Best-seller", sizes: "bracelet", line: "eclipse",
    desc: "Maille cubaine de 8 mm, compacte et lourde au poignet. Fermoir à cliquet double sécurité.",
    specs: { "Maille": "Cubaine 8 mm", "Fermoir": "Cliquet sécurisé", "Poids": "≈ 34 g" } },
  { id: "apogee", name: "Jonc Apogée", cat: "bracelets", shape: "bangle",
    price: 119, metals: ["argent", "or", "noir"], engravable: true, sizes: "bracelet", line: "pleine",
    desc: "Jonc ouvert ajustable, section ronde de 4 mm. Gravure intérieure possible.",
    specs: { "Section": "4 mm", "Ouverture": "Ajustable", "Poids": "≈ 19 g" } },
  { id: "perigee", name: "Bracelet Périgée", cat: "bracelets", shape: "beads",
    price: 69, metals: ["argent", "or"], sizes: "bracelet", line: "eclipse",
    desc: "Perles d’onyx mat de 8 mm et une perle de métal poli. Monté sur fil élastique tressé.",
    specs: { "Perles": "Onyx mat 8 mm", "Montage": "Élastique tressé", "Poids": "≈ 22 g" } },
  { id: "phase", name: "Créole Phase", cat: "pendentifs", shape: "hoop",
    price: 45, metals: ["argent", "or", "noir"], line: "quartier",
    desc: "Petite créole de 12 mm vendue à l’unité. Fermeture charnière invisible.",
    specs: { "Diamètre": "12 mm", "Épaisseur": "2 mm", "Vendu": "À l’unité" } },
  { id: "lune-noire", name: "Médaille Lune Noire", cat: "pendentifs", shape: "pendant",
    price: 129, metals: ["argent", "or"], tag: "Gravable", engravable: true, sizes: "chain", line: "eclipse",
    desc: "Médaille de 20 mm frappée d’un croissant, revers lisse à graver. Livrée avec sa chaîne forçat.",
    specs: { "Médaille": "Ø 20 mm", "Chaîne": "Forçat 2 mm incluse", "Poids": "≈ 8 g" } }
];

window.LUNOR_SIZES = {
  ring: ["54", "56", "58", "60", "62", "64", "66", "68"],
  chain: ["50 cm", "55 cm", "60 cm", "65 cm"],
  bracelet: ["17 cm", "19 cm", "21 cm", "23 cm"]
};

/* Les quatre lignes, rangées par phase lunaire */
window.LUNOR_LINES = [
  { key: "nouvelle", phase: 0.0, name: "Nouvelle Lune", metal: "noir",
    text: "Acier noirci, finitions brossées. Ce qu’on remarque à peine, et qu’on ne quitte plus." },
  { key: "quartier", phase: 0.25, name: "Premier Quartier", metal: "argent",
    text: "Argent 925 martelé et mailles fines. La lumière arrive par les facettes." },
  { key: "pleine", phase: 0.5, name: "Pleine Lune", metal: "or",
    text: "Vermeil or 18k sur argent. Des volumes pleins, faits pour être vus." },
  { key: "eclipse", phase: 0.75, name: "Éclipse", metal: "argent",
    text: "Onyx noir et métal poli. Le contraste comme signature." }
];
