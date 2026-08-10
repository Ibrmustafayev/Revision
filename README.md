<div align="center">

# 🏰 Revision

![Language](https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Type](https://img.shields.io/badge/Type-Tower%20Defense%20Roguelike-informational?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Complete-brightgreen?style=for-the-badge)

*A browser-based tower defense roguelike. Two roads, one gate. Nothing may get through.*

**[🌐 Play](https://filmroulette.vercel.app)** <!-- replace with actual URL if deployed -->

</div>

---

## 📌 Overview

Revision is a fully browser-based tower defense roguelike — no server, no dependencies, no build step. Enemies march down two merging roads toward a single gate. One breach ends the run immediately. Every wave you survive earns a **revision**: a card that permanently amends your build for the rest of the run. Some of those amendments are curses.

---

## ✨ Features

| # | Feature | Description |
|---|---|---|
| 1 | **Three Emplacements** | Bastion (reliable), Cryo (slows + strips wards), Lance (long-range, high damage) |
| 2 | **Seven Enemy Types** | Grunt, Runner, Brute, Sapper (explodes), Brood (splits on death), Warded (immune until Cryo hits), Boss |
| 3 | **Two Warlords** | Warden (silences emplacements), Herald (heals nearby enemies) — alternate every fifth wave |
| 4 | **Revision Cards** | 13 cards + 5 curses that permanently modify your run — pierce shots, doubled gold, glass cannon, and more |
| 5 | **Wave Contracts** | Optional harder terms before each wave — faster enemies, more gold, extra revisions |
| 6 | **Three Maps** | Three handcrafted two-lane battlefields with procedurally painted terrain |
| 7 | **Meta Progression** | Earn seals every run, spend them in the Armoury on permanent cross-run upgrades |
| 8 | **Synthesized Audio** | All sound effects built from Web Audio API oscillators and noise buffers — no sound files |
| 9 | **Tier Upgrades** | Three upgrade tiers per emplacement — damage, range, fire rate, and HP all scale |
| 10 | **Targeting Modes** | Per-emplacement priority: First, Last, Toughest, or Closest |

---

## 🧠 Architecture

| File | Role |
|---|---|
| `config.js` | All game data — towers, enemies, cards, curses, contracts, maps, meta upgrades, helpers |
| `audio.js` | Web Audio API sound engine — oscillators and filtered noise, no files |
| `store.js` | `localStorage` persistence — best run, seals, armoury upgrades, save migration |
| `terrain.js` | Offscreen canvas terrain painter — roads, grass, props, gate, drawn once per run |
| `game.js` | Core simulation — enemy spawning, tower firing, collision, wave logic, card application |
| `render.js` | Per-frame canvas renderer — enemies, towers, projectiles, range rings, animations |
| `ui.js` | DOM layer — HUD, palette, inspect panel, draft overlay, armoury, end screen |
| `main.js` | Input handling, game loop, button wiring, frame timing |

---

## ⌨️ Controls

| Key | Action |
|---|---|
| `1` `2` `3` | Select emplacement type |
| `Space` | Start the wave |
| `C` | Sign the contract |
| `T` | Cycle targeting mode |
| `U` | Upgrade selected emplacement |
| `R` | Repair selected emplacement |
| `S` | Sell selected emplacement |
| `P` | Pause / resume |
| `Esc` | Deselect |

---

## 🚀 How to Run

No build step or server required — open `index.html` directly in any modern browser.

```bash
# Clone and open
git clone https://github.com/Ibrmustafayev/Revision.git
cd Revision
# Open index.html in your browser
```

Or drag `index.html` onto a browser window.

---

## 📁 Structure

```
Revision/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── config.js    # All data tables and helpers
    ├── audio.js     # Synthesized sound engine
    ├── store.js     # localStorage persistence
    ├── terrain.js   # Offscreen terrain painter
    ├── game.js      # Core simulation
    ├── render.js    # Canvas renderer
    ├── ui.js        # DOM panels and overlays
    └── main.js      # Input, loop, boot
```

> **Script load order matters.** `config.js` must load first, `main.js` last. All modules share the `window.RV` namespace.

---

## 📜 License

Released under the [MIT License](LICENSE).
