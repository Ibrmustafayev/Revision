/* Revision — persistence: best run, earned seals, purchased upgrades.
   Every path is wrapped: localStorage is blocked in some embedded previews
   and in private mode, and a save file is never worth a crash. The game runs
   fine with persistence dead, it just forgets everything between runs. */
window.RV = window.RV || {};

(function (RV) {
  "use strict";

  var KEY = "revision.save";
  var LEGACY = "revision.best";

  function blank() {
    return { best: null, seals: 0, upgrades: {} };
  }

  function normalise(raw) {
    var s = blank();
    if (!raw || typeof raw !== "object") return s;
    if (raw.best && typeof raw.best.wave === "number") s.best = raw.best;
    if (typeof raw.seals === "number" && isFinite(raw.seals)) s.seals = Math.max(0, raw.seals | 0);
    if (raw.upgrades && typeof raw.upgrades === "object") {
      RV.META.forEach(function (u) {
        var v = raw.upgrades[u.id];
        if (typeof v === "number" && v > 0) s.upgrades[u.id] = Math.min(u.max, v | 0);
      });
    }
    return s;
  }

  var cache = null;

  function read() {
    if (cache) return cache;
    var raw = null;
    try { raw = JSON.parse(window.localStorage.getItem(KEY)); } catch (e) { raw = null; }
    if (!raw) {
      /* migrate the old best-only key from earlier versions */
      try {
        var old = JSON.parse(window.localStorage.getItem(LEGACY));
        if (old && typeof old.wave === "number") raw = { best: old, seals: 0, upgrades: {} };
      } catch (e) {}
    }
    cache = normalise(raw);
    return cache;
  }

  function write() {
    try { window.localStorage.setItem(KEY, JSON.stringify(cache)); return true; }
    catch (e) { return false; }
  }

  RV.Store = {
    read: read,

    rank: function (id) { return read().upgrades[id] || 0; },
    seals: function () { return read().seals; },
    best: function () { return read().best; },

    /* Records the run and pays out seals. Returns { record, seals }. */
    finish: function (wave, kills) {
      var s = read();
      var earned = RV.sealsFor(wave, kills);
      var record = wave > 0 && (!s.best || wave > s.best.wave);
      if (record) s.best = { wave: wave, kills: kills };
      s.seals += earned;
      write();
      return { record: record, seals: earned };
    },

    /* Returns true if the purchase went through. */
    buy: function (id) {
      var s = read();
      var def = null;
      for (var i = 0; i < RV.META.length; i++) if (RV.META[i].id === id) def = RV.META[i];
      if (!def) return false;
      var rank = s.upgrades[id] || 0;
      if (rank >= def.max) return false;
      var price = def.cost(rank);
      if (s.seals < price) return false;
      s.seals -= price;
      s.upgrades[id] = rank + 1;
      write();
      return true;
    },

    wipe: function () {
      cache = blank();
      write();
    }
  };

}(window.RV));
