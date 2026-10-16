/* ==========================================================
   JOURNEY — album 3D (Three.js) yang terbuka saat discroll,
   lalu kamera berjalan menyusuri jalan kenangan berisi foto.
   Progress (0..1) dikendalikan GSAP ScrollTrigger dari main.js
   ========================================================== */
(function () {
  const W = window;
  const BG = 0x2a0309;
  let renderer, scene, camera, canvas, book, cover, bookMats = [], road, curve, u0 = 0;
  let photos = [], petals, petalVel, lights, trail, markers;
  const tmpObj = new THREE.Object3D();
  let progress = 0, smooth = 0, active = -1;
  const mouse = new THREE.Vector2(0, 0), mouseTarget = new THREE.Vector2(0, 0);
  const ray = new THREE.Raycaster();
  const cb = { onActive: () => {}, onClick: () => {} };

  const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
  const range = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ---------- Canvas textures ---------- */
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }

  function leather(g, w, h) {
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#7d1422"); grd.addColorStop(1, "#4f0912");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) {
      g.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  }
  function goldFrame(g, w, h, inset) {
    g.strokeStyle = "#dcbc84"; g.lineWidth = 4;
    g.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
    g.lineWidth = 1.5;
    g.strokeRect(inset + 14, inset + 14, w - (inset + 14) * 2, h - (inset + 14) * 2);
  }
  function heart(g, x, y, s) {
    g.beginPath();
    g.moveTo(x, y + s * .3);
    g.bezierCurveTo(x - s * .1, y - s * .1, x - s * .9, y - s * .1, x - s * .9, y + s * .35);
    g.bezierCurveTo(x - s * .9, y + s * .75, x - s * .3, y + s * .95, x, y + s * 1.25);
    g.bezierCurveTo(x + s * .3, y + s * .95, x + s * .9, y + s * .75, x + s * .9, y + s * .35);
    g.bezierCurveTo(x + s * .9, y - s * .1, x + s * .1, y - s * .1, x, y + s * .3);
  }

  const coverTex = () => canvasTex(780, 1020, (g, w, h) => {
    leather(g, w, h); goldFrame(g, w, h, 40);
    g.fillStyle = "#e9cf9c"; g.textAlign = "center";
    g.font = "120px Italiana"; g.fillText(CONFIG.albumTitle, w / 2, h * .46);
    g.font = "italic 38px 'Cormorant Garamond'"; g.fillText(CONFIG.albumSubtitle, w / 2, h * .54);
    g.strokeStyle = "#e9cf9c"; g.lineWidth = 2.5; heart(g, w / 2, h * .62, 34); g.stroke();
    g.font = "64px 'Pinyon Script'"; g.fillText(`${CONFIG.sender} & ${CONFIG.recipient}`, w / 2, h * .82);
  });
  const paperTex = (title, sub) => canvasTex(780, 1020, (g, w, h) => {
    g.fillStyle = "#f5efe4"; g.fillRect(0, 0, w, h);
    const grd = g.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, 700);
    grd.addColorStop(0, "rgba(0,0,0,0)"); grd.addColorStop(1, "rgba(120,80,40,.18)");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#c9b48e"; g.lineWidth = 2; g.strokeRect(46, 46, w - 92, h - 92);
    g.fillStyle = "#4d0a16"; g.textAlign = "center";
    g.font = "92px 'Pinyon Script'"; g.fillText(title, w / 2, h * .45);
    g.font = "italic 36px 'Cormorant Garamond'"; g.fillText(sub, w / 2, h * .54);
    g.strokeStyle = "#a97e43"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(w / 2, h * .6); g.lineTo(w / 2, h * .7); g.moveTo(w / 2 - 14, h * .68); g.lineTo(w / 2, h * .7); g.lineTo(w / 2 + 14, h * .68); g.stroke();
  });
  const roadTex = () => {
    const t = canvasTex(256, 512, (g, w, h) => {
      g.fillStyle = "#3a0610"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(255,220,220,${Math.random() * .05})`;
        g.fillRect(Math.random() * w, Math.random() * h, 2, 6);
      }
      g.fillStyle = "#dcbc84";
      g.fillRect(10, 0, 3, h); g.fillRect(w - 13, 0, 3, h);
      g.fillStyle = "rgba(220,188,132,.35)";
      g.fillRect(20, 0, 1, h); g.fillRect(w - 21, 0, 1, h);
      g.fillStyle = "#e9cf9c";
      for (let y = 20; y < h; y += 128) { heart(g, w / 2, y, 10); g.fill(); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const captionTex = (m) => canvasTex(512, 128, (g, w, h) => {
    g.textAlign = "center"; g.fillStyle = "#dcbc84";
    g.font = "26px 'Cormorant Garamond'"; g.fillText(m.date.split("").join(" "), w / 2, 38);
    g.fillStyle = "#f4ece0"; g.font = "52px Italiana"; g.fillText(m.caption, w / 2, 98);
  });
  const dotTex = (inner, outer) => canvasTex(64, 64, (g) => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, inner); grd.addColorStop(.35, outer); grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  });
  const petalTex = () => canvasTex(64, 64, (g) => {
    g.translate(32, 32); g.rotate(.5);
    g.fillStyle = "#f6e6e0";
    g.beginPath(); g.ellipse(0, 0, 13, 24, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(200,120,130,.35)";
    g.beginPath(); g.ellipse(0, 8, 6, 12, 0, 0, Math.PI * 2); g.fill();
  });

  /* ---------- Scene parts ---------- */
  function buildBook() {
    book = new THREE.Group();
    book.position.set(0, 0.6, 0);
    const BW = 2.6, BH = 3.4;
    const mat = (opts) => { const m = new THREE.MeshBasicMaterial(Object.assign({ transparent: true }, opts)); bookMats.push(m); return m; };
    const leatherCol = mat({ color: 0x5c0b15 });
    const pageCol = mat({ color: 0xe9dfcd });

    const back = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, 0.08), [leatherCol, leatherCol, leatherCol, leatherCol, leatherCol, leatherCol]);
    back.position.z = -0.1;
    const pages = new THREE.Mesh(new THREE.BoxGeometry(BW - 0.12, BH - 0.12, 0.14),
      [pageCol, pageCol, pageCol, pageCol, mat({ map: paperTex("Our Memory Lane", "walk with me, one moment at a time") }), pageCol]);
    pages.position.z = 0.01;

    cover = new THREE.Group();
    cover.position.set(-BW / 2, 0, 0.12);
    const coverMesh = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, 0.08),
      [leatherCol, leatherCol, leatherCol, leatherCol, mat({ map: coverTex() }), mat({ map: paperTex("for you", "since the very first hello") })]);
    coverMesh.position.x = BW / 2;
    cover.add(coverMesh);

    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.1, BH, 0.32), leatherCol);
    spine.position.set(-BW / 2, 0, 0.01);

    book.add(back, pages, cover, spine);
    scene.add(book);
  }

  function buildRoad() {
    curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.1, 7), new THREE.Vector3(0, -1.1, -2), new THREE.Vector3(2.6, -1.1, -12),
      new THREE.Vector3(-2.8, -1.1, -24), new THREE.Vector3(2.4, -1.1, -36), new THREE.Vector3(-2.2, -1.1, -48),
      new THREE.Vector3(1.6, -1.1, -60), new THREE.Vector3(0, -1.1, -72), new THREE.Vector3(0, -1.1, -80),
    ], false, "catmullrom", 0.4);

    const SEG = 500, HW = 1.25, len = curve.getLength();
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG, p = curve.getPointAt(t), tg = curve.getTangentAt(t);
      const n = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
      pos.push(p.x + n.x * HW, p.y, p.z + n.z * HW, p.x - n.x * HW, p.y, p.z - n.z * HW);
      uv.push(0, t * len / 2.4, 1, t * len / 2.4);
      if (i < SEG) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    road = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: roadTex(), side: THREE.DoubleSide }));
    scene.add(road);

    // jejak emas yang tergambar mengikuti langkah kamera
    const tp = [], ti = [], TW = 0.035;
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG, p = curve.getPointAt(t), tg = curve.getTangentAt(t);
      const n = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
      tp.push(p.x + n.x * TW, p.y + 0.012, p.z + n.z * TW, p.x - n.x * TW, p.y + 0.012, p.z - n.z * TW);
      if (i < SEG) { const a = i * 2; ti.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const tg2 = new THREE.BufferGeometry();
    tg2.setAttribute("position", new THREE.Float32BufferAttribute(tp, 3));
    tg2.setIndex(ti);
    tg2.setDrawRange(0, 0);
    trail = new THREE.Mesh(tg2, new THREE.MeshBasicMaterial({ color: 0xffe2a8, side: THREE.DoubleSide, transparent: true, opacity: 0.75 }));
    trail.userData.seg = SEG;
    scene.add(trail);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: 0x1c0207 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.12;
    scene.add(ground);

    // titik awal kamera di jalan (z ≈ 2, tepat di depan halaman album)
    let best = 1e9;
    for (let i = 0; i <= 400; i++) {
      const d = Math.abs(curve.getPointAt(i / 400).z - 2);
      if (d < best) { best = d; u0 = i / 400; }
    }
  }

  function buildPhotos() {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const list = CONFIG.moments, N = list.length;
    list.forEach((m, i) => {
      const u = u0 + 0.07 + (i / (N - 1)) * (0.9 - u0 - 0.07);
      const p = curve.getPointAt(u), tg = curve.getTangentAt(u);
      const n = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
      const side = i % 2 === 0 ? 1 : -1;

      const g = new THREE.Group();
      g.position.set(p.x + n.x * 2.3 * side, 0.35, p.z + n.z * 2.3 * side);
      const look = curve.getPointAt(Math.max(u - 0.05, 0));
      g.lookAt(look.x, 0.35, look.z);

      const frame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xf1e7d8 }));
      frame.position.z = -0.01;
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x4d0a16 }));
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
      shadow.position.set(0.08, -0.08, -0.03);
      const cap = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.45), new THREE.MeshBasicMaterial({ map: captionTex(m), transparent: true }));

      const setSize = (aspect) => {
        const h = aspect >= 1 ? 1.6 : 2.1, w = h * aspect;
        photo.scale.set(w, h, 1);
        frame.scale.set(w + 0.16, h + 0.16, 1);
        shadow.scale.set(w + 0.16, h + 0.16, 1);
        cap.position.y = -h / 2 - 0.38;
      };
      setSize(0.8);
      loader.load(m.src, (tex) => {
        photo.material.map = tex;
        photo.material.color.set(0xffffff);
        photo.material.needsUpdate = true;
        setSize(tex.image.width / tex.image.height);
      });

      g.add(shadow, frame, photo, cap);
      g.userData = { u, index: i, baseQ: g.quaternion.clone(), seed: Math.random() * 10 };
      photo.userData.index = i;
      scene.add(g);
      photos.push({ group: g, photo });
    });

    // titik cahaya di setiap kenangan, terlihat saat path dilihat dari atas
    const mk = new Float32Array(N * 3);
    photos.forEach(({ group }, i) => {
      const p = curve.getPointAt(group.userData.u);
      mk.set([p.x, p.y + 0.2, p.z], i * 3);
    });
    const mg = new THREE.BufferGeometry();
    mg.setAttribute("position", new THREE.BufferAttribute(mk, 3));
    markers = new THREE.Points(mg, new THREE.PointsMaterial({ map: dotTex("rgba(255,250,235,1)", "rgba(255,210,150,.6)"), size: 3.2, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    scene.add(markers);
  }

  function buildParticles() {
    // kelopak bunga melayang
    const COUNT = 520, arr = new Float32Array(COUNT * 3);
    petalVel = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      const p = curve.getPointAt(Math.random());
      arr[i * 3] = p.x + (Math.random() - .5) * 10;
      arr[i * 3 + 1] = -1 + Math.random() * 5;
      arr[i * 3 + 2] = p.z + (Math.random() - .5) * 6;
      petalVel[i * 2] = 0.15 + Math.random() * 0.3;
      petalVel[i * 2 + 1] = Math.random() * 6.28;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    petals = new THREE.Points(geo, new THREE.PointsMaterial({ map: petalTex(), size: 0.14, transparent: true, depthWrite: false, opacity: 0.9 }));
    scene.add(petals);

    // lampu-lampu kecil keemasan di sepanjang jalan
    const L = 380, la = new Float32Array(L * 3);
    for (let i = 0; i < L; i++) {
      const t = Math.random(), p = curve.getPointAt(t), tg = curve.getTangentAt(t);
      const n = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
      const s = (Math.random() < .5 ? -1 : 1) * (1.5 + Math.random() * 4);
      la[i * 3] = p.x + n.x * s;
      la[i * 3 + 1] = -0.9 + Math.random() * 3.2;
      la[i * 3 + 2] = p.z + n.z * s;
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(la, 3));
    lights = new THREE.Points(lg, new THREE.PointsMaterial({ map: dotTex("rgba(255,240,210,1)", "rgba(220,188,132,.5)"), size: 0.22, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(lights);
  }

  /* ---------- Camera choreography ----------
     0.00–0.18  album mendekat, sampul terbuka, masuk ke halaman
     0.18–0.72  berjalan menyusuri jalan (jejak emas tergambar)
     0.72–0.84  kamera naik → seluruh path terlihat dari atas
     0.84–1.00  DITAHAN di tampilan path sebelum section berikutnya */
  const PH = { open: [0.03, 0.12], fade: [0.13, 0.18], walk: [0.18, 0.72], aerial: [0.72, 0.84] };
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), look = new THREE.Vector3();
  const walkPos = new THREE.Vector3(), walkLook = new THREE.Vector3();
  const AERIAL_POS = new THREE.Vector3(0, 58, 12), AERIAL_LOOK = new THREE.Vector3(0, -1.1, -44);
  const walkU = (p) => u0 + ease(range(p, PH.walk[0], PH.walk[1])) * (0.985 - u0);
  let aerialK = 0;

  function updateCamera(p, time) {
    const pOpen = ease(range(p, PH.open[0], PH.open[1]));
    cover.rotation.y = -Math.PI * 0.94 * pOpen;
    book.position.y = 0.6 + Math.sin(time * 1.2) * 0.04 * (1 - pOpen);
    const fade = 1 - range(p, PH.fade[0], PH.fade[1]);
    bookMats.forEach((m) => (m.opacity = fade));
    book.visible = fade > 0.001;

    aerialK = ease(range(p, PH.aerial[0], PH.aerial[1]));
    if (p < PH.walk[0]) {
      const a = ease(range(p, 0, PH.fade[0])), b = ease(range(p, PH.fade[0], PH.walk[0]));
      camera.position.set(0, 0.6 - a * 0.25 - b * 0.15, 8.5 - a * 5.2 - b * 1.3);
      look.copy(tmpA.set(0, 0.5, 0)).lerp(tmpB.set(0, 0.1, -6), b);
    } else {
      const u = walkU(p);
      const cp = curve.getPointAt(u), lp = curve.getPointAt(Math.min(u + 0.03, 1));
      walkPos.set(cp.x, cp.y + 1.3, cp.z);
      walkLook.set(lp.x, lp.y + 1.2, lp.z);
      camera.position.copy(walkPos).lerp(AERIAL_POS, aerialK);
      look.copy(walkLook).lerp(AERIAL_LOOK, aerialK);
      // perlahan berputar saat ditahan di atas, supaya path terasa hidup
      const hold = range(p, PH.aerial[1], 1);
      camera.position.x += Math.sin(hold * Math.PI) * 10 * aerialK;
    }
    scene.fog.near = 7 + aerialK * 120;
    scene.fog.far = 34 + aerialK * 200;

    // jejak emas: tergambar sampai posisi kamera, penuh saat tampilan atas
    const seg = trail.userData.seg;
    const drawn = p < PH.walk[0] ? 0 : Math.max(walkU(p), aerialK);
    trail.geometry.setDrawRange(0, Math.floor(drawn * seg) * 6);
    markers.material.opacity = aerialK;
    trail.material.opacity = 0.75 + aerialK * 0.25;

    camera.position.x += mouse.x * 0.25 * (1 - aerialK);
    camera.position.y += mouse.y * 0.15 * (1 - aerialK);
    camera.lookAt(look);
  }

  function updateActive(p) {
    let idx = -1;
    if (p > PH.walk[0] && p < PH.walk[1]) {
      const u = walkU(p);
      let best = 0.06;
      photos.forEach(({ group }, i) => {
        const d = group.userData.u - u;
        if (d > -0.01 && d < best) { best = d; idx = i; }
      });
    }
    if (idx !== active) { active = idx; cb.onActive(idx); }
  }

  function resize() {
    if (!renderer) return;
    const r = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.fov = camera.aspect < 0.8 ? 62 : 50;
    camera.updateProjectionMatrix();
  }

  W.Journey = {
    init(handlers) {
      Object.assign(cb, handlers);
      canvas = document.getElementById("journey-canvas");
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      scene = new THREE.Scene();
      scene.background = new THREE.Color(BG);
      scene.fog = new THREE.Fog(BG, 7, 34);
      camera = new THREE.PerspectiveCamera(50, 1, 0.05, 220);

      buildBook();
      buildRoad();
      buildPhotos();
      buildParticles();
      resize();
      window.addEventListener("resize", resize);

      canvas.addEventListener("pointermove", (e) => {
        const r = canvas.getBoundingClientRect();
        mouseTarget.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(mouseTarget, camera);
        const hit = ray.intersectObjects(photos.map((p) => p.photo))[0];
        canvas.style.cursor = hit ? "zoom-in" : "";
      });
      canvas.addEventListener("click", () => {
        ray.setFromCamera(mouseTarget, camera);
        const hit = ray.intersectObjects(photos.map((p) => p.photo))[0];
        if (hit) cb.onClick(hit.object.userData.index);
      });
    },

    setProgress(p) { progress = p; },
    phases: PH,
    get aerial() { return aerialK; },
    // titik-titik path (x, z) untuk peta mini di HUD
    path2D(n = 120) {
      const pts = [];
      for (let i = 0; i <= n; i++) { const p = curve.getPointAt(u0 + (i / n) * (0.985 - u0)); pts.push([p.x, p.z]); }
      return { pts, stops: photos.map(({ group }) => (group.userData.u - u0) / (0.985 - u0)) };
    },
    walkFraction() { return ease(range(smooth, PH.walk[0], PH.walk[1])); },

    render(time) {
      if (!renderer) return;
      smooth += (progress - smooth) * 0.12;
      mouse.lerp(mouseTarget, 0.05);
      updateCamera(smooth, time);
      updateActive(smooth);

      photos.forEach(({ group }, i) => {
        const d = group.userData;
        group.quaternion.copy(d.baseQ);
        group.rotateY(Math.sin(time * 0.8 + d.seed) * 0.05);
        if (aerialK > 0) {
          // saat dilihat dari atas, foto berbalik menghadap kamera
          tmpObj.position.copy(group.position);
          tmpObj.lookAt(camera.position);
          group.quaternion.slerp(tmpObj.quaternion, aerialK);
        }
        group.position.y = 0.35 + Math.sin(time * 1.1 + d.seed) * 0.05 + aerialK * 2.2;
        const s = (i === active ? 1.08 : 1) + aerialK * 2.8;
        group.scale.x += (s - group.scale.x) * 0.08;
        group.scale.y = group.scale.z = group.scale.x;
      });

      const pa = petals.geometry.attributes.position.array;
      for (let i = 0; i < pa.length / 3; i++) {
        pa[i * 3 + 1] -= petalVel[i * 2] * 0.006;
        pa[i * 3] += Math.sin(time + petalVel[i * 2 + 1]) * 0.003;
        if (pa[i * 3 + 1] < -1.05) pa[i * 3 + 1] = 4;
      }
      petals.geometry.attributes.position.needsUpdate = true;
      lights.material.opacity = 0.75 + Math.sin(time * 2) * 0.2;

      renderer.render(scene, camera);
    },
  };
})();
