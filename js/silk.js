/* ==========================================================
   SILK — background satin merah marun (Three.js shader)
   seperti kain bergelombang pada gambar referensi.
   ========================================================== */
(function () {
  const canvas = document.getElementById("silk");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2() },
    uScroll: { value: 0 },
    uPulse: { value: 0 },
    uDim: { value: 0 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime, uScroll, uPulse, uDim;
      uniform vec2 uRes;

      float fold(vec2 p, float t){
        float h = 0.0;
        h += sin(p.y * 2.2 + p.x * 0.9 + t * 0.35) * 0.55;
        h += sin(p.y * 4.1 - p.x * 1.6 + t * 0.22 + sin(p.x * 1.3 + t * .15) * 1.4) * 0.28;
        h += sin(p.y * 7.5 + p.x * 2.8 - t * 0.4) * 0.09;
        return h;
      }

      void main(){
        vec2 p = vUv;
        p.x *= uRes.x / uRes.y;
        p *= 3.2;
        p.y += uScroll * 0.6;
        float t = uTime;
        float e = 0.004;
        float h  = fold(p, t);
        float hx = fold(p + vec2(e, 0.0), t);
        float hy = fold(p + vec2(0.0, e), t);
        vec3 n = normalize(vec3((h - hx) / e * 0.13, (h - hy) / e * 0.13, 1.0));
        vec3 l = normalize(vec3(-0.35, 0.55, 0.75));
        float diff = clamp(dot(n, l), 0.0, 1.0);
        float spec = pow(clamp(dot(reflect(-l, n), vec3(0., 0., 1.)), 0.0, 1.0), 18.0);

        vec3 deep = vec3(0.13, 0.008, 0.03);
        vec3 wine = vec3(0.42, 0.04, 0.09);
        vec3 col = mix(deep, wine, smoothstep(0.2, 1.0, diff));
        col += vec3(0.6, 0.18, 0.2) * spec * (0.5 + uPulse * 0.7);
        // vignette
        float v = smoothstep(1.25, 0.25, length(vUv - 0.5) * 1.6);
        col *= mix(0.55, 1.0, v);
        col *= 1.0 - uDim * 0.35;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", resize);
  resize();

  let pulse = 0, last = 0;
  window.Silk = {
    uniforms,
    render(time) {
      const dt = Math.min(time - last, 0.1);
      last = time;
      const lvl = window.SongPlayer ? SongPlayer.level() : 0;
      pulse += (lvl - pulse) * 0.08;
      uniforms.uPulse.value = pulse;
      uniforms.uTime.value += dt * (1 + pulse * 1.2);
      renderer.render(scene, camera);
    },
  };
})();
