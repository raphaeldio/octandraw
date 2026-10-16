/* ==========================================================
   AUDIO — pemutar lagu untuk section "Play Our Favorite Song".
   - Jika CONFIG.song.src diisi  → memutar file audio tersebut.
   - Jika kosong                → memainkan melodi music-box (Web Audio).
   Keduanya lewat AnalyserNode supaya background satin ikut "bernapas".
   ========================================================== */
(function () {
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const BPM = 76, EIGHTH = 60 / BPM / 2, STEPS = 8 * 8; // 8 bar × 8 not 1/8
  const LOOP = STEPS * EIGHTH;
  const CHORDS = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [52, 55, 59], [53, 57, 60], [60, 64, 67], [53, 57, 60], [55, 59, 62]];
  const ARP = [0, 2, 3, 4, 5, 4, 3, 2];
  const MELODY = [76, 0, 79, 77, 74, 0, 71, 74, 72, 0, 76, 79, 79, 0, 76, 0, 77, 76, 74, 72, 76, 0, 72, 0, 74, 76, 77, 81, 79, 0, 0, 0];

  let ctx, master, analyser, freq, reverb;
  let el = null, srcNode = null;
  let playing = false, startAt = 0, pausedAt = 0, step = 0, nextTime = 0, timer = null;
  const listeners = [];
  const emit = () => listeners.forEach((fn) => fn());

  function impulse(sec) {
    const len = ctx.sampleRate * sec, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return buf;
  }

  function ensureCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    freq = new Uint8Array(analyser.frequencyBinCount);
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(analyser);
    analyser.connect(ctx.destination);

    if (CONFIG.song.src) {
      el = new Audio();
      el.crossOrigin = "anonymous";
      el.src = CONFIG.song.src;
      el.loop = true;
      el.addEventListener("loadedmetadata", emit);
      srcNode = ctx.createMediaElementSource(el);
      srcNode.connect(master);
    } else {
      reverb = ctx.createConvolver();
      reverb.buffer = impulse(2.8);
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      reverb.connect(wet).connect(master);
    }
  }

  function bell(m, t, vel) {
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(vel, t + 0.006);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    out.connect(master);
    out.connect(reverb);
    [[1, 1], [2, 0.28], [3.01, 0.08]].forEach(([mul, g]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = "sine";
      o.frequency.value = midi(m) * mul;
      og.gain.value = g;
      o.connect(og).connect(out);
      o.start(t);
      o.stop(t + 2.3);
    });
  }

  function pad(chord, t) {
    const dur = EIGHTH * 8;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.5);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.4);
    lp.connect(g).connect(master);
    g.connect(reverb);
    chord.forEach((m) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = midi(m - 12);
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.5);
    });
  }

  function scheduleStep(s, t) {
    const bar = Math.floor(s / 8), inBar = s % 8;
    const c = CHORDS[bar];
    const tones = [c[0], c[1], c[2], c[0] + 12, c[1] + 12, c[2] + 12];
    if (inBar === 0) { pad(c, t); bell(c[0] - 12, t, 0.12); }
    bell(tones[ARP[inBar]], t, 0.07);
    if (inBar % 2 === 0) {
      const mel = MELODY[bar * 4 + inBar / 2];
      if (mel) bell(mel, t + 0.01, 0.16);
    }
  }

  function tick() {
    while (nextTime < ctx.currentTime + 0.2) {
      scheduleStep(step, nextTime);
      step = (step + 1) % STEPS;
      nextTime += EIGHTH;
    }
  }

  function position() {
    if (el) return el.currentTime || 0;
    if (!ctx) return pausedAt;
    return playing ? (ctx.currentTime - startAt) % LOOP : pausedAt;
  }

  window.SongPlayer = {
    get playing() { return playing; },
    get duration() { return el ? (el.duration || 0) : LOOP; },
    get time() { return position(); },
    onChange(fn) { listeners.push(fn); },

    play() {
      ensureCtx();
      ctx.resume();
      if (playing) return;
      playing = true;
      if (el) {
        el.play();
      } else {
        const pos = pausedAt;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(0.55, ctx.currentTime);
        startAt = ctx.currentTime - pos;
        step = Math.ceil(pos / EIGHTH) % STEPS;
        nextTime = startAt + Math.ceil(pos / EIGHTH) * EIGHTH;
        tick();
        timer = setInterval(tick, 50);
      }
      emit();
    },

    pause() {
      if (!playing) return;
      playing = false;
      if (el) el.pause();
      else {
        pausedAt = (ctx.currentTime - startAt) % LOOP;
        clearInterval(timer);
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);      }
      emit();
    },

    toggle() { playing ? this.pause() : this.play(); },

    seek(frac) {
      frac = Math.min(Math.max(frac, 0), 0.999);
      if (el) { if (el.duration) el.currentTime = frac * el.duration; emit(); return; }
      const wasPlaying = playing;
      if (wasPlaying) { playing = false; clearInterval(timer); }
      pausedAt = frac * LOOP;
      if (wasPlaying) { master.gain.value = 0.55; this.play(); } else emit();
    },

    // 0..1 — kekuatan suara saat ini, untuk visual
    level() {
      if (!analyser || !playing) return 0;
      analyser.getByteFrequencyData(freq);
      let sum = 0;
      for (let i = 0; i < 48; i++) sum += freq[i];
      return Math.min(sum / (48 * 160), 1);
    },
  };
})();
