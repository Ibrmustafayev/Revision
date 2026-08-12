/* Revision — DOM side: readouts, panels, overlays, armoury. */
window.RV = window.RV || {};

(function (RV) {
  "use strict";

  var S = null;
  function $(id) { return document.getElementById(id); }

  function init() { S = RV.S; }

  function bump(id) {
    var el = $(id);
    el.classList.remove("pulse");
    void el.offsetWidth;
    el.classList.add("pulse");
  }

  /* ---- readouts -------------------------------------------------------- */
  function syncHud() {
    $("v-wave").textContent = S.G.wave;
    $("v-kills").textContent = S.G.kills;
    $("v-towers").textContent = S.towers.length;

    var btn = $("start");
    btn.disabled = S.phase !== "build";
    btn.textContent = S.phase === "wave"     ? "Wave " + S.G.wave + " running"
                    : S.phase === "paused"   ? "Paused"
                    : S.phase === "over"     ? "Run ended"
                    : (S.phase === "draft" || S.phase === "stamping") ? "Choose a revision"
                    : "Start wave " + (S.G.wave + 1);
    $("pause").disabled = !(S.phase === "build" || S.phase === "wave" || S.phase === "paused");
  }

  /* ---- wave contract ---------------------------------------------------- */
  function drawContract() {
    var host = $("contract");
    if (!S.contract) { host.innerHTML = '<p class="hint">No offer.</p>'; return; }

    if (S.takenContract) {
      host.innerHTML = '<div class="signed"><span class="cn"></span>' +
                       '<span class="ok">Signed \u2014 applies to the next wave</span></div>';
      host.querySelector(".cn").textContent = S.takenContract.name;
      return;
    }
    if (S.phase !== "build") {
      host.innerHTML = '<p class="hint">Offers arrive between waves.</p>';
      return;
    }

    host.innerHTML =
      '<div class="cname"></div>' +
      '<p class="terms"></p><p class="pay"></p>' +
      '<button class="sign">Sign the contract</button>';
    host.querySelector(".cname").textContent = S.contract.name;
    host.querySelector(".terms").textContent = "\u2212 " + S.contract.terms;
    host.querySelector(".pay").textContent = "+ " + S.contract.pay;
    host.querySelector(".sign").addEventListener("click", function () {
      if (RV.Game.signContract()) { drawContract(); syncHud(); }
    });
  }

  /* ---- emplacement palette ---------------------------------------------- */
  function drawPalette() {
    var host = $("palette");
    host.innerHTML = "";
    Object.keys(RV.TOWERS).forEach(function (id) {
      var spec = RV.TOWERS[id];
      var price = RV.Game.buildPrice(id);
      var unlocked = S.G.unlocked[id];
      var b = document.createElement("button");
      b.className = "tower-btn";
      b.disabled = !unlocked || S.G.gold < price;
      b.setAttribute("aria-pressed", String(S.selected === id));
      b.innerHTML = '<span class="row"><span class="nm"><span class="swatch"></span></span>' +
                    '<span class="ct"></span></span><span class="dt"></span>';
      b.querySelector(".swatch").style.background = spec.color;
      b.querySelector(".nm").append(unlocked ? spec.name : "Locked");
      b.querySelector(".ct").textContent = unlocked ? price : "\u2014";
      b.querySelector(".dt").textContent = unlocked
        ? spec.blurb + " " + Math.round(spec.hp * S.M.towerHp) + " hp."
        : "Earn this from a revision.";
      b.addEventListener("click", function () {
        RV.Sfx.unlock(); RV.Sfx.ui();
        S.selected = S.selected === id ? null : id;
        S.picked = null;
        drawPalette(); drawInspect();
      });
      host.appendChild(b);
    });
  }

  /* ---- selected emplacement ---------------------------------------------- */
  function drawInspect() {
    var host = $("inspect");
    var t = S.picked;
    if (!t) {
      host.innerHTML = '<p class="hint"></p>';
      host.firstChild.textContent = RV.t("inspect.hint");
      return;
    }
    var spec = RV.TOWERS[t.type], st = RV.Game.towerStats(t);
    var up = RV.Game.upgradePrice(t), rp = RV.Game.repairPrice(t), sv = RV.Game.sellValue(t);

    host.innerHTML =
      '<div class="hd"><span class="tn"></span><span class="tier"></span></div>' +
      '<div class="cond"><div class="bar"><i></i></div><span class="pct"></span></div>' +
      '<dl><dt class="l-dmg"></dt><dd class="d-dmg"></dd>' +
      '<dt class="l-rng"></dt><dd class="d-rng"></dd>' +
      '<dt class="l-cyc"></dt><dd class="d-cyc"></dd>' +
      '<dt class="l-inv"></dt><dd class="d-inv"></dd></dl>' +
      '<div class="modes" role="group"></div>' +
      '<p class="modehint"></p>' +
      '<div class="swampbox"></div>' +
      '<div class="acts"><button class="up"></button><button class="rp"></button>' +
      '<button class="sl"></button></div>';

    host.querySelector(".modes").setAttribute("aria-label", RV.t("inspect.targeting"));
    host.querySelector(".l-dmg").textContent = RV.t("inspect.damage");
    host.querySelector(".l-rng").textContent = RV.t("inspect.range");
    host.querySelector(".l-cyc").textContent = RV.t("inspect.cycle");
    host.querySelector(".l-inv").textContent = RV.t("inspect.invested");
    host.querySelector(".tn").textContent = RV.t("tower." + t.type);
    host.querySelector(".tn").style.color = spec.color;
    host.querySelector(".tier").textContent = RV.t("inspect.tier", {n: t.tier});

    var fill = host.querySelector(".bar i");
    fill.style.width = Math.round(t.hpPct * 100) + "%";
    fill.style.background = t.hpPct > 0.5 ? "var(--ok)" : t.hpPct > 0.25 ? "var(--brass)" : "var(--blood)";
    host.querySelector(".pct").textContent =
      Math.round(st.maxHp * t.hpPct) + " / " + Math.round(st.maxHp) + " hp";

    host.querySelector(".d-dmg").textContent = st.damage.toFixed(1);
    host.querySelector(".d-rng").textContent = Math.round(st.range);
    host.querySelector(".d-cyc").textContent = st.cool.toFixed(2) + "s";
    host.querySelector(".d-inv").textContent = t.spent;

    /* targeting priority */
    var modes = host.querySelector(".modes");
    RV.MODES.forEach(function (m) {
      var mb = document.createElement("button");
      mb.className = "mode";
      mb.textContent = RV.t("mode." + m.id);
      mb.setAttribute("aria-pressed", String(t.mode === m.id));
      mb.addEventListener("click", function () {
        t.mode = m.id;
        RV.Sfx.ui();
        drawInspect();
      });
      modes.appendChild(mb);
    });
    for (var mi = 0; mi < RV.MODES.length; mi++)
      if (RV.MODES[mi].id === t.mode)
        host.querySelector(".modehint").textContent = RV.t("mode." + t.mode + ".hint");

    var sbox = host.querySelector(".swampbox");
    if (t.swamp) {
      var sp = RV.Game.shorePrice(t);
      sbox.className = "swampbox on" + (t.sinkIn <= 1 ? " urgent" : "");
      sbox.innerHTML = '<p class="sw"></p><button class="shore"></button>';
      sbox.querySelector(".sw").textContent = t.sinkIn <= 1
        ? RV.t("swamp.sinking") : RV.t("swamp.sinks_in", {n: t.sinkIn});
      var shb = sbox.querySelector(".shore");
      shb.textContent = RV.t("swamp.shore", {n: sp});
      shb.disabled = S.G.gold < sp;
      shb.addEventListener("click", function () {
        if (RV.Game.shore(S.picked)) { syncHud(); drawPalette(); drawInspect(); }
      });
    } else {
      sbox.className = "swampbox";
      sbox.innerHTML = "";
    }

    var ub = host.querySelector(".up"), rb = host.querySelector(".rp"), sb = host.querySelector(".sl");
    ub.textContent = up === null ? RV.t("inspect.maxed") : RV.t("inspect.upgrade", {n: up});
    ub.disabled = up === null || S.G.gold < up;
    ub.addEventListener("click", function () {
      if (RV.Game.upgrade(S.picked)) { syncHud(); drawPalette(); drawInspect(); }
    });

    rb.textContent = S.M.noRepair ? RV.t("inspect.cursed")
                   : rp === null ? RV.t("inspect.intact") : RV.t("inspect.repair", {n: rp});
    rb.disabled = rp === null || S.G.gold < rp;
    rb.addEventListener("click", function () {
      if (RV.Game.repair(S.picked)) { syncHud(); drawPalette(); drawInspect(); }
    });

    sb.textContent = sv === null ? RV.t("inspect.cursed") : RV.t("inspect.sell", {n: sv});
    sb.disabled = sv === null;
    sb.addEventListener("click", function () {
      if (RV.Game.sell(S.picked)) { syncHud(); drawPalette(); drawInspect(); }
    });
  }

  /* ---- revision draft ------------------------------------------------------ */
  function openDraft() {
    var slots = 3 + S.M.extraDraft;
    var pool = RV.CARDS.filter(function (c) { return !(c.unlock && S.G.unlocked[c.unlock]); });
    var picks = [], bag = pool.slice();
    while (picks.length < slots && bag.length) picks.push(bag.splice((Math.random() * bag.length) | 0, 1)[0]);

    /* from wave 4 onward, one slot may be replaced by a curse */
    if (S.G.wave >= 4 && Math.random() < 0.28 && picks.length) {
      var curse = RV.pick(RV.CURSES);
      var seen = S.G.taken.indexOf(curse.id) === -1;
      if (seen) picks[(Math.random() * picks.length) | 0] = curse;
    }

    var host = $("draft-cards");
    host.innerHTML = "";
    host.className = "cards" + (slots > 3 ? " wide" : "");
    $("draft-sub").textContent = S.pendingDrafts > 1
      ? RV.t("draft.sub_many", {n: S.G.wave, c: S.pendingDrafts})
      : RV.t("draft.sub", {n: S.G.wave});

    picks.forEach(function (card) {
      var el = document.createElement("button");
      el.className = "card" + (card.curse ? " curse" : "");
      el.innerHTML = '<span class="rev"></span><span class="nm"></span><span class="ds"></span>' +
                     '<span class="terms"><span class="gain"></span><span class="toll"></span></span>';
      el.querySelector(".rev").textContent = card.curse
        ? RV.t("draft.curse")
        : RV.t("draft.revision", {n: String(S.revision + 1).padStart(2, "0")});
      el.querySelector(".nm").textContent = RV.t(card.k + ".name");
      el.querySelector(".ds").textContent = RV.t(card.k + ".desc");
      el.querySelector(".gain").textContent = "+ " + RV.t(card.k + ".gain");
      var toll = RV.t(card.k + ".toll");
      el.querySelector(".toll").textContent = toll ? "\u2212 " + toll : "";
      el.addEventListener("click", function () { takeCard(card, el); });
      host.appendChild(el);
    });

    $("draft").hidden = false;
    if (host.firstChild && host.firstChild.focus) host.firstChild.focus();
  }

  function takeCard(card, el) {
    if (!RV.Game.takeCard(card)) return;
    if (el) el.classList.add("stamped");
    logRevision(RV.t(card.k + ".name"), card.curse);
    setTimeout(function () {
      $("draft").hidden = true;
      if (RV.Game.consumeDraft()) {
        S.phase = "draft";
        openDraft();
      } else {
        S.phase = "build";
        RV.Game.offerContract();
        drawContract();
      }
      syncHud(); drawPalette(); drawInspect();
    }, S.reduceMotion ? 0 : 460);
  }

  function logRevision(name, cursed) {
    var log = $("log");
    if (log.querySelector(".empty")) log.innerHTML = "";
    var p = document.createElement("p");
    if (cursed) p.className = "cursed";
    var i = document.createElement("i");
    i.textContent = (cursed ? "\u2020" : "R" + String(S.revision).padStart(2, "0")) + " ";
    p.appendChild(i);
    p.appendChild(document.createTextNode(name));
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  /* ---- armoury ------------------------------------------------------------- */
  function openArmoury() {
    drawArmoury();
    $("armoury").hidden = false;
    RV.Sfx.ui();
  }

  function drawArmoury() {
    $("seals").textContent = RV.Store.seals();
    var host = $("upgrades");
    host.innerHTML = "";
    RV.META.forEach(function (u) {
      var rank = RV.Store.rank(u.id);
      var maxed = rank >= u.max;
      var price = maxed ? null : u.cost(rank);
      var row = document.createElement("div");
      row.className = "upgrade" + (maxed ? " maxed" : "");
      row.innerHTML =
        '<div class="ui-top"><span class="un"></span><span class="ur"></span></div>' +
        '<p class="ud"></p><button class="buy"></button>';
      row.querySelector(".un").textContent = RV.t(u.k + ".name");
      row.querySelector(".ur").textContent = rank + " / " + u.max;
      row.querySelector(".ud").textContent = RV.t(u.k + ".desc");
      var buy = row.querySelector(".buy");
      buy.textContent = maxed ? RV.t("armoury.complete") : RV.t("armoury.cost", {n: price});
      buy.disabled = maxed || RV.Store.seals() < price;
      buy.addEventListener("click", function () {
        if (RV.Store.buy(u.id)) { RV.Sfx.upgrade(); drawArmoury(); paintBest(); }
      });
      host.appendChild(row);
    });
  }

  /* ---- end of run ----------------------------------------------------------- */
  function openGameOver(cleared, result, breached) {
    $("over-title").textContent = RV.t(breached ? "over.gate_fell" : "over.abandoned");
    $("over-lede").textContent = RV.t(breached ? "over.lede_breach" : "over.lede_abandon");
    $("f-wave").textContent = cleared;
    $("f-kills").textContent = S.G.kills;
    $("f-towers").textContent = S.G.built;
    $("f-lost").textContent = S.G.lost;
    $("f-sunk").textContent = S.G.sunk || 0;
    $("f-cards").textContent = S.G.taken.length;
    $("f-curses").textContent = S.G.curses.length;
    $("f-contracts").textContent = S.G.contracts;
    $("f-seals").textContent = "+" + result.seals;
    $("record").hidden = !result.record;
    paintBest();
    $("over").hidden = false;
    syncHud();
  }

  function paintBest() {
    var b = RV.Store.best();
    $("best-line").textContent = b
      ? RV.t("hud.wave") + " " + b.wave + " \u00b7 " + b.kills + " " + RV.t("hud.kills")
      : RV.t("title.no_runs");
    $("seal-line").textContent = RV.t("armoury.cost", {n: RV.Store.seals()});
  }

  function resetPanels() {
    ["draft", "over", "paused", "help", "armoury"].forEach(function (id) { $(id).hidden = true; });
    $("log").innerHTML = '<p class="empty"></p>';
    $("log").firstChild.textContent = RV.t("log.empty");
    $("speed").textContent = "1\u00d7";
    drawPalette(); drawInspect(); drawContract(); syncHud();
  }

  RV.UI = {
    init: init, syncHud: syncHud, drawPalette: drawPalette, drawInspect: drawInspect,
    drawContract: drawContract, openDraft: openDraft, openGameOver: openGameOver,
    openArmoury: openArmoury, drawArmoury: drawArmoury,
    paintBest: paintBest, resetPanels: resetPanels, bump: bump, $: $
  };

}(window.RV));
