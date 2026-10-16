/* ==========================================================
   FLORA — ilustrasi bunga SVG (calla lily, mawar putih, daun,
   lily of the valley). Semua path dibuat sebagai elemen nyata
   sehingga bisa dianimasikan anime.js (draw + sway).
   ========================================================== */
(function () {
  const DEG = 180 / Math.PI;
  const C = {
    petal: "#fbf8f3", petalLine: "#cfc6b8", petalShade: "#e6ded2",
    stem: "#4d6a3c", stemDark: "#34492a", leaf: "#4f6b3f", leafLine: "#3a5130", rib: "#7a9763",
    spadix: "#e3bd55", red: "#b3192b", redDark: "#760d1a",
  };
  const f = (n) => +n.toFixed(1);

  function stem(bx, by, cx, cy, tx, ty, w = 3) {
    return `<path class="draw stem" d="M${f(bx)} ${f(by)} Q${f(cx)} ${f(cy)} ${f(tx)} ${f(ty)}" fill="none" stroke="${C.stem}" stroke-width="${w}" stroke-linecap="round"/>`;
  }

  // Calla lily: batang melengkung + kelopak terompet
  function calla(bx, by, cx, cy, tx, ty, s = 1) {
    const ang = Math.atan2(ty - cy, tx - cx) * DEG + 90;
    return `<g class="sway" style="transform-origin:${f(bx)}px ${f(by)}px">
      ${stem(bx, by, cx, cy, tx, ty, 3 * s)}
      <g transform="translate(${f(tx)} ${f(ty)}) rotate(${f(ang)}) scale(${s})">
        <path class="draw fill-in" d="M0 0 C-11 -6 -17 -22 -13 -38 C-10 -50 2 -60 16 -58 C9 -52 7 -45 11 -38 C17 -27 13 -10 0 0Z" fill="${C.petal}" stroke="${C.petalLine}" stroke-width="1.1"/>
        <path class="draw" d="M0 -1 C-6 -14 -5 -30 4 -44" fill="none" stroke="${C.petalShade}" stroke-width="1.4"/>
        <path class="draw" d="M-13 -38 C-6 -47 6 -50 16 -58" fill="none" stroke="${C.petalLine}" stroke-width="1"/>
        <path class="draw" d="M1 -5 L3 -30" fill="none" stroke="${C.spadix}" stroke-width="3.2" stroke-linecap="round"/>
      </g>
    </g>`;
  }

  function leaf(x, y, len, ang, w = len * 0.22) {
    return `<g class="sway leaf" style="transform-origin:${f(x)}px ${f(y)}px">
      <g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">
        <path class="draw fill-in" d="M0 0 C${f(w)} ${f(-len * .3)} ${f(w * .6)} ${f(-len * .8)} 0 ${f(-len)} C${f(-w * .6)} ${f(-len * .8)} ${f(-w)} ${f(-len * .3)} 0 0Z" fill="${C.leaf}" stroke="${C.leafLine}" stroke-width="1"/>
        <path class="draw" d="M0 -2 L0 ${f(-len * .9)}" stroke="${C.rib}" stroke-width="1" fill="none"/>
      </g>
    </g>`;
  }

  // Mawar putih
  function rose(x, y, r) {
    let out = `<g class="sway rose" style="transform-origin:${f(x)}px ${f(y + r)}px">`;
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.3;
      const px = x + Math.cos(a) * r * 0.42, py = y + Math.sin(a) * r * 0.42;
      out += `<ellipse class="draw fill-in" cx="${f(px)}" cy="${f(py)}" rx="${f(r * .62)}" ry="${f(r * .5)}" transform="rotate(${f(a * DEG + 90)} ${f(px)} ${f(py)})" fill="${C.petal}" stroke="${C.petalLine}" stroke-width="1"/>`;
    }
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * .56)}" fill="#f3ede4" stroke="${C.petalLine}" stroke-width="1"/>`;
    let d = "";
    for (let t = 0; t <= Math.PI * 3.6; t += 0.25) {
      const rr = r * 0.05 + (r * 0.46 * t) / (Math.PI * 3.6);
      d += (d ? " L" : "M") + f(x + Math.cos(t) * rr) + " " + f(y + Math.sin(t) * rr * 0.9);
    }
    out += `<path class="draw" d="${d}" fill="none" stroke="#c9bdab" stroke-width="1.2" stroke-linecap="round"/></g>`;
    return out;
  }

  function blossom(x, y, r) {
    let out = `<g class="sway blossom" style="transform-origin:${f(x)}px ${f(y)}px">`;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const px = x + Math.cos(a) * r * .55, py = y + Math.sin(a) * r * .55;
      out += `<ellipse class="fill-in" cx="${f(px)}" cy="${f(py)}" rx="${f(r * .55)}" ry="${f(r * .4)}" transform="rotate(${f(a * DEG)} ${f(px)} ${f(py)})" fill="${C.petal}" stroke="${C.petalLine}" stroke-width=".8"/>`;
    }
    return out + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * .25)}" fill="#e9d7a7"/></g>`;
  }

  // Lily of the valley (untaian lonceng kecil)
  function sprig(bx, by, cx, cy, tx, ty, n = 6) {
    let out = `<g class="sway" style="transform-origin:${f(bx)}px ${f(by)}px">` + stem(bx, by, cx, cy, tx, ty, 1.6);
    for (let i = 1; i <= n; i++) {
      const t = 0.25 + (i / n) * 0.75;
      const px = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * cx + t * t * tx;
      const py = (1 - t) * (1 - t) * by + 2 * (1 - t) * t * cy + t * t * ty;
      const s = 0.7 + (1 - t) * 0.6;
      out += `<path class="draw" d="M${f(px)} ${f(py)} q2 6 0 10" fill="none" stroke="${C.stem}" stroke-width="1"/>
        <path class="fill-in bell" d="M${f(px - 4.5 * s)} ${f(py + 10 + 7 * s)} C${f(px - 5 * s)} ${f(py + 10)} ${f(px + 5 * s)} ${f(py + 10)} ${f(px + 4.5 * s)} ${f(py + 10 + 7 * s)} l${f(-1.5 * s)} ${f(-1.4 * s)} l${f(-1.5 * s)} ${f(1.4 * s)} l${f(-1.5 * s)} ${f(-1.4 * s)} l${f(-1.5 * s)} ${f(1.4 * s)} l${f(-1.5 * s)} ${f(-1.4 * s)}Z" fill="${C.petal}" stroke="${C.petalLine}" stroke-width=".8"/>`;
    }
    return out + "</g>";
  }

  function redLily(x, y, r, rot = 0) {
    let out = `<g class="sway" style="transform-origin:${f(x)}px ${f(y)}px"><g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">`;
    for (let i = 0; i < 6; i++) {
      const a = i * 60 + (i % 2) * 8;
      out += `<path class="draw fill-in" transform="rotate(${a})" d="M0 0 C${f(r * .35)} ${f(-r * .35)} ${f(r * .22)} ${f(-r * .9)} 0 ${f(-r)} C${f(-r * .22)} ${f(-r * .9)} ${f(-r * .35)} ${f(-r * .35)} 0 0Z" fill="${C.red}" stroke="${C.redDark}" stroke-width="1"/>`;
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      out += `<path class="draw" d="M0 0 L${f(Math.cos(a) * r * .55)} ${f(Math.sin(a) * r * .55)}" stroke="#f1d7a4" stroke-width="1.2"/>`;
    }
    return out + "</g></g>";
  }

  const P = {
    "opening-left": { vb: "0 0 200 360", parts: () =>
      leaf(150, 250, 90, -60) + leaf(150, 260, 70, -100) +
      calla(170, 300, 120, 220, 60, 120, 1.25) + calla(175, 300, 140, 200, 90, 70, 1.05) +
      rose(150, 210, 30) + sprig(160, 230, 150, 160, 120, 140, 5) + redLily(140, 300, 46, 20) + leaf(170, 320, 60, -140) },
    "opening-right": { vb: "0 0 200 380", parts: () =>
      leaf(40, 120, 100, 60) + leaf(30, 220, 90, 110) + leaf(50, 300, 70, 140) +
      calla(30, 160, 70, 110, 150, 80, 1.15) + calla(30, 230, 90, 210, 160, 190, 1) +
      rose(55, 150, 34) + rose(70, 250, 28) + blossom(110, 300, 12) + blossom(90, 320, 10) },
    "song-left": { vb: "0 0 200 420", parts: () =>
      calla(150, 410, 120, 260, 80, 90, 1.2) + calla(150, 410, 170, 260, 150, 120, 1) + calla(150, 410, 70, 300, 40, 200, .9) +
      leaf(150, 400, 70, -30) + rose(130, 380, 22) },
    "song-right": { vb: "0 0 220 380", parts: () =>
      stem(40, 370, 80, 220, 140, 60, 2.6) + leaf(90, 200, 70, 30) + leaf(70, 280, 60, -70) + leaf(110, 130, 50, 70) +
      rose(150, 70, 34) + rose(110, 160, 24) + blossom(160, 150, 10) },
    "song-bottom": { vb: "0 0 240 240", parts: () =>
      leaf(120, 180, 80, -120) + leaf(130, 180, 70, 120) + rose(90, 130, 36) + rose(150, 160, 30) + rose(70, 190, 26) + blossom(170, 110, 12) },
    story: { vb: "0 0 220 440", parts: () =>
      calla(110, 430, 60, 300, 50, 150, 1.25) + calla(110, 430, 80, 260, 110, 110, 1) + calla(110, 430, 150, 300, 160, 200, .9) +
      sprig(110, 420, 30, 360, 20, 300, 6) + leaf(110, 430, 80, -20) + blossom(150, 340, 14) + blossom(170, 370, 11) + rose(130, 380, 22) },
    "env2-left": { vb: "0 0 200 200", parts: () =>
      leaf(110, 120, 70, -110) + rose(100, 100, 52) + blossom(150, 150, 14) },
    "env2-right": { vb: "0 0 200 440", parts: () =>
      calla(60, 300, 80, 200, 110, 60, 1.25) + calla(60, 300, 120, 220, 170, 140, 1.05) + leaf(60, 300, 80, 30) +
      rose(70, 250, 28) + blossom(110, 270, 13) + sprig(80, 290, 110, 340, 100, 420, 6) + sprig(70, 300, 60, 360, 70, 410, 5) },
    paper: { vb: "0 0 220 220", parts: () =>
      leaf(40, 60, 60, 100) + leaf(50, 50, 50, 50) + blossom(70, 60, 16) + blossom(110, 40, 12) + blossom(100, 80, 10) +
      sprig(40, 50, 120, 40, 180, 90, 6) },
  };

  window.Flora = {
    render() {
      document.querySelectorAll("[data-flora]").forEach((el) => {
        const p = P[el.dataset.flora];
        if (!p) return;
        el.innerHTML = `<svg viewBox="${p.vb}" preserveAspectRatio="xMidYMid meet">${p.parts()}</svg>`;
      });
    },
    // Path lace berenda untuk tutup amplop krem
    lace(svg) {
      let out = "";
      const seg = (x1, y1, x2, y2, n) => {
        const dx = (x2 - x1) / n, dy = (y2 - y1) / n, len = Math.hypot(dx, dy);
        const nx = -dy / len, ny = dx / len; // normal ke luar
        for (let i = 0; i < n; i++) {
          const ax = x1 + dx * i, ay = y1 + dy * i;
          const mx = ax + dx / 2 + nx * len * .7, my = ay + dy / 2 + ny * len * .7;
          out += `<path class="lace-s" d="M${f(ax)} ${f(ay)} Q${f(mx)} ${f(my)} ${f(ax + dx)} ${f(ay + dy)}Z"/>`;
          out += `<circle class="hole" cx="${f(ax + dx / 2 + nx * len * .22)}" cy="${f(ay + dy / 2 + ny * len * .22)}" r="${f(len * .1)}"/>`;
        }
      };
      seg(0, 0, 200, 220, 20);
      seg(200, 220, 400, 0, 20);
      svg.innerHTML = out;
    },
  };
})();
