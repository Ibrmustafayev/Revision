/* Revision — terrain painter.
   The whole battlefield is drawn once per run into an offscreen canvas and
   blitted each frame. That is what pays for the detail: 7000 grass blades
   cost nothing if you only draw them one time. */
window.RV = window.RV || {};

(function (RV) {
  "use strict";

  var CFG = RV.CFG;

  function strokeLane(g, lane, width, color) {
    g.beginPath();
    g.moveTo(lane.pts[0].x, lane.pts[0].y);
    for (var i = 1; i < lane.pts.length; i++) g.lineTo(lane.pts[i].x, lane.pts[i].y);
    g.lineWidth = width;
    g.strokeStyle = color;
    g.stroke();
  }

  function drawProp(g, p) {
    var x = RV.cx(p.c), y = RV.cy(p.r), s = p.s, rng = RV.mulberry32(p.seed | 0);
    g.save();
    g.fillStyle = "rgba(14,28,12,.34)";
    g.beginPath(); g.ellipse(x + 3, y + 13 * s, 20 * s, 8 * s, 0, 0, Math.PI * 2); g.fill();

    if (p.kind === "tree") {
      g.fillStyle = "#4a3520";
      g.fillRect(x - 3.5 * s, y - 2 * s, 7 * s, 17 * s);
      var blobs = [[-11, -7, 15], [11, -6, 14], [0, -19, 16], [-5, -3, 14], [7, -14, 13]];
      blobs.forEach(function (b, i) {
        g.fillStyle = i % 2 ? "#2f5a26" : "#3d7130";
        g.beginPath(); g.arc(x + b[0] * s, y + b[1] * s - 5, b[2] * s, 0, Math.PI * 2); g.fill();
      });
      g.fillStyle = "rgba(140,190,96,.5)";
      g.beginPath(); g.arc(x - 6 * s, y - 21 * s, 7 * s, 0, Math.PI * 2); g.fill();
    } else {
      var pts = [];
      for (var i = 0; i < 7; i++) {
        var a = i / 7 * Math.PI * 2, rr = (13 + rng() * 7) * s;
        pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.78]);
      }
      g.beginPath();
      pts.forEach(function (pt, i) { i ? g.lineTo(pt[0], pt[1]) : g.moveTo(pt[0], pt[1]); });
      g.closePath();
      g.fillStyle = "#7b7a72"; g.fill();
      g.strokeStyle = "#4e4d47"; g.lineWidth = 1.8; g.stroke();
      g.beginPath();
      g.ellipse(x - 4 * s, y - 5 * s, 7 * s, 5 * s, -0.4, 0, Math.PI * 2);
      g.fillStyle = "rgba(178,178,168,.5)"; g.fill();
    }
    g.restore();
  }

  /* The keep the enemies are marching toward — sits on the exit cell. */
  function drawGate(g, exit) {
    var x = RV.cx(exit[0]), y = RV.cy(exit[1]), C = CFG.CELL;

    g.fillStyle = "rgba(12,26,10,.42)";
    g.beginPath(); g.ellipse(x + 5, y + C * 0.42, C * 0.62, C * 0.2, 0, 0, Math.PI * 2); g.fill();

    // wall block
    g.fillStyle = "#5c564a";
    g.fillRect(x - C * 0.42, y - C * 0.52, C * 0.9, C * 1.0);
    g.strokeStyle = "#38342c"; g.lineWidth = 3;
    g.strokeRect(x - C * 0.42, y - C * 0.52, C * 0.9, C * 1.0);

    // courses
    g.strokeStyle = "rgba(40,36,30,.55)"; g.lineWidth = 1.5;
    for (var i = 1; i < 5; i++) {
      g.beginPath();
      g.moveTo(x - C * 0.42, y - C * 0.52 + i * C * 0.2);
      g.lineTo(x + C * 0.48, y - C * 0.52 + i * C * 0.2);
      g.stroke();
    }

    // crenellations
    g.fillStyle = "#6e675a";
    for (var j = 0; j < 3; j++) {
      g.fillRect(x - C * 0.42 + j * C * 0.32, y - C * 0.66, C * 0.2, C * 0.16);
    }

    // archway
    g.fillStyle = "#241f19";
    g.beginPath();
    g.moveTo(x - C * 0.18, y + C * 0.48);
    g.lineTo(x - C * 0.18, y - C * 0.02);
    g.quadraticCurveTo(x, y - C * 0.3, x + C * 0.18, y - C * 0.02);
    g.lineTo(x + C * 0.18, y + C * 0.48);
    g.closePath(); g.fill();

    // banner
    g.fillStyle = "#c8433b";
    g.beginPath();
    g.moveTo(x + C * 0.28, y - C * 0.44);
    g.lineTo(x + C * 0.46, y - C * 0.44);
    g.lineTo(x + C * 0.46, y - C * 0.08);
    g.lineTo(x + C * 0.37, y - C * 0.17);
    g.lineTo(x + C * 0.28, y - C * 0.08);
    g.closePath(); g.fill();
  }

  RV.Terrain = {
    paint: function (seed, lanes, blocked, props, exit, swamp) {
      var W = CFG.W, H = CFG.H;
      var off = document.createElement("canvas");
      off.width = W; off.height = H;
      var g = off.getContext("2d");
      var rng = RV.mulberry32(seed ^ 0x9e37);

      g.fillStyle = "#4a7a37";
      g.fillRect(0, 0, W, H);

      // broad tonal patches so the field isn't a flat colour
      for (var i = 0; i < 30; i++) {
        var px = rng() * W, py = rng() * H, pr = 70 + rng() * 170;
        var grd = g.createRadialGradient(px, py, 0, px, py, pr);
        grd.addColorStop(0, rng() < 0.5 ? "rgba(122,163,79,.5)" : "rgba(54,94,42,.45)");
        grd.addColorStop(1, "rgba(74,122,55,0)");
        g.fillStyle = grd;
        g.fillRect(px - pr, py - pr, pr * 2, pr * 2);
      }

      // grass blades
      for (var b = 0; b < 8000; b++) {
        var bx = rng() * W, by = rng() * H, shade = rng();
        g.strokeStyle = shade < 0.4 ? "rgba(40,74,32,.5)"
                      : shade < 0.8 ? "rgba(104,148,66,.42)"
                                    : "rgba(140,180,92,.34)";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(bx, by);
        g.lineTo(bx + (rng() - 0.5) * 3, by - 2 - rng() * 5);
        g.stroke();
      }

      /* ── the marsh ──────────────────────────────────────────────────────
         Drawn as overlapping organic blobs rather than per-cell squares, so
         the boundary is irregular and it reads as one body of water instead
         of a tile mask. Roads go down afterwards and stay dry on top. */
      if (swamp && swamp.size) {
        var cells = [];
        swamp.forEach(function (k) {
          var q = k.split(",");
          cells.push([+q[0], +q[1]]);
        });
        var C = CFG.CELL;

        function blobs(pad, col, jitter) {
          cells.forEach(function (c) {
            var bx = c[0] * C + C / 2, by = c[1] * C + C / 2;
            for (var b = 0; b < 3; b++) {
              var rx = C * (0.62 + rng() * 0.30) + pad;
              var ry = C * (0.58 + rng() * 0.30) + pad;
              var ox = (rng() - 0.5) * C * jitter, oy = (rng() - 0.5) * C * jitter;
              g.beginPath();
              g.ellipse(bx + ox, by + oy, rx, ry, rng() * 3, 0, Math.PI * 2);
              g.fillStyle = col;
              g.fill();
            }
          });
        }

        blobs(C * 0.16, "rgba(58,74,44,.85)", 0.34);   // wet mud shore
        blobs(0,         "rgba(38,60,46,.92)", 0.26);   // water body
        blobs(-C * 0.20, "rgba(28,50,44,.85)", 0.22);   // deeper channels

        /* silt streaks and light on the surface */
        for (var si = 0; si < 900; si++) {
          var c2 = cells[(rng() * cells.length) | 0];
          var px = c2[0] * C + rng() * C, py = c2[1] * C + rng() * C;
          var v2 = rng();
          g.strokeStyle = v2 < 0.45 ? "rgba(96,132,104,.30)"
                        : v2 < 0.8  ? "rgba(24,44,38,.35)"
                                    : "rgba(150,190,160,.22)";
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(px, py);
          g.lineTo(px + (rng() - 0.3) * 22, py + (rng() - 0.5) * 5);
          g.stroke();
        }

        /* algae mats */
        for (var am = 0; am < 90; am++) {
          var c3 = cells[(rng() * cells.length) | 0];
          var ax = c3[0] * C + rng() * C, ay = c3[1] * C + rng() * C;
          g.beginPath();
          g.ellipse(ax, ay, 5 + rng() * 16, 3 + rng() * 8, rng() * 3, 0, Math.PI * 2);
          g.fillStyle = "rgba(96,140,86,.28)";
          g.fill();
        }

        /* reeds, thickest along the shoreline */
        cells.forEach(function (c) {
          var edge = !swamp.has(RV.key(c[0] + 1, c[1])) ||
                     !swamp.has(RV.key(c[0], c[1] + 1)) ||
                     !swamp.has(RV.key(c[0], c[1] - 1));
          var n = edge ? 16 : 6;
          for (var r2 = 0; r2 < n; r2++) {
            var rx2 = c[0] * C + rng() * C, ry2 = c[1] * C + rng() * C;
            var hgt = 10 + rng() * 20;
            g.strokeStyle = rng() < 0.5 ? "rgba(104,140,74,.62)" : "rgba(74,104,58,.6)";
            g.lineWidth = 1.6;
            g.beginPath();
            g.moveTo(rx2, ry2);
            g.quadraticCurveTo(rx2 + (rng() - 0.5) * 8, ry2 - hgt * 0.6,
                               rx2 + (rng() - 0.5) * 13, ry2 - hgt);
            g.stroke();
          }
        });

        /* dead timber half-sunk in the shallows */
        for (var lg = 0; lg < 14; lg++) {
          var c4 = cells[(rng() * cells.length) | 0];
          var lx = c4[0] * C + rng() * C, ly = c4[1] * C + rng() * C;
          var la = rng() * Math.PI, ll = 14 + rng() * 26;
          g.strokeStyle = "rgba(62,48,32,.75)";
          g.lineWidth = 5 + rng() * 4;
          g.beginPath();
          g.moveTo(lx - Math.cos(la) * ll, ly - Math.sin(la) * ll * 0.5);
          g.lineTo(lx + Math.cos(la) * ll, ly + Math.sin(la) * ll * 0.5);
          g.stroke();
          g.strokeStyle = "rgba(140,160,130,.22)";
          g.lineWidth = 1.6;
          g.stroke();
        }
      }

      // roads, built up in layers
      g.lineCap = "round"; g.lineJoin = "round";
      lanes.forEach(function (l) { strokeLane(g, l, CFG.ROAD + 12, "rgba(28,50,24,.4)"); });
      lanes.forEach(function (l) { strokeLane(g, l, CFG.ROAD + 5,  "#5c4b2c"); });
      lanes.forEach(function (l) { strokeLane(g, l, CFG.ROAD,      "#8a6f42"); });
      lanes.forEach(function (l) { strokeLane(g, l, CFG.ROAD - 14, "rgba(160,131,80,.55)"); });

      // gravel and wheel ruts
      lanes.forEach(function (l) {
        for (var d = 0; d < l.total; d += 3) {
          var p = RV.alongLane(l, d);
          var n = 2 + ((rng() * 3) | 0);
          for (var k = 0; k < n; k++) {
            var o = (rng() - 0.5) * (CFG.ROAD - 8);
            var gx = p.x + Math.cos(p.ang + Math.PI / 2) * o;
            var gy = p.y + Math.sin(p.ang + Math.PI / 2) * o;
            var v = rng();
            g.fillStyle = v < 0.35 ? "rgba(92,72,42,.5)"
                        : v < 0.7  ? "rgba(168,140,88,.35)"
                                   : "rgba(60,46,28,.3)";
            var s = 1 + rng() * 2.6;
            g.fillRect(gx, gy, s, s);
          }
        }
        [-11, 11].forEach(function (o) {
          g.beginPath();
          for (var d = 0; d <= l.total; d += 6) {
            var p = RV.alongLane(l, d);
            var rx = p.x + Math.cos(p.ang + Math.PI / 2) * o;
            var ry = p.y + Math.sin(p.ang + Math.PI / 2) * o;
            d ? g.lineTo(rx, ry) : g.moveTo(rx, ry);
          }
          g.strokeStyle = "rgba(74,58,34,.32)"; g.lineWidth = 3.5; g.stroke();
        });
      });

      // loose ground detail off-road
      for (var s2 = 0; s2 < 220; s2++) {
        var sx = rng() * W, sy = rng() * H;
        var cc = Math.floor(sx / CFG.CELL), rr2 = Math.floor(sy / CFG.CELL);
        if (blocked.has(RV.key(cc, rr2))) continue;
        if (rng() < 0.6) {
          g.fillStyle = "rgba(56,96,42,.5)";
          g.beginPath(); g.ellipse(sx, sy, 5 + rng() * 8, 2 + rng() * 4, rng() * 3, 0, Math.PI * 2); g.fill();
        } else {
          g.fillStyle = "rgba(120,120,110,.35)";
          g.beginPath(); g.arc(sx, sy, 1.5 + rng() * 3, 0, Math.PI * 2); g.fill();
        }
      }

      props.forEach(function (p) { drawProp(g, p); });
      drawGate(g, exit);

      // vignette
      var vg = g.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.9);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(8,18,8,.42)");
      g.fillStyle = vg;
      g.fillRect(0, 0, W, H);

      return off;
    }
  };

}(window.RV));
