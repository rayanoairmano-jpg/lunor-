<?php
/* Nightgild : création et encaissement des commandes PayPal (API Orders v2).
   POST api/commande.php?action=creer          corps : {"panier":[{"ref":"…","option":"…","qte":1}]}
   POST api/commande.php?action=capturer&id=…  après validation du client dans la fenêtre PayPal
   Les prix viennent de catalogue.php ; le navigateur n'envoie que des références et des quantités. */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// Conseillé par Hostinger : garder les identifiants hors de public_html.
// Si nightgild-config.php existe à côté du dossier public_html, il est prioritaire sur api/config.php.
$horsWeb = dirname(__DIR__, 2) . '/nightgild-config.php';
$config = require (is_file($horsWeb) ? $horsWeb : __DIR__ . '/config.php');
$catalogue = require __DIR__ . '/catalogue.php';
const DOSSIER = __DIR__ . '/commandes';

function repondre(int $code, array $donnees): void
{
    http_response_code($code);
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
    exit;
}

function montant(float $v): string
{
    return number_format($v, 2, '.', '');
}

function paypal(string $methode, string $chemin, ?array $corps, array $config): array
{
    $base = $config['api'] ?? ($config['mode'] === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com');

    $ch = curl_init($base . '/v1/oauth2/token');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => $config['client_id'] . ':' . $config['client_secret'],
        CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
        CURLOPT_TIMEOUT => 20,
    ]);
    $jeton = json_decode((string) curl_exec($ch), true)['access_token'] ?? null;
    curl_close($ch);
    if (!$jeton) {
        repondre(502, ['erreur' => 'AUTH', 'message' => 'Le paiement est momentanément indisponible. Réessayez dans un instant.']);
    }

    $ch = curl_init($base . $chemin);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $methode,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Authorization: Bearer ' . $jeton],
        CURLOPT_POSTFIELDS => $corps === null ? '' : json_encode($corps, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 30,
    ]);
    $brut = (string) curl_exec($ch);
    $statut = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$statut, json_decode($brut, true) ?? []];
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    repondre(405, ['erreur' => 'METHODE']);
}
if (str_starts_with($config['client_id'], 'REMPLACER') || str_starts_with($config['client_secret'], 'REMPLACER')) {
    repondre(503, ['erreur' => 'CONFIG', 'message' => 'Paiement en ligne bientôt disponible : la boutique finalise sa configuration PayPal.']);
}
if (!is_dir(DOSSIER)) {
    mkdir(DOSSIER, 0750, true);
}

$action = $_GET['action'] ?? '';

