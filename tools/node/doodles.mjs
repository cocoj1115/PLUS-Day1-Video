// Hand-drawn doodles for the PLUS video, generated with rough.js (fixed seeds, so every
// build is identical). Writes assets/doodles/*.svg and assets/doodles/inline.json (path data
// for shapes the scenes draw inline, e.g. the laptops whose outlines animate).
//   cd tools/node && node doodles.mjs
import rough from "roughjs/bundled/rough.esm.js";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("../../assets/doodles");
const gen = rough.generator();
const INK = "#00454d", LINE = "#3f484a";
const C = { blue: "#90c9f4", blue1: "#d7eefd", blue2: "#367cb3", green: "#a0cca3", green2: "#5c9c62",
  yellow: "#f5c263", yellow1: "#fbe9b2", yellow2: "#ecad43", pink: "#f8dbef", coral: "#f2acaa",
  coral1: "#f9dad9", red: "#be5052", white: "#ffffff" };

let seed = 11;
const base = (o = {}) => ({ seed: seed++, roughness: 1.15, bowing: 1.2, strokeWidth: 5, stroke: INK,
  fillStyle: "solid", ...o });

// a drawable -> svg <path> elements
function el(d) {
  return gen.toPaths(d).map((p) => {
    const fill = p.fill && p.fill !== "none" ? p.fill : "none";
    return `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("");
}
// soft crayon wobble + grain, the same on every doodle
const FILTER = `<defs><filter id="crayon" x="-5%" y="-5%" width="110%" height="110%">
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves="1" seed="3" result="g"/>
<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="ga"/>
<feComposite in="d" in2="ga" operator="in"/></filter></defs>`;
function svg(name, w, h, body, stretch = false) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 ${w + 16} ${h + 16}" width="${w + 16}" height="${h + 16}"${stretch ? ' preserveAspectRatio="none"' : ""}>${FILTER}<g filter="url(#crayon)">${body}</g></svg>`;
  fs.writeFileSync(path.join(OUT, name), s);
}
const P = (d, o) => el(gen.path(d, base(o)));
const R = (x, y, w, h, o) => el(gen.rectangle(x, y, w, h, base(o)));
const E = (x, y, w, h, o) => el(gen.ellipse(x, y, w, h, base(o)));
const L = (x1, y1, x2, y2, o) => el(gen.line(x1, y1, x2, y2, base(o)));

// --- icons ---------------------------------------------------------------
svg("cursor.svg", 64, 80, P("M6 4 L6 62 L20 49 L30 74 L41 69 L31 45 L50 45 Z", { fill: C.white, roughness: 0.8 }));
svg("check.svg", 100, 100, E(50, 50, 86, 84, { fill: C.green, stroke: C.green2, strokeWidth: 4 }) +
  P("M28 52 L44 67 L73 35", { stroke: C.white, strokeWidth: 10, roughness: 0.9 }));
svg("hand.svg", 100, 120, P("M30 112 C 18 96 14 80 16 66 L 16 50 C 16 44 26 44 26 50 L 26 64 L 28 22 C 28 14 39 14 39 22 L 39 58 L 41 12 C 41 4 53 4 53 12 L 53 58 L 56 18 C 56 10 67 10 67 18 L 66 62 L 70 34 C 71 26 82 27 81 35 L 78 76 C 76 94 70 104 62 112 Z", { fill: C.yellow, stroke: LINE, strokeWidth: 4, roughness: 0.9 }));
svg("headphones.svg", 200, 150, P("M30 112 C 26 36 174 36 170 112", { strokeWidth: 11 }) +
  R(10, 88, 42, 58, { fill: C.blue2 }) + R(148, 88, 42, 58, { fill: C.blue2 }));
const spk = (fill) => P("M12 38 L32 38 L56 16 L56 84 L32 62 L12 62 Z", { fill });
svg("speaker.svg", 120, 100, spk(C.blue1) + P("M72 34 C 82 44 82 56 72 66") + P("M86 22 C 104 40 104 60 86 78"));
svg("speaker-muted.svg", 120, 100, spk(C.coral1) + L(74, 34, 104, 66, { stroke: C.red, strokeWidth: 6 }) + L(104, 34, 74, 66, { stroke: C.red, strokeWidth: 6 }));
svg("screen-x.svg", 120, 100, R(10, 10, 100, 64, { fill: C.coral1 }) + L(46, 90, 74, 90) + L(60, 74, 60, 90) +
  L(44, 28, 76, 58, { stroke: C.red, strokeWidth: 6 }) + L(76, 28, 44, 58, { stroke: C.red, strokeWidth: 6 }));
svg("question.svg", 120, 180, P("M22 52 C 22 10 98 6 98 50 C 98 80 60 82 60 112 L60 124", { stroke: C.blue2, strokeWidth: 15, roughness: 0.9 }) +
  E(60, 158, 22, 22, { fill: C.blue2, stroke: C.blue2, strokeWidth: 3 }));
svg("star.svg", 100, 100, P("M50 6 L61 37 L94 38 L68 58 L77 91 L50 72 L23 91 L32 58 L6 38 L39 37 Z", { fill: C.yellow, stroke: C.yellow2, strokeWidth: 4 }));
svg("thumbs.svg", 100, 100, P("M30 46 L44 18 C 48 10 60 14 58 24 L54 40 L80 40 C 88 40 92 48 88 56 L80 84 C 78 90 74 92 68 92 L30 92 Z", { fill: C.yellow1, stroke: LINE, strokeWidth: 4 }) +
  R(10, 44, 20, 50, { fill: C.blue, stroke: LINE, strokeWidth: 4 }));
svg("snack.svg", 160, 200, P("M18 14 L142 14 L136 30 L142 46 L134 172 L142 186 L18 186 L26 172 L18 46 L24 30 Z", { fill: C.pink, stroke: "#b8474f" }) +
  E(60, 96, 36, 36, { fill: C.red, stroke: "#b8474f", strokeWidth: 3 }) + E(96, 84, 32, 32, { fill: C.yellow, stroke: C.yellow2, strokeWidth: 3 }) +
  E(94, 122, 34, 34, { fill: C.green, stroke: C.green2, strokeWidth: 3 }) + E(62, 134, 28, 28, { fill: C.blue, stroke: C.blue2, strokeWidth: 3 }) +
  L(40, 160, 120, 160, { stroke: "#b8474f" }));
// the flag: a wooden pole with a small grass tuft, and a cloth that ripples in two waves
svg("flag.svg", 170, 230,
  P("M28 222 C 30 160 26 90 30 14", { stroke: "#8a6a4a", strokeWidth: 8, roughness: 0.7 }) +
  P("M32 18 C 58 6 78 30 104 22 C 124 16 138 12 156 22 C 152 46 154 70 150 90 C 132 82 118 86 100 92 C 76 100 56 78 32 88 Z",
    { fill: C.yellow, stroke: C.yellow2, strokeWidth: 4 }) +
  P("M8 224 L14 206 M22 226 L26 202 M38 226 L36 206 M50 224 L46 210", { stroke: C.green2, strokeWidth: 4 }));
svg("clock.svg", 100, 100, E(50, 52, 76, 76, { fill: C.blue1 }) + P("M50 30 L50 52 L66 62", { strokeWidth: 6, roughness: 0.6 }));
svg("arrow-back.svg", 200, 120, P("M20 96 C 40 20 150 10 176 70", { stroke: C.blue2, strokeWidth: 7, roughness: 0.9 }) +
  P("M150 66 L178 74 L184 44", { stroke: C.blue2, strokeWidth: 7, roughness: 0.6 }));
// sticky-note icons (scene 2)
svg("smile.svg", 100, 100, E(50, 50, 80, 80, { fill: C.white }) + E(37, 42, 8, 8, { fill: INK, strokeWidth: 2 }) +
  E(63, 42, 8, 8, { fill: INK, strokeWidth: 2 }) + P("M34 60 Q50 74 66 60"));
svg("ask.svg", 100, 100, P("M12 20 Q12 10 22 10 L78 10 Q88 10 88 20 L88 62 Q88 72 78 72 L40 72 L22 90 L24 72 L22 72 Q12 72 12 62 Z", { fill: C.white }) +
  P("M40 32 Q40 22 50 22 Q60 22 60 31 Q60 38 50 42 L50 48", { roughness: 0.6 }) + E(50, 59, 6, 6, { fill: INK, strokeWidth: 2 }));
svg("pencil.svg", 100, 100, P("M22 78 L30 56 L70 16 L84 30 L44 70 Z", { fill: C.yellow }) + L(22, 78, 44, 70) + L(64, 22, 78, 36));
svg("checkbox.svg", 100, 100, R(12, 12, 76, 76, { fill: C.yellow1 }) + P("M30 52 L45 66 L72 36", { strokeWidth: 6, roughness: 0.7 }));
svg("waves.svg", 200, 90, ["M20 25 Q35 45 20 65", "M45 15 Q68 45 45 75", "M180 25 Q165 45 180 65", "M155 15 Q132 45 155 75"]
  .map((d) => P(d, { stroke: C.blue2, strokeWidth: 7, roughness: 0.8 })).join(""));
svg("rings.svg", 780, 52, [60, 200, 340, 480, 620].map((x) => P(`M${x} 46 C ${x} 6 ${x + 32} 6 ${x + 32} 46`, { strokeWidth: 6, roughness: 0.8 })).join(""));
svg("stone.svg", 400, 100, E(200, 50, 390, 88, { fill: C.yellow1, stroke: C.yellow2, strokeWidth: 5, roughness: 1.4 }), true);

// --- speech bubbles (hand-drawn), tail toward the speaker -------------------
// body: rounded blob w×h; tail drawn as part of the outline
function bubblePath(w, h, tail) {
  const r = Math.min(w, h) * 0.32;
  if (tail === "left") {          // tail on the left side, pointing left (toward the photo)
    const ty = h * 0.55;
    return `M${r} 0 L${w - r} 0 Q${w} 0 ${w} ${r} L${w} ${h - r} Q${w} ${h} ${w - r} ${h} L${r} ${h} Q0 ${h} 0 ${h - r} L0 ${ty + 22} L-46 ${ty + 6} L0 ${ty - 18} L0 ${r} Q0 0 ${r} 0 Z`;
  }
  // tail bottom-left, pointing down-left (toward the student)
  const tx = w * 0.16;
  return `M${r} 0 L${w - r} 0 Q${w} 0 ${w} ${r} L${w} ${h - r} Q${w} ${h} ${w - r} ${h} L${tx + 60} ${h} L${tx - 30} ${h + 62} L${tx + 14} ${h} L${r} ${h} Q0 ${h} 0 ${h - r} L0 ${r} Q0 0 ${r} 0 Z`;
}
const bub = (name, w, h, fill, stroke, tail) =>
  svg(name, w + 60, h + 70, `<g transform="translate(50 4)">` + P(bubblePath(w, h, tail), { fill, stroke, strokeWidth: 5, roughness: 1.0, bowing: 1.4 }) + `</g>`);
bub("bubble-yellow.svg", 300, 230, C.yellow1, C.yellow2, "left");
bub("bubble-blue.svg", 300, 230, C.blue1, C.blue, "left");
bub("bubble-pink.svg", 300, 230, C.pink, C.coral, "left");
bub("bubble-say.svg", 640, 150, C.white, INK, "bottom");

// --- inline shapes (outlines the scenes animate) --------------------------
const one = (d) => gen.toPaths(d).map((p) => p.d).join(" ");
const inline = {
  // welcome laptop, 700×470 box
  w_screen: one(gen.path("M62 18 Q350 10 640 20 Q648 190 642 382 Q350 388 58 380 Q52 200 62 18 Z", base({ roughness: 1.0 }))),
  w_base: one(gen.path("M18 384 Q350 380 684 386 L700 432 Q350 446 2 430 Z", base({ roughness: 1.0 }))),
  w_notch: one(gen.path("M300 400 Q350 404 400 400", base({ roughness: 0.6 }))),
  // start laptop, 940×640 box
  s_screen: one(gen.path("M14 8 Q470 0 926 10 Q934 260 928 410 Q470 418 10 410 Q6 220 14 8 Z", base({ roughness: 1.0 }))),
  s_base: one(gen.path("M-20 414 Q470 410 960 416 L978 462 Q470 476 -38 460 Z", base({ roughness: 1.0 }))),
  // the "stuck here" ring (scene 5), 380×150 box
  j_ring: one(gen.ellipse(190, 72, 330, 118, base({ roughness: 1.6, bowing: 2 }))),
};
fs.writeFileSync(path.join(OUT, "inline.json"), JSON.stringify(inline, null, 1));
console.log("doodles written:", fs.readdirSync(OUT).length);
