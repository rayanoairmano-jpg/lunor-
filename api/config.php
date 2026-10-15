<?php
/* Configuration du paiement Nightgild. À remplir une fois sur Hostinger (Gestionnaire de fichiers),
   jamais dans un dépôt public : la clé secrète donne accès à ton compte PayPal.
   Identifiants : developer.paypal.com > Apps & Credentials > ton application (onglet Sandbox pour tester, Live pour vendre). */
return [
    // 'sandbox' pour tester avec de faux comptes PayPal, 'live' pour encaisser pour de vrai
    'mode' => 'sandbox',
    'client_id' => 'REMPLACER_PAR_TON_CLIENT_ID_PAYPAL',
    'client_secret' => 'REMPLACER_PAR_TA_CLE_SECRETE_PAYPAL',

    // Adresse qui reçoit chaque commande payée (avec l'adresse de livraison du client)
    'email_commandes' => 'REMPLACER_PAR_TON_EMAIL',
    // Expéditeur des emails : une adresse de ton domaine créée dans Hostinger (ex. commandes@nightgild.fr)
    'email_expediteur' => 'REMPLACER_PAR_UNE_ADRESSE_DE_TON_DOMAINE',

    // Livraison en euros : 0 = offerte. Au-delà de 'livraison_offerte_des' (0 = jamais), elle devient gratuite.
    // Garder les mêmes valeurs que SHIPPING dans index.html.
    'livraison' => 0.00,
    'livraison_offerte_des' => 0.00,
];