/* ---------- Créer la commande ---------- */
if ($action === 'creer') {
    $entree = json_decode((string) file_get_contents('php://input'), true);
    $panier = $entree['panier'] ?? null;
    if (!is_array($panier) || !$panier || count($panier) > 30) {
        repondre(400, ['erreur' => 'PANIER', 'message' => 'Votre panier est vide ou illisible. Rechargez la page.']);
    }

    $articles = [];
    $sousTotal = 0.0;
    foreach ($panier as $ligne) {
        $ref = (string) ($ligne['ref'] ?? '');
        $option = trim((string) ($ligne['option'] ?? ''));
        $qte = (int) ($ligne['qte'] ?? 0);
        $produit = $catalogue[$ref] ?? null;
        if (!$produit || $qte < 1 || $qte > 10) {
            repondre(400, ['erreur' => 'ARTICLE', 'message' => 'Un article du panier n’est plus disponible. Retirez-le puis réessayez.']);
        }
        if ($produit['options'] ? !in_array($option, $produit['options'], true) : $option !== '') {
            repondre(400, ['erreur' => 'OPTION', 'message' => 'Une option choisie n’existe plus. Retirez l’article puis ajoutez-le de nouveau.']);
        }
        $nom = $produit['nom'] . ($option !== '' ? ' (' . $option . ')' : '');
        $articles[] = [
            'name' => mb_substr($nom, 0, 127),
            'sku' => mb_substr($ref . ($option !== '' ? '|' . $option : ''), 0, 127),
            'quantity' => (string) $qte,
            'unit_amount' => ['currency_code' => 'EUR', 'value' => montant($produit['prix'])],
            'category' => 'PHYSICAL_GOODS',
        ];
        $sousTotal += $produit['prix'] * $qte;
    }

    $offerte = $config['livraison_offerte_des'] > 0 && $sousTotal >= $config['livraison_offerte_des'];
    $livraison = $offerte ? 0.0 : (float) $config['livraison'];

    [$statut, $reponse] = paypal('POST', '/v2/checkout/orders', [
        'intent' => 'CAPTURE',
        'purchase_units' => [[
            'reference_id' => 'nightgild',
            'description' => 'Commande Nightgild',
            'amount' => [
                'currency_code' => 'EUR',
                'value' => montant($sousTotal + $livraison),
                'breakdown' => [
                    'item_total' => ['currency_code' => 'EUR', 'value' => montant($sousTotal)],
                    'shipping' => ['currency_code' => 'EUR', 'value' => montant($livraison)],
                ],
            ],
            'items' => $articles,
        ]],
        'application_context' => [
            'brand_name' => 'Nightgild',
            'locale' => 'fr-FR',
            'shipping_preference' => 'GET_FROM_FILE',
            'user_action' => 'PAY_NOW',
        ],
    ], $config);

    if ($statut >= 300 || empty($reponse['id'])) {
        repondre(502, ['erreur' => 'CREATION', 'message' => 'La commande n’a pas pu être préparée. Réessayez dans un instant.']);
    }
    file_put_contents(DOSSIER . '/' . $reponse['id'] . '.json', json_encode([
        'statut' => 'CREEE',
        'cree_le' => date('c'),
        'articles' => $articles,
        'livraison' => montant($livraison),
        'total' => montant($sousTotal + $livraison),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    repondre(200, ['id' => $reponse['id']]);
}

/* ---------- Encaisser après validation du client ---------- */
if ($action === 'capturer') {
    $id = (string) ($_GET['id'] ?? '');
    $fichier = DOSSIER . '/' . $id . '.json';
    if (!preg_match('/^[A-Z0-9]{10,30}$/', $id) || !is_file($fichier)) {
        repondre(400, ['erreur' => 'COMMANDE', 'message' => 'Commande introuvable. Rechargez la page et réessayez.']);
    }

    [$statut, $reponse] = paypal('POST', '/v2/checkout/orders/' . $id . '/capture', null, $config);
    $probleme = $reponse['details'][0]['issue'] ?? null;
    if ($probleme === 'INSTRUMENT_DECLINED') {
        repondre(200, ['erreur' => 'INSTRUMENT_DECLINED']);
    }
    $unite = $reponse['purchase_units'][0] ?? [];
    $paiement = $unite['payments']['captures'][0] ?? [];
    if ($statut >= 300 || ($paiement['status'] ?? '') !== 'COMPLETED') {
        repondre(200, ['statut' => $paiement['status'] ?? 'ECHEC', 'message' => 'Le paiement n’a pas abouti : aucun montant n’a été débité. Réessayez ou choisissez un autre moyen de paiement.']);
    }

    $commande = json_decode((string) file_get_contents($fichier), true);
    $adresse = $unite['shipping']['address'] ?? [];
    $client = [
        'nom' => $unite['shipping']['name']['full_name'] ?? trim(($reponse['payer']['name']['given_name'] ?? '') . ' ' . ($reponse['payer']['name']['surname'] ?? '')),
        'email' => $reponse['payer']['email_address'] ?? '',
        'adresse' => array_values(array_filter([
            $adresse['address_line_1'] ?? '', $adresse['address_line_2'] ?? '',
            trim(($adresse['postal_code'] ?? '') . ' ' . ($adresse['admin_area_2'] ?? '')), $adresse['country_code'] ?? '',
        ])),
    ];
    $numero = 'NG-' . strtoupper(substr(hash('sha256', $id), 0, 6));
    $commande = array_merge($commande, [
        'statut' => 'PAYEE', 'numero' => $numero, 'payee_le' => date('c'),
        'transaction_paypal' => $paiement['id'] ?? '', 'montant_encaisse' => $paiement['amount']['value'] ?? '', 'client' => $client,
    ]);
    file_put_contents($fichier, json_encode($commande, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // Email de commande pour préparer l'envoi (passer la commande chez le fournisseur avec cette adresse)
    if (filter_var($config['email_commandes'], FILTER_VALIDATE_EMAIL)) {
        $lignes = array_map(fn($a) => '- ' . $a['quantity'] . ' × ' . $a['name'] . ' (' . $a['unit_amount']['value'] . ' €)', $commande['articles']);
        $texte = "Nouvelle commande payée $numero\n\n" . implode("\n", $lignes)
            . "\n\nLivraison : {$commande['livraison']} €\nTotal encaissé : {$commande['montant_encaisse']} €"
            . "\nTransaction PayPal : {$commande['transaction_paypal']}\n\nLivrer à :\n{$client['nom']}\n" . implode("\n", $client['adresse'])
            . "\n\nEmail du client : {$client['email']}\n";
        $de = filter_var($config['email_expediteur'], FILTER_VALIDATE_EMAIL) ? $config['email_expediteur'] : $config['email_commandes'];
        @mail($config['email_commandes'], "=?UTF-8?B?" . base64_encode("Commande $numero payée") . "?=", $texte,
            "From: Nightgild <$de>\r\nContent-Type: text/plain; charset=UTF-8\r\n" . ($client['email'] ? "Reply-To: {$client['email']}\r\n" : ''));
    }

    repondre(200, ['statut' => 'COMPLETED', 'numero' => $numero]);
}

repondre(404, ['erreur' => 'ACTION']);
