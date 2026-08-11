/* Revision — configuration, data tables and small helpers.
   Everything hangs off the global RV namespace so the files can be plain
   <script> tags (ES modules break when you open index.html from file://). */
window.RV = window.RV || {};

(function (RV) {
  "use strict";

  /* ---- board ------------------------------------------------------- */
  RV.CFG = {
    CELL: 60,
    COLS: 15,
    ROWS: 10,
    ROAD: 50,
    NO_BUILD: 2.4,      // radius, in cells, around each spawn where you can't build
    START_GOLD: 420,
    SWAMP_COLS: 4,        // the marsh runs down the left edge of every map
    SINK_WAVES: 2,        // waves an emplacement survives on swamp
    SUNK_LOCK: 1,         // waves the square stays unusable after it goes under
    SHORE_BASE: 0.70,     // shoring costs this share of everything invested...
    SHORE_FLAT: 50,       // ...plus a flat fee, so it always beats a fresh build
    SHORE_STEP: 1.45,     // and 45% more each time. Swamp is never a home.
    REPAIR_STEP: 1.60     // every repair on the same emplacement costs 60% more
  };
  RV.CFG.W = RV.CFG.CELL * RV.CFG.COLS;   // 900
  RV.CFG.H = RV.CFG.CELL * RV.CFG.ROWS;   // 600

  /* ---- maps -------------------------------------------------------- */
  /* Two lanes per map. Both enter from the left, converge at a junction,
     then share one trunk to a single exit on the right. The waypoint lists
     overlap from the junction onward — that IS the merge. */
  RV.MAPS = [
    { lanes: [ [[-1, 1], [3, 1], [3, 3], [8, 3], [8, 5], [15, 5]],
               [[-1, 8], [3, 8], [3, 7], [8, 7], [8, 5], [15, 5]] ], exit: [14, 5] },
    { lanes: [ [[-1, 2], [2, 2], [2, 5], [6, 5], [6, 2], [10, 2], [10, 4], [15, 4]],
               [[-1, 7], [4, 7], [4, 9], [8, 9], [8, 6], [10, 6], [10, 4], [15, 4]] ], exit: [14, 4] },
    { lanes: [ [[-1, 4], [3, 4], [3, 1], [7, 1], [7, 6], [15, 6]],
               [[-1, 9], [3, 9], [3, 7], [7, 7], [7, 6], [15, 6]] ], exit: [14, 6] }
  ];

  /* ---- emplacements ------------------------------------------------ */
  RV.TOWERS = {
    cannon: {
      name: "Bastion", cost: 80, range: 150, damage: 14, cooldown: 0.68,
      shot: 470, hp: 130, color: "#d9a441",
      blurb: "Steady stonework. Reliable at anything."
    },
    frost: {
      name: "Cryo", cost: 120, range: 130, damage: 6, cooldown: 0.85,
      shot: 410, hp: 95, color: "#7fc6e8", slow: 0.55, slowFor: 1.6,
      blurb: "Slows what it hits by 45%, and strips wards."
    },
    sniper: {
      name: "Lance", cost: 190, range: 300, damage: 54, cooldown: 1.95,
      shot: 1000, hp: 85, color: "#e2703a",
      blurb: "Long reach, heavy hit, slow to cycle. Fragile."
    }
  };

  /* tier 1 is as-built; 2 and 3 are bought */
  RV.TIERS = [
    { damage: 1,    range: 1,    fireRate: 1,    hp: 1,   price: 0 },
    { damage: 1.75, range: 1.10, fireRate: 1.15, hp: 1.4, price: 1.15 },
    { damage: 3.10, range: 1.22, fireRate: 1.35, hp: 1.9, price: 2.30 }
  ];

  /* how each emplacement chooses among the enemies in range */
  RV.MODES = [
    { id: "first",  label: "First",    hint: "Furthest along the road" },
    { id: "last",   label: "Last",     hint: "Nearest the spawn" },
    { id: "strong", label: "Toughest", hint: "Most remaining health" },
    { id: "close",  label: "Closest",  hint: "Nearest to this emplacement" }
  ];

  /* ---- enemies ----------------------------------------------------- */
  RV.ENEMIES = {
    grunt:  { hpMul: 1,    speedMul: 1,    rewardMul: 1,   r: 15, color: "#7b5ea7", armMul: 1 },
    runner: { hpMul: 0.55, speedMul: 1.80, rewardMul: 1.2, r: 11, color: "#c05f8f", armMul: 0.35 },
    brute:  { hpMul: 3.20, speedMul: 0.68, rewardMul: 2.2, r: 20, color: "#8a4b3a", armMul: 2.0 },
    sapper: { hpMul: 1.25, speedMul: 1.15, rewardMul: 1.6, r: 15, color: "#e08a2e",
              blastRadius: 105, blastDamage: 62, armMul: 0.8 },
    /* dies into two smaller copies, which die into two smaller copies */
    brood:  { hpMul: 1.70, speedMul: 0.95, rewardMul: 1.4, r: 18, color: "#5f9e6a",
              splits: 2, maxGen: 2, armMul: 0.7 },
    /* takes 85% reduced damage until a Cryo shot strips the ward */
    warded: { hpMul: 1.15, speedMul: 0.90, rewardMul: 1.7, r: 16, color: "#4a6fa5",
              wardCut: 0.15, wardDown: 4.5, armMul: 1.3 },
    /* alien-touched thrall — its death throws an EMP over your crews */
    reson:  { hpMul: 1.45, speedMul: 1.05, rewardMul: 1.8, r: 16, color: "#5fd6c0",
              armMul: 0.9, empRadius: 175, empStun: 2.0 },
    boss:   { hpMul: 11,   speedMul: 0.52, rewardMul: 11,  r: 28, color: "#a52f3f", armMul: 2.4 }
  };

  /* The Harvester hangs above the field and reaches down. Both strikes are
     telegraphed — an untelegraphed instant loss reads as arbitrary, not hard. */
  RV.STRIKES = {
    zone: { from: 4, chance: 0.68, warn: 2.4, span: 1,  damage: 0.78,
            label: "HARVEST BEAM" },
    line: { from: 8, chance: 0.45, warn: 2.7, half: 38, damage: 1.10,
            label: "LANCE BEAM" }
  };

  /* warlords alternate between two kits */
  RV.BOSSES = {
    warden: { label: "Warden", color: "#a52f3f", cd: 6.0, reach: 280, stun: 4.0,
              blurb: "Silences an emplacement every few seconds." },
    herald: { label: "Herald", color: "#8e3f8a", cd: 1.2, reach: 150, heal: 0.045,
              blurb: "Continuously heals everything marching near it." }
  };

  /* ---- revision cards ---------------------------------------------- */
  RV.CARDS = [
    { id: "pierce", name: "Piercing Rounds",
      gain: "Shots carry into one more target", toll: "",
      desc: "Each projectile continues to a second enemy for half damage.",
      apply: function (S) { S.M.pierce += 1; } },

    { id: "blood", name: "Blood Money",
      gain: "Double gold per kill", toll: "Enemies move 15% faster",
      desc: "The contract pays double. The contractors hurry.",
      apply: function (S) { S.M.gold *= 2; S.M.enemySpeed *= 1.15; } },

    { id: "overclock", name: "Overclock",
      gain: "+40% fire rate", toll: "20% less range",
      desc: "Cycle faster, see less.",
      apply: function (S) { S.M.fireRate *= 1.4; S.M.range *= 0.8; } },

    { id: "spotters", name: "Spotters",
      gain: "+30% range", toll: "15% slower fire rate",
      desc: "Reach further, cycle slower.",
      apply: function (S) { S.M.range *= 1.3; S.M.fireRate *= 0.85; } },

    { id: "glass", name: "Glass Cannon",
      gain: "+55% damage", toll: "Emplacements have 28% less health",
      desc: "Everything hits harder. Nothing stands as long.",
      apply: function (S) { S.M.damage *= 1.55; S.M.towerHp *= 0.72; } },

    { id: "fortify", name: "Fortify",
      gain: "+45% emplacement health", toll: "12% less damage",
      desc: "Thicker walls, duller teeth. Sappers hate it.",
      apply: function (S) { S.M.towerHp *= 1.45; S.M.damage *= 0.88; } },

    { id: "masons", name: "Masons' Guild",
      gain: "Repairs cost 60% less", toll: "",
      desc: "A standing crew, paid by retainer.",
      apply: function (S) { S.M.repair *= 0.4; } },

    { id: "scavenge", name: "Scavenger",
      gain: "12% chance of 45 bonus gold on kill", toll: "",
      desc: "Crews strip the wrecks between volleys.",
      apply: function (S) { S.M.scavenge += 0.12; } },

    { id: "quarry", name: "Quarry Contract",
      gain: "Everything costs 22% less", toll: "Enemies gain 12% health",
      desc: "Build and upgrade cheaper, but they send sturdier stock.",
      apply: function (S) { S.M.cost *= 0.78; S.M.enemyHp *= 1.12; } },

    { id: "chest", name: "War Chest",
      gain: "+280 gold now", toll: "",
      desc: "An advance against next season. Spend it well.",
      apply: function (S) { S.G.gold += 280; } },

    { id: "coldiron", name: "Cold Iron",
      gain: "Cryo shots deal triple damage", toll: "",
      desc: "Sharpened frost. Wards fall faster.",
      apply: function (S) { S.M.frostDamage *= 3; } },

    { id: "cryocoils", name: "Cryo Coils", unlock: "frost",
      gain: "Unlocks the Cryo emplacement", toll: "",
      desc: "Slows what it hits, and the only thing that strips a ward.",
      apply: function (S) { S.G.unlocked.frost = true; } },

    { id: "longbarrel", name: "Long Barrel", unlock: "sniper",
      gain: "Unlocks the Lance emplacement", toll: "",
      desc: "One target at a time, from across the field.",
      apply: function (S) { S.G.unlocked.sniper = true; } }
  ];

  /* ---- curse cards -------------------------------------------------- */
  /* Occasionally replace one draft slot. Big gain, permanent drawback. */
  RV.CURSES = [
    { id: "bloodpact", name: "Blood Pact", curse: true,
      gain: "+120% damage", toll: "Emplacements can never be repaired",
      desc: "Signed in the field, in a hurry. The masons walk off the job.",
      apply: function (S) { S.M.damage *= 2.2; S.M.noRepair = true; } },

    { id: "ironprice", name: "The Iron Price", curse: true,
      gain: "+85% range", toll: "Emplacements can never be sold",
      desc: "What is built stays built, whether or not you still want it there.",
      apply: function (S) { S.M.range *= 1.85; S.M.noSell = true; } },

    { id: "hollow", name: "Hollow Ranks", curse: true,
      gain: "Every draft offers one more card", toll: "A random emplacement falls each wave",
      desc: "More counsel than you can afford, and a payroll you cannot meet.",
      apply: function (S) { S.M.extraDraft += 1; S.M.waveDestroy = true; } },

    { id: "scorched", name: "Scorched Earth", curse: true,
      gain: "+140% gold from kills", toll: "All emplacements decay 7% each wave",
      desc: "Burn the ground you stand on and sell the ash.",
      apply: function (S) { S.M.gold *= 2.4; S.M.waveDecay += 0.07; } },

    { id: "conscript", name: "Conscription", curse: true,
      gain: "Everything costs 45% less", toll: "Enemies gain 30% health, permanently",
      desc: "Cheap labour on both sides of the wall.",
      apply: function (S) { S.M.cost *= 0.55; S.M.enemyHp *= 1.30; } }
  ];

  /* ---- wave contracts ------------------------------------------------ */
  /* Optional, offered before each wave. Accept for harder terms and better pay. */
  RV.CONTRACTS = [
    { id: "march", name: "Forced March",
      terms: "Enemies move 40% faster", pay: "Double gold this wave",
      apply: function (W) { W.speed *= 1.4; W.gold *= 2; } },

    { id: "iron", name: "Iron Stock",
      terms: "Enemies have 65% more health", pay: "One extra revision",
      apply: function (W) { W.hp *= 1.65; W.revisions += 1; } },

    { id: "blackout", name: "Blackout",
      terms: "Kills pay nothing this wave", pay: "Two extra revisions",
      apply: function (W) { W.gold = 0; W.revisions += 2; } },

    { id: "column", name: "Double Column",
      terms: "Twice as many march", pay: "60% more gold this wave",
      apply: function (W) { W.count *= 2; W.gold *= 1.6; } },

    { id: "convoy", name: "Sappers' Convoy",
      terms: "Half the column are sappers", pay: "150% more gold this wave",
      apply: function (W) { W.sappers = true; W.gold *= 2.5; } },

    { id: "vanguard", name: "Vanguard",
      terms: "An extra warlord marches", pay: "One revision and 50% more gold",
      apply: function (W) { W.extraBoss = true; W.revisions += 1; W.gold *= 1.5; } },

    { id: "ward", name: "Warded Column",
      terms: "Every enemy carries a ward", pay: "Double gold and one revision",
      apply: function (W) { W.allWarded = true; W.gold *= 2; W.revisions += 1; } }
  ];

  /* ---- meta progression ---------------------------------------------- */
  /* Seals are earned per run and spent in the armoury between runs. */
  RV.META = [
    { id: "purse",  name: "Deeper Purse",   max: 3,
      desc: "Begin each run with 90 more gold, per rank.",
      cost: function (rank) { return 5 + rank * 4; } },
    { id: "found",  name: "Reinforced Foundations", max: 2,
      desc: "Emplacements have 15% more health, per rank.",
      cost: function (rank) { return 8 + rank * 6; } },
    { id: "crews",  name: "Veteran Crews",  max: 2,
      desc: "Emplacements deal 10% more damage, per rank.",
      cost: function (rank) { return 11 + rank * 8; } },
    { id: "orders", name: "Standing Orders", max: 1,
      desc: "Begin every run with the Cryo emplacement unlocked.",
      cost: function () { return 16; } },
    { id: "fletch", name: "Master Fletcher", max: 1,
      desc: "Begin every run with the Lance emplacement unlocked.",
      cost: function () { return 26; } },
    { id: "draft",  name: "Wider Draft",    max: 1,
      desc: "Every revision draft offers a fourth card.",
      cost: function () { return 34; } }
  ];

  RV.sealsFor = function (wave, kills) {
    return 1 + Math.floor(wave / 3) + Math.floor(kills / 240);
  };

  /* ---- helpers ----------------------------------------------------- */
  RV.cx = function (c) { return c * RV.CFG.CELL + RV.CFG.CELL / 2; };
  RV.cy = function (r) { return r * RV.CFG.CELL + RV.CFG.CELL / 2; };
  RV.key = function (c, r) { return c + "," + r; };
  RV.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  RV.lerp = function (a, b, t) { return a + (b - a) * t; };
  RV.pick = function (arr) { return arr[(Math.random() * arr.length) | 0]; };

  RV.mulberry32 = function (a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  RV.shade = function (hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = RV.clamp((n >> 16) + amt, 0, 255);
    var g = RV.clamp(((n >> 8) & 255) + amt, 0, 255);
    var b = RV.clamp((n & 255) + amt, 0, 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  };

  RV.makeLane = function (grid) {
    var pts = grid.map(function (g) { return { x: RV.cx(g[0]), y: RV.cy(g[1]) }; });
    var cells = new Set();
    for (var i = 0; i < grid.length - 1; i++) {
      var c1 = grid[i][0], r1 = grid[i][1], c2 = grid[i + 1][0], r2 = grid[i + 1][1];
      var dc = Math.sign(c2 - c1), dr = Math.sign(r2 - r1);
      var c = c1, r = r1;
      cells.add(RV.key(c, r));
      while (c !== c2 || r !== r2) { c += dc; r += dr; cells.add(RV.key(c, r)); }
    }
    var segs = [], total = 0;
    for (var j = 0; j < pts.length - 1; j++) {
      var len = Math.hypot(pts[j + 1].x - pts[j].x, pts[j + 1].y - pts[j].y);
      segs.push({ a: pts[j], b: pts[j + 1], len: len, at: total });
      total += len;
    }
    return { pts: pts, cells: cells, segs: segs, total: total };
  };

  RV.alongLane = function (lane, d) {
    d = ((d % lane.total) + lane.total) % lane.total;
    for (var i = 0; i < lane.segs.length; i++) {
      var s = lane.segs[i];
      if (d <= s.at + s.len) {
        var t = (d - s.at) / s.len;
        return { x: RV.lerp(s.a.x, s.b.x, t), y: RV.lerp(s.a.y, s.b.y, t),
                 ang: Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x) };
      }
    }
    var l = lane.segs[lane.segs.length - 1];
    return { x: l.b.x, y: l.b.y, ang: Math.atan2(l.b.y - l.a.y, l.b.x - l.a.x) };
  };

}(window.RV));
