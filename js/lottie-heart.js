/* Lottie: hati berdenyut + cincin yang memudar (dipakai di section lagu) */
(function () {
  const ease = (n) => ({ i: { x: Array(n).fill(0.4), y: Array(n).fill(1) }, o: { x: Array(n).fill(0.6), y: Array(n).fill(0) } });
  const kf = (t, s, n = 3) => Object.assign({ t, s }, ease(n));
  const heartPath = {
    i: [[4, -16], [0, -18], [-12, -12], [0, 16]],
    o: [[-4, -16], [0, 16], [12, -12], [0, -18]],
    v: [[0, -16], [-36, -14], [0, 22], [36, -14]],
    c: true,
  };
  const tr = { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } };
  const layer = (ind, nm, ks, shapes) => ({ ddd: 0, ind, ty: 4, nm, sr: 1, ks, ao: 0, shapes, ip: 0, op: 90, st: 0, bm: 0 });
  const base = (extra) => Object.assign({ o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [100, 100, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } }, extra);

  window.LOTTIE_HEART = {
    v: "5.7.4", fr: 60, ip: 0, op: 90, w: 200, h: 200, nm: "heart-beat", ddd: 0, assets: [],
    layers: [
      layer(1, "heart", base({
        s: { a: 1, k: [kf(0, [100, 100, 100]), kf(12, [124, 124, 100]), kf(24, [104, 104, 100]), kf(36, [118, 118, 100]), kf(54, [100, 100, 100]), { t: 90, s: [100, 100, 100] }] },
      }), [{ ty: "gr", it: [
        { ty: "sh", ks: { a: 0, k: heartPath } },
        { ty: "fl", c: { a: 0, k: [0.957, 0.925, 0.878, 1] }, o: { a: 0, k: 100 }, r: 1 },
        tr,
      ] }]),
      layer(2, "ring", base({
        o: { a: 1, k: [kf(0, [70], 1), kf(50, [0], 1), { t: 90, s: [0] }] },
        s: { a: 1, k: [kf(0, [80, 80, 100]), kf(50, [190, 190, 100]), { t: 90, s: [190, 190, 100] }] },
      }), [{ ty: "gr", it: [
        { ty: "sh", ks: { a: 0, k: heartPath } },
        { ty: "st", c: { a: 0, k: [0.863, 0.737, 0.518, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2.5 }, lc: 2, lj: 2 },
        tr,
      ] }]),
    ],
  };
})();
