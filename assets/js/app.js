/* Lunoré — interactions : collection, fiche produit, panier, guide des tailles, animations. */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const P = window.LUNOR_PRODUCTS, M = window.LUNOR_METALS;
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const eur = n => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ================= Lune : chemin de la partie éclairée =================
     p ∈ [0,1[ : 0 nouvelle lune, .25 premier quartier, .5 pleine lune, .75 dernier quartier */
  function moonPath(p, r = 44) {
    p = ((p % 1) + 1) % 1;
    const k = Math.cos(2 * Math.PI * p), rx = Math.abs(k) * r;
    if (p < 0.5) return `M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${rx} ${r} 0 0 ${k > 0 ? 0 : 1} 0 ${-r}Z`;
    return `M0 ${-r} A${r} ${r} 0 0 0 0 ${r} A${rx} ${r} 0 0 ${k < 0 ? 0 : 1} 0 ${-r}Z`;
  }
  const setPhase = (el, p) => el && el.setAttribute("d", moonPath(p));

  /* Phase réelle de la lune aujourd'hui (lunaison moyenne de 29,53 j) */
  const SYNODIC = 29.530588853, REF_NEW = Date.UTC(2000, 0, 6, 18, 14);
  const todayPhase = () => (((Date.now() - REF_NEW) / 864e5) % SYNODIC) / SYNODIC;

  /* ================= Préchargement ================= */
  (function loader() {
    const el = $("#loader"), num = $("#loader-num"), ph = $("#loader-phase");
    const dur = reduce ? 200 : 1300, t0 = performance.now();
    (function tick(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      num.textContent = String(Math.round(e * 100)).padStart(2, "0");
      setPhase(ph, e * 0.5);
      if (k < 1) requestAnimationFrame(tick);
      else { el.classList.add("is-done"); intro(); }
    })(t0);
  })();

  function intro() {
    if (!hasGsap || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".hero__title .line > span", { yPercent: 110, duration: 1.3, stagger: .12 })
      .from(".hero__eyebrow, .hero__lead, .hero__actions", { y: 24, opacity: 0, duration: 1, stagger: .08 }, "-=1")
      .from(".hero__metal, .hero__specs, .nav", { opacity: 0, duration: 1.2 }, "-=.9");
  }

  /* ================= En-tête : état au défilement + lune de progression ================= */
  const nav = $("#nav"), navPhase = $("#nav-phase");
  let lastY = 0;
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > lastY && y > 600 && !$("#drawer").classList.contains("is-open"));
    lastY = y;
    setPhase(navPhase, 0.03 + (max > 0 ? y / max : 0) * 0.47); // du croissant à la pleine lune
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ================= Curseur + boutons magnétiques ================= */
  if (fine && !reduce) {
    const c = $("#cursor");
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; }, { passive: true });
    (function raf() { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(raf); })();
    document.addEventListener("pointerover", e => {
      c.classList.toggle("is-hover", !!e.target.closest("a,button,select,input[type=range],.card__media"));
      c.classList.toggle("is-drag", !!e.target.closest("#hero-canvas"));
    });
    document.addEventListener("pointermove", e => {
      const m = e.target.closest("[data-magnetic]");
      $$("[data-magnetic].is-mag").forEach(b => { if (b !== m) { b.style.transform = ""; b.classList.remove("is-mag"); } });
      if (!m) return;
      const r = m.getBoundingClientRect();
      m.classList.add("is-mag");
      m.style.transition = "transform .25s cubic-bezier(.2,.7,.1,1)";
      m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .3}px,${(e.clientY - r.top - r.height / 2) * .4}px)`;
    }, { passive: true });
  }

  /* ================= Hero : choix du métal ================= */
  $$("[data-hero-metal]").forEach(b => b.addEventListener("click", () => {
    $$("[data-hero-metal]").forEach(x => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", x === b); });
    window.LunoreHero && window.LunoreHero.setMetal(b.dataset.heroMetal);
  }));

  /* ================= Collection ================= */
  const grid = $("#grid"), filters = $("#filters"), sortSel = $("#sort");
  let filter = store.get("lunore:filter", "all"), sort = "featured";
  const cardMetal = {};
  $("#col-total").textContent = P.length;

  filters.innerHTML = window.LUNOR_CATEGORIES.map(c => {
    const n = c.key === "all" ? P.length : P.filter(p => p.cat === c.key).length;
    return `<button type="button" role="tab" class="chip" data-filter="${c.key}" aria-selected="false">${c.label}<sup>${n}</sup></button>`;
  }).join("");
  filters.addEventListener("click", e => {
    const b = e.target.closest("[data-filter]"); if (!b) return;
    filter = b.dataset.filter; store.set("lunore:filter", filter); renderGrid(true);
  });
  sortSel.addEventListener("change", () => { sort = sortSel.value; renderGrid(true); });

  function catLabel(key) { return (window.LUNOR_CATEGORIES.find(c => c.key === key) || {}).label || ""; }

  function cardHTML(p) {
    const metal = cardMetal[p.id] || p.metals[0];
    return `<article class="card" data-id="${p.id}">
      <div class="card__media" data-open="${p.id}" tabindex="-1">
        ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
        <div class="card__visual">${window.LunoreVisual(p, metal)}</div>
        <button type="button" class="card__quick" data-open="${p.id}">Choisir ${p.sizes ? "ma taille" : "mon métal"}</button>
      </div>
      <div class="card__row"><h3 class="card__name"><a href="#${p.id}" data-open="${p.id}">${p.name}</a></h3><span class="card__price">${eur(p.price)}</span></div>
      <div class="card__meta"><span>${M[metal].label}</span>
        <span class="card__dots">${p.metals.map(m => `<button type="button" aria-label="${M[m].label}" title="${M[m].label}" class="${m === metal ? "is-active" : ""}" style="background:${M[m].swatch}" data-metal="${m}" data-for="${p.id}"></button>`).join("")}</span>
      </div>
    </article>`;
  }

  function renderGrid(animate) {
    $$(".chip", filters).forEach(c => { const on = c.dataset.filter === filter; c.classList.toggle("is-active", on); c.setAttribute("aria-selected", on); });
    let list = P.filter(p => filter === "all" || p.cat === filter);
    if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    grid.innerHTML = list.map(cardHTML).join("");
    if (animate && !reduce) $$(".card", grid).forEach((c, i) => { c.classList.add("is-entering"); c.style.animationDelay = i * 45 + "ms"; });
  }
  renderGrid(false);

  grid.addEventListener("click", e => {
    const dot = e.target.closest("[data-metal]");
    if (dot) {
      const p = byId[dot.dataset.for]; cardMetal[p.id] = dot.dataset.metal;
      const card = dot.closest(".card");
      card.outerHTML = cardHTML(p);
      return;
    }
    const o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); openProduct(o.dataset.open, cardMetal[o.dataset.open]); }
  });

  /* inclinaison 3D + reflet qui suit la souris */
  if (fine && !reduce) {
    grid.addEventListener("pointermove", e => {
      const m = e.target.closest(".card__media"); if (!m) return;
      const r = m.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      m.style.setProperty("--ry", (px - .5) * 10 + "deg");
      m.style.setProperty("--rx", (.5 - py) * 10 + "deg");
      m.style.setProperty("--mx", px * 100 + "%");
      m.style.setProperty("--my", py * 100 + "%");
    });
    grid.addEventListener("pointerout", e => {
      const m = e.target.closest(".card__media");
      if (m && !m.contains(e.relatedTarget)) { m.style.setProperty("--rx", "0deg"); m.style.setProperty("--ry", "0deg"); }
    });
  }

  /* ================= Lignes ================= */
  const track = $("#lines-track");
  track.innerHTML = window.LUNOR_LINES.map((l, i) => {
    const pieces = P.filter(p => p.line === l.key);
    return `<article class="line-card">
      <span class="line-card__index mono">${String(i + 1).padStart(2, "0")} / 04</span>
      <svg class="line-card__moon" viewBox="-50 -50 100 100" aria-hidden="true"><circle r="44" class="moon-dark"/><path class="moon-lit" d="${moonPath(l.phase)}"/></svg>
      <div class="line-card__visual" aria-hidden="true">${pieces[0] ? window.LunoreVisual(pieces[0], l.metal) : ""}</div>
      <h3>${l.name}</h3>
      <p>${l.text}</p>
      <div class="line-card__pieces">${pieces.map(p => `<button type="button" data-open="${p.id}">${p.name}</button>`).join("")}</div>
    </article>`;
  }).join("");
  track.addEventListener("click", e => { const b = e.target.closest("[data-open]"); if (b) openProduct(b.dataset.open); });

  if (hasGsap && !reduce) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const dist = () => Math.max(0, track.scrollWidth - (innerWidth - track.getBoundingClientRect().left) + parseFloat(getComputedStyle(track.parentElement).paddingRight) || 40);
      const tw = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: ".lines__pin", pin: true, start: "top top", end: () => "+=" + dist() * 1.6, scrub: .8, invalidateOnRefresh: true }
      });
      return () => tw.kill();
    });
    addEventListener("load", () => ScrollTrigger.refresh());
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());

    /* titres : légère montée au défilement (le texte reste lisible au repos) */
    $$(".reveal").forEach(el => gsap.from(el, { y: 50, opacity: .2, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
    $$(".steps li").forEach(el => gsap.from(el, { x: 40, opacity: .2, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } }));
  }

  /* ================= Compteurs ================= */
  const counters = $$("[data-count]");
  const runCount = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now(), d = reduce ? 1 : 1600;
    (function f(now) { const k = Math.min(1, (now - t0) / d); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 4))) + suf; if (k < 1) requestAnimationFrame(f); })(t0);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); } }), { threshold: .6 });
  counters.forEach(c => { c.textContent = c.dataset.count + (c.dataset.suffix || ""); io.observe(c); });

  /* ================= Guide des tailles =================
     taille FR = tour de doigt (mm) ; diamètre = tour / π ;
     US ≈ (diamètre − 11,63) / 0,8128 ; UK : A = 37,8 mm, puis une lettre par 1,25 mm */
  const range = $("#sizer-range");
  function sizer() {
    const circ = +range.value, d = circ / Math.PI;
    const us = Math.max(0, Math.round(((d - 11.63) / 0.8128) * 2) / 2);
    const ukI = Math.round((circ - 37.8) / 1.25);
    const uk = ukI < 0 ? "—" : ukI < 26 ? String.fromCharCode(65 + ukI) : "Z+" + (ukI - 25);
    $("#sizer-circ-val").textContent = circ + " mm";
    $("#sizer-diam-val").textContent = d.toFixed(1).replace(".", ",") + " mm";
    $("#out-fr").textContent = circ;
    $("#out-us").textContent = String(us).replace(".", ",");
    $("#out-uk").textContent = uk;
    const r = 30 + (circ - 44) * 1.9; // échelle visuelle
    $("#sizer-circle").setAttribute("r", r);
    const dl = $("#sizer-diam"); dl.setAttribute("x1", -r); dl.setAttribute("x2", r);
    range.style.setProperty("--p", ((circ - 44) / 32) * 100 + "%");
  }
  range.addEventListener("input", sizer);
  sizer();

  /* ================= Lune du jour & prochaine nouvelle lune ================= */
  const ph = todayPhase();
  setPhase($("#club-phase"), ph);
  const daysLeft = (1 - ph) * SYNODIC;
  const next = new Date(Date.now() + daysLeft * 864e5);
  $("#next-moon").textContent = `Nouvelle lune le ${next.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}, dans ${Math.ceil(daysLeft)} jour${Math.ceil(daysLeft) > 1 ? "s" : ""}.`;

  /* ================= Newsletter ================= */
  $("#club-form").addEventListener("submit", e => {
    e.preventDefault();
    const v = $("#club-email").value.trim(), msg = $("#club-msg");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { msg.textContent = "Cette adresse ne semble pas valide. Vérifie le @ et le domaine."; return; }
    msg.textContent = "Bienvenue dans le Cercle. Ton code −10 % : PREMIERELUNE";
    $("#club-email").value = "";
  });

  /* ================= Fiche produit ================= */
  const modal = $("#modal");
  const qv = { p: null, metal: null, size: null, engrave: "", view: "visual", lastFocus: null };

  function openProduct(id, metal) {
    const p = byId[id]; if (!p) return;
    Object.assign(qv, { p, metal: metal || p.metals[0], size: null, engrave: "", view: "visual", lastFocus: document.activeElement });
    $("#qv-cat").textContent = catLabel(p.cat) + (p.tag ? " · " + p.tag : "");
    $("#qv-title").textContent = p.name;
    $("#qv-price").textContent = eur(p.price);
    $("#qv-desc").textContent = p.desc;
    $("#qv-specs").innerHTML = Object.entries(p.specs).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    $("#qv-metals").innerHTML = p.metals.map(m => `<button type="button" class="opt" data-qv-metal="${m}"><i style="background:${M[m].swatch}"></i>${M[m].short}</button>`).join("");
    const sizes = p.sizes ? window.LUNOR_SIZES[p.sizes] : null;
    $("#qv-size-field").hidden = !sizes;
    $("#qv-size-legend").textContent = p.sizes === "ring" ? "Taille FR (tour de doigt en mm)" : p.sizes === "chain" ? "Longueur" : "Tour de poignet";
    $("#qv-sizes").innerHTML = sizes ? sizes.map(s => `<button type="button" class="opt opt--size" data-qv-size="${s}">${s}</button>`).join("") : "";
    $("#qv-engrave-field").hidden = !p.engravable;
    $("#qv-tabs").hidden = !p.engravable;
    $("#qv-engrave-input").value = "";
    $("#qv-error").textContent = "";
    paintQV();
    modal.hidden = false;
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => $(".modal__close", modal).focus(), 50);
    history.replaceState(null, "", "#" + p.id);
  }
  function paintQV() {
    const { p, metal, size, view } = qv;
    $("#qv-metal-label").textContent = M[metal].label;
    $$("[data-qv-metal]").forEach(b => b.classList.toggle("is-active", b.dataset.qvMetal === metal));
    $$("[data-qv-size]").forEach(b => b.classList.toggle("is-active", b.dataset.qvSize === size));
    $("#qv-visual").hidden = view !== "visual";
    $("#qv-engrave").hidden = view !== "engrave";
    $$("#qv-tabs button").forEach(b => b.classList.toggle("is-active", b.dataset.view === view));
    if (view === "visual") $("#qv-visual").innerHTML = window.LunoreVisual(p, metal);
    else $("#qv-engrave").innerHTML = window.LunoreEngraving(metal, qv.engrave);
  }
  function closeProduct() {
    modal.hidden = true;
    document.documentElement.style.overflow = "";
    history.replaceState(null, "", location.pathname + location.search);
    qv.lastFocus && qv.lastFocus.focus && qv.lastFocus.focus();
  }
  modal.addEventListener("click", e => {
    if (e.target.closest("[data-close]")) return closeProduct();
    const m = e.target.closest("[data-qv-metal]"); if (m) { qv.metal = m.dataset.qvMetal; return paintQV(); }
    const s = e.target.closest("[data-qv-size]"); if (s) { qv.size = s.dataset.qvSize; $("#qv-error").textContent = ""; return paintQV(); }
    const t = e.target.closest("[data-view]"); if (t) { qv.view = t.dataset.view; return paintQV(); }
  });
  $("#qv-engrave-input").addEventListener("input", e => {
    qv.engrave = e.target.value; qv.view = "engrave"; paintQV();
  });
  $("#qv-engrave-input").addEventListener("focus", () => { qv.view = "engrave"; paintQV(); });
  $("#qv-add").addEventListener("click", () => {
    const { p } = qv;
    if (p.sizes && !qv.size) {
      $("#qv-error").textContent = p.sizes === "ring" ? "Choisis ta taille. Pas sûr ? Le guide des tailles est plus bas." : "Choisis une longueur pour continuer.";
      $("#qv-sizes").animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
      return;
    }
    addToCart(p.id, qv.metal, qv.size, qv.engrave.trim());
    closeProduct();
    openCart();
  });
  addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!modal.hidden) closeProduct();
    else if ($("#drawer").classList.contains("is-open")) closeCart();
  });

  /* ouverture directe via l'ancre (#eclipse, #orbite…) */
  if (location.hash && byId[location.hash.slice(1)]) setTimeout(() => openProduct(location.hash.slice(1)), 1500);

  /* ================= Panier ================= */
  const FREE = 80;
  let cart = store.get("lunore:cart", []).filter(i => byId[i.id]);
  const drawer = $("#drawer");

  function addToCart(id, metal, size, engrave) {
    const key = [id, metal, size || "", engrave || ""].join("|");
    const ex = cart.find(i => i.key === key);
    if (ex) ex.qty++; else cart.push({ key, id, metal, size, engrave, qty: 1 });
    saveCart();
    toast(`${byId[id].name} ajouté au panier`);
    const c = $("#cart-count"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
  }
  function saveCart() { store.set("lunore:cart", cart); renderCart(); }
  function renderCart() {
    const total = cart.reduce((s, i) => s + byId[i.id].price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);
    $("#cart-count").textContent = count;
    $("#cart-total").textContent = eur(total);
    $("#ship-text").innerHTML = total >= FREE ? "<strong>Livraison offerte</strong> pour cette commande." : `Plus que <strong>${eur(FREE - total)}</strong> pour la livraison offerte.`;
    $("#ship-bar").style.width = Math.min(100, (total / FREE) * 100) + "%";
    $("#checkout").disabled = !cart.length;
    $("#cart-items").innerHTML = cart.length ? cart.map(i => {
      const p = byId[i.id];
      const meta = [M[i.metal].label, i.size, i.engrave ? `Gravure « ${i.engrave.replace(/[<>&]/g, "")} »` : ""].filter(Boolean).join(" · ");
      return `<li class="item" data-key="${i.key}">
        <div class="item__img">${window.LunoreVisual(p, i.metal)}</div>
        <div><h4>${p.name}</h4><p>${meta}</p>
          <div class="qty"><button type="button" data-q="-1" aria-label="Retirer un">−</button><span>${i.qty}</span><button type="button" data-q="1" aria-label="Ajouter un">+</button></div></div>
        <div class="item__side"><span class="item__price">${eur(p.price * i.qty)}</span><button type="button" class="item__remove" data-remove>Retirer</button></div>
      </li>`;
    }).join("") : `<li class="drawer__empty"><svg viewBox="-50 -50 100 100" aria-hidden="true"><circle r="44" class="moon-dark"/></svg>
        <span>Ton panier est vide, comme une nuit de nouvelle lune.</span>
        <button type="button" class="btn btn--ghost" data-drawer-close data-goto="#collection"><span>Voir la collection</span></button></li>`;
  }
  $("#cart-items").addEventListener("click", e => {
    const li = e.target.closest(".item"); if (!li) return;
    const it = cart.find(i => i.key === li.dataset.key); if (!it) return;
    const q = e.target.closest("[data-q]");
    if (q) { it.qty += +q.dataset.q; if (it.qty < 1) cart = cart.filter(i => i !== it); saveCart(); }
    if (e.target.closest("[data-remove]")) { cart = cart.filter(i => i !== it); saveCart(); }
  });
  function openCart() { drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); nav.classList.remove("is-hidden"); setTimeout(() => $(".drawer__head .modal__close").focus(), 60); }
  function closeCart() { drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); $("#cart-open").focus(); }
  $("#cart-open").addEventListener("click", openCart);
  drawer.addEventListener("click", e => {
    const c = e.target.closest("[data-drawer-close]"); if (!c) return;
    closeCart();
    if (c.dataset.goto) $(c.dataset.goto).scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });
  $("#checkout").addEventListener("click", () => {
    $("#checkout-note").textContent = "Version de démonstration : ce bouton se branchera sur le paiement Shopify.";
    toast("Démo : le paiement se branche sur Shopify Checkout");
  });
  renderCart();

  /* ================= Toast ================= */
  let tt;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("is-on"), 2600);
  }
})();
