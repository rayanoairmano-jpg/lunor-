/* Lunoré — anneau 3D du hero (Three.js r128).
   Profil d'anneau "confort" tourné (LatheGeometry), métal physique + reflets
   générés par une petite scène-studio passée dans PMREM. Repli SVG si WebGL indisponible. */
(function () {
  const mount = document.getElementById("hero-canvas");
  if (!mount) return;

  const METALS = {
    argent: { color: 0xe6e8ec, rough: 0.16 },
    or:     { color: 0xf0c56b, rough: 0.2 },
    noir:   { color: 0x2b2d33, rough: 0.32 }
  };

  function fallback() {
    mount.classList.add("is-fallback");
    mount.innerHTML = window.LunoreVisual
      ? window.LunoreVisual({ name: "Bague Orbite", shape: "band", metals: ["argent"] }, "argent")
      : "";
    window.LunoreHero = { setMetal(m) {
      mount.innerHTML = window.LunoreVisual({ name: "Bague Orbite", shape: "band", metals: [m] }, m);
    } };
  }

  let ok = false;
  try { ok = !!window.THREE && !!document.createElement("canvas").getContext("webgl"); } catch (e) {}
  if (!ok) return fallback();

  const THREE = window.THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  /* --- environnement studio : panneaux lumineux autour d'une pièce sombre --- */
  const studio = new THREE.Scene();
  studio.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x0c0f16, side: THREE.BackSide })));
  const panel = (w, h, pos, rot, c) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); studio.add(m);
  };
  panel(14, 3, [0, 8, 0], [Math.PI / 2, 0, 0], 0xffffff);
  panel(3, 12, [-9, 0, 2], [0, Math.PI / 2, 0], 0xdfe6ff);
  panel(3, 12, [9, 1, -2], [0, -Math.PI / 2, 0], 0xfff1d6);
  panel(10, 1.2, [0, -3, -9], [0, 0, 0], 0x9fb1d8);
  panel(6, 6, [0, -8, 4], [-Math.PI / 2, 0, 0], 0x2a3142);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio, 0.03).texture;

  /* --- anneau : profil rectangulaire aux angles arrondis, tourné autour de Y --- */
  const rIn = 1.0, rOut = 1.24, half = 0.34, rad = 0.09, pts = [];
  const arc = (cx, cy, a0, a1) => {
    for (let i = 0; i <= 8; i++) {
      const a = a0 + (a1 - a0) * (i / 8);
      pts.push(new THREE.Vector2(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad));
    }
  };
  arc(rIn + rad, -half + rad, Math.PI, Math.PI * 1.5);
  arc(rOut - rad, -half + rad, -Math.PI / 2, 0);
  arc(rOut - rad, half - rad, 0, Math.PI / 2);
  arc(rIn + rad, half - rad, Math.PI / 2, Math.PI);
  pts.push(pts[0].clone());
  const geo = new THREE.LatheGeometry(pts, 180);
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({ color: METALS.argent.color, metalness: 1, roughness: METALS.argent.rough, envMapIntensity: 1.25 });
  const ring = new THREE.Mesh(geo, mat);
  const group = new THREE.Group();
  group.add(ring);
  group.rotation.set(1.05, 0.3, -0.35);
  scene.add(group);

  /* fines bandes gravées (deux filets) */
  [-0.2, 0.2].forEach(y => {
    const g = new THREE.TorusGeometry(rOut + 0.002, 0.012, 8, 180);
    const t = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x111215, metalness: 1, roughness: 0.6 }));
    t.rotation.x = Math.PI / 2; t.position.y = y; ring.add(t);
  });

  /* --- poussière d'étoiles --- */
  const N = 900, star = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    star[i * 3] = (Math.random() - .5) * 26;
    star[i * 3 + 1] = (Math.random() - .5) * 16;
    star[i * 3 + 2] = -Math.random() * 14 - 2;
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.BufferAttribute(star, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xcfd6ea, size: 0.035, transparent: true, opacity: .75, depthWrite: false }));
  scene.add(stars);

  /* --- interaction --- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let offsetX = 0, scrollP = 0, spin = 0, drag = null, dragVel = 0;
  addEventListener("pointermove", e => {
    pointer.tx = (e.clientX / innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / innerHeight) * 2 - 1;
    if (drag !== null) { dragVel = (e.clientX - drag) * 0.004; drag = e.clientX; }
  }, { passive: true });
  mount.addEventListener("pointerdown", e => { drag = e.clientX; mount.setPointerCapture(e.pointerId); });
  addEventListener("pointerup", () => { drag = null; });
  addEventListener("scroll", () => {
    scrollP = Math.min(1, scrollY / innerHeight);
  }, { passive: true });

  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 640 ? 7.6 : 6.4;
    offsetX = w > 900 ? Math.min(1.35, (w / h) * 0.7) : 0; // décale l'anneau à droite du titre sur grand écran
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(mount);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(mount);

  const target = new THREE.Color(METALS.argent.color);
  let targetRough = METALS.argent.rough;
  window.LunoreHero = {
    setMetal(m) {
      const d = METALS[m] || METALS.argent;
      target.setHex(d.color); targetRough = d.rough;
      dragVel += 0.12;
    }
  };

  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    spin += (reduce ? 0 : 0.0035) + dragVel;
    dragVel *= 0.94;
    group.rotation.x = 1.05 + pointer.y * 0.25 + scrollP * 0.8 + (reduce ? 0 : Math.sin(t * .6) * 0.05);
    group.rotation.y = 0.3 + pointer.x * 0.35;
    ring.rotation.y = spin;
    group.position.x = offsetX;
    group.position.y = (reduce ? 0 : Math.sin(t * .9) * 0.08) + scrollP * 1.2;
    mat.color.lerp(target, 0.06);
    mat.roughness += (targetRough - mat.roughness) * 0.06;
    stars.rotation.y = pointer.x * 0.05 + t * 0.004;
    stars.position.y = scrollP * 1.5;
    renderer.render(scene, camera);
  })();
  mount.classList.add("is-ready");
})();
