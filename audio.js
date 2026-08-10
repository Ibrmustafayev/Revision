/* Revision — synthesized audio. No sound files: everything is oscillators
   and filtered noise buffers built at call time. */
window.RV = window.RV || {};

(function (RV) {
  "use strict";

  var ac = null, master = null, muted = false, lastShot = 0;

  function ready() {
    if (ac) {
      if (ac.state === "suspended") { try { ac.resume(); } catch (e) {} }
      return true;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ac = new AC();
      master = ac.createGain();
      master.gain.value = 0.2;
      master.connect(ac.destination);
    } catch (e) { ac = null; return false; }
    return true;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted || !ready()) return;
    try {
      var t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }

  function noise(dur, vol, freq, q) {
    if (muted || !ready()) return;
    try {
      var t = ac.currentTime, n = Math.max(1, Math.floor(ac.sampleRate * dur));
      var buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      var src = ac.createBufferSource(); src.buffer = buf;
      var f = ac.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = freq || 900; f.Q.value = q || 1;
      var g = ac.createGain(); g.gain.value = vol || 0.3;
      src.connect(f); f.connect(g); g.connect(master); src.start(t);
    } catch (e) {}
  }

  RV.Sfx = {
    unlock: ready,
    toggle: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; },

    shot: function (type) {
      var now = Date.now() / 1000;
      if (now - lastShot < 0.04) return;   // stop a wall of towers becoming a wall of noise
      lastShot = now;
      if (type === "sniper")      tone(230, 0.17, "sawtooth", 0.24, 66);
      else if (type === "frost")  tone(900, 0.09, "triangle", 0.15, 1600);
      else                        tone(400, 0.07, "square",   0.16, 180);
    },
    hit:      function () { noise(0.05, 0.11, 1500, 1.2); },
    kill:     function () { noise(0.17, 0.26, 400, 0.8); tone(170, 0.12, "sawtooth", 0.14, 58); },
    boom:     function () { noise(0.55, 0.40, 160, 0.5); tone(85, 0.45, "sawtooth", 0.26, 32); },
    blast:    function () { noise(0.40, 0.38, 260, 0.6); tone(120, 0.34, "square", 0.24, 44); },
    crumble:  function () { noise(0.6, 0.34, 320, 0.5); tone(110, 0.5, "sawtooth", 0.2, 40); },
    place:    function () { noise(0.08, 0.2, 500, 1); tone(300, 0.09, "square", 0.16, 180); },
    repair:   function () { [420, 560].forEach(function (f, i) {
                  setTimeout(function () { noise(0.05, 0.16, 900, 1.4); tone(f, 0.07, "square", 0.16); }, i * 90); }); },
    upgrade:  function () { [480, 660, 900].forEach(function (f, i) {
                  setTimeout(function () { tone(f, 0.09, "triangle", 0.24); }, i * 60); }); },
    sell:     function () { tone(620, 0.12, "triangle", 0.2, 270); },
    wave:     function () { tone(220, 0.22, "sawtooth", 0.2, 300);
                            setTimeout(function () { tone(330, 0.3, "sawtooth", 0.2); }, 170); },
    stamp:    function () { noise(0.09, 0.32, 650, 0.7); tone(140, 0.15, "square", 0.2, 84); },
    ui:       function () { tone(660, 0.035, "triangle", 0.1); },
    dead:     function () { [380, 310, 240, 165].forEach(function (f, i) {
                  setTimeout(function () { tone(f, 0.32, "sawtooth", 0.22, f * 0.6); }, i * 155); }); }
  };

}(window.RV));
