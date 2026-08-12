/* Revision — input, wiring and the frame loop. Boots last. */
window.RV = window.RV || {};

(function (RV) {
  "use strict";

  var CFG = RV.CFG, S = RV.S, $ = function (id) { return document.getElementById(id); };
  var cv = $("game"), ctx = cv.getContext("2d");

  cv.width = CFG.W;
  cv.height = CFG.H;

  S.reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  RV.Render.init(ctx);
  RV.UI.init();

  /* ---- language ---------------------------------------------------------- */
  function buildLangPicker() {
    var host = $("langs");
    host.innerHTML = "";
    RV.LANGS.forEach(function (L) {
      var b = document.createElement("button");
      b.className = "lang";
      b.textContent = L.label;
      b.title = L.name;
      b.setAttribute("aria-pressed", String(RV.getLang() === L.id));
      b.addEventListener("click", function () {
        if (RV.getLang() === L.id) return;
        RV.setLang(L.id);
        buildLangPicker();
        relabel();
        RV.Sfx.ui();
      });
      host.appendChild(b);
    });
  }

  /* Static nodes are handled by RV.applyStatic; these are the ones drawn
     from JS and so have to be rebuilt by hand. */
  function relabel() {
    $("mute").textContent = RV.t(RV.Sfx.isMuted() ? "ui.sound_off" : "ui.sound_on");
    RV.UI.paintBest();
    refresh();
    RV.UI.redrawLog();
    if (!$("armoury").hidden) RV.UI.drawArmoury();
    /* a draft open mid-switch would otherwise keep the old language's cards */
    if (!$("draft").hidden) RV.UI.openDraft();
  }

  RV.setLang(RV.detectLang());
  buildLangPicker();

  function refresh() {
    RV.UI.syncHud(); RV.UI.drawPalette();
    RV.UI.drawInspect(); RV.UI.drawContract();
  }

  function newRun() {
    RV.Game.reset();
    RV.UI.resetPanels();
  }

  /* ---- pointer ---------------------------------------------------------- */
  function cellFromEvent(ev) {
    var box = cv.getBoundingClientRect();
    /* the canvas is CSS-scaled, so map back through the real ratio */
    var x = (ev.clientX - box.left) * (CFG.W / box.width);
    var y = (ev.clientY - box.top) * (CFG.H / box.height);
    var c = Math.floor(x / CFG.CELL), r = Math.floor(y / CFG.CELL);
    if (c < 0 || r < 0 || c >= CFG.COLS || r >= CFG.ROWS) return null;
    return { c: c, r: r };
  }

  cv.addEventListener("mousemove", function (e) { S.hover = cellFromEvent(e); });
  cv.addEventListener("mouseleave", function () { S.hover = null; });

  cv.addEventListener("click", function (e) {
    if (S.phase === "over" || S.phase === "title" || S.phase === "paused" ||
        S.phase === "draft" || S.phase === "stamping") return;
    RV.Sfx.unlock();
    var cell = cellFromEvent(e);
    if (!cell) return;
    S.hover = cell;

    var existing = RV.Game.towerAt(cell.c, cell.r);
    if (existing) {
      S.picked = S.picked === existing ? null : existing;
      S.selected = null;
      RV.Sfx.ui();
      refresh();
      return;
    }
    S.picked = null;
    if (S.selected && RV.Game.place(cell.c, cell.r, S.selected)) refresh();
    else RV.UI.drawInspect();
  });

  /* ---- keyboard ---------------------------------------------------------- */
  document.addEventListener("keydown", function (e) {
    if (S.phase === "title" || S.phase === "over") return;
    if (e.key === "Escape") { S.selected = null; S.picked = null; refresh(); return; }
    if (e.key === "p" || e.key === "P") { togglePause(); return; }
    if (S.phase === "paused" || S.phase === "draft" || S.phase === "stamping") return;

    if (e.code === "Space") {
      e.preventDefault();
      if (S.phase === "build") { RV.Game.startWave(); refresh(); }
      return;
    }
    if (e.key === "c" || e.key === "C") {
      if (RV.Game.signContract()) refresh();
      return;
    }
    if (e.key === "t" || e.key === "T") {
      if (RV.Game.cycleMode(S.picked)) RV.UI.drawInspect();
      return;
    }
    if (e.key === "u" || e.key === "U") { if (RV.Game.upgrade(S.picked)) refresh(); return; }
    if (e.key === "r" || e.key === "R") { if (RV.Game.repair(S.picked)) refresh(); return; }
    if (e.key === "s" || e.key === "S") { if (RV.Game.sell(S.picked)) refresh(); return; }

    var map = { "1": "cannon", "2": "frost", "3": "sniper" };
    var t = map[e.key];
    if (t && S.G.unlocked[t]) {
      S.selected = S.selected === t ? null : t;
      S.picked = null;
      RV.Sfx.ui();
      refresh();
    }
  });

  function togglePause() {
    if (S.phase === "paused") { S.phase = S.prevPhase; $("paused").hidden = true; }
    else if (S.phase === "build" || S.phase === "wave") {
      S.prevPhase = S.phase; S.phase = "paused"; $("paused").hidden = false;
    } else return;
    RV.Sfx.ui();
    RV.UI.syncHud();
  }

  /* ---- buttons ------------------------------------------------------------ */
  $("start").addEventListener("click", function () {
    RV.Sfx.unlock(); RV.Game.startWave(); refresh();
  });
  $("again").addEventListener("click", newRun);
  $("pause").addEventListener("click", togglePause);
  $("resume").addEventListener("click", togglePause);
  $("abandon").addEventListener("click", function () {
    $("paused").hidden = true;
    RV.Game.gameOver(false);
  });
  $("begin").addEventListener("click", function () {
    RV.Sfx.unlock();
    $("title").hidden = true;
    newRun();
  });
  $("help-btn").addEventListener("click", function () { $("help").hidden = false; RV.Sfx.ui(); });
  $("how-title").addEventListener("click", function () { $("help").hidden = false; });
  $("help-close").addEventListener("click", function () { $("help").hidden = true; RV.Sfx.ui(); });

  $("armoury-title").addEventListener("click", RV.UI.openArmoury);
  $("armoury-over").addEventListener("click", RV.UI.openArmoury);
  $("armoury-close").addEventListener("click", function () {
    $("armoury").hidden = true; RV.Sfx.ui();
  });
  $("wipe").addEventListener("click", function () {
    if (window.confirm(RV.t("ui.wipe_confirm"))) {
      RV.Store.wipe();
      RV.UI.drawArmoury();
      RV.UI.paintBest();
    }
  });

  $("mute").addEventListener("click", function () {
    var m = RV.Sfx.toggle();
    $("mute").textContent = RV.t(m ? "ui.sound_off" : "ui.sound_on");
    $("mute").setAttribute("aria-pressed", String(m));
    if (!m) { RV.Sfx.unlock(); RV.Sfx.ui(); }
  });
  $("speed").addEventListener("click", function () {
    S.rate = S.rate === 1 ? 2 : S.rate === 2 ? 3 : 1;
    $("speed").textContent = S.rate + "\u00d7";
    RV.Sfx.ui();
  });

  /* ---- loop ---------------------------------------------------------------- */
  var last = (window.performance && performance.now) ? performance.now() : Date.now();
  var lastTowerCount = -1, lastPhase = "";

  function frame(now) {
    var dt = (now - last) / 1000;
    last = now;
    if (!(dt > 0)) dt = 0.016;
    dt = Math.min(dt, 0.05);

    if (S.phase === "wave") {
      for (var i = 0; i < S.rate && S.phase === "wave"; i++) RV.Game.update(dt);
    } else if (S.phase !== "paused" && S.phase !== "title") {
      S.tick += dt;
      RV.Game.decay(dt);
    }

    if (S.G) {
      /* gold counter eases toward its real value instead of snapping */
      S.shownGold = Math.abs(S.shownGold - S.G.gold) < 1
        ? S.G.gold : RV.lerp(S.shownGold, S.G.gold, 0.22);
      var el = $("v-gold"), v = String(Math.round(S.shownGold));
      if (el.textContent !== v) {
        el.textContent = v;
        RV.UI.drawPalette();
        RV.UI.drawInspect();
      }
      if (S.towers.length !== lastTowerCount) {
        lastTowerCount = S.towers.length;
        $("v-towers").textContent = lastTowerCount;
      }
      if (S.phase !== lastPhase) {
        lastPhase = S.phase;
        RV.UI.drawContract();
        RV.UI.syncHud();
      }
    }

    if (S.phase !== "title") RV.Render.frame();
    requestAnimationFrame(frame);
  }

  /* ---- boot ----------------------------------------------------------------- */
  RV.Game.reset();
  RV.UI.resetPanels();
  S.phase = "title";
  RV.applyStatic();
  RV.UI.paintBest();
  RV.UI.syncHud();
  requestAnimationFrame(frame);

}(window.RV));
