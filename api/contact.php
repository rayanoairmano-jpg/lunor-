<?php
/* Nightgild : formulaire de contact.
   POST api/contact.php  corps JSON : {"nom","email","commande","sujet","message","site"}
   Envoie le message à 'email_contact' (config.php), avec le client en Reply-To.
   Anti-spam : champ piège « site » et limite de 5 messages par heure et par adresse IP. */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function repondre(int $code, array $donnees): void
{
    http_response_code($code);
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') repondre(405, ['ok' => false, 'erreur' => 'Méthode non autorisée.']);

$horsWeb = dirname(__DIR__, 2) . '/nightgild-config.php';
$config = require (is_file($horsWeb) ? $horsWeb : __DIR__ . '/config.php');

$brut = file_get_contents('php://input') ?: '';
$d = json_decode($brut, true);
if (!is_array($d)) $d = $_POST;

$propre = fn($v, int $max) => mb_substr(trim(str_replace(["\r", "\0"], '', (string)($v ?? ''))), 0, $max);
$nom      = $propre($d['nom'] ?? '', 100);
$email    = $propre($d['email'] ?? '', 200);
$commande = $propre($d['commande'] ?? '', 20);
$sujet    = $propre($d['sujet'] ?? 'Autre demande', 60);
$message  = $propre($d['message'] ?? '', 5000);

// Robot : on fait comme si tout allait bien
if (!empty($d['site'])) repondre(200, ['ok' => true]);

if ($nom === '' || $message === '') repondre(422, ['ok' => false, 'erreur' => 'Merci d’indiquer votre nom et votre message.']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) repondre(422, ['ok' => false, 'erreur' => 'Merci d’indiquer une adresse e-mail valide.']);
$nom = str_replace("\n", ' ', $nom);
$sujet = str_replace("\n", ' ', $sujet);
$commande = preg_replace('/[^A-Za-z0-9-]/', '', $commande);

// Limite simple : 5 messages par heure et par IP
$dossier = __DIR__ . '/commandes';
$fichier = $dossier . '/.contact-' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . 'nightgild');
$horodatages = is_file($fichier) ? array_filter(array_map('intval', file($fichier) ?: []), fn($t) => $t > time() - 3600) : [];
if (count($horodatages) >= 5) repondre(429, ['ok' => false, 'erreur' => 'Trop de messages envoyés. Réessayez dans une heure ou écrivez à contact@nightgild.com.']);
$horodatages[] = time();
@file_put_contents($fichier, implode("\n", $horodatages));

$destinataire = $config['email_contact'] ?? $config['email_commandes'] ?? '';
if (!filter_var($destinataire, FILTER_VALIDATE_EMAIL)) repondre(500, ['ok' => false, 'erreur' => 'Le formulaire n’est pas encore configuré. Écrivez-nous à contact@nightgild.com.']);
$de = filter_var($config['email_expediteur'] ?? '', FILTER_VALIDATE_EMAIL) ? $config['email_expediteur'] : $destinataire;

$texte = "Nouveau message depuis nightgild.com\n\n"
    . "Nom : $nom\nE-mail : $email\n" . ($commande !== '' ? "Commande : $commande\n" : '')
    . "Sujet : $sujet\n\n$message\n";
$objet = '=?UTF-8?B?' . base64_encode("[Contact] $sujet : $nom") . '?=';
$entetes = "From: Nightgild <$de>\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8\r\n";

if (!@mail($destinataire, $objet, $texte, $entetes)) {
    repondre(500, ['ok' => false, 'erreur' => 'L’envoi a échoué. Réessayez ou écrivez-nous à contact@nightgild.com.']);
}
repondre(200, ['ok' => true]);
