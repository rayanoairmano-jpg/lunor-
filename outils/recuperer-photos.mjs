/* À lancer UNE fois, avant de fermer l'ancienne boutique : copie les photos des bijoux
   dans assets/produits/ pour que le site n'en dépende plus.
   Commande (depuis le dossier du site) : node outils/recuperer-photos.mjs
   Une fois les 80 photos copiées, ce fichier peut être supprimé. */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";

const ANCIEN_HEBERGEMENT = "https://cdn.shopify.com/s/files/1/1053/3466/9654/files/";
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const debut = html.indexOf("const RAW = ["), fin = html.indexOf("\n];", debut) + 3;
const RAW = new Function(html.slice(debut, fin) + "; return RAW;")();
const noms = [...new Set(RAW.flatMap(r => [r[5], r[6]]).filter(Boolean))];
const dossier = new URL("../assets/produits/", import.meta.url);
await mkdir(dossier, { recursive: true });

let ok = 0, deja = 0; const ratees = [];
for (const nom of noms) {
  const cible = new URL(nom + ".webp", dossier);
  try { await access(cible); deja++; continue; } catch {}
  try {
    const r = await fetch(ANCIEN_HEBERGEMENT + nom + ".webp?width=1200");
    if (!r.ok) throw new Error("HTTP " + r.status);
    await writeFile(cible, Buffer.from(await r.arrayBuffer())); ok++;
    process.stdout.write(".");
  } catch (e) { ratees.push(`${nom} (${e.message})`); }
}
console.log(`\n${ok} photos copiées, ${deja} déjà présentes, ${ratees.length} en échec sur ${noms.length}.`);
if (ratees.length) console.log("En échec :\n" + ratees.join("\n"));
