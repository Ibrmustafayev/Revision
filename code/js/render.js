/* Revision — per-frame drawing. Reads RV.S, mutates nothing. */
window.RV = window.RV || {};

(function (RV) {
  "use strict";

  var CFG = RV.CFG, TOWERS = RV.TOWERS, S = null, ctx = null;

  function init(context) { ctx = context; S = RV.S; }

  /* ---- towers -------------------------------------------------------- */
  function drawTower(t) {
    var spec = TOWERS[t.type];
    var bob = Math.sin(S.tick * 1.4 + t.c) * 0.6;
    var stunned = RV.Game.isStunned(t);
    var settle = t.swamp ? (1 - t.sinkIn / RV.CFG.SINK_WAVES) * 7 : 0;
    var going = t.sinking > 0 ? 1 - t.sinking / 1.6 : 0;
    settle += going * 34;

    ctx.save();
    ctx.translate(t.x, t.y + bob + settle);
    if (going > 0) {
      ctx.rotate(going * 0.26);
      ctx.scale(1 - going * 0.18, 1 - going * 0.3);
      ctx.globalAlpha = 1 - going * 0.55;
    }

    ctx.fillStyle = "rgba(12,26,10,.38)";
    ctx.beginPath(); ctx.ellipse(3, 18, 24, 10, 0, 0, Math.PI * 2); ctx.fill();

    var R = 22 + (t.tier - 1) * 1.8;
    var hurt = t.hurt > 0;

    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3;
      var px = Math.cos(a) * R, py = Math.sin(a) * R * 0.82 + 4;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = hurt ? "#7a4038" : "#4c463c"; ctx.fill();
    ctx.strokeStyle = "#332f28"; ctx.lineWidth = 2.4; ctx.stroke();

    ctx.beginPath();
    for (var j = 0; j < 6; j++) {
      var b = j * Math.PI / 3;
      var qx = Math.cos(b) * (R - 5), qy = Math.sin(b) * (R - 5) * 0.82;
      j ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy);
    }
    ctx.closePath();
    ctx.fillStyle = hurt ? "#9c5a4a" : "#6e675a"; ctx.fill();
    ctx.strokeStyle = "rgba(180,172,152,.4)"; ctx.lineWidth = 1; ctx.stroke();

    /* battle damage appears as condition drops */
    if (t.hpPct < 0.85) {
      ctx.strokeStyle = "rgba(30,24,18,.7)";
      ctx.lineWidth = 1.6;
      var cracks = t.hpPct < 0.45 ? 4 : 2;
      for (var ck = 0; ck < cracks; ck++) {
        var ca = ck * 1.9 + 0.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ca) * 4, Math.sin(ca) * 3);
        ctx.lineTo(Math.cos(ca) * (R - 6), Math.sin(ca) * (R - 6) * 0.8);
        ctx.stroke();
      }
    }

    /* tier banners */
    for (var k = 0; k < t.tier; k++) {
      var ba = -Math.PI / 2 + (k - (t.tier - 1) / 2) * 0.8;
      var bx = Math.cos(ba) * (R - 3), by = Math.sin(ba) * (R - 3) * 0.82;
      ctx.fillStyle = spec.color;
      ctx.fillRect(bx - 1, by - 11, 2, 11);
      ctx.beginPath();
      ctx.moveTo(bx + 1, by - 11); ctx.lineTo(bx + 9, by - 8); ctx.lineTo(bx + 1, by - 5);
      ctx.closePath(); ctx.fill();
    }

    /* turret */
    ctx.rotate(t.angle);
    var back = t.recoil * 5;
    var len = t.type === "sniper" ? 34 : t.type === "frost" ? 21 : 26;
    ctx.fillStyle = "#2f2b24";
    ctx.fillRect(2 - back, -5.5, len + 2, 11);
    ctx.fillStyle = stunned ? "#5a5348" : spec.color;
    ctx.fillRect(3 - back, -4, len, 8);
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.fillRect(3 - back, -4, len, 2.2);

    ctx.beginPath(); ctx.arc(0, 0, 11.5, 0, Math.PI * 2);
    ctx.fillStyle = "#3a352c"; ctx.fill();
    ctx.strokeStyle = stunned ? "#c86fd0" : spec.color; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.beginPath(); ctx.arc(-2.5, -2.5, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fill();

    if (t.flash > 0 && !stunned) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = RV.clamp(t.flash * 12, 0, 1);
      var gr = ctx.createRadialGradient(len + 9 - back, 0, 0, len + 9 - back, 0, 22);
      gr.addColorStop(0, spec.color);
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(len - 15 - back, -22, 44, 44);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();

    /* silenced: crackling violet arcs over the emplacement */
    if (stunned) {
      ctx.save();
      ctx.translate(t.x, t.y + bob + settle);
    if (going > 0) {
      ctx.rotate(going * 0.26);
      ctx.scale(1 - going * 0.18, 1 - going * 0.3);
      ctx.globalAlpha = 1 - going * 0.55;
    }
      ctx.strokeStyle = "rgba(200,111,208,.85)";
      ctx.lineWidth = 1.8;
      for (var z = 0; z < 3; z++) {
        var sa = S.tick * 6 + z * 2.1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * 20, Math.sin(sa) * 15);
        ctx.lineTo(Math.cos(sa + 1.1) * 8, Math.sin(sa + 1.1) * 6);
        ctx.lineTo(Math.cos(sa + 2.4) * 20, Math.sin(sa + 2.4) * 15);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* swamp waterline + sink countdown */
    if (t.swamp && t.sinking <= 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(140,200,160,.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(t.x, t.y + 16 + settle, 26, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = t.sinkIn <= 1 ? "rgba(200,67,59,.92)" : "rgba(140,200,160,.85)";
      ctx.font = "600 10px 'IBM Plex Mono',monospace";
      ctx.textAlign = "center";
      ctx.fillText(t.sinkIn <= 1 ? RV.t("canvas.sinking")
                                 : RV.t("canvas.sinks_in", {n: t.sinkIn}), t.x, t.y + 44 + settle);
      ctx.textAlign = "left";
      ctx.restore();
    }

    /* targeting mode pip */
    if (S.picked === t) {
      ctx.fillStyle = "rgba(12,20,10,.8)";
      ctx.fillRect(t.x - 24, t.y + 22, 48, 13);
      ctx.fillStyle = "#d9a441";
      ctx.font = "600 9px 'IBM Plex Mono',monospace";
      ctx.textAlign = "center";
      ctx.fillText(t.mode.toUpperCase(), t.x, t.y + 31);
      ctx.textAlign = "left";
    }

    /* condition bar, only once damaged */
    if (t.hpPct < 0.999) {
      var w = 40, bx2 = t.x - w / 2, by2 = t.y - 34;
      ctx.fillStyle = "rgba(12,20,10,.8)";
      ctx.fillRect(bx2 - 1, by2 - 1, w + 2, 5.5);
      ctx.fillStyle = t.hpPct > 0.5 ? "#8dc26f" : t.hpPct > 0.25 ? "#d9a441" : "#c8433b";
      ctx.fillRect(bx2, by2, w * t.hpPct, 3.5);
    }
  }

  /* ---- enemies -------------------------------------------------------- */
  function silhouette(kind, r, phaseT, color, flash, boss) {
    var swing = Math.sin(phaseT) * (kind === "runner" ? 0.9 : 0.6);
    var body = flash ? "#ffffff" : color;
    var dark = flash ? "#dddddd" : RV.shade(color, -34);
    var light = flash ? "#ffffff" : RV.shade(color, 26);

    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(2.2, r * 0.26);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-r * 0.28, r * 0.35); ctx.lineTo(-r * 0.28 + swing * r * 0.5, r * 1.0);
    ctx.moveTo(r * 0.28, r * 0.35);  ctx.lineTo(r * 0.28 - swing * r * 0.5, r * 1.0);
    ctx.stroke();

    if (kind === "brute") {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(-r * 0.9, -r * 0.5); ctx.lineTo(r * 0.9, -r * 0.5);
      ctx.lineTo(r * 0.75, r * 0.5);  ctx.lineTo(-r * 0.75, r * 0.5);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = light;
      ctx.fillRect(-r * 0.5, -r * 0.35, r * 1.0, r * 0.2);
      ctx.fillStyle = "#6b6459";
      ctx.beginPath(); ctx.ellipse(-r * 1.05, 0, r * 0.34, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#403b33"; ctx.lineWidth = 1.5; ctx.stroke();

    } else if (kind === "runner") {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.85); ctx.lineTo(r * 0.55, r * 0.45);
      ctx.lineTo(0, r * 0.2); ctx.lineTo(-r * 0.55, r * 0.45);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 1.6; ctx.stroke();

    } else if (kind === "sapper") {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.1, r * 0.72, r * 0.66, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.strokeStyle = "rgba(60,36,10,.75)"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.32); ctx.lineTo(r * 0.7, -r * 0.32);
      ctx.moveTo(-r * 0.7, r * 0.16);  ctx.lineTo(r * 0.7, r * 0.16);
      ctx.stroke();
      ctx.strokeStyle = "#4a3a22"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(r * 0.2, -r * 0.72);
      ctx.quadraticCurveTo(r * 0.7, -r * 1.05, r * 0.5, -r * 1.35);
      ctx.stroke();
      var spark = 0.55 + Math.abs(Math.sin(phaseT * 3)) * 0.45;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(255,190,90," + spark + ")";
      ctx.beginPath(); ctx.arc(r * 0.5, -r * 1.38, r * 0.24 * spark + 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = "source-over";

    } else if (kind === "reson") {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.92);
      ctx.quadraticCurveTo(r * 0.8, -r * 0.25, r * 0.58, r * 0.5);
      ctx.lineTo(-r * 0.58, r * 0.5);
      ctx.quadraticCurveTo(-r * 0.8, -r * 0.25, 0, -r * 0.92);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 1.8; ctx.stroke();
      /* the thing bolted into its chest */
      var hum = 0.55 + Math.abs(Math.sin(phaseT * 2.2)) * 0.45;
      ctx.strokeStyle = "rgba(150,255,230," + hum + ")";
      ctx.lineWidth = 2;
      for (var q = 0; q < 3; q++) {
        ctx.beginPath();
        ctx.arc(0, -r * 0.1, r * (0.22 + q * 0.16), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(210,255,245," + hum + ")";
      ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.15, 0, Math.PI * 2); ctx.fill();
      var hy2 = -r * 0.78;
      ctx.beginPath(); ctx.arc(0, hy2, r * 0.34, 0, Math.PI * 2);
      ctx.fillStyle = flash ? "#ffffff" : dark; ctx.fill();
      ctx.fillStyle = "rgba(180,255,240,.95)";
      ctx.beginPath(); ctx.arc(-r * 0.14, hy2, r * 0.09, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.14, hy2, r * 0.09, 0, Math.PI * 2); ctx.fill();

    } else if (kind === "brood") {
      /* lumpy sac with visible smaller shapes inside — it reads as "full of more" */
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.95);
      ctx.bezierCurveTo(r * 1.0, -r * 0.7, r * 0.9, r * 0.55, 0, r * 0.6);
      ctx.bezierCurveTo(-r * 0.9, r * 0.55, -r * 1.0, -r * 0.7, 0, -r * 0.95);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = flash ? "#eeeeee" : RV.shade(color, -50);
      [[-0.3, -0.15, 0.24], [0.32, -0.05, 0.2], [0.02, 0.28, 0.18]].forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p[0] * r, p[1] * r, p[2] * r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = light;
      ctx.beginPath(); ctx.arc(-r * 0.34, -r * 0.42, r * 0.16, 0, Math.PI * 2); ctx.fill();

    } else {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.9);
      ctx.quadraticCurveTo(r * 0.85, -r * 0.2, r * 0.62, r * 0.5);
      ctx.lineTo(-r * 0.62, r * 0.5);
      ctx.quadraticCurveTo(-r * 0.85, -r * 0.2, 0, -r * 0.9);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 1.8; ctx.stroke();
    }

    if (kind !== "sapper" && kind !== "brood" && kind !== "reson") {
      var hy = -r * 0.75;
      ctx.beginPath(); ctx.arc(0, hy, r * (kind === "boss" ? 0.44 : 0.36), 0, Math.PI * 2);
      ctx.fillStyle = flash ? "#ffffff" : dark; ctx.fill();
      ctx.fillStyle = flash ? "#ff9d9d" : "#ffd76a";
      var ex = r * 0.15, ey = hy + r * 0.02, es = Math.max(1.2, r * 0.09);
      ctx.beginPath(); ctx.arc(-ex, ey, es, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex, ey, es, 0, Math.PI * 2); ctx.fill();

      if (kind === "boss") {
        ctx.strokeStyle = flash ? "#ffffff" : "#ffd76a"; ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-r * 0.4, hy - r * 0.24); ctx.lineTo(-r * 0.72, hy - r * 0.78);
        ctx.moveTo(r * 0.4, hy - r * 0.24);  ctx.lineTo(r * 0.72, hy - r * 0.78);
        ctx.stroke();
        /* Warden carries a staff, Herald carries a censer */
        if (boss === "warden") {
          ctx.strokeStyle = "#d8c8a0"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(r * 0.75, -r * 0.9); ctx.lineTo(r * 0.62, r * 0.7); ctx.stroke();
          ctx.fillStyle = "#c86fd0";
          ctx.beginPath(); ctx.arc(r * 0.77, -r * 1.02, r * 0.19, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.strokeStyle = "#d8c8a0"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(r * 0.7, -r * 0.6); ctx.lineTo(r * 0.86, r * 0.1); ctx.stroke();
          ctx.fillStyle = "#8fd6a0";
          ctx.beginPath(); ctx.arc(r * 0.88, r * 0.25, r * 0.22, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  }

  function drawEnemy(e) {
    var walk = e.dist * 0.09 + e.bob;
    var lift = Math.abs(Math.sin(walk)) * (e.r * 0.09);

    ctx.fillStyle = "rgba(12,26,10,.36)";
    ctx.beginPath();
    ctx.ellipse(e.x + 2, e.y + e.r * 0.95, e.r * 0.85, e.r * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    if (e.kind === "boss" || e.kind === "sapper" || e.kind === "reson") {
      ctx.globalCompositeOperation = "lighter";
      var gr = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 2);
      gr.addColorStop(0, e.kind === "boss"
        ? (e.boss === "herald" ? "rgba(140,60,180,.3)" : "rgba(200,60,70,.28)")
        : e.kind === "reson" ? "rgba(95,214,192,.3)"
        : "rgba(230,140,40,.24)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(e.x - e.r * 2, e.y - e.r * 2, e.r * 4, e.r * 4);
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.save();
    ctx.translate(e.x, e.y - lift);
    ctx.scale(Math.cos(e.angle) < 0 ? -1 : 1, 1);
    silhouette(e.kind, e.r, walk, e.color, e.flash > 0, e.boss);
    ctx.restore();

    /* intact ward: a rotating hex barrier */
    if (e.warded && S.tick > e.wardBrokenUntil) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(S.tick * 0.7);
      ctx.strokeStyle = "rgba(120,175,240,.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var w = 0; w < 6; w++) {
        var wa = w * Math.PI / 3, rr = e.r * 1.45;
        w ? ctx.lineTo(Math.cos(wa) * rr, Math.sin(wa) * rr)
          : ctx.moveTo(Math.cos(wa) * rr, Math.sin(wa) * rr);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "rgba(120,175,240,.1)";
      ctx.fill();
      ctx.restore();
    }

    if (e.slowMul < 1) {
      ctx.strokeStyle = "rgba(127,198,232,.85)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 1.15, 0, Math.PI * 2); ctx.stroke();
    }

    if (e.hp < e.maxHp) {
      var bw = e.r * 2.1, pct = RV.clamp(e.hp / e.maxHp, 0, 1);
      var bx = e.x - bw / 2, by = e.y - e.r * 1.75;
      ctx.fillStyle = "rgba(12,20,10,.8)";
      ctx.fillRect(bx - 1, by - 1, bw + 2, 5.5);
      ctx.fillStyle = pct > 0.5 ? "#8dc26f" : pct > 0.22 ? "#d9a441" : "#c8433b";
      ctx.fillRect(bx, by, bw * pct, 3.5);
    }
  }

  /* ---- overlays -------------------------------------------------------- */
  function drawSwamp() {
    /* The marsh itself is baked into the terrain layer so it reads as one
       body of water. All that happens here is motion. */
    var C = CFG.CELL;
    S.swamp.forEach(function (k) {
      var p = k.split(","), cxx = +p[0] * C + C * 0.5, cyy = +p[1] * C + C * 0.5;
      var seedn = (+p[0] * 7 + +p[1] * 13);
      for (var i = 0; i < 2; i++) {
        var ph = (S.tick * 0.28 + i * 0.5 + seedn * 0.11) % 1;
        ctx.beginPath();
        ctx.ellipse(cxx, cyy, C * 0.12 + ph * C * 0.4, C * 0.06 + ph * C * 0.19,
                    0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(150,200,170," + (0.16 * (1 - ph)) + ")";
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
      if (S.sunk[k]) {
        ctx.fillStyle = "rgba(170,210,185,.5)";
        for (var b = 0; b < 4; b++) {
          var bt = (S.tick * 0.7 + b * 0.25 + seedn * 0.07) % 1;
          ctx.beginPath();
          ctx.arc(cxx - C * 0.2 + b * C * 0.13, cyy + C * 0.3 - bt * C * 0.5,
                  1.4 + bt * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  /* Beams and iron riding the water where an emplacement went under. */
  function drawWrecks() {
    for (var i = 0; i < S.wrecks.length; i++) {
      var w = S.wrecks[i];
      var settle = Math.min(1, w.age / 0.9);
      var fade = S.sunk[w.key] ? 1 : Math.max(0, 1 - (w.age - 1.2) / 1.2);
      if (fade <= 0) continue;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(w.x, w.y);

      /* the slick left on the surface */
      ctx.beginPath();
      ctx.ellipse(0, 6, 30 * settle, 13 * settle, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(20,38,32,.55)";
      ctx.fill();

      for (var b = 0; b < w.bits.length; b++) {
        var bit = w.bits[b];
        var bob = Math.sin(S.tick * 1.5 + bit.ph) * 1.8;
        var drift = Math.sin(S.tick * 0.4 + bit.ph) * 2.5;
        ctx.save();
        ctx.translate(bit.ox * settle + drift, bit.oy * settle + bob + 4);
        ctx.rotate(bit.rot + Math.sin(S.tick * 0.5 + bit.ph) * 0.06);
        if (bit.kind === "beam") {
          ctx.fillStyle = "#4e3a24";
          ctx.fillRect(-bit.len / 2, -3, bit.len, 6);
          ctx.fillStyle = "rgba(150,120,80,.55)";
          ctx.fillRect(-bit.len / 2, -3, bit.len, 1.8);
          ctx.strokeStyle = "rgba(20,32,26,.7)";
          ctx.lineWidth = 1;
          ctx.strokeRect(-bit.len / 2, -3, bit.len, 6);
        } else {
          ctx.fillStyle = "#6b6f70";
          ctx.beginPath();
          ctx.moveTo(-bit.len * 0.34, -4);
          ctx.lineTo(bit.len * 0.4, -6);
          ctx.lineTo(bit.len * 0.3, 5);
          ctx.lineTo(-bit.len * 0.4, 3);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = w.color;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.fillStyle = "rgba(210,215,215,.4)";
          ctx.fillRect(-bit.len * 0.16, -3, bit.len * 0.3, 1.6);
        }
        ctx.restore();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  /* The Harvester telegraphs for ~2.5s before it fires. An untelegraphed
     instant loss reads as arbitrary; a warned one reads as a decision. */
  function drawStrike() {
    var k = S.strike;
    if (!k || k.state === "waiting") return;
    var C = CFG.CELL;
    var warming = k.state === "warning";
    var p = warming ? k.t / k.cfg.warn : 1;
    var pulse = 0.35 + Math.abs(Math.sin(S.tick * (warming ? 6 + p * 10 : 30))) * 0.65;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    if (k.kind === "zone") {
      var x = (k.c - k.cfg.span) * C, y = (k.r - k.cfg.span) * C;
      var w = (k.cfg.span * 2 + 1) * C, h = w;
      ctx.fillStyle = "rgba(90,255,170," + (warming ? 0.06 + p * 0.16 : 0.55) + ")";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(140,255,190," + pulse + ")";
      ctx.lineWidth = warming ? 3 : 6;
      ctx.strokeRect(x, y, w, h);
      /* converging cross-hair */
      var inset = warming ? (1 - p) * w * 0.4 : 0;
      ctx.strokeStyle = "rgba(190,255,215," + pulse + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + inset, y + h / 2); ctx.lineTo(x + w - inset, y + h / 2);
      ctx.moveTo(x + w / 2, y + inset); ctx.lineTo(x + w / 2, y + h - inset);
      ctx.stroke();
      if (!warming) {
        var col = ctx.createLinearGradient(0, y, 0, y + h);
        col.addColorStop(0, "rgba(150,255,200,.9)");
        col.addColorStop(1, "rgba(150,255,200,0)");
        ctx.fillStyle = col;
        ctx.fillRect(x + w * 0.12, 0, w * 0.76, y + h);
      }
    } else {
      ctx.strokeStyle = "rgba(140,255,190," + (warming ? 0.25 + p * 0.5 : 1) + ")";
      ctx.lineWidth = warming ? 2 + p * 4 : k.cfg.half * 2;
      ctx.beginPath(); ctx.moveTo(k.ax, k.ay); ctx.lineTo(k.bx, k.by); ctx.stroke();
      ctx.strokeStyle = "rgba(230,255,240," + pulse + ")";
      ctx.lineWidth = warming ? 1.5 : 8;
      ctx.beginPath(); ctx.moveTo(k.ax, k.ay); ctx.lineTo(k.bx, k.by); ctx.stroke();
    }
    ctx.restore();

    if (warming) {
      ctx.fillStyle = "rgba(12,20,10,.72)";
      ctx.fillRect(0, 8, CFG.W, 30);
      ctx.fillStyle = "rgba(140,255,190," + pulse + ")";
      ctx.font = "600 15px 'IBM Plex Mono',monospace";
      ctx.textAlign = "center";
      ctx.fillText(RV.t("canvas.harvester", {label: RV.t(k.cfg.k)}), CFG.W / 2, 29);
      ctx.textAlign = "left";
    }
  }

  function drawNoBuild() {
    if (!S.selected || S.phase === "over" || S.phase === "title") return;
    var C = CFG.CELL;
    ctx.save();
    ctx.globalAlpha = 0.5;
    S.noBuild.forEach(function (k) {
      if (S.blocked.has(k)) return;
      var parts = k.split(","), x = +parts[0] * C, y = +parts[1] * C;
      ctx.fillStyle = "rgba(200,67,59,.13)";
      ctx.fillRect(x, y, C, C);
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, C, C); ctx.clip();
      ctx.strokeStyle = "rgba(200,67,59,.3)"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var o = -C; o < C; o += 11) { ctx.moveTo(x + o, y + C); ctx.lineTo(x + o + C, y); }
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }

  function drawGhost() {
    if (S.phase === "over" || S.phase === "title") return;
    if (S.picked) {
      var st = RV.Game.towerStats(S.picked);
      ctx.beginPath(); ctx.arc(S.picked.x, S.picked.y, st.range, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(217,164,65,.09)"; ctx.fill();
      ctx.strokeStyle = "rgba(217,164,65,.6)"; ctx.setLineDash([5, 7]);
      ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
      return;
    }
    if (!S.hover || !S.selected) return;
    var C = CFG.CELL;
    var ok = RV.Game.canPlace(S.hover.c, S.hover.r, S.selected);
    var spec = TOWERS[S.selected];
    ctx.fillStyle = ok ? "rgba(217,164,65,.2)" : "rgba(200,67,59,.26)";
    ctx.fillRect(S.hover.c * C + 4, S.hover.r * C + 4, C - 8, C - 8);
    ctx.strokeStyle = ok ? "#d9a441" : "#c8433b"; ctx.lineWidth = 2.4;
    ctx.strokeRect(S.hover.c * C + 4, S.hover.r * C + 4, C - 8, C - 8);
    ctx.beginPath();
    ctx.arc(RV.cx(S.hover.c), RV.cy(S.hover.r), spec.range * S.M.range, 0, Math.PI * 2);
    ctx.fillStyle = ok ? "rgba(217,164,65,.07)" : "rgba(200,67,59,.07)";
    ctx.fill();
    ctx.strokeStyle = ok ? "rgba(217,164,65,.5)" : "rgba(200,67,59,.45)";
    ctx.setLineDash([5, 7]); ctx.stroke(); ctx.setLineDash([]);
  }

  /* ---- frame ------------------------------------------------------------ */
  function frame() {
    var W = CFG.W, H = CFG.H;
    ctx.save();
    if (S.shake > 0.1) ctx.translate((Math.random() - 0.5) * S.shake, (Math.random() - 0.5) * S.shake);

    if (S.terrain) ctx.drawImage(S.terrain, 0, 0);
    else { ctx.fillStyle = "#4a7a37"; ctx.fillRect(0, 0, W, H); }

    drawSwamp();
    drawWrecks();
    drawNoBuild();
    drawGhost();
    drawStrike();

    for (var c = 0; c < S.corpses.length; c++) {
      var co = S.corpses[c], t = co.life / co.max;
      ctx.save();
      ctx.globalAlpha = t * 0.85;
      ctx.translate(co.x, co.y);
      var sc = 1 + (1 - t) * 0.9;
      ctx.scale(sc, sc * 0.7);
      ctx.beginPath(); ctx.arc(0, 0, co.r, 0, Math.PI * 2);
      ctx.strokeStyle = co.color; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    /* depth sort so overlaps read correctly */
    var order = S.towers.concat(S.enemies).sort(function (a, b) { return a.y - b.y; });
    for (var i = 0; i < order.length; i++) {
      if (order[i].tier !== undefined) drawTower(order[i]); else drawEnemy(order[i]);
    }

    ctx.globalCompositeOperation = "lighter";
    for (var g = 0; g < S.rings.length; g++) {
      var ring = S.rings[g], a = ring.life / ring.maxLife;
      ctx.globalAlpha = a * 0.8;
      ctx.strokeStyle = ring.color || "#ffb457";
      ctx.lineWidth = 4 + (1 - a) * 6;
      ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (var s = 0; s < S.shots.length; s++) {
      var sh = S.shots[s];
      for (var q = sh.trail.length - 1; q >= 0; q--) {
        ctx.globalAlpha = (1 - q / sh.trail.length) * 0.35;
        ctx.fillStyle = sh.color;
        var rr2 = (sh.type === "sniper" ? 4 : 3) * (1 - q / sh.trail.length);
        ctx.beginPath(); ctx.arc(sh.trail[q].x, sh.trail[q].y, Math.max(0.5, rr2), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      var pg = ctx.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, 12);
      pg.addColorStop(0, sh.color);
      pg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = pg;
      ctx.fillRect(sh.x - 12, sh.y - 12, 24, 24);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    for (var s2 = 0; s2 < S.shots.length; s2++) {
      ctx.beginPath();
      ctx.arc(S.shots[s2].x, S.shots[s2].y, S.shots[s2].type === "sniper" ? 3.4 : 2.6, 0, Math.PI * 2);
      ctx.fillStyle = "#fff6de"; ctx.fill();
    }

    for (var b = 0; b < S.bits.length; b++) {
      var bit = S.bits[b];
      ctx.globalAlpha = RV.clamp(bit.life * 2.4, 0, 1);
      ctx.fillStyle = bit.color;
      var bs = bit.size || 2.5;
      ctx.fillRect(bit.x - bs / 2, bit.y - bs / 2, bs, bs);
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    for (var f = 0; f < S.floats.length; f++) {
      var fl = S.floats[f];
      ctx.globalAlpha = RV.clamp(fl.life * 1.6, 0, 1);
      ctx.font = "600 " + fl.size + "px 'IBM Plex Mono',monospace";
      ctx.lineWidth = 3.5; ctx.strokeStyle = "rgba(12,20,10,.75)";
      ctx.strokeText(fl.text, fl.x, fl.y);
      ctx.fillStyle = fl.color;
      ctx.fillText(fl.text, fl.x, fl.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";

    if (S.phase === "build") {
      ctx.fillStyle = "rgba(12,20,10,.58)";
      ctx.fillRect(0, H - 30, W, 30);
      ctx.fillStyle = "rgba(232,220,192,.9)";
      ctx.font = "500 12px 'IBM Plex Mono',monospace";
      ctx.fillText(RV.t("canvas.build"), 12, H - 11);
    }
    ctx.restore();

    if (S.flash > 0) {
      ctx.fillStyle = "rgba(200,67,59," + (S.flash * 0.85) + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }

  RV.Render = { init: init, frame: frame };

}(window.RV));
