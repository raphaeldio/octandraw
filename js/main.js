/* ==========================================================
   MAIN — merangkai semua: Lenis, GSAP/ScrollTrigger, anime.js,
   Lottie, Three.js (silk + journey) dan pemutar lagu/film.
   ========================================================== */
(function () {
  gsap.registerPlugin(ScrollTrigger);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...(typeof r === "string" ? document.querySelector(r) : r).querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. Isi konten dari CONFIG
     --------------------------------------------------------- */
  $$(".js-recipient").forEach((el) => (el.textContent = CONFIG.recipient));
  $$(".js-sender").forEach((el) => (el.textContent = CONFIG.sender));
  Flora.render();
  Flora.lace($("#lace"));

  // Bingkai scallop
  function scallopPath(W, H, r) {
    const nx = Math.round(W / (2 * r)), ny = Math.round(H / (2 * r));
    const rx = W / (2 * nx), ry = H / (2 * ny);
    let d = "M0 0";
    for (let i = 0; i < nx; i++) d += ` a${rx} ${rx} 0 0 1 ${2 * rx} 0`;
    for (let i = 0; i < ny; i++) d += ` a${ry} ${ry} 0 0 1 0 ${2 * ry}`;
    for (let i = 0; i < nx; i++) d += ` a${rx} ${rx} 0 0 1 ${-2 * rx} 0`;
    for (let i = 0; i < ny; i++) d += ` a${ry} ${ry} 0 0 1 0 ${-2 * ry}`;
    return d + "Z";
  }
  const sp = scallopPath(300, 370, 17);
  $("#frames-row").innerHTML = CONFIG.framePhotos.map((src, i) => `
    <div class="scallop" data-i="${i}">
      <svg viewBox="-20 -20 340 410" aria-hidden="true">
        <path class="s-fill" d="${sp}"/>
        <path class="s-line" d="${sp}" transform="translate(150 185) scale(.93) translate(-150 -185)"/>
      </svg>
      <div class="s-photo"><img src="${src}" alt="Kenangan ${i + 1}" crossorigin="anonymous"/></div>
    </div>`).join("");

  // Piringan hitam
  const grooves = $("#grooves");
  for (let r = 74; r < 192; r += 3.5) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", 200); c.setAttribute("cy", 200); c.setAttribute("r", r);
    c.setAttribute("fill", "none");
    c.setAttribute("stroke", `rgba(255,255,255,${r % 7 < 3.5 ? 0.05 : 0.025})`);
    c.setAttribute("stroke-width", 1);
    grooves.appendChild(c);
  }
  $("#vinyl-label").setAttribute("href", CONFIG.song.cover);
  $("#song-title").textContent = CONFIG.song.title;
  $("#song-artist").textContent = CONFIG.song.artist;

  // Story
  $("#story-img").setAttribute("href", CONFIG.story.photo);
  $("#story-paras").innerHTML = CONFIG.story.paragraphs.map((p) => `<p>${p}</p>`).join("");
  const beads = $("#oval-beads");
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", 200 + Math.cos(a) * 178);
    c.setAttribute("cy", 250 + Math.sin(a) * 222);
    c.setAttribute("r", i % 2 ? 4 : 6.5);
    c.setAttribute("fill", "#f1e9de");
    c.setAttribute("stroke", "#cdbda5");
    beads.appendChild(c);
  }

  // Moments grid
  $("#moments-grid").innerHTML = CONFIG.moments.map((m, i) => `
    <figure class="moment" data-i="${i}">
      <img src="${m.src}" alt="${m.caption}"/>
      <figcaption><small>${m.date}</small>${m.caption}</figcaption>
    </figure>`).join("");

  // Surat
  $("#paper-lead").textContent = CONFIG.anniversary;
  $("#paper-body").innerHTML = CONFIG.letter.map((p) =>
    `<p>${p.split(" ").map((w) => `<span class="w">${w} </span>`).join("")}</p>`).join("");
  $("#sig-name").textContent = CONFIG.sender;

  // Tepi kertas sobek
  (function torn() {
    const pts = [];
    const jag = (n, fn) => { for (let i = 0; i <= n; i++) pts.push(fn(i / n)); };
    const j = () => (Math.random() * 1.6).toFixed(2);
    jag(40, (t) => `${(t * 100).toFixed(2)}% ${j()}%`);
    jag(30, (t) => `${(100 - j()).toFixed(2)}% ${(t * 100).toFixed(2)}%`);
    jag(40, (t) => `${(100 - t * 100).toFixed(2)}% ${(100 - j()).toFixed(2)}%`);
    jag(30, (t) => `${j()}% ${(100 - t * 100).toFixed(2)}%`);
    $("#paper").style.setProperty("--torn", `polygon(${pts.join(",")})`);
  })();

  // Film
  const video = $("#film-video");
  if (CONFIG.film && CONFIG.film.src) {
    video.src = CONFIG.film.src;
    video.poster = CONFIG.film.poster || "";
    $("#film-title").textContent = CONFIG.film.title || "";
  } else {
    // Tanpa data film di config, sembunyikan section-nya daripada membuat seluruh halaman macet
    $("#film").style.display = "none";
  }

  // Pecah judul menjadi huruf
  $$(".reveal-chars").forEach((el) => {
    const html = el.innerHTML.split(/<br\s*\/?>/i).map((line) =>
      line.trim().split(/\s+/).map((w) => `<span class="word">${[...w].map((c) => `<span class="ch">${c}</span>`).join("")}</span>`).join(" ")
    ).join("<br/>");
    el.innerHTML = html;
  });

  /* ---------------------------------------------------------
     2. Lenis + GSAP ticker (satu loop untuk semua render)
     --------------------------------------------------------- */
  const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.stop();
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  let journeyOn = false;
  let autoScrolling = false; // true saat scroll dipicu menu, agar tidak ikut ditahan
  const autoScroll = (target, opts = {}) => {
    autoScrolling = true;
    lenis.scrollTo(target, Object.assign({}, opts, { onComplete: () => (autoScrolling = false) }));
  };
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
    Silk.render(time);
    if (journeyOn) { Journey.render(time); updateJourneyHud(); }
    updateSongUI();
  });
  gsap.ticker.lagSmoothing(0);
  window.scrollTo(0, 0);

  /* ---------------------------------------------------------
     3. Animasi bunga (anime.js) — draw + sway
     --------------------------------------------------------- */
  function drawFlora(container, delay = 0) {
    const paths = $$(".draw", container);
    const fills = $$(".fill-in", container);
    fills.forEach((el) => (el.style.fillOpacity = 0));
    anime({ targets: paths, strokeDashoffset: [anime.setDashoffset, 0], easing: "easeInOutSine", duration: 1600, delay: anime.stagger(18, { start: delay }) });
    anime({ targets: fills, fillOpacity: [0, 1], easing: "easeOutQuad", duration: 900, delay: anime.stagger(22, { start: delay + 700 }) });
    anime({ targets: $$(".bell, .blossom", container), scale: [0, 1], easing: "easeOutBack", duration: 700, delay: anime.stagger(30, { start: delay + 900 }) });
  }
  function swayFlora() {
    if (reduce) return;
    $$(".sway").forEach((g) => {
      const amp = g.classList.contains("leaf") ? 4 : 2.2;
      anime({ targets: g, rotate: [-amp * Math.random() - 0.5, amp * Math.random() + 0.5], duration: 2600 + Math.random() * 2200, direction: "alternate", loop: true, easing: "easeInOutSine", delay: Math.random() * 800 });
    });
  }
  // sembunyikan bunga sebelum muncul
  $$("[data-flora]").forEach((el) => (el.style.opacity = 0));

  /* ---------------------------------------------------------
     4. Preloader
     --------------------------------------------------------- */
  const preImgs = [...CONFIG.framePhotos, CONFIG.story.photo, CONFIG.song.cover, CONFIG.moments[0].src];
  let loaded = 0;
  const total = preImgs.length + 1;
  const counter = { v: 0 };
  const bump = () => {
    loaded++;
    gsap.to(counter, { v: (loaded / total) * 100, duration: 0.4, onUpdate: () => ($("#pre-count").textContent = Math.round(counter.v)) });
  };
  anime({ targets: ".pre-heart", strokeDashoffset: [anime.setDashoffset, 0], duration: 1800, easing: "easeInOutSine", direction: "alternate", loop: true });

  const fontsReady = Promise.all([
    document.fonts.load("120px Italiana"),
    document.fonts.load("64px 'Pinyon Script'"),
    document.fonts.load("italic 38px 'Cormorant Garamond'"),
    document.fonts.load("38px 'Cormorant Garamond'"),
    document.fonts.load("16px Lora"),
  ]).catch(() => {}).then(bump);
  const imgsReady = preImgs.map((src) => new Promise((res) => {
    const im = new Image();
    im.onload = im.onerror = () => { bump(); res(); };
    im.src = src;
  }));
  const timeout = new Promise((res) => setTimeout(res, 7000));
  Promise.race([Promise.all([fontsReady, ...imgsReady]), timeout]).then(start);

  function start() {
    Journey.init({ onActive: showCaption, onClick: openLightbox });
    buildJourneyMap();
    setupScroll();
    gsap.timeline()
      .to(counter, { v: 100, duration: 0.3, onUpdate: () => ($("#pre-count").textContent = Math.round(counter.v)) })
      .to("#preloader", { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" })
      .add(introOpening, "-=0.3");
    swayFlora();
  }

  /* ---------------------------------------------------------
     5. Opening — amplop merah & segel lilin
     --------------------------------------------------------- */
  function introOpening() {
    const tl = gsap.timeline();
    tl.from("#opening .title .ch", { yPercent: 110, opacity: 0, rotate: 8, stagger: 0.025, duration: 0.9, ease: "power3.out" })
      .from("#env-red", { y: 80, opacity: 0, rotateX: 25, duration: 1.3, ease: "power3.out" }, 0.2)
      .from("#seal", { scale: 0, rotate: -40, duration: 1, ease: "back.out(2)" }, 0.9)
      .from("#btn-open", { y: 20, opacity: 0, duration: 0.8 }, 1.1)
      .add(() => {
        $$("#opening [data-flora]").forEach((el, i) => { el.style.opacity = 1; drawFlora(el, i * 200); });
      }, 0.5);
    anime({ targets: "#seal .seal-heart", strokeDashoffset: [anime.setDashoffset, 0], duration: 1600, delay: 1400, easing: "easeInOutSine" });
    anime({ targets: "#seal .seal-ring", rotate: 360, duration: 24000, loop: true, easing: "linear" });
    $$("#seal .seal-ring").forEach((c) => (c.style.transformOrigin = "100px 100px"));
    // kilau segel ketika hover
    $("#env-red").addEventListener("mouseenter", () => anime({ targets: "#seal", scale: [1, 1.08, 1], duration: 700, easing: "easeOutElastic(1, .5)" }));
  }

  let opened = false;
  function openLetter() {
    if (opened) return;
    opened = true;
    SongPlayer.play(); // musik mulai lembut setelah amplop dibuka (butuh gesture user)
    $$("#seal .seal-half").forEach((g) => (g.style.transformOrigin = "100px 100px"));
    const tl = gsap.timeline();
    tl.add(() => {
      // segel retak menjadi dua (anime.js)
      anime.timeline({ easing: "easeOutCubic" })
        .add({ targets: "#seal .seal-face", scale: [1, 1.12], duration: 160, easing: "easeOutQuad" })
        .add({ targets: "#seal .seal-face", opacity: 0, scale: 0.6, duration: 400 })
        .add({ targets: "#seal .seal-l", translateX: -26, translateY: 14, rotate: -24, duration: 700 }, 160)
        .add({ targets: "#seal .seal-r", translateX: 26, translateY: 18, rotate: 22, duration: 700 }, 160)
        .add({ targets: "#seal", opacity: 0, translateY: 60, duration: 600, easing: "easeInQuad" }, 650);
    })
      .to("#env-red .env-flap", { rotateX: 180, duration: 1, ease: "power2.inOut" }, 0.6)
      .set("#env-red .env-flap", { zIndex: 0 }, 1.1)
      .to("#env-red .env-card", { yPercent: -58, duration: 1, ease: "power3.out" }, 1.25)
      .to("#btn-open", { opacity: 0, y: 10, duration: 0.4 }, 0.3)
      .add(() => {
        document.body.classList.remove("is-locked");
        $(".topnav").classList.add("show");
        lenis.start();
        ScrollTrigger.refresh();
      }, 1.9)
      .add(() => lenis.scrollTo("#frames", { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) }), 2.2);
  }
  $("#btn-open").addEventListener("click", openLetter);
  $("#env-red").addEventListener("click", openLetter);

  /* ---------------------------------------------------------
     6. Scroll scenes
     --------------------------------------------------------- */
  function revealTitle(sel, trigger) {
    gsap.from(`${sel} .ch`, {
      yPercent: 110, opacity: 0, rotate: 6, stagger: 0.02, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: trigger || sel, start: "top 82%" },
    });
  }
  function floraOnEnter(scope) {
    $$("[data-flora]", scope).forEach((el, i) => {
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => { el.style.opacity = 1; drawFlora(el, i * 180); } });
    });
  }

  function setupScroll() {
    // Opening: parallax keluar
    gsap.to("#opening .env-stage", { yPercent: -18, scale: 0.92, ease: "none", scrollTrigger: { trigger: "#opening", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(Silk.uniforms.uScroll, { value: 3, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true } });

    /* Frames — bingkai scallop digambar anime.js */
    $$(".scallop").forEach((card, i) => {
      gsap.set(card, { opacity: 0, rotateY: -35, y: 80, transformPerspective: 900 });
      ScrollTrigger.create({
        trigger: "#frames-row", start: "top 78%", once: true,
        onEnter: () => {
          gsap.to(card, { opacity: 1, rotateY: 0, y: 0, duration: 1.3, delay: i * 0.18, ease: "power3.out" });
          anime({ targets: $(".s-line", card), strokeDashoffset: [anime.setDashoffset, 0], duration: 1800, delay: 300 + i * 180, easing: "easeInOutQuad" });
          gsap.fromTo($(".s-photo", card), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.2, delay: 0.5 + i * 0.18, ease: "power3.inOut" });
        },
      });
      gsap.to($("img", card), { yPercent: -8, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
      tilt(card, 10);
      card.addEventListener("mouseenter", () => anime({ targets: $(".s-line", card), strokeWidth: [1.4, 3, 1.4], duration: 900, easing: "easeInOutSine" }));
    });

    /* Song */
    revealTitle("#song .title");
    floraOnEnter("#song");
    gsap.from(".turntable", { scale: 0.7, rotate: -60, opacity: 0, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: ".turntable", start: "top 85%" } });
    gsap.from(".song-meta", { y: 30, opacity: 0, duration: 1, scrollTrigger: { trigger: ".song-meta", start: "top 92%" } });

    /* Story */
    revealTitle("#story .title");
    floraOnEnter("#story");
    ScrollTrigger.create({
      trigger: "#oval", start: "top 80%", once: true,
      onEnter: () => {
        anime({ targets: "#oval .oval-line", strokeDashoffset: [anime.setDashoffset, 0], duration: 1800, delay: anime.stagger(200), easing: "easeInOutSine" });
        anime({ targets: "#oval-beads circle", scale: [0, 1], opacity: [0, 1], duration: 600, delay: anime.stagger(18, { from: "first" }), easing: "easeOutBack" });
        gsap.fromTo("#story-img", { opacity: 0, scale: 1.15, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 1.6, delay: 0.4, ease: "power2.out" });
      },
    });
    $$("#oval-beads circle").forEach((c) => (c.style.transformBox = "fill-box", c.style.transformOrigin = "center"));
    $$("#story-paras p").forEach((p) => {
      p.innerHTML = p.textContent.split(" ").map((w) => `<span class="sw" style="display:inline-block">${w}&nbsp;</span>`).join("");
      gsap.from($$(".sw", p), { opacity: 0, y: 14, filter: "blur(4px)", stagger: 0.012, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: p, start: "top 85%" } });
    });
    gsap.to("#oval", { yPercent: -6, rotate: -2, ease: "none", scrollTrigger: { trigger: "#story", start: "top bottom", end: "bottom top", scrub: true } });

    /* Journey — album 3D. Section ditahan (sticky 1000vh) sampai path selesai ditampilkan */
    let held = false; // ditahan sekali setiap kali melewati jalan dari atas
    ScrollTrigger.create({
      trigger: "#journey", start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: (self) => {
        Journey.setProgress(self.progress);
        gsap.set("#journey-bar", { scaleX: self.progress });
        $("#journey-hint").style.opacity = Math.max(0, 1 - self.progress * 18);
        // tahan: begitu sampai di tampilan path dari atas, scroll dikunci sebentar
        // agar tidak langsung terlempar ke section berikutnya
        const hold = Journey.phases.aerial[0];
        if (self.direction === 1 && !held && !autoScrolling && self.progress > hold + 0.02) {
          held = true;
          lenis.scrollTo(self.start + (self.end - self.start) * 0.9, { duration: 1.8, lock: true, force: true });
        }
        if (self.progress < hold - 0.05) held = false;
      },
    });
    ScrollTrigger.create({ trigger: "#journey", start: "top bottom", end: "bottom top", onToggle: (self) => (journeyOn = self.isActive) });
    gsap.to(Silk.uniforms.uDim, { value: 1, ease: "none", scrollTrigger: { trigger: "#journey", start: "top bottom", end: "top top", scrub: true } });

    /* Moments */
    let refreshTimer;
    const refreshSoon = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150); };
    ScrollTrigger.create({ trigger: "#moments", start: "top 75%", once: true, onEnter: () => drawOrnament("#moments .ornament") });
    revealTitle("#moments .title");
    $$(".moment").forEach((m, i) => {
      gsap.fromTo(m, { clipPath: "inset(18% 18% 18% 18%)", opacity: 0, y: 60 }, {
        clipPath: "inset(0% 0% 0% 0%)", opacity: 1, y: 0, duration: 1.3, ease: "power3.out", delay: (i % 3) * 0.12,
        scrollTrigger: { trigger: m, start: "top 92%" },
      });
      m.addEventListener("click", () => openLightbox(i));
      tilt(m, 6);
      // Tinggi kartu mengikuti rasio foto, jadi hitung ulang posisi trigger setelah foto termuat
      const img = $("img", m);
      if (!img.complete) img.addEventListener("load", refreshSoon, { once: true });
    });

    /* Envelope 2 */
    revealTitle("#envelope2 .title");
    floraOnEnter("#envelope2");
    gsap.from("#env-cream", { y: 100, rotate: -4, opacity: 0, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: "#env-cream", start: "top 85%" } });
    ScrollTrigger.create({
      trigger: "#env-cream", start: "top 75%", once: true,
      onEnter: () => anime({ targets: "#lace path, #lace circle", opacity: [0, 1], scale: [0.4, 1], duration: 500, delay: anime.stagger(20), easing: "easeOutBack" }),
    });
    $$("#lace path, #lace circle").forEach((el) => { el.style.transformBox = "fill-box"; el.style.transformOrigin = "center"; el.style.opacity = 0; });

    /* Letter */
    floraOnEnter("#letter");
    gsap.from("#paper", { y: 120, rotate: 2, opacity: 0, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: "#paper", start: "top 85%" } });
    gsap.from(".paper-title", { x: 40, opacity: 0, duration: 1.2, scrollTrigger: { trigger: "#paper", start: "top 70%" } });
    $$("#paper-body p").forEach((p) => {
      gsap.from($$(".w", p), { opacity: 0, y: 8, stagger: 0.015, duration: 0.5, ease: "power1.out", scrollTrigger: { trigger: p, start: "top 88%" } });
    });
    const sig = $("#sig-name");
    sig.style.strokeDasharray = 900; sig.style.strokeDashoffset = 900;
    ScrollTrigger.create({
      trigger: ".signature", start: "top 90%", once: true,
      onEnter: () => anime.timeline({ easing: "easeInOutSine" })
        .add({ targets: sig, strokeDashoffset: [900, 0], duration: 2600 })
        .add({ targets: sig, fill: ["rgba(58,6,16,0)", "rgba(58,6,16,1)"], duration: 800 }, "-=600"),
    });

    /* Film */
    revealTitle("#film .title");
    gsap.from("#player", { scale: 0.86, opacity: 0, y: 60, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: "#player", start: "top 88%" } });

    /* Outro */
    ScrollTrigger.create({ trigger: "#outro", start: "top 80%", once: true, onEnter: () => drawOrnament("#outro .ornament") });
    gsap.from(".outro-script", { opacity: 0, y: 40, filter: "blur(8px)", duration: 1.6, scrollTrigger: { trigger: "#outro", start: "top 75%" } });

    /* Nav aktif */
    [["#opening", "opening"], ["#inside", "inside"], ["#letter-wrap", "letter"], ["#film", "inside"]].forEach(([sel, key]) => {
      ScrollTrigger.create({ trigger: sel, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && setNav(key) });
    });
  }

  function drawOrnament(sel) {
    anime({ targets: `${sel} .draw`, strokeDashoffset: [anime.setDashoffset, 0], duration: 1800, delay: anime.stagger(250), easing: "easeInOutSine" });
    anime({ targets: `${sel} .dot`, r: [0, 2.4], duration: 600, delay: 1200, easing: "easeOutBack" });
  }
  $$(".ornament .draw").forEach((p) => { p.style.strokeDasharray = p.getTotalLength(); p.style.strokeDashoffset = p.getTotalLength(); });

  function setNav(key) {
    $$(".topnav a").forEach((a) => a.classList.toggle("active", a.dataset.nav === key));
  }
  $$(".topnav a").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    autoScroll(a.getAttribute("href"), { duration: 2 });
  }));

  /* Peta mini path di sisi kanan (SVG) */
  let mapLen = 0, mapPts = [], mapStops = [];
  function buildJourneyMap() {
    const { pts, stops } = Journey.path2D();
    const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
    const xMin = Math.min(...xs) - 1, xMax = Math.max(...xs) + 1, zMin = Math.min(...zs), zMax = Math.max(...zs);
    const VW = 60, VH = 200;
    mapPts = pts.map(([x, z]) => [((x - xMin) / (xMax - xMin)) * VW, ((z - zMin) / (zMax - zMin)) * VH]);
    const svg = $("#journey-map");
    svg.setAttribute("viewBox", `-6 -6 ${VW + 12} ${VH + 12}`);
    const d = mapPts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    $(".jm-base", svg).setAttribute("d", d);
    const line = $(".jm-line", svg);
    line.setAttribute("d", d);
    mapLen = line.getTotalLength();
    line.style.strokeDasharray = mapLen;
    line.style.strokeDashoffset = mapLen;
    mapStops = stops;
    $(".jm-stops", svg).innerHTML = stops.map((t) => {
      const p = mapPts[Math.round(t * (mapPts.length - 1))];
      return `<circle cx="${p[0]}" cy="${p[1]}" r="3.4"/>`;
    }).join("");
    ScrollTrigger.create({
      trigger: "#journey", start: "top top", once: true,
      onEnter: () => anime({ targets: "#journey-map .jm-base", strokeDashoffset: [anime.setDashoffset, 0], duration: 1600, easing: "easeInOutSine" }),
    });
  }
  function updateJourneyHud() {
    if (!mapLen) return;
    const f = Math.max(Journey.walkFraction(), Journey.aerial);
    const PH = Journey.phases;
    const vis = gsap.utils.clamp(0, 1, (journeyProgress() - PH.walk[0] + 0.03) / 0.05);
    $("#journey-map").style.opacity = vis;
    $("#journey-map .jm-line").style.strokeDashoffset = mapLen * (1 - f);
    const me = mapPts[Math.round(f * (mapPts.length - 1))];
    const dot = $("#journey-map .jm-me");
    dot.setAttribute("cx", me[0]); dot.setAttribute("cy", me[1]);
    $$("#journey-map .jm-stops circle").forEach((c, i) => c.classList.toggle("on", f >= mapStops[i] - 0.01));
    const a = Journey.aerial;
    $("#journey-end").style.opacity = gsap.utils.clamp(0, 1, (a - 0.5) * 2);
    $("#journey-end").style.transform = `translateY(${(1 - a) * 20}px)`;
  }
  const journeyProgress = () => {
    const j = $("#journey"), max = j.offsetHeight - innerHeight;
    return gsap.utils.clamp(0, 1, (scrollY - j.offsetTop) / max);
  };

  /* ---------------------------------------------------------
     7. Journey caption & lightbox
     --------------------------------------------------------- */
  const cap = $("#journey-caption");
  function showCaption(i) {
    gsap.killTweensOf(cap);
    if (i < 0) { gsap.to(cap, { opacity: 0, y: 10, duration: 0.4 }); return; }
    const m = CONFIG.moments[i];
    gsap.to(cap, {
      opacity: 0, duration: 0.2, onComplete: () => {
        $(".jc-date", cap).textContent = m.date;
        $(".jc-text", cap).textContent = m.caption;
        gsap.fromTo(cap, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
      },
    });
  }

  const lb = $("#lightbox");
  function openLightbox(i) {
    const m = CONFIG.moments[i];
    $("#lightbox-img").src = m.src;
    $("#lightbox-cap").textContent = m.caption;
    lb.classList.add("open");
    lenis.stop();
    gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    gsap.fromTo("#lightbox-img", { scale: 0.85, y: 30 }, { scale: 1, y: 0, duration: 0.7, ease: "power3.out" });
  }
  lb.addEventListener("click", () => {
    gsap.to(lb, { opacity: 0, duration: 0.4, onComplete: () => { lb.classList.remove("open"); lenis.start(); } });
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && lb.classList.contains("open")) lb.click(); });

  /* ---------------------------------------------------------
     8. Lagu — vinyl, seek, Lottie
     --------------------------------------------------------- */
  const spin = gsap.to("#vinyl", { rotation: 360, duration: 3.6, ease: "none", repeat: -1, paused: true, transformOrigin: "50% 50%" });
  const heartAnim = lottie.loadAnimation({ container: $("#lottie-heart"), renderer: "svg", loop: true, autoplay: false, animationData: LOTTIE_HEART });
  const btnPlay = $("#btn-play");
  btnPlay.addEventListener("click", () => SongPlayer.toggle());
  $("#vinyl").addEventListener("click", () => SongPlayer.toggle());
  $("#vinyl").style.cursor = "pointer";

  SongPlayer.onChange(() => {
    const on = SongPlayer.playing;
    btnPlay.classList.toggle("is-playing", on);
    btnPlay.setAttribute("aria-label", on ? "Jeda lagu" : "Putar lagu");
    if (on) {
      spin.play();
      gsap.to(spin, { timeScale: 1, duration: 1.2, ease: "power2.out" });
      heartAnim.play();
      if (!video.paused) video.pause();
    } else {
      gsap.to(spin, { timeScale: 0, duration: 1.4, ease: "power2.out", onComplete: () => spin.pause() });
      heartAnim.pause();
    }
  });

  const seek = $("#seek");
  let dragging = false;
  const seekTo = (e) => {
    const r = seek.getBoundingClientRect();
    SongPlayer.seek((e.clientX - r.left) / r.width);
  };
  seek.addEventListener("pointerdown", (e) => { dragging = true; seek.setPointerCapture(e.pointerId); seekTo(e); });
  seek.addEventListener("pointermove", (e) => dragging && seekTo(e));
  seek.addEventListener("pointerup", () => (dragging = false));

  function updateSongUI() {
    const d = SongPlayer.duration || 1, t = SongPlayer.time;
    const pct = Math.min(t / d, 1) * 100;
    $("#seek-fill").style.width = pct + "%";
    $("#seek-knob").style.left = pct + "%";
    $("#t-cur").textContent = fmt(t);
    $("#t-dur").textContent = fmt(d);
  }

  /* ---------------------------------------------------------
     9. Amplop krem → surat
     --------------------------------------------------------- */
  let opened2 = false;
  function openEnvelope2() {
    if (opened2) { lenis.scrollTo("#letter", { duration: 1.8 }); return; }
    opened2 = true;
    gsap.timeline()
      .to("#env-cream .env-flap", { rotateX: 180, duration: 1, ease: "power2.inOut" })
      .set("#env-cream .env-flap", { zIndex: 0 }, 0.5)
      .to("#env-cream .env-card", { yPercent: -62, duration: 1, ease: "power3.out" }, 0.7)
      .to("#env-cream .env-card", { rotate: -3, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, 1.4)
      .add(() => lenis.scrollTo("#letter", { duration: 2.2 }), 1.8);
    $("#btn-letter span").textContent = "Read the Letter";
  }
  $("#btn-letter").addEventListener("click", openEnvelope2);
  $("#env-cream").addEventListener("click", openEnvelope2);

  /* ---------------------------------------------------------
     10. Film player
     --------------------------------------------------------- */
  const player = $("#player");
  const togglePlay = () => (video.paused ? video.play() : video.pause());
  $("#film-center").addEventListener("click", togglePlay);
  $("#film-play").addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);
  video.addEventListener("play", () => { player.classList.add("is-playing"); $("#film-play").classList.add("is-playing"); if (SongPlayer.playing) SongPlayer.pause(); });
  video.addEventListener("pause", () => { player.classList.remove("is-playing"); $("#film-play").classList.remove("is-playing"); });
  video.addEventListener("loadedmetadata", () => ($("#film-dur").textContent = fmt(video.duration)));
  video.addEventListener("timeupdate", () => {
    $("#film-cur").textContent = fmt(video.currentTime);
    $("#film-seek-fill").style.width = (video.currentTime / (video.duration || 1)) * 100 + "%";
  });
  $("#film-seek").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    video.currentTime = ((e.clientX - r.left) / r.width) * (video.duration || 0);
  });
  $("#film-mute").addEventListener("click", () => { video.muted = !video.muted; $("#film-mute").classList.toggle("muted", video.muted); });
  $("#film-fs").addEventListener("click", () => (document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen?.()));
  $("#btn-like").addEventListener("click", (e) => {
    const b = e.currentTarget;
    b.classList.toggle("liked");
    anime({ targets: b, scale: [1, 1.45, 1], duration: 600, easing: "easeOutElastic(1, .5)" });
  });

  /* ---------------------------------------------------------
     11. Interaksi kecil: tilt & tombol magnetic
     --------------------------------------------------------- */
  function tilt(el, max) {
    if (matchMedia("(hover: none)").matches) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: x * max, rotateX: -y * max, transformPerspective: 900, duration: 0.6, ease: "power2.out" });
    });
    el.addEventListener("pointerleave", () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "elastic.out(1, .5)" }));
  }
  $$(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4 });
    });
    b.addEventListener("pointerleave", () => gsap.to(b, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, .4)" }));
  });
  $("#btn-top").addEventListener("click", () => autoScroll(0, { duration: 3 }));
})();
