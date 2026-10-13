/* Lunoré — visuels produits générés en SVG.
   Aucun fichier image : chaque bijou est dessiné à partir de sa forme et de son métal,
   ce qui garde le site léger et permet de changer de métal en direct. */
(function () {
  const PALETTES = {
    argent: ["#fbfcfd", "#cfd3da", "#8b919d", "#4f5460", "#e9ecf0"],
    or:     ["#fff1c9", "#e6c27a", "#b08435", "#6e4d15", "#f6dc9c"],
    noir:   ["#8a8e97", "#4a4e57", "#24262c", "#0f1013", "#5d616b"]
  };
  let uid = 0;

  function defs(id, metal) {
    const p = PALETTES[metal] || PALETTES.argent;
    return `
    <defs>
      <linearGradient id="m${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${p[0]}"/><stop offset=".28" stop-color="${p[1]}"/>
        <stop offset=".52" stop-color="${p[3]}"/><stop offset=".7" stop-color="${p[4]}"/>
        <stop offset="1" stop-color="${p[2]}"/>
      </linearGradient>
      <linearGradient id="d${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p[2]}"/><stop offset="1" stop-color="${p[3]}"/>
      </linearGradient>
      <linearGradient id="h${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${p[3]}"/><stop offset=".35" stop-color="${p[0]}"/>
        <stop offset=".55" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[3]}"/>
      </linearGradient>
      <radialGradient id="s${id}" cx=".35" cy=".3" r=".8">
        <stop offset="0" stop-color="${p[0]}"/><stop offset=".45" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[3]}"/>
      </radialGradient>
      <radialGradient id="o${id}" cx=".32" cy=".28" r=".85">
        <stop offset="0" stop-color="#5b5f6b"/><stop offset=".35" stop-color="#1b1d23"/><stop offset="1" stop-color="#050506"/>
      </radialGradient>
      <radialGradient id="sh${id}" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
  }

  const shadow = (id, cx = 200, cy = 330, rx = 130, ry = 18) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#sh${id})"/>`;

  /* anneau vu en perspective : bande extérieure + intérieur sombre */
  function band(id, { cx = 200, cy = 220, rx = 118, ry = 64, w = 30, t = 18, hammered = false } = {}) {
    let s = `
      <ellipse cx="${cx}" cy="${cy + w}" rx="${rx}" ry="${ry}" fill="url(#d${id})"/>
      <rect x="${cx - rx}" y="${cy}" width="${rx * 2}" height="${w}" fill="url(#h${id})"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#m${id})"/>
      <ellipse cx="${cx}" cy="${cy + 3}" rx="${rx - t}" ry="${ry - t * .62}" fill="url(#d${id})"/>
      <ellipse cx="${cx}" cy="${cy + 3 + w * .55}" rx="${rx - t - 2}" ry="${ry - t * .62 - 1}" fill="#0b0c10" opacity=".55"/>`;
    if (hammered) {
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI;
        const x = cx + Math.cos(a) * (rx - 4) * -1;
        const y = cy + w * .5 + Math.sin(a) * ry * .98;
        s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(5 + (i % 3)).toFixed(1)}" ry="${(9 + (i % 4)).toFixed(1)}" fill="#fff" opacity="${(0.08 + (i % 4) * 0.05).toFixed(2)}"/>`;
      }
    }
    s += `<path d="M${cx - rx + 6} ${cy + w * .55} Q ${cx - rx * .55} ${cy + ry + w * .85} ${cx - rx * .05} ${cy + ry + w * .8}" stroke="#fff" stroke-opacity=".4" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    return s;
  }

  const SHAPES = {
    band(id) { return shadow(id) + band(id); },
    hammered(id) { return shadow(id) + band(id, { hammered: true, w: 26 }); },

    signet(id, p) {
      const top = p.stone === "onyx"
        ? `<ellipse cx="200" cy="150" rx="52" ry="30" fill="url(#o${id})"/>
           <path d="M168 140 Q 190 128 214 132" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>`
        : `<ellipse cx="200" cy="150" rx="52" ry="30" fill="url(#s${id})"/>
           <text x="200" y="160" text-anchor="middle" font-family="'Bodoni Moda',Georgia,serif" font-style="italic" font-size="34" fill="url(#d${id})" opacity=".85">L</text>`;
      return shadow(id) + band(id, { cy: 230, ry: 58, w: 24 }) + `
        <path d="M128 196 Q 150 150 200 146 Q 250 150 272 196 L 262 214 Q 200 190 138 214 Z" fill="url(#h${id})"/>
        <ellipse cx="200" cy="158" rx="66" ry="40" fill="url(#d${id})"/>
        <ellipse cx="200" cy="150" rx="64" ry="38" fill="url(#m${id})"/>` + top;
    },

    chain(id, p) {
      let s = shadow(id, 200, 340, 120, 12);
      const n = p.link === "cable" ? 34 : 28;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const x = 70 + t * 260;
        const y = 70 + Math.pow(Math.sin(t * Math.PI), 0.9) * 230;
        const dx = 260 / n, dy = Math.cos(t * Math.PI) * 230 * Math.PI / n;
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        if (p.link === "rope") {
          s += `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" transform="rotate(${ang + 45} ${x} ${y})" fill="url(#s${id})" stroke="url(#d${id})" stroke-width="1"/>`;
        } else if (p.link === "cable") {
          const flat = i % 2 === 0;
          s += `<ellipse cx="${x}" cy="${y}" rx="${flat ? 9 : 9}" ry="${flat ? 5.5 : 2}" transform="rotate(${ang} ${x} ${y})" fill="none" stroke="url(#m${id})" stroke-width="${flat ? 2.6 : 3.4}"/>`;
        } else {
          s += `<rect x="${x - 10}" y="${y - 6}" width="20" height="12" rx="6" transform="rotate(${ang + (i % 2 ? 14 : -14)} ${x} ${y})" fill="none" stroke="url(#m${id})" stroke-width="4"/>`;
        }
      }
      return s;
    },

    cuban(id) {
      let s = shadow(id, 200, 320, 140, 20);
      const n = 26;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const x = 200 + Math.cos(a) * 120, y = 205 + Math.sin(a) * 74;
        const ang = (a * 180 / Math.PI) + 90;
        const back = Math.sin(a) < 0;
        s += `<g opacity="${back ? .7 : 1}"><rect x="${x - 15}" y="${y - 11}" width="30" height="22" rx="10" transform="rotate(${ang + (i % 2 ? 18 : -18)} ${x} ${y})" fill="url(#${back ? "d" : "m"}${id})" stroke="url(#d${id})" stroke-width="1.5"/>
        <rect x="${x - 7}" y="${y - 3}" width="14" height="6" rx="3" transform="rotate(${ang + (i % 2 ? 18 : -18)} ${x} ${y})" fill="#0b0c10" opacity=".55"/></g>`;
      }
      return s;
    },

    bangle(id) {
      return shadow(id, 200, 320, 140, 20) + `
        <path d="M128 140 A 120 78 0 1 0 272 140" fill="none" stroke="url(#d${id})" stroke-width="22" stroke-linecap="round" transform="translate(0 8)"/>
        <path d="M128 140 A 120 78 0 1 0 272 140" fill="none" stroke="url(#m${id})" stroke-width="20" stroke-linecap="round"/>
        <path d="M110 170 A 110 68 0 0 0 220 280" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
        <circle cx="128" cy="140" r="12" fill="url(#s${id})"/><circle cx="272" cy="140" r="12" fill="url(#s${id})"/>`;
    },

    beads(id) {
      let s = shadow(id, 200, 320, 140, 20);
      const n = 18, items = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + .2;
        items.push({ x: 200 + Math.cos(a) * 118, y: 200 + Math.sin(a) * 76, z: Math.sin(a), metal: i === 4 });
      }
      items.sort((a, b) => a.z - b.z).forEach(b => {
        const r = 19 + b.z * 3;
        s += `<circle cx="${b.x}" cy="${b.y}" r="${r}" fill="url(#${b.metal ? "s" : "o"}${id})" opacity="${b.z < 0 ? .8 : 1}"/>`;
      });
      return s;
    },

    hoop(id) {
      return shadow(id, 200, 330, 90, 14) + `
        <circle cx="200" cy="205" r="96" fill="none" stroke="url(#d${id})" stroke-width="24" transform="translate(4 6)"/>
        <circle cx="200" cy="205" r="96" fill="none" stroke="url(#m${id})" stroke-width="22"/>
        <path d="M120 160 A 96 96 0 0 1 200 109" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>
        <rect x="190" y="98" width="20" height="16" rx="3" fill="url(#h${id})"/>`;
    },

    pendant(id) {
      let s = shadow(id, 200, 340, 70, 10);
      for (let i = 0; i < 22; i++) {
        const t = i / 21, x = 92 + t * 216, y = 40 + Math.sin(t * Math.PI) * 120;
        s += `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="none" stroke="url(#m${id})" stroke-width="1.8" transform="rotate(${(t - .5) * -80} ${x} ${y})"/>`;
      }
      return s + `
        <rect x="193" y="156" width="14" height="22" rx="7" fill="none" stroke="url(#m${id})" stroke-width="4"/>
        <circle cx="200" cy="248" r="72" fill="url(#d${id})" transform="translate(3 5)"/>
        <circle cx="200" cy="248" r="72" fill="url(#m${id})"/>
        <circle cx="200" cy="248" r="60" fill="none" stroke="url(#d${id})" stroke-width="2"/>
        <path d="M222 205 A 46 46 0 1 0 222 291 A 36 36 0 1 1 222 205 Z" fill="url(#d${id})"/>`;
    }
  };

  window.LunoreVisual = function (product, metal) {
    const id = "v" + (++uid);
    const draw = SHAPES[product.shape] || SHAPES.band;
    return `<svg viewBox="0 0 400 380" role="img" aria-label="${product.name}" xmlns="http://www.w3.org/2000/svg">${defs(id, metal || product.metals[0])}${draw(id, product)}</svg>`;
  };

  /* Vue de face d'un anneau, avec la gravure qui suit la courbe intérieure */
  window.LunoreEngraving = function (metal, text) {
    const id = "e" + (++uid);
    const safe = String(text || "").replace(/[<>&"]/g, "").slice(0, 22) || "Ta gravure ici";
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" aria-label="Aperçu de la gravure">${defs(id, metal)}
      <circle cx="150" cy="150" r="128" fill="url(#m${id})"/>
      <circle cx="150" cy="150" r="114" fill="url(#d${id})"/>
      <circle cx="150" cy="150" r="88" fill="#0b0c10"/>
      <circle cx="150" cy="150" r="88" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2"/>
      <path id="p${id}" d="M 150 150 m -97 0 a 97 97 0 1 1 194 0 a 97 97 0 1 1 -194 0" fill="none"/>
      <text font-family="'JetBrains Mono',ui-monospace,monospace" font-size="13" letter-spacing="2.5" fill="${metal === "noir" ? "#c9ccd3" : "#fff"}" opacity=".85">
        <textPath href="#p${id}" startOffset="25%" text-anchor="middle">${safe}</textPath>
      </text>
      <path d="M40 120 A 115 115 0 0 1 120 30" stroke="#fff" stroke-opacity=".55" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`;
  };
})();
