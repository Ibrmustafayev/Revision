/* Revision — game state and simulation.
   Rendering and DOM live elsewhere; this file only moves numbers around. */
window.RV = window.RV || {};

(function (RV) {
  "use strict";

  var CFG = RV.CFG, TOWERS = RV.TOWERS, TIERS = RV.TIERS, ENEMIES = RV.ENEMIES;

  var S = RV.S = {
    G: null, M: null, W: null,
    lanes: [], blocked: new Set(), noBuild: new Set(), swamp: new Set(),
    sunk: {}, wrecks: [], props: [], exit: [0, 0], strike: null, waveTime: 0,
    terrain: null,
    enemies: [], towers: [], shots: [], bits: [], floats: [], corpses: [], rings: [],
    phase: "title", prevPhase: "build", spawner: null,
    contract: null, takenContract: null, pendingDrafts: 0,
    selected: null, picked: null, hover: null,
    rate: 1, revision: 0, shake: 0, flash: 0, tick: 0, shownGold: 0,
    reduceMotion: false
  };

  /* ---- derived stats ------------------------------------------------ */
  function towerStats(t) {
    var s = TOWERS[t.type], k = TIERS[t.tier - 1];
    var dmg = s.damage * k.damage * S.M.damage;
    if (t.type === "frost") dmg *= S.M.frostDamage;
    return {
      damage: dmg,
      range:  s.range * k.range * S.M.range,
      cool:   s.cooldown / (k.fireRate * S.M.fireRate),
      maxHp:  s.hp * k.hp * S.M.towerHp
    };
  }
  function buildPrice(type) { return Math.round(TOWERS[type].cost * S.M.cost); }
  function upgradePrice(t)  { return t.tier >= 3 ? null
                              : Math.round(TOWERS[t.type].cost * TIERS[t.tier].price * S.M.cost); }
  /* resale scales with condition — a battered emplacement is worth less scrap */
  function sellValue(t)     { return S.M.noSell ? null : Math.round(t.spent * 0.6 * t.hpPct); }
  function repairPrice(t)   {
    if (S.M.noRepair || t.hpPct >= 0.999) return null;
    return Math.max(8, Math.round(t.spent * 0.5 * (1 - t.hpPct) * S.M.repair *
                                  Math.pow(CFG.REPAIR_STEP, t.repairs || 0)));
  }
  function isStunned(t) { return t.stunUntil > S.tick; }
  function onSwamp(c, r) { return S.swamp.has(RV.key(c, r)); }
  function shorePrice(t) {
    if (!t.swamp) return null;
    return Math.round((t.spent * CFG.SHORE_BASE + CFG.SHORE_FLAT) *
                      Math.pow(CFG.SHORE_STEP, t.shored || 0));
  }

  /* ---- setup -------------------------------------------------------- */
  function reset() {
    var purse  = RV.Store.rank("purse");
    var found  = RV.Store.rank("found");
    var crews  = RV.Store.rank("crews");

    S.G = { wave: 0, gold: CFG.START_GOLD + purse * 90, kills: 0, built: 0, lost: 0,
            unlocked: {
              cannon: true,
              frost: RV.Store.rank("orders") > 0,
              sniper: RV.Store.rank("fletch") > 0
            },
            taken: [], curses: [], contracts: 0 };

    S.M = { damage: 1 + crews * 0.10, fireRate: 1, range: 1, gold: 1, cost: 1,
            enemySpeed: 1, enemyHp: 1, pierce: 0, scavenge: 0,
            towerHp: 1 + found * 0.15, repair: 1, frostDamage: 1,
            noRepair: false, noSell: false,
            extraDraft: RV.Store.rank("draft") > 0 ? 1 : 0,
            waveDestroy: false, waveDecay: 0 };

    var seed = (Math.random() * 1e9) | 0;
    var rng = RV.mulberry32(seed);
    var map = RV.MAPS[(rng() * RV.MAPS.length) | 0];

    S.lanes = map.lanes.map(RV.makeLane);
    S.exit = map.exit;

    S.blocked = new Set();
    S.lanes.forEach(function (l) { l.cells.forEach(function (k) { S.blocked.add(k); }); });

    /* no-build ring around each spawn, so the entrances can't be camped */
    S.noBuild = new Set();
    S.lanes.forEach(function (l) {
      var o = l.pts[0];
      for (var c = 0; c < CFG.COLS; c++)
        for (var r = 0; r < CFG.ROWS; r++)
          if (Math.hypot(RV.cx(c) - o.x, RV.cy(r) - o.y) <= CFG.NO_BUILD * CFG.CELL)
            S.noBuild.add(RV.key(c, r));
    });

    /* Swamp: the marsh down the left edge. Buildable, but it eats what you
       put on it. Roads run through it as raised causeways and stay dry. */
    S.swamp = new Set();
    S.sunk = {};
    S.wrecks = [];
    for (var sc = 0; sc < CFG.SWAMP_COLS; sc++) {
      for (var sr = 0; sr < CFG.ROWS; sr++) {
        var sk = RV.key(sc, sr);
        if (!S.blocked.has(sk)) S.swamp.add(sk);
      }
    }

    /* scenery that also blocks building */
    S.props = [];
    var taken = new Set(), tries = 0;
    while (S.props.length < 11 && tries < 500) {
      tries++;
      var pc = (rng() * CFG.COLS) | 0, pr = (rng() * CFG.ROWS) | 0, k = RV.key(pc, pr);
      if (S.blocked.has(k) || taken.has(k) || S.swamp.has(k)) continue;
      var nearRoad = false;
      for (var dc = -1; dc <= 1; dc++)
        for (var dr = -1; dr <= 1; dr++)
          if (S.blocked.has(RV.key(pc + dc, pr + dr))) nearRoad = true;
      if (nearRoad && rng() < 0.75) continue;
      taken.add(k);
      S.props.push({ c: pc, r: pr, kind: rng() < 0.62 ? "tree" : "rock",
                     s: 0.85 + rng() * 0.4, seed: rng() * 999 });
    }
    S.props.forEach(function (p) { S.blocked.add(RV.key(p.c, p.r)); });

    S.terrain = RV.Terrain.paint(seed, S.lanes, S.blocked, S.props, S.exit, S.swamp);

    S.enemies = []; S.towers = []; S.shots = [];
    S.bits = []; S.floats = []; S.corpses = []; S.rings = [];
    S.selected = null; S.picked = null; S.hover = null; S.spawner = null;
    S.revision = 0; S.shake = 0; S.flash = 0; S.rate = 1; S.tick = 0;
    S.pendingDrafts = 0; S.takenContract = null;
    S.strike = null; S.waveTime = 0;
    S.shownGold = S.G.gold;
    S.phase = "build";
    offerContract();
  }

  /* ---- contracts ----------------------------------------------------- */
  function offerContract() {
    S.contract = RV.pick(RV.CONTRACTS);
    S.takenContract = null;
  }
  function signContract() {
    if (S.phase !== "build" || !S.contract || S.takenContract) return false;
    S.takenContract = S.contract;
    S.G.contracts++;
    RV.Sfx.stamp();
    return true;
  }

  /* ---- waves --------------------------------------------------------- */
  function waveSpec(n) {
    /* Health has to ACCELERATE, not grow at a fixed rate. Player power
       compounds (cards multiply, tiers multiply, tower count grows), so a
       flat exponent runs parallel to it and the player eventually pulls
       permanently ahead. The second term bends the curve upward past 12. */
    var late = n > 13 ? Math.pow(1.045, n - 13) : 1;
    return {
      perLane: 3 + Math.floor(n * 1.05),
      hp: 27 * Math.pow(1.185, n - 1) * late * S.M.enemyHp,
      /* Flat armour subtracted from every hit. This is the lever that
         punishes sprawling cheap towers and rewards upgrading instead.
         Held at zero for the first few waves so the opening stays fair. */
      armor: Math.max(0, (n - 5) * 0.45),
      speed: 50 + n * 1.3,
      reward: 9 + Math.floor(n * 0.62),
      gap: Math.max(0.22, 0.86 - n * 0.024),
      boss: n % 5 === 0 || (n >= 20 && n % 3 === 0)
    };
  }

  function startWave() {
    if (S.phase !== "build") return;
    S.G.wave++;
    S.phase = "wave";

    /* wave-scoped modifiers, from the contract if one was signed */
    S.W = { speed: 1, hp: 1, gold: 1, count: 1, revisions: 0,
            sappers: false, extraBoss: false, allWarded: false };
    if (S.takenContract) S.takenContract.apply(S.W);

    /* swamp: everything standing on it settles one wave deeper */
    for (var sk in S.sunk) {
      S.sunk[sk] -= 1;
      if (S.sunk[sk] <= 0) delete S.sunk[sk];
    }
    for (var sw = S.towers.length - 1; sw >= 0; sw--) {
      var st_ = S.towers[sw];
      if (!st_.swamp) continue;
      st_.sinkIn -= 1;
      if (st_.sinkIn <= 0 && !st_.sinking) { st_.sinking = 1.6; RV.Sfx.crumble(); }
    }

    /* the Harvester picks its moment */
    S.waveTime = 0;
    S.strike = null;
    var Z = RV.STRIKES.zone, L = RV.STRIKES.line;
    S.strike = null;
    if (S.G.wave >= L.from && Math.random() < L.chance)      S.strike = newStrike("line", L);
    else if (S.G.wave >= Z.from && Math.random() < Z.chance) S.strike = newStrike("zone", Z);

    /* curses that bite at the start of every wave */
    if (S.M.waveDecay > 0) {
      for (var d = S.towers.length - 1; d >= 0; d--) {
        S.towers[d].hpPct = Math.max(0, S.towers[d].hpPct - S.M.waveDecay);
        if (S.towers[d].hpPct <= 0) destroyTower(d);
      }
    }
    if (S.M.waveDestroy && S.towers.length) {
      var victim = (Math.random() * S.towers.length) | 0;
      addFloat(S.towers[victim].x, S.towers[victim].y - 34, RV.t("float.conscripted"), "#c8433b", 1.3, 12);
      destroyTower(victim);
    }

    var spec = waveSpec(S.G.wave);
    var count = Math.round(spec.perLane * S.W.count);

    var queues = S.lanes.map(function (_, li) {
      var q = [];
      for (var i = 0; i < count; i++) {
        var kind = "grunt";
        if (S.G.wave >= 2 && i % 3 === 2) kind = "runner";
        if (S.G.wave >= 3 && i % 5 === 4) kind = "brute";
        if (S.G.wave >= 4 && i % 4 === 1) kind = "sapper";
        if (S.G.wave >= 5 && i % 7 === 6) kind = "brood";
        if (S.G.wave >= 6 && i % 9 === 8) kind = "warded";
        if (S.G.wave >= 7 && i % 6 === 3) kind = "reson";
        if (S.W.sappers && i % 2 === 0) kind = "sapper";
        q.push(kind);
      }
      if (spec.boss && (S.G.wave % 10 === 0 || li === Math.floor(S.G.wave / 5) % 2)) q.push("boss");
      if (S.W.extraBoss) q.push("boss");
      return q;
    });

    S.spawner = { queues: queues, spec: spec, gap: spec.gap,
                  timers: S.lanes.map(function (_, i) { return i * 0.35; }) };
    RV.Sfx.wave();
  }

  function spawn(kind, spec, li) {
    var p = S.lanes[li].pts[0];
    var e = makeEnemy(kind, spec, li, p.x, p.y, 0, 0);
    S.enemies.push(e);
  }

  function makeEnemy(kind, spec, li, x, y, gen, dist) {
    var base = ENEMIES[kind];
    var shrink = Math.pow(0.55, gen);
    var hp = Math.max(1, Math.round(spec.hp * base.hpMul * S.W.hp * Math.pow(0.45, gen)));
    var e = {
      x: x, y: y, wp: 1, lane: li, dist: dist || 0, gen: gen || 0,
      slowUntil: 0, slowMul: 1, alive: true, angle: 0, flash: 0,
      bob: Math.random() * 6, kind: kind,
      hp: hp, maxHp: hp,
      speed: spec.speed * base.speedMul * S.W.speed * (1 + gen * 0.28),
      reward: Math.max(1, Math.round(spec.reward * base.rewardMul * S.W.gold * Math.pow(0.5, gen))),
      r: base.r * shrink, color: base.color,
      armor: (spec.armor || 0) * (base.armMul || 1) * Math.pow(0.5, gen),
      warded: kind === "warded" || S.W.allWarded,
      wardBrokenUntil: 0
    };
    /* place the fresh enemy at the right point on its lane */
    if (dist) {
      var at = RV.alongLane(S.lanes[li], dist);
      e.x = at.x; e.y = at.y; e.angle = at.ang;
      var lane = S.lanes[li];
      for (var w = 1; w < lane.pts.length; w++) {
        if (lane.segs[w - 1] && lane.segs[w - 1].at + lane.segs[w - 1].len >= dist) { e.wp = w; break; }
      }
    }
    if (kind === "boss") {
      var kit = (Math.floor(S.G.wave / 5) % 2 === 0) ? "warden" : "herald";
      e.boss = kit;
      e.color = RV.BOSSES[kit].color;
      e.abilityCd = RV.BOSSES[kit].cd;
    }
    return e;
  }

  /* ---- effects helpers ------------------------------------------------ */
  function kick(v) { if (!S.reduceMotion) S.shake = Math.min(24, S.shake + v); }

  function addFloat(x, y, text, color, life, size) {
    if (S.floats.length > 46) S.floats.shift();
    S.floats.push({ x: x, y: y, text: text, color: color, life: life,
                    size: size || 12, rise: size > 13 ? 16 : 28 });
  }

  function burst(x, y, n, color, size, speed) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = speed * (0.4 + Math.random());
      S.bits.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                    life: 0.35 + Math.random() * 0.35, color: color, size: size });
    }
  }

  /* ---- targeting ------------------------------------------------------ */
  function acquire(t, range) {
    var best = null, bestScore = -Infinity;
    for (var i = 0; i < S.enemies.length; i++) {
      var e = S.enemies[i];
      var d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d > range) continue;
      var score;
      switch (t.mode) {
        case "last":   score = -e.dist; break;
        case "strong": score = e.hp; break;
        case "close":  score = -d; break;
        default:       score = e.dist;   // "first"
      }
      if (score > bestScore) { bestScore = score; best = e; }
    }
    return best;
  }

  function nearestLive(x, y, within, exclude) {
    var best = null, bestD = within;
    for (var i = 0; i < S.enemies.length; i++) {
      var e = S.enemies[i];
      if (!e.alive || exclude.indexOf(e) !== -1) continue;
      var d = Math.hypot(e.x - x, e.y - y);
      if (d < bestD) { best = e; bestD = d; }
    }
    return best;
  }

  /* ---- sapper detonation ---------------------------------------------- */
  function detonate(e) {
    var spec = ENEMIES.sapper;
    var radius = spec.blastRadius * (e.r / spec.r);
    S.rings.push({ x: e.x, y: e.y, r: 8, max: radius, life: 0.42, maxLife: 0.42 });
    burst(e.x, e.y, 26, "#ffb457", 3.4, 210);
    kick(13);
    RV.Sfx.blast();

    for (var i = S.towers.length - 1; i >= 0; i--) {
      var t = S.towers[i];
      var d = Math.hypot(t.x - e.x, t.y - e.y);
      if (d > radius) continue;
      var dmg = spec.blastDamage * (1 - (d / radius) * 0.65);
      t.hpPct = Math.max(0, t.hpPct - dmg / towerStats(t).maxHp);
      t.hurt = 0.3;
      addFloat(t.x, t.y - 26, "-" + Math.round(dmg), "#ff7d5c", 0.7, 12);
      if (t.hpPct <= 0) destroyTower(i);
    }
  }

  /* Once it goes under it leaves a wreck: beams and iron riding the water
     until the ground firms up again. */
  function sinkTower(index) {
    var t = S.towers[index];
    var k = RV.key(t.c, t.r);
    S.sunk[k] = CFG.SUNK_LOCK;
    S.wrecks.push({ key: k, x: t.x, y: t.y, age: 0,
                    color: TOWERS[t.type].color, tier: t.tier,
                    bits: makeWreckBits() });
    burst(t.x, t.y + 10, 24, "#4b6b45", 3, 90);
    burst(t.x, t.y + 10, 14, "#8fb08a", 2.4, 140);
    addFloat(t.x, t.y - 30, RV.t("float.swallowed"), "#6f8f5a", 1.3, 13);
    if (S.picked === t) S.picked = null;
    S.towers.splice(index, 1);
    S.G.lost++;
    S.G.sunk = (S.G.sunk || 0) + 1;
    kick(9);
    RV.Sfx.crumble();
  }

  function makeWreckBits() {
    var out = [];
    for (var i = 0; i < 5; i++) {
      out.push({ kind: i < 3 ? "beam" : "iron",
                 ox: (Math.random() - 0.5) * 34,
                 oy: (Math.random() - 0.5) * 20,
                 len: 14 + Math.random() * 16,
                 rot: Math.random() * Math.PI,
                 ph: Math.random() * 6.28 });
    }
    return out;
  }

  function shore(t) {
    if (!t || !t.swamp) return false;
    var price = shorePrice(t);
    if (S.G.gold < price) return false;
    S.G.gold -= price;
    t.spent += Math.round(price * 0.4);
    t.shored = (t.shored || 0) + 1;
    t.sinkIn = CFG.SINK_WAVES;   /* a full two waves again, every time */
    RV.Sfx.repair();
    addFloat(t.x, t.y - 30, RV.t("float.shored"), "#8dc26f", 1.0, 12);
    return true;
  }

  /* EMP: silences nearby crews rather than killing them. Punishes clustering,
     which pulls directly against the sapper — that tension is the point. */
  function resonate(e) {
    var spec = ENEMIES.reson;
    S.rings.push({ x: e.x, y: e.y, r: 8, max: spec.empRadius,
                   life: 0.5, maxLife: 0.5, color: "#5fd6c0" });
    burst(e.x, e.y, 22, "#5fd6c0", 3, 190);
    kick(9);
    RV.Sfx.blast();
    var hit_ = 0;
    for (var i = 0; i < S.towers.length; i++) {
      var t = S.towers[i];
      if (Math.hypot(t.x - e.x, t.y - e.y) > spec.empRadius) continue;
      t.stunUntil = Math.max(t.stunUntil, S.tick + spec.empStun);
      hit_++;
    }
    if (hit_) addFloat(e.x, e.y - 34, RV.t("float.silenced", {n: hit_}), "#5fd6c0", 1.1, 13);
  }

  function destroyTower(index) {
    var t = S.towers[index];
    burst(t.x, t.y, 22, "#8a8578", 3, 150);
    addFloat(t.x, t.y - 30, RV.t("float.destroyed"), "#c8433b", 1.1, 13);
    if (S.picked === t) S.picked = null;
    S.towers.splice(index, 1);
    S.G.lost++;
    kick(10);
    RV.Sfx.crumble();
  }

  /* ---- damage ---------------------------------------------------------- */
  function hit(shot, e) {
    var dmg = shot.damage;
    var warded = e.warded && S.tick > e.wardBrokenUntil;

    if (shot.type === "frost" && warded) {
      /* Cryo is the only thing that strips a ward */
      e.wardBrokenUntil = S.tick + ENEMIES.warded.wardDown;
      warded = false;
      addFloat(e.x, e.y - e.r - 16, RV.t("float.ward"), "#7fc6e8", 0.85, 11);
      burst(e.x, e.y, 10, "#7fc6e8", 2.5, 110);
    }
    if (warded) dmg *= ENEMIES.warded.wardCut;
    /* flat reduction, floored at 15% so nothing is ever fully immune */
    if (e.armor > 0) dmg = Math.max(dmg * 0.15, dmg - e.armor);

    e.hp -= dmg;
    e.flash = 0.11;
    RV.Sfx.hit();
    addFloat(e.x + (Math.random() * 12 - 6), e.y - e.r - 4,
             String(Math.round(dmg)), warded ? "#8fa6c4" : "#f2ead2", 0.5, 11);
    burst(e.x, e.y, 4, shot.color, 2, 70);

    if (shot.type === "frost") {
      e.slowMul = TOWERS.frost.slow;
      e.slowUntil = Date.now() / 1000 + TOWERS.frost.slowFor;
    }
    if (e.hp <= 0 && e.alive) kill(e);
  }

  function kill(e) {
    e.alive = false;
    var idx = S.enemies.indexOf(e);
    if (idx >= 0) S.enemies.splice(idx, 1);

    var pay = Math.round(e.reward * S.M.gold);
    if (S.M.scavenge > 0 && Math.random() < S.M.scavenge) pay += 45;
    S.G.gold += pay;
    S.G.kills++;

    S.corpses.push({ x: e.x, y: e.y, r: e.r, color: e.color, life: 0.36, max: 0.36 });
    if (pay > 0) addFloat(e.x, e.y - e.r - 10, "+" + pay, "#d9a441", 0.85, e.kind === "boss" ? 17 : 12);
    burst(e.x, e.y, e.kind === "boss" ? 30 : e.kind === "brute" ? 14 : 8,
          e.color, e.kind === "boss" ? 4 : 2.6, 160);

    if (e.kind === "sapper") detonate(e);
    else if (e.kind === "reson") resonate(e);
    else if (e.kind === "brood" && e.gen < ENEMIES.brood.maxGen) split(e);
    else if (e.kind === "boss") { kick(16); RV.Sfx.boom(); }
    else RV.Sfx.kill();
  }

  function split(e) {
    if (!S.spawner && !S.enemies.length) { /* still fine — spawner may be done */ }
    var spec = S.spawner ? S.spawner.spec : waveSpec(S.G.wave);
    for (var i = 0; i < ENEMIES.brood.splits; i++) {
      var child = makeEnemy("brood", spec, e.lane, e.x, e.y, e.gen + 1,
                            Math.max(0, e.dist - 6 - i * 12));
      child.warded = e.warded;
      S.enemies.push(child);
    }
    burst(e.x, e.y, 12, "#8fd6a0", 2.4, 130);
  }

  /* ---- the Harvester ------------------------------------------------------ */
  function newStrike(kind, cfg) {
    var s_ = { kind: kind, cfg: cfg, at: 3.0 + Math.random() * 5.0,
               state: "waiting", t: 0 };
    if (kind === "zone") {
      /* aim where you actually built — the beam hunts clusters */
      var target = S.towers.length
        ? S.towers[(Math.random() * S.towers.length) | 0]
        : { c: 4 + ((Math.random() * 7) | 0), r: 2 + ((Math.random() * 6) | 0) };
      s_.c = RV.clamp(target.c, cfg.span, CFG.COLS - 1 - cfg.span);
      s_.r = RV.clamp(target.r, cfg.span, CFG.ROWS - 1 - cfg.span);
    } else {
      /* a lance drawn from an edge through to the gate */
      var edge = Math.random();
      s_.ax = edge < 0.5 ? -40 : RV.cx((Math.random() * CFG.COLS) | 0);
      s_.ay = edge < 0.5 ? RV.cy((Math.random() * CFG.ROWS) | 0)
                         : (Math.random() < 0.5 ? -40 : CFG.H + 40);
      s_.bx = RV.cx(S.exit[0]); s_.by = RV.cy(S.exit[1]);
    }
    return s_;
  }

  function strikeTick(dt) {
    var k = S.strike;
    if (!k) return;
    if (k.state === "waiting") {
      if (S.waveTime >= k.at) { k.state = "warning"; k.t = 0; RV.Sfx.wave(); }
      return;
    }
    k.t += dt;
    if (k.state === "warning") {
      if (k.t >= k.cfg.warn) { k.state = "firing"; k.t = 0; fireStrike(k); }
      return;
    }
    if (k.t > 0.7) S.strike = null;
  }

  function inStrike(k, t) {
    if (k.kind === "zone") {
      return Math.abs(t.c - k.c) <= k.cfg.span && Math.abs(t.r - k.r) <= k.cfg.span;
    }
    var vx = k.bx - k.ax, vy = k.by - k.ay;
    var len2 = vx * vx + vy * vy;
    var u = RV.clamp(((t.x - k.ax) * vx + (t.y - k.ay) * vy) / len2, 0, 1);
    return Math.hypot(t.x - (k.ax + vx * u), t.y - (k.ay + vy * u)) <= k.cfg.half;
  }

  function fireStrike(k) {
    kick(k.kind === "line" ? 22 : 16);
    S.flash = 0.22;
    RV.Sfx.boom();
    for (var i = S.towers.length - 1; i >= 0; i--) {
      var t = S.towers[i];
      if (!inStrike(k, t)) continue;
      var max = towerStats(t).maxHp;
      var dmg = max * k.cfg.damage;
      t.hpPct = Math.max(0, t.hpPct - k.cfg.damage);
      t.hurt = 0.5;
      addFloat(t.x, t.y - 28, "-" + Math.round(dmg), "#7dffb0", 0.9, 13);
      burst(t.x, t.y, 16, "#7dffb0", 3, 150);
      if (t.hpPct <= 0) destroyTower(i);
    }
  }

  /* ---- boss kits -------------------------------------------------------- */
  function bossTick(e, dt) {
    var kit = RV.BOSSES[e.boss];
    e.abilityCd -= dt;
    if (e.abilityCd > 0) return;
    e.abilityCd = kit.cd;

    if (e.boss === "warden") {
      var target = null, bestD = kit.reach;
      for (var i = 0; i < S.towers.length; i++) {
        var t = S.towers[i];
        if (isStunned(t)) continue;
        var d = Math.hypot(t.x - e.x, t.y - e.y);
        if (d < bestD) { bestD = d; target = t; }
      }
      if (target) {
        target.stunUntil = S.tick + kit.stun;
        addFloat(target.x, target.y - 34, RV.t("float.silenced", {n: 1}), "#c86fd0", 1.0, 12);
        S.rings.push({ x: e.x, y: e.y, r: 8, max: bestD, life: 0.35, maxLife: 0.35, color: "#c86fd0" });
        RV.Sfx.ui();
      }
    } else {
      var healed = 0;
      for (var j = 0; j < S.enemies.length; j++) {
        var o = S.enemies[j];
        if (o.hp >= o.maxHp) continue;
        if (Math.hypot(o.x - e.x, o.y - e.y) > kit.reach) continue;
        o.hp = Math.min(o.maxHp, o.hp + o.maxHp * kit.heal);
        healed++;
      }
      if (healed) S.rings.push({ x: e.x, y: e.y, r: kit.reach * 0.6, max: kit.reach,
                                 life: 0.3, maxLife: 0.3, color: "#8fd6a0" });
    }
  }

  /* ---- main step --------------------------------------------------------- */
  function update(dt) {
    S.tick += dt;
    S.waveTime += dt;
    strikeTick(dt);

    if (S.spawner) {
      var pending = 0;
      for (var li = 0; li < S.spawner.queues.length; li++) {
        var q = S.spawner.queues[li];
        pending += q.length;
        if (!q.length) continue;
        S.spawner.timers[li] -= dt;
        if (S.spawner.timers[li] <= 0) {
          spawn(q.shift(), S.spawner.spec, li);
          S.spawner.timers[li] = S.spawner.gap;
        }
      }
      if (pending === 0 && !S.enemies.length) { S.spawner = null; endWave(); return; }
    }

    var now = Date.now() / 1000;

    /* enemies */
    for (var i = S.enemies.length - 1; i >= 0; i--) {
      var e = S.enemies[i];
      var lane = S.lanes[e.lane];
      if (now > e.slowUntil) e.slowMul = 1;
      if (e.flash > 0) e.flash -= dt;
      if (e.boss) bossTick(e, dt);

      var left = e.speed * S.M.enemySpeed * e.slowMul * dt;
      e.dist += left;
      /* consume the step across waypoints so corners never overshoot */
      while (left > 0 && e.wp < lane.pts.length) {
        var t = lane.pts[e.wp];
        var dx = t.x - e.x, dy = t.y - e.y, d = Math.hypot(dx, dy);
        if (d <= left) { e.x = t.x; e.y = t.y; left -= d; e.wp++; }
        else { e.angle = Math.atan2(dy, dx); e.x += dx / d * left; e.y += dy / d * left; left = 0; }
      }
      if (e.wp >= lane.pts.length) { breach(e); return; }
    }

    /* towers */
    for (var wk = S.wrecks.length - 1; wk >= 0; wk--) {
      S.wrecks[wk].age += dt;
      if (!S.sunk[S.wrecks[wk].key] && S.wrecks[wk].age > 1.2) S.wrecks.splice(wk, 1);
    }

    for (var ti = S.towers.length - 1; ti >= 0; ti--) {
      var tw = S.towers[ti];
      if (tw.sinking > 0) {
        tw.sinking -= dt;
        if (Math.random() < dt * 12)
          burst(tw.x + (Math.random() - .5) * 26, tw.y + 14, 2, "#9fc0a0", 2, 40);
        if (tw.sinking <= 0) sinkTower(ti);
        continue;
      }
      if (tw.flash > 0) tw.flash -= dt;
      if (tw.hurt > 0) tw.hurt -= dt;
      if (tw.recoil > 0) tw.recoil = Math.max(0, tw.recoil - dt * 6);
      var st = towerStats(tw);
      tw.cd -= dt;
      if (isStunned(tw)) continue;

      var best = acquire(tw, st.range);
      if (best) {
        var want = Math.atan2(best.y - tw.y, best.x - tw.x);
        var diff = want - tw.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        tw.angle += diff * Math.min(1, dt * 11);
      }
      if (tw.cd > 0 || !best) continue;

      tw.cd = st.cool;
      tw.flash = 0.08;
      tw.recoil = 1;
      RV.Sfx.shot(tw.type);
      var spec = TOWERS[tw.type];
      S.shots.push({
        x: tw.x + Math.cos(tw.angle) * 20, y: tw.y + Math.sin(tw.angle) * 20,
        target: best, speed: spec.shot, damage: st.damage, color: spec.color,
        pierce: S.M.pierce, hit: [], type: tw.type, trail: []
      });
    }

    /* projectiles — always aim at the target's CURRENT position */
    for (var si = S.shots.length - 1; si >= 0; si--) {
      var s = S.shots[si];
      if (!s.target || !s.target.alive) {
        var next = nearestLive(s.x, s.y, 150, s.hit);
        if (!next) { S.shots.splice(si, 1); continue; }
        s.target = next;
      }
      var sdx = s.target.x - s.x, sdy = s.target.y - s.y, sd = Math.hypot(sdx, sdy);
      var step = s.speed * dt;
      s.trail.unshift({ x: s.x, y: s.y });
      if (s.trail.length > 6) s.trail.pop();
      if (sd <= step + s.target.r) {
        hit(s, s.target);
        s.hit.push(s.target);
        if (s.pierce > 0) {
          var nx = nearestLive(s.target.x, s.target.y, 165, s.hit);
          if (nx) { s.pierce--; s.damage *= 0.5; s.x = s.target.x; s.y = s.target.y; s.target = nx; continue; }
        }
        S.shots.splice(si, 1);
      } else { s.x += sdx / sd * step; s.y += sdy / sd * step; }
    }

    decay(dt);
  }

  function decay(dt) {
    for (var i = S.bits.length - 1; i >= 0; i--) {
      var b = S.bits[i];
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.vx *= 0.94; b.vy *= 0.94;
      b.life -= dt;
      if (b.life <= 0) S.bits.splice(i, 1);
    }
    for (var f = S.floats.length - 1; f >= 0; f--) {
      S.floats[f].y -= S.floats[f].rise * dt;
      S.floats[f].life -= dt;
      if (S.floats[f].life <= 0) S.floats.splice(f, 1);
    }
    for (var c = S.corpses.length - 1; c >= 0; c--) {
      S.corpses[c].life -= dt;
      if (S.corpses[c].life <= 0) S.corpses.splice(c, 1);
    }
    for (var r = S.rings.length - 1; r >= 0; r--) {
      var ring = S.rings[r];
      ring.life -= dt;
      ring.r = ring.max * (1 - ring.life / ring.maxLife);
      if (ring.life <= 0) S.rings.splice(r, 1);
    }
    if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 34);
    if (S.flash > 0) S.flash = Math.max(0, S.flash - dt);
  }

  /* ---- terminal states ---------------------------------------------------- */
  function breach(e) {
    e.alive = false;
    var idx = S.enemies.indexOf(e);
    if (idx >= 0) S.enemies.splice(idx, 1);
    S.flash = 0.5;
    kick(22);
    RV.Sfx.dead();
    gameOver(true);
  }

  function endWave() {
    S.phase = "draft";
    S.shots.length = 0;
    S.pendingDrafts = 1 + (S.W ? S.W.revisions : 0);
    RV.UI.openDraft();
  }

  function gameOver(breached) {
    S.phase = "over";
    var cleared = Math.max(0, S.G.wave - (breached ? 1 : 0));
    var result = RV.Store.finish(cleared, S.G.kills);
    RV.UI.openGameOver(cleared, result, breached);
  }

  function takeCard(card) {
    if (S.phase !== "draft") return false;
    S.phase = "stamping";
    card.apply(S);
    S.revision++;
    S.G.taken.push(card.id);
    if (card.curse) S.G.curses.push(card.id);
    RV.Sfx.stamp();
    return true;
  }

  /* Called after a card is taken; true if another draft is owed. */
  function consumeDraft() {
    S.pendingDrafts = Math.max(0, S.pendingDrafts - 1);
    return S.pendingDrafts > 0;
  }

  /* ---- placement / economy ------------------------------------------------- */
  function canPlace(c, r, type) {
    if (!type || !S.G.unlocked[type]) return false;
    var k = RV.key(c, r);
    if (S.blocked.has(k) || S.noBuild.has(k) || S.sunk[k]) return false;
    for (var i = 0; i < S.towers.length; i++)
      if (S.towers[i].c === c && S.towers[i].r === r) return false;
    return S.G.gold >= buildPrice(type);
  }

  function place(c, r, type) {
    if (!canPlace(c, r, type)) return null;
    var price = buildPrice(type);
    S.G.gold -= price;
    S.G.built++;
    var t = { c: c, r: r, x: RV.cx(c), y: RV.cy(r), type: type,
              tier: 1, spent: price, cd: 0, angle: -Math.PI / 2,
              flash: 0, recoil: 0, hurt: 0, hpPct: 1,
              mode: "first", stunUntil: -1,
              swamp: onSwamp(c, r), sinkIn: CFG.SINK_WAVES, shored: 0,
              repairs: 0, sinking: 0 };
    S.towers.push(t);
    burst(t.x, t.y + 12, 10, "#9c8b6a", 2.5, 60);
    RV.Sfx.place();
    return t;
  }

  function upgrade(t) {
    if (!t || t.tier >= 3) return false;
    var price = upgradePrice(t);
    if (S.G.gold < price) return false;
    S.G.gold -= price;
    t.spent += price;
    t.tier++;
    RV.Sfx.upgrade();
    addFloat(t.x, t.y - 28, RV.t("float.tier", {n: t.tier}), "#d9a441", 0.95, 13);
    return true;
  }

  function repair(t) {
    if (!t) return false;
    var price = repairPrice(t);
    if (price === null || S.G.gold < price) return false;
    S.G.gold -= price;
    t.spent += Math.round(price * 0.5);
    t.repairs = (t.repairs || 0) + 1;
    t.hpPct = 1;
    RV.Sfx.repair();
    addFloat(t.x, t.y - 28, RV.t("float.repaired"), "#8dc26f", 0.95, 12);
    return true;
  }

  function sell(t) {
    if (!t) return false;
    var value = sellValue(t);
    if (value === null) return false;
    S.G.gold += value;
    addFloat(t.x, t.y - 28, "+" + value, "#d9a441", 0.95, 13);
    S.towers.splice(S.towers.indexOf(t), 1);
    if (S.picked === t) S.picked = null;
    RV.Sfx.sell();
    return true;
  }

  function cycleMode(t) {
    if (!t) return false;
    var ids = RV.MODES.map(function (m) { return m.id; });
    t.mode = ids[(ids.indexOf(t.mode) + 1) % ids.length];
    RV.Sfx.ui();
    return true;
  }

  function towerAt(c, r) {
    for (var i = 0; i < S.towers.length; i++)
      if (S.towers[i].c === c && S.towers[i].r === r) return S.towers[i];
    return null;
  }

  RV.Game = {
    reset: reset, update: update, decay: decay, startWave: startWave,
    towerStats: towerStats, buildPrice: buildPrice, upgradePrice: upgradePrice,
    sellValue: sellValue, repairPrice: repairPrice, isStunned: isStunned,
    canPlace: canPlace, place: place, upgrade: upgrade, repair: repair,
    shore: shore, shorePrice: shorePrice, onSwamp: onSwamp,
    sell: sell, cycleMode: cycleMode, towerAt: towerAt,
    takeCard: takeCard, consumeDraft: consumeDraft,
    offerContract: offerContract, signContract: signContract,
    gameOver: gameOver, waveSpec: waveSpec
  };

}(window.RV));
