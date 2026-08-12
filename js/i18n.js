/* Revision — localisation.
   One dictionary, three languages. Anything missing falls back to English,
   so a half-finished translation degrades instead of breaking. */
window.RV = window.RV || {};

(function (RV) {
  "use strict";

  var KEY = "revision.lang";
  var lang = "en";

  RV.LANGS = [
    { id: "en", label: "EN", name: "English" },
    { id: "tr", label: "TR", name: "T\u00fcrk\u00e7e" },
    { id: "ru", label: "RU", name: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439" }
  ];

  var DICT = {

  /* ══════════════ ENGLISH ══════════════ */
  en: {
    "ui.sound_on": "Sound on", "ui.sound_off": "Sound off",
    "ui.pause": "Pause", "ui.resume": "Resume", "ui.how": "How to play",
    "ui.back": "Back", "ui.armoury": "Armoury", "ui.begin": "Begin the plan",
    "ui.new_plan": "New plan", "ui.abandon": "Abandon run",
    "ui.paused": "Paused", "ui.paused_lede": "The plan waits.",
    "ui.wipe": "Erase save",
    "ui.wipe_confirm": "Erase all seals, upgrades and your best run?",
    "ui.language": "Language",

    "hud.wave": "Wave", "hud.gold": "Gold",
    "hud.standing": "Standing", "hud.kills": "Kills",

    "btn.start_wave": "Start wave {n}", "btn.wave_running": "Wave {n} running",
    "btn.run_ended": "Run ended", "btn.choose": "Choose a revision",
    "btn.paused": "Paused",

    "panel.contract": "Contract on offer", "panel.emplacements": "Emplacements",
    "panel.selected": "Selected", "panel.log": "Revision log",

    "contract.none": "No offer.",
    "contract.between": "Offers arrive between waves.",
    "contract.sign": "Sign the contract",
    "contract.signed": "Signed \u2014 applies to the next wave",

    "inspect.hint": "Click a built emplacement to retarget, upgrade, repair or sell it. Damaged emplacements sell for less.",
    "inspect.tier": "TIER {n} / 3",
    "inspect.damage": "Damage", "inspect.range": "Range",
    "inspect.cycle": "Cycle", "inspect.invested": "Invested",
    "inspect.upgrade": "Upgrade {n}", "inspect.maxed": "Maxed",
    "inspect.repair": "Repair {n}", "inspect.intact": "Intact",
    "inspect.cursed": "Cursed", "inspect.sell": "Sell {n}",
    "inspect.targeting": "Targeting priority",

    "swamp.sinks_in": "Standing in swamp \u2014 sinks in {n} waves.",
    "swamp.sinking": "Standing in swamp \u2014 goes under after this wave.",
    "swamp.shore": "Shore up {n}",

    "mode.first": "First", "mode.last": "Last",
    "mode.strong": "Toughest", "mode.close": "Closest",
    "mode.first.hint": "Furthest along the road",
    "mode.last.hint": "Nearest the spawn",
    "mode.strong.hint": "Most remaining health",
    "mode.close.hint": "Nearest to this emplacement",

    "draft.title": "Wave held",
    "draft.sub": "Wave {n} held. Issue one revision to the plan.",
    "draft.sub_many": "Wave {n} held. {c} revisions owed \u2014 issue one.",
    "draft.revision": "Revision {n}", "draft.curse": "Curse",
    "draft.locked": "Earn this from a revision.", "draft.locked_short": "Locked",

    "over.gate_fell": "The gate fell", "over.abandoned": "Run abandoned",
    "over.lede_breach": "One of them walked through. That is all it takes.",
    "over.lede_abandon": "You called it off.",
    "over.record": "New best run",
    "over.waves": "Waves cleared", "over.kills": "Enemies destroyed",
    "over.built": "Emplacements built", "over.lost": "Emplacements lost",
    "over.sunk": "Taken by the swamp", "over.cards": "Revisions issued",
    "over.curses": "Curses accepted", "over.contracts": "Contracts signed",
    "over.seals": "Seals earned",

    "armoury.title": "Armoury",
    "armoury.lede": "Seals are earned every run, win or lose. What you buy here is permanent.",
    "armoury.held": "Seals held", "armoury.complete": "Complete",
    "armoury.cost": "{n} seals",

    "title.tagline": "A tower defense roguelike. They come down two roads that meet at one gate, and nothing may get through \u2014 a single breach ends the run. Every wave you hold earns a stamped amendment to your blueprint. Some of those amendments are curses.",
    "title.best": "Best run", "title.no_runs": "no runs recorded",
    "log.empty": "No amendments yet. Hold a wave to earn one.",

    "canvas.build": "BUILD PHASE \u2014 nothing may reach the gate",
    "canvas.harvester": "\u25B2 HARVESTER \u2014 {label} INCOMING",
    "canvas.sinks_in": "SINKS IN {n}", "canvas.sinking": "SINKING",

    "float.breach": "BREACH", "float.destroyed": "DESTROYED",
    "float.swallowed": "SWALLOWED", "float.repaired": "REPAIRED",
    "float.shored": "SHORED UP", "float.tier": "TIER {n}",
    "float.ward": "WARD BROKEN", "float.silenced": "{n} SILENCED",
    "float.conscripted": "CONSCRIPTED",

    "strike.zone": "HARVEST BEAM", "strike.line": "LANCE BEAM",

    "tower.cannon": "Bastion", "tower.frost": "Cryo", "tower.sniper": "Lance",
    "tower.cannon.blurb": "Steady stonework. Reliable at anything.",
    "tower.frost.blurb": "Slows what it hits by 45%, and strips wards.",
    "tower.sniper.blurb": "Long reach, heavy hit, slow to cycle. Fragile.",
    "tower.hp": "{n} hp.",

    "foot.pick": "pick an emplacement", "foot.start": "start the wave",
    "foot.sign": "sign the contract", "foot.retarget": "retarget",
    "foot.upgrade": "upgrade", "foot.repair": "repair", "foot.sell": "sell",
    "foot.pause": "pause", "foot.deselect": "deselect"
  },

  /* ══════════════ T\u00dcRK\u00c7E ══════════════ */
  tr: {
    "ui.sound_on": "Ses a\u00e7\u0131k", "ui.sound_off": "Ses kapal\u0131",
    "ui.pause": "Duraklat", "ui.resume": "Devam et", "ui.how": "Nas\u0131l oynan\u0131r",
    "ui.back": "Geri", "ui.armoury": "Cephanelik", "ui.begin": "Plan\u0131 ba\u015flat",
    "ui.new_plan": "Yeni plan", "ui.abandon": "Turu b\u0131rak",
    "ui.paused": "Duraklat\u0131ld\u0131", "ui.paused_lede": "Plan bekliyor.",
    "ui.wipe": "Kayd\u0131 sil",
    "ui.wipe_confirm": "T\u00fcm m\u00fch\u00fcrler, y\u00fckseltmeler ve en iyi turun silinsin mi?",
    "ui.language": "Dil",

    "hud.wave": "Dalga", "hud.gold": "Alt\u0131n",
    "hud.standing": "Ayakta", "hud.kills": "\u00d6ld\u00fcrme",

    "btn.start_wave": "{n}. dalgay\u0131 ba\u015flat", "btn.wave_running": "{n}. dalga s\u00fcr\u00fcyor",
    "btn.run_ended": "Tur bitti", "btn.choose": "Bir revizyon se\u00e7",
    "btn.paused": "Duraklat\u0131ld\u0131",

    "panel.contract": "Sunulan s\u00f6zle\u015fme", "panel.emplacements": "Mevziler",
    "panel.selected": "Se\u00e7ili", "panel.log": "Revizyon kayd\u0131",

    "contract.none": "Teklif yok.",
    "contract.between": "Teklifler dalgalar aras\u0131nda gelir.",
    "contract.sign": "S\u00f6zle\u015fmeyi imzala",
    "contract.signed": "\u0130mzaland\u0131 \u2014 sonraki dalgada ge\u00e7erli",

    "inspect.hint": "Kurulu bir mevziye t\u0131kla: hedefini de\u011fi\u015ftir, y\u00fckselt, onar ya da sat. Hasarl\u0131 mevziler daha ucuza gider.",
    "inspect.tier": "KADEME {n} / 3",
    "inspect.damage": "Hasar", "inspect.range": "Menzil",
    "inspect.cycle": "At\u0131\u015f aral\u0131\u011f\u0131", "inspect.invested": "Yat\u0131r\u0131lan",
    "inspect.upgrade": "Y\u00fckselt {n}", "inspect.maxed": "Tam",
    "inspect.repair": "Onar {n}", "inspect.intact": "Sa\u011flam",
    "inspect.cursed": "Lanetli", "inspect.sell": "Sat {n}",
    "inspect.targeting": "Hedefleme \u00f6nceli\u011fi",

    "swamp.sinks_in": "Batakl\u0131kta \u2014 {n} dalga sonra batacak.",
    "swamp.sinking": "Batakl\u0131kta \u2014 bu dalgadan sonra gidiyor.",
    "swamp.shore": "Payanda vur {n}",

    "mode.first": "\u0130lk", "mode.last": "Son",
    "mode.strong": "En sa\u011flam", "mode.close": "En yak\u0131n",
    "mode.first.hint": "Yolda en \u00f6nde gideni",
    "mode.last.hint": "Giri\u015fe en yak\u0131n olan\u0131",
    "mode.strong.hint": "Can\u0131 en \u00e7ok kalan\u0131",
    "mode.close.hint": "Bu mevziye en yak\u0131n olan\u0131",

    "draft.title": "Dalga tutuldu",
    "draft.sub": "{n}. dalga tutuldu. Plana bir revizyon i\u015fle.",
    "draft.sub_many": "{n}. dalga tutuldu. {c} revizyon hakk\u0131n var \u2014 birini se\u00e7.",
    "draft.revision": "Revizyon {n}", "draft.curse": "Lanet",
    "draft.locked": "Bunu bir revizyondan kazan.", "draft.locked_short": "Kilitli",

    "over.gate_fell": "Kap\u0131 d\u00fc\u015ft\u00fc", "over.abandoned": "Tur b\u0131rak\u0131ld\u0131",
    "over.lede_breach": "\u0130\u00e7lerinden biri ge\u00e7ti. Tek bir tanesi yeter.",
    "over.lede_abandon": "Sen b\u0131rakt\u0131n.",
    "over.record": "Yeni en iyi tur",
    "over.waves": "Ge\u00e7ilen dalga", "over.kills": "\u00d6ld\u00fcr\u00fclen d\u00fc\u015fman",
    "over.built": "Kurulan mevzi", "over.lost": "Kaybedilen mevzi",
    "over.sunk": "Batakl\u0131\u011f\u0131n ald\u0131\u011f\u0131", "over.cards": "\u0130\u015flenen revizyon",
    "over.curses": "Kabul edilen lanet", "over.contracts": "\u0130mzalanan s\u00f6zle\u015fme",
    "over.seals": "Kazan\u0131lan m\u00fch\u00fcr",

    "armoury.title": "Cephanelik",
    "armoury.lede": "Her tur m\u00fch\u00fcr kazand\u0131r\u0131r, kazansan da kaybetsen de. Buradan ald\u0131klar\u0131n kal\u0131c\u0131d\u0131r.",
    "armoury.held": "Eldeki m\u00fch\u00fcr", "armoury.complete": "Tamam",
    "armoury.cost": "{n} m\u00fch\u00fcr",

    "title.tagline": "Bir kule savunmas\u0131 roguelike'\u0131. Tek bir kap\u0131da birle\u015fen iki yoldan geliyorlar ve hi\u00e7biri ge\u00e7memeli \u2014 tek bir s\u0131z\u0131nt\u0131 turu bitirir. Tuttu\u011fun her dalga, plan\u0131na m\u00fch\u00fcrl\u00fc bir de\u011fi\u015fiklik kazand\u0131r\u0131r. Baz\u0131lar\u0131 lanettir.",
    "title.best": "En iyi tur", "title.no_runs": "kay\u0131tl\u0131 tur yok",
    "log.empty": "Hen\u00fcz de\u011fi\u015fiklik yok. Bir dalga tut, birini kazan.",

    "canvas.build": "KURULUM A\u015eAMASI \u2014 hi\u00e7bir \u015fey kap\u0131ya ula\u015famaz",
    "canvas.harvester": "\u25B2 HASATÇI \u2014 {label} GEL\u0130YOR",
    "canvas.sinks_in": "{n} DALGA", "canvas.sinking": "BATIYOR",

    "float.breach": "SIZINTI", "float.destroyed": "YIKILDI",
    "float.swallowed": "YUTULDU", "float.repaired": "ONARILDI",
    "float.shored": "PAYANDALANDI", "float.tier": "KADEME {n}",
    "float.ward": "KALKAN KIRILDI", "float.silenced": "{n} SUSTURULDU",
    "float.conscripted": "EL KONULDU",

    "strike.zone": "HASAT HUZMES\u0130", "strike.line": "M\u0131ZRAK HUZMES\u0130",

    "tower.cannon": "Burç", "tower.frost": "Kriyo", "tower.sniper": "M\u0131zrak",
    "tower.cannon.blurb": "Sa\u011flam ta\u015f i\u015f\u00e7ili\u011fi. Her i\u015fte g\u00fcvenilir.",
    "tower.frost.blurb": "Vurdu\u011funu %45 yava\u015flat\u0131r ve kalkan\u0131 k\u0131rar.",
    "tower.sniper.blurb": "Uzun menzil, a\u011f\u0131r vuru\u015f, yava\u015f dolum. K\u0131r\u0131lgan.",
    "tower.hp": "{n} can.",

    "foot.pick": "mevzi se\u00e7", "foot.start": "dalgay\u0131 ba\u015flat",
    "foot.sign": "s\u00f6zle\u015fmeyi imzala", "foot.retarget": "hedef de\u011fi\u015ftir",
    "foot.upgrade": "y\u00fckselt", "foot.repair": "onar", "foot.sell": "sat",
    "foot.pause": "duraklat", "foot.deselect": "se\u00e7imi b\u0131rak"
  },

  /* ══════════════ \u0420\u0423\u0421\u0421\u041a\u0418\u0419 ══════════════ */
  ru: {
    "ui.sound_on": "\u0417\u0432\u0443\u043a \u0432\u043a\u043b.", "ui.sound_off": "\u0417\u0432\u0443\u043a \u0432\u044b\u043a\u043b.",
    "ui.pause": "\u041f\u0430\u0443\u0437\u0430", "ui.resume": "\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c", "ui.how": "\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c",
    "ui.back": "\u041d\u0430\u0437\u0430\u0434", "ui.armoury": "\u0410\u0440\u0441\u0435\u043d\u0430\u043b", "ui.begin": "\u041d\u0430\u0447\u0430\u0442\u044c \u043f\u043b\u0430\u043d",
    "ui.new_plan": "\u041d\u043e\u0432\u044b\u0439 \u043f\u043b\u0430\u043d", "ui.abandon": "\u0411\u0440\u043e\u0441\u0438\u0442\u044c \u0437\u0430\u0431\u0435\u0433",
    "ui.paused": "\u041f\u0430\u0443\u0437\u0430", "ui.paused_lede": "\u041f\u043b\u0430\u043d \u0436\u0434\u0451\u0442.",
    "ui.wipe": "\u0421\u0442\u0435\u0440\u0435\u0442\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435",
    "ui.wipe_confirm": "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0432\u0441\u0435 \u043f\u0435\u0447\u0430\u0442\u0438, \u0443\u043b\u0443\u0447\u0448\u0435\u043d\u0438\u044f \u0438 \u043b\u0443\u0447\u0448\u0438\u0439 \u0437\u0430\u0431\u0435\u0433?",
    "ui.language": "\u042f\u0437\u044b\u043a",

    "hud.wave": "\u0412\u043e\u043b\u043d\u0430", "hud.gold": "\u0417\u043e\u043b\u043e\u0442\u043e",
    "hud.standing": "\u0421\u0442\u043e\u0438\u0442", "hud.kills": "\u0423\u0431\u0438\u0439\u0441\u0442\u0432\u0430",

    "btn.start_wave": "\u041d\u0430\u0447\u0430\u0442\u044c \u0432\u043e\u043b\u043d\u0443 {n}", "btn.wave_running": "\u0412\u043e\u043b\u043d\u0430 {n} \u0438\u0434\u0451\u0442",
    "btn.run_ended": "\u0417\u0430\u0431\u0435\u0433 \u043e\u043a\u043e\u043d\u0447\u0435\u043d", "btn.choose": "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u0430\u0432\u043a\u0443",
    "btn.paused": "\u041f\u0430\u0443\u0437\u0430",

    "panel.contract": "\u041f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u043d\u044b\u0439 \u043a\u043e\u043d\u0442\u0440\u0430\u043a\u0442", "panel.emplacements": "\u0423\u043a\u0440\u0435\u043f\u043b\u0435\u043d\u0438\u044f",
    "panel.selected": "\u0412\u044b\u0431\u0440\u0430\u043d\u043e", "panel.log": "\u0416\u0443\u0440\u043d\u0430\u043b \u043f\u0440\u0430\u0432\u043e\u043a",

    "contract.none": "\u041f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u0439 \u043d\u0435\u0442.",
    "contract.between": "\u041f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f \u043f\u0440\u0438\u0445\u043e\u0434\u044f\u0442 \u043c\u0435\u0436\u0434\u0443 \u0432\u043e\u043b\u043d\u0430\u043c\u0438.",
    "contract.sign": "\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u0442\u044c \u043a\u043e\u043d\u0442\u0440\u0430\u043a\u0442",
    "contract.signed": "\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u043d \u2014 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 \u0432 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0439 \u0432\u043e\u043b\u043d\u0435",

    "inspect.hint": "\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u043d\u0430 \u043f\u043e\u0441\u0442\u0440\u043e\u0435\u043d\u043d\u043e\u0435 \u0443\u043a\u0440\u0435\u043f\u043b\u0435\u043d\u0438\u0435, \u0447\u0442\u043e\u0431\u044b \u0441\u043c\u0435\u043d\u0438\u0442\u044c \u0446\u0435\u043b\u044c, \u0443\u043b\u0443\u0447\u0448\u0438\u0442\u044c, \u043f\u043e\u0447\u0438\u043d\u0438\u0442\u044c \u0438\u043b\u0438 \u043f\u0440\u043e\u0434\u0430\u0442\u044c. \u041f\u043e\u0432\u0440\u0435\u0436\u0434\u0451\u043d\u043d\u044b\u0435 \u0441\u0442\u043e\u044f\u0442 \u0434\u0435\u0448\u0435\u0432\u043b\u0435.",
    "inspect.tier": "\u0423\u0420\u041e\u0412\u0415\u041d\u042c {n} / 3",
    "inspect.damage": "\u0423\u0440\u043e\u043d", "inspect.range": "\u0414\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c",
    "inspect.cycle": "\u041f\u0435\u0440\u0435\u0437\u0430\u0440\u044f\u0434\u043a\u0430", "inspect.invested": "\u0412\u043b\u043e\u0436\u0435\u043d\u043e",
    "inspect.upgrade": "\u0423\u043b\u0443\u0447\u0448\u0438\u0442\u044c {n}", "inspect.maxed": "\u041c\u0430\u043a\u0441\u0438\u043c\u0443\u043c",
    "inspect.repair": "\u041f\u043e\u0447\u0438\u043d\u0438\u0442\u044c {n}", "inspect.intact": "\u0426\u0435\u043b\u043e",
    "inspect.cursed": "\u041f\u0440\u043e\u043a\u043b\u044f\u0442\u043e", "inspect.sell": "\u041f\u0440\u043e\u0434\u0430\u0442\u044c {n}",
    "inspect.targeting": "\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 \u0446\u0435\u043b\u0438",

    "swamp.sinks_in": "\u0412 \u0431\u043e\u043b\u043e\u0442\u0435 \u2014 \u0443\u0439\u0434\u0451\u0442 \u043f\u043e\u0434 \u0432\u043e\u0434\u0443 \u0447\u0435\u0440\u0435\u0437 {n} \u0432\u043e\u043b\u043d\u044b.",
    "swamp.sinking": "\u0412 \u0431\u043e\u043b\u043e\u0442\u0435 \u2014 \u0443\u0439\u0434\u0451\u0442 \u043f\u043e\u0441\u043b\u0435 \u044d\u0442\u043e\u0439 \u0432\u043e\u043b\u043d\u044b.",
    "swamp.shore": "\u0423\u043a\u0440\u0435\u043f\u0438\u0442\u044c {n}",

    "mode.first": "\u041f\u0435\u0440\u0432\u044b\u0439", "mode.last": "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439",
    "mode.strong": "\u041a\u0440\u0435\u043f\u0447\u0430\u0439\u0448\u0438\u0439", "mode.close": "\u0411\u043b\u0438\u0436\u0430\u0439\u0448\u0438\u0439",
    "mode.first.hint": "\u0414\u0430\u043b\u044c\u0448\u0435 \u0432\u0441\u0435\u0445 \u043f\u0440\u043e\u0448\u0451\u043b \u043f\u043e \u0434\u043e\u0440\u043e\u0433\u0435",
    "mode.last.hint": "\u0411\u043b\u0438\u0436\u0435 \u0432\u0441\u0435\u0445 \u043a \u0432\u0445\u043e\u0434\u0443",
    "mode.strong.hint": "\u0411\u043e\u043b\u044c\u0448\u0435 \u0432\u0441\u0435\u0433\u043e \u0437\u0434\u043e\u0440\u043e\u0432\u044c\u044f",
    "mode.close.hint": "\u0411\u043b\u0438\u0436\u0435 \u0432\u0441\u0435\u0445 \u043a \u044d\u0442\u043e\u043c\u0443 \u0443\u043a\u0440\u0435\u043f\u043b\u0435\u043d\u0438\u044e",

    "draft.title": "\u0412\u043e\u043b\u043d\u0430 \u043e\u0442\u0431\u0438\u0442\u0430",
    "draft.sub": "\u0412\u043e\u043b\u043d\u0430 {n} \u043e\u0442\u0431\u0438\u0442\u0430. \u0412\u043d\u0435\u0441\u0438\u0442\u0435 \u043e\u0434\u043d\u0443 \u043f\u0440\u0430\u0432\u043a\u0443 \u0432 \u043f\u043b\u0430\u043d.",
    "draft.sub_many": "\u0412\u043e\u043b\u043d\u0430 {n} \u043e\u0442\u0431\u0438\u0442\u0430. \u041f\u043e\u043b\u043e\u0436\u0435\u043d\u043e \u043f\u0440\u0430\u0432\u043e\u043a: {c} \u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043e\u0434\u043d\u0443.",
    "draft.revision": "\u041f\u0440\u0430\u0432\u043a\u0430 {n}", "draft.curse": "\u041f\u0440\u043e\u043a\u043b\u044f\u0442\u0438\u0435",
    "draft.locked": "\u041e\u0442\u043a\u0440\u043e\u0435\u0442\u0441\u044f \u0447\u0435\u0440\u0435\u0437 \u043f\u0440\u0430\u0432\u043a\u0443.", "draft.locked_short": "\u0417\u0430\u043a\u0440\u044b\u0442\u043e",

    "over.gate_fell": "\u0412\u043e\u0440\u043e\u0442\u0430 \u043f\u0430\u043b\u0438", "over.abandoned": "\u0417\u0430\u0431\u0435\u0433 \u0431\u0440\u043e\u0448\u0435\u043d",
    "over.lede_breach": "\u041e\u0434\u0438\u043d \u0438\u0437 \u043d\u0438\u0445 \u043f\u0440\u043e\u0448\u0451\u043b. \u042d\u0442\u043e\u0433\u043e \u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e.",
    "over.lede_abandon": "\u0412\u044b \u043e\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u043b\u0438\u0441\u044c \u0441\u0430\u043c\u0438.",
    "over.record": "\u041d\u043e\u0432\u044b\u0439 \u0440\u0435\u043a\u043e\u0440\u0434",
    "over.waves": "\u041f\u0440\u043e\u0439\u0434\u0435\u043d\u043e \u0432\u043e\u043b\u043d", "over.kills": "\u0423\u043d\u0438\u0447\u0442\u043e\u0436\u0435\u043d\u043e \u0432\u0440\u0430\u0433\u043e\u0432",
    "over.built": "\u041f\u043e\u0441\u0442\u0440\u043e\u0435\u043d\u043e \u0443\u043a\u0440\u0435\u043f\u043b\u0435\u043d\u0438\u0439", "over.lost": "\u041f\u043e\u0442\u0435\u0440\u044f\u043d\u043e \u0443\u043a\u0440\u0435\u043f\u043b\u0435\u043d\u0438\u0439",
    "over.sunk": "\u0417\u0430\u0431\u0440\u0430\u043b\u043e \u0431\u043e\u043b\u043e\u0442\u043e", "over.cards": "\u0412\u043d\u0435\u0441\u0435\u043d\u043e \u043f\u0440\u0430\u0432\u043e\u043a",
    "over.curses": "\u041f\u0440\u0438\u043d\u044f\u0442\u043e \u043f\u0440\u043e\u043a\u043b\u044f\u0442\u0438\u0439", "over.contracts": "\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u043d\u043e \u043a\u043e\u043d\u0442\u0440\u0430\u043a\u0442\u043e\u0432",
    "over.seals": "\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u043e \u043f\u0435\u0447\u0430\u0442\u0435\u0439",

    "armoury.title": "\u0410\u0440\u0441\u0435\u043d\u0430\u043b",
    "armoury.lede": "\u041f\u0435\u0447\u0430\u0442\u0438 \u0434\u0430\u044e\u0442\u0441\u044f \u0437\u0430 \u043a\u0430\u0436\u0434\u044b\u0439 \u0437\u0430\u0431\u0435\u0433 \u2014 \u0443\u0434\u0430\u0447\u043d\u044b\u0439 \u0438\u043b\u0438 \u043d\u0435\u0442. \u041a\u0443\u043f\u043b\u0435\u043d\u043d\u043e\u0435 \u0437\u0434\u0435\u0441\u044c \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u043d\u0430\u0432\u0441\u0435\u0433\u0434\u0430.",
    "armoury.held": "\u041f\u0435\u0447\u0430\u0442\u0435\u0439 \u0432 \u043d\u0430\u043b\u0438\u0447\u0438\u0438", "armoury.complete": "\u0413\u043e\u0442\u043e\u0432\u043e",
    "armoury.cost": "{n} \u043f\u0435\u0447\u0430\u0442\u0435\u0439",

    "title.tagline": "\u0420\u043e\u0433\u0430\u043b\u0438\u043a-\u043e\u0431\u043e\u0440\u043e\u043d\u0430 \u0431\u0430\u0448\u043d\u044f\u043c\u0438. \u041e\u043d\u0438 \u0438\u0434\u0443\u0442 \u043f\u043e \u0434\u0432\u0443\u043c \u0434\u043e\u0440\u043e\u0433\u0430\u043c, \u0441\u0445\u043e\u0434\u044f\u0449\u0438\u043c\u0441\u044f \u0443 \u043e\u0434\u043d\u0438\u0445 \u0432\u043e\u0440\u043e\u0442, \u0438 \u043d\u0438 \u043e\u0434\u0438\u043d \u043d\u0435 \u0434\u043e\u043b\u0436\u0435\u043d \u043f\u0440\u043e\u0439\u0442\u0438 \u2014 \u043e\u0434\u0438\u043d \u043f\u0440\u043e\u0440\u044b\u0432 \u0437\u0430\u0432\u0435\u0440\u0448\u0430\u0435\u0442 \u0437\u0430\u0431\u0435\u0433. \u041a\u0430\u0436\u0434\u0430\u044f \u043e\u0442\u0431\u0438\u0442\u0430\u044f \u0432\u043e\u043b\u043d\u0430 \u0434\u0430\u0451\u0442 \u043f\u0440\u0430\u0432\u043a\u0443 \u043a \u0447\u0435\u0440\u0442\u0435\u0436\u0443. \u041d\u0435\u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0438\u0437 \u043d\u0438\u0445 \u2014 \u043f\u0440\u043e\u043a\u043b\u044f\u0442\u0438\u044f.",
    "title.best": "\u041b\u0443\u0447\u0448\u0438\u0439 \u0437\u0430\u0431\u0435\u0433", "title.no_runs": "\u0437\u0430\u0431\u0435\u0433\u043e\u0432 \u043d\u0435\u0442",
    "log.empty": "\u041f\u0440\u0430\u0432\u043e\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0442. \u041e\u0442\u0431\u0435\u0439\u0442\u0435 \u0432\u043e\u043b\u043d\u0443.",

    "canvas.build": "\u0424\u0410\u0417\u0410 \u0421\u0422\u0420\u041e\u0418\u0422\u0415\u041b\u042c\u0421\u0422\u0412\u0410 \u2014 \u043d\u0438\u0447\u0442\u043e \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0434\u043e\u0439\u0442\u0438 \u0434\u043e \u0432\u043e\u0440\u043e\u0442",
    "canvas.harvester": "\u25B2 \u0416\u041d\u0415\u0426 \u2014 {label}",
    "canvas.sinks_in": "\u0412\u041e\u041b\u041d: {n}", "canvas.sinking": "\u0422\u041e\u041d\u0415\u0422",

    "float.breach": "\u041f\u0420\u041e\u0420\u042b\u0412", "float.destroyed": "\u0420\u0410\u0417\u0420\u0423\u0428\u0415\u041d\u041e",
    "float.swallowed": "\u041f\u041e\u0413\u041b\u041e\u0429\u0415\u041d\u041e", "float.repaired": "\u041f\u041e\u0427\u0418\u041d\u0415\u041d\u041e",
    "float.shored": "\u0423\u041a\u0420\u0415\u041f\u041b\u0415\u041d\u041e", "float.tier": "\u0423\u0420\u041e\u0412\u0415\u041d\u042c {n}",
    "float.ward": "\u0429\u0418\u0422 \u0421\u041b\u041e\u041c\u0410\u041d", "float.silenced": "\u0417\u0410\u0413\u041b\u0423\u0428\u0415\u041d\u041e: {n}",
    "float.conscripted": "\u0418\u0417\u042a\u042f\u0422\u041e",

    "strike.zone": "\u041b\u0423\u0427 \u0416\u041d\u0415\u0426\u0410", "strike.line": "\u041a\u041e\u041f\u042c\u0415\u0412\u041e\u0419 \u041b\u0423\u0427",

    "tower.cannon": "\u0411\u0430\u0441\u0442\u0438\u043e\u043d", "tower.frost": "\u041a\u0440\u0438\u043e", "tower.sniper": "\u041a\u043e\u043f\u044c\u0451",
    "tower.cannon.blurb": "\u041a\u0440\u0435\u043f\u043a\u0430\u044f \u043a\u043b\u0430\u0434\u043a\u0430. \u041d\u0430\u0434\u0451\u0436\u043d\u043e \u043f\u0440\u043e\u0442\u0438\u0432 \u0432\u0441\u0435\u0433\u043e.",
    "tower.frost.blurb": "\u0417\u0430\u043c\u0435\u0434\u043b\u044f\u0435\u0442 \u043d\u0430 45% \u0438 \u0441\u0440\u044b\u0432\u0430\u0435\u0442 \u0449\u0438\u0442\u044b.",
    "tower.sniper.blurb": "\u0414\u0430\u043b\u044c\u043d\u043e\u0431\u043e\u0439\u043d\u043e\u0435, \u0442\u044f\u0436\u0451\u043b\u043e\u0435, \u043c\u0435\u0434\u043b\u0435\u043d\u043d\u043e\u0435. \u0425\u0440\u0443\u043f\u043a\u043e\u0435.",
    "tower.hp": "{n} \u0435\u0434. \u043f\u0440\u043e\u0447\u043d\u043e\u0441\u0442\u0438.",

    "foot.pick": "\u0432\u044b\u0431\u0440\u0430\u0442\u044c \u0443\u043a\u0440\u0435\u043f\u043b\u0435\u043d\u0438\u0435", "foot.start": "\u043d\u0430\u0447\u0430\u0442\u044c \u0432\u043e\u043b\u043d\u0443",
    "foot.sign": "\u043f\u043e\u0434\u043f\u0438\u0441\u0430\u0442\u044c \u043a\u043e\u043d\u0442\u0440\u0430\u043a\u0442", "foot.retarget": "\u0441\u043c\u0435\u043d\u0438\u0442\u044c \u0446\u0435\u043b\u044c",
    "foot.upgrade": "\u0443\u043b\u0443\u0447\u0448\u0438\u0442\u044c", "foot.repair": "\u043f\u043e\u0447\u0438\u043d\u0438\u0442\u044c", "foot.sell": "\u043f\u0440\u043e\u0434\u0430\u0442\u044c",
    "foot.pause": "\u043f\u0430\u0443\u0437\u0430", "foot.deselect": "\u0441\u043d\u044f\u0442\u044c \u0432\u044b\u0431\u043e\u0440"
  }
  };

  /* ---- lookup ------------------------------------------------------- */
  function t(key, vars) {
    var s = (DICT[lang] && DICT[lang][key]);
    if (s === undefined) s = DICT.en[key];
    if (s === undefined) return key;          // loud, so misses are visible
    if (vars) {
      for (var k in vars) s = s.split("{" + k + "}").join(vars[k]);
    }
    return s;
  }

  function setLang(code) {
    if (!DICT[code]) code = "en";
    lang = code;
    try { window.localStorage.setItem(KEY, code); } catch (e) {}
    document.documentElement.setAttribute("lang", code);
    applyStatic();
  }

  function getLang() { return lang; }

  /* Swap every element carrying data-i18n. */
  function applyStatic() {
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    }
    var html = document.querySelectorAll("[data-i18n-html]");
    for (var j = 0; j < html.length; j++) {
      html[j].innerHTML = t(html[j].getAttribute("data-i18n-html"));
    }
  }

  function detect() {
    var saved = null;
    try { saved = window.localStorage.getItem(KEY); } catch (e) {}
    if (saved && DICT[saved]) return saved;
    var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return DICT[nav] ? nav : "en";
  }

  /* Lets a second file bolt on the content strings (cards, contracts, help)
     without making this one unreadable. */
  function addStrings(code, obj) {
    if (!DICT[code]) DICT[code] = {};
    for (var k in obj) DICT[code][k] = obj[k];
  }

  RV.addStrings = addStrings;
  RV.t = t;
  RV.setLang = setLang;
  RV.getLang = getLang;
  RV.applyStatic = applyStatic;
  RV.detectLang = detect;

}(window.RV));
