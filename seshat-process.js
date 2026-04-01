/**
 * seshat-process.js
 *
 * Reads SeshatDetailedPaths.svg (the Inkscape source with inkscape:label on
 * every element) and produces SeshatAnimation.svg — a working animation file
 * where every path is preserved exactly while CSS animations are injected via
 * a <style> block in the SVG's <defs>.
 *
 * USAGE
 *   node seshat-process.js
 *
 * OUTPUT
 *   SeshatAnimation.svg  — drop this into any HTML page or open directly in
 *                          a browser to see the animations.
 *
 * =====================================================================
 *  GROUP REFERENCE (id => inkscape:label)
 * =====================================================================
 *  g94   rosette          — star-shaped headdress top
 *  g77   eye              — eye + brow detail
 *  g107  body             — full body outline, face, limbs
 *  g91   dress-belt       — belt across the dress
 *  g3    short-hair-group — short crown hair strands (7)
 *  g2    long-hair-group  — long flowing hair strands (21) ← HARP TARGET
 *  g17   palm-rib         — decorative circles / palm pattern
 *  g16   shen-ring        — protective shen-ring cartouche
 *  g95   tadpole          — tadpole hieroglyph
 *  g10   necklace         — menat necklace + gems
 *  g92   dress-knot       — tied knot on dress
 *  g106  dress-decoration — dress surface pattern
 *  g93   bangle-2         — wide wrist bangle with strands ← MINI HARP TARGET
 *  g18   bangle           — solid bangle with stripes
 *  g14   left-tail        — left shendyt tail
 *  g15   tail-right       — right shendyt tail
 *  g99   headband         — headband detail
 *  g105  shoulder-strap   — shoulder strap of dress
 *  g13   dress-seam       — dress seam lines
 * =====================================================================
 *
 * =====================================================================
 *  LONG HAIR STRANDS (long-hair-group / g2) — harp plucking order
 * =====================================================================
 *  long-hair-1  => #path30    long-hair-2  => #path68
 *  long-hair-3  => #path67    long-hair-4  => #path66
 *  long-hair-5  => #path65    long-hair-6  => #path64
 *  long-hair-7  => #path48    long-hair-8  => #path50
 *  long-hair-9  => #path51    long-hair-10 => #path52
 *  long-hair-11 => #path53    long-hair-12 => #path54
 *  long-hair-13 => #path55    long-hair-14 => #path56
 *  long-hair-15 => #path63    long-hair-16 => #path62
 *  long-hair-17 => #path61    long-hair-18 => #path60
 *  long-hair-19 => #path59    long-hair-20 => #path58
 *  long-hair-21 => #path57
 *
 * =====================================================================
 *  UPPER HAIR STRANDS — ambient shimmer
 * =====================================================================
 *  upper-hair-strand-1  => #path105   upper-hair-strand-2  => #path1
 *  upper-hair-strand-3  => #path3     upper-hair-strand-4  => #path9
 *  upper-hair-strand-5  => #path92    upper-hair-strand-6  => #path93
 *  upper-hair-strand-7  => #path94    upper-hair-strand-8  => #path96
 *  upper-hair-strand-9  => #path97    upper-hair-strand-10 => #path98
 *  upper-hair-strand-11 => #path100   upper-hair-strand-12 => #path101
 *  upper-hair-strand-13 => #path102   upper-hair-strand-14 => #path103
 *  upper-hair-strand-15 => #path104
 *
 * =====================================================================
 *  BANGLE-2 STRANDS — micro harp
 * =====================================================================
 *  bangle-2-strand-1 => #path401   bangle-2-strand-2 => #path402
 *  bangle-2-strand-3 => #path403   bangle-2-strand-4 => #path404
 *  bangle-2-strand-5 => #path405   bangle-2-strand-6 => #path406
 *  bangle-2-strand-7 => #path407   bangle-2-strand-8 => #path408
 *  bangle-2-strand-9 => #path409
 *
 * =====================================================================
 *  SHORT HAIR STRANDS (short-hair-group / g3)
 *  Aligned to long hair: short-hair-N fires with long-hair-(N-1)
 *  short-hair-7 ↔ long-hair-6, short-hair-6 ↔ long-hair-5, etc.
 * =====================================================================
 *  short-hair-1 => #path20   short-hair-2 => #path22   short-hair-3 => #path23
 *  short-hair-4 => #path24   short-hair-5 => #path46   short-hair-6 => #path47
 *  short-hair-7 => #path49
 *
 * =====================================================================
 *  DRESS STARS (dress-decoration / g106) — individual sparkle
 * =====================================================================
 *  star-h  => #path223   star-i  => #path224   star-j  => #path225
 *  star-5  => #path226   star-1  => #path227   star-7  => #path228
 *  star-6  => #path229   star-8  => #path230   star-9  => #path231
 *  star-10 => #path232   star-11 => #path233   star-12 => #path234
 *  star-13 => #path235   star-14 => #path236   star-15 => #path237
 *  star-16 => #path238   star-17 => #path239   star-18 => #path240
 *  star-21 => #path241   star-19 => #path242   star-20 => #path243
 *  star-26 => #path244   star-27 => #path245   star-28 => #path246
 *  star-29 => #path247   star-33 => #path248   star-34 => #path249
 *  star-35 => #path250   star-36 => #path251   star-39 => #path252
 *  star-38 => #path253   star-37 => #path254   star-32 => #path255
 *  star-31 => #path256   star-30 => #path257   star-31 => #path258
 *  star-25 => #path259   star-24 => #path260   star-22 => #path261
 *
 * =====================================================================
 *  UPPER BODY STARS — individual sparkle
 * =====================================================================
 *  star-g  => #path78    star-c  => #path79    star-f  => #path85
 *  star-b  => #path86    star-d  => #path87    star-e  => #path88
 *  star-a  => #path91
 * =====================================================================
 */

'use strict';
const fs = require('fs');

// ---------------------------------------------------------------------------
// Element maps: [inkscape-label, path-id]
// ---------------------------------------------------------------------------

const LONG_HAIR = [
  ['long-hair-1',  'path30'],
  ['long-hair-2',  'path68'],
  ['long-hair-3',  'path67'],
  ['long-hair-4',  'path66'],
  ['long-hair-5',  'path65'],
  ['long-hair-6',  'path64'],
  ['long-hair-7',  'path48'],
  ['long-hair-8',  'path50'],
  ['long-hair-9',  'path51'],
  ['long-hair-10', 'path52'],
  ['long-hair-11', 'path53'],
  ['long-hair-12', 'path54'],
  ['long-hair-13', 'path55'],
  ['long-hair-14', 'path56'],
  ['long-hair-15', 'path63'],
  ['long-hair-16', 'path62'],
  ['long-hair-17', 'path61'],
  ['long-hair-18', 'path60'],
  ['long-hair-19', 'path59'],
  ['long-hair-20', 'path58'],
  ['long-hair-21', 'path57'],
];

const UPPER_HAIR = [
  ['upper-hair-strand-1',  'path105'],
  ['upper-hair-strand-2',  'path1'],
  ['upper-hair-strand-3',  'path3'],
  ['upper-hair-strand-4',  'path9'],
  ['upper-hair-strand-5',  'path92'],
  ['upper-hair-strand-6',  'path93'],
  ['upper-hair-strand-7',  'path94'],
  ['upper-hair-strand-8',  'path96'],
  ['upper-hair-strand-9',  'path97'],
  ['upper-hair-strand-10', 'path98'],
  ['upper-hair-strand-11', 'path100'],
  ['upper-hair-strand-12', 'path101'],
  ['upper-hair-strand-13', 'path102'],
  ['upper-hair-strand-14', 'path103'],
  ['upper-hair-strand-15', 'path104'],
];

const SHORT_HAIR = [
  ['short-hair-1', 'path20'],
  ['short-hair-2', 'path22'],
  ['short-hair-3', 'path23'],
  ['short-hair-4', 'path24'],
  ['short-hair-5', 'path46'],
  ['short-hair-6', 'path47'],
  ['short-hair-7', 'path49'],
];

const BANGLE_STRANDS = [
  ['bangle-2-strand-1', 'path401'],
  ['bangle-2-strand-2', 'path402'],
  ['bangle-2-strand-3', 'path403'],
  ['bangle-2-strand-4', 'path404'],
  ['bangle-2-strand-5', 'path405'],
  ['bangle-2-strand-6', 'path406'],
  ['bangle-2-strand-7', 'path407'],
  ['bangle-2-strand-8', 'path408'],
  ['bangle-2-strand-9', 'path409'],
];

// Solid bangle stripes — reversed so stripe-7 fires first (opposite direction to bangle-2)
const BANGLE_STRIPES = [
  ['bangle-stripe-7', 'path418'],
  ['bangle-stripe-6', 'path417'],
  ['bangle-stripe-5', 'path416'],
  ['bangle-stripe-4', 'path415'],
  ['bangle-stripe-3', 'path414'],
  ['bangle-stripe-2', 'path413'],
  ['bangle-stripe-1', 'path412'],
];

// dress-belt (g91) — two belt straps, traced left to right
const BELT_PATHS = [
  ['belt-strap-1', 'path44'],
  ['belt-strap-2', 'path45'],
];

// dress-knot (g92) — knot body + details + trailing tails
const KNOT_PATHS = [
  ['knot-main',   'path175'],
  ['knot-line-1', 'path176'],
  ['knot-line-2', 'path177'],
  ['knot-trail-1','path178'],
  ['knot-trail-2','path180'],
];

// Dress-decoration group (g106) — 39 individual star paths
const DRESS_STARS = [
  'path223', 'path224', 'path225', 'path226', 'path227',
  'path228', 'path229', 'path230', 'path231', 'path232',
  'path233', 'path234', 'path235', 'path236', 'path237',
  'path238', 'path239', 'path240', 'path241', 'path242',
  'path243', 'path244', 'path245', 'path246', 'path247',
  'path248', 'path249', 'path250', 'path251', 'path252',
  'path253', 'path254', 'path255', 'path256', 'path257',
  'path258', 'path259', 'path260', 'path261',
];

// Upper body stars — 7 paths (not in g106)
const UPPER_STARS = [
  'path78', 'path79', 'path85', 'path86', 'path87', 'path88', 'path91',
];

// Palm-rib buds — ordered bud-1 (base/midnight) → bud-58 (top/midnight)
// 59 entries: bud-41 has two overlapping paths (ellipse87 + ellipse88)
// Used by JS clock engine in script.js; CSS states defined in generateCSS()
const PALM_BUDS = [
  ['bud-1',  'ellipse127'], ['bud-2',  'ellipse126'], ['bud-3',  'ellipse125'],
  ['bud-4',  'ellipse124'], ['bud-5',  'ellipse123'], ['bud-6',  'ellipse122'],
  ['bud-7',  'ellipse121'], ['bud-8',  'ellipse120'], ['bud-9',  'ellipse119'],
  ['bud-10', 'ellipse118'], ['bud-11', 'ellipse117'], ['bud-12', 'ellipse116'],
  ['bud-13', 'ellipse115'], ['bud-14', 'ellipse114'], ['bud-15', 'ellipse113'],
  ['bud-16', 'ellipse112'], ['bud-17', 'ellipse111'], ['bud-18', 'ellipse110'],
  ['bud-19', 'ellipse109'], ['bud-20', 'ellipse108'], ['bud-21', 'ellipse107'],
  ['bud-22', 'ellipse106'], ['bud-23', 'ellipse105'], ['bud-24', 'ellipse104'],
  ['bud-25', 'ellipse103'], ['bud-26', 'ellipse102'], ['bud-27', 'ellipse101'],
  ['bud-28', 'ellipse100'], ['bud-29', 'ellipse99'],  ['bud-30', 'ellipse98'],
  ['bud-31', 'ellipse97'],  ['bud-32', 'ellipse96'],  ['bud-33', 'ellipse95'],
  ['bud-34', 'ellipse94'],  ['bud-35', 'ellipse129'], ['bud-36', 'ellipse93'],
  ['bud-37', 'ellipse92'],  ['bud-38', 'ellipse91'],  ['bud-39', 'ellipse90'],
  ['bud-40', 'ellipse89'],  ['bud-41', 'ellipse87'],  ['bud-41', 'ellipse88'],
  ['bud-42', 'ellipse86'],  ['bud-43', 'ellipse85'],  ['bud-44', 'ellipse84'],
  ['bud-45', 'ellipse83'],  ['bud-46', 'ellipse82'],  ['bud-47', 'ellipse81'],
  ['bud-48', 'ellipse80'],  ['bud-49', 'ellipse79'],  ['bud-50', 'ellipse78'],
  ['bud-51', 'ellipse77'],  ['bud-52', 'ellipse76'],  ['bud-53', 'ellipse75'],
  ['bud-54', 'ellipse74'],  ['bud-55', 'ellipse73'],  ['bud-56', 'ellipse72'],
  ['bud-57', 'ellipse71'],  ['bud-58', 'path71'],
];

// ---------------------------------------------------------------------------
// Animation timing parameters — tweak freely
// ---------------------------------------------------------------------------

const HARP = {
  period:    12,    // full cycle length in seconds
  stagger:   0.38,  // seconds between consecutive strands
  peakAt:    0.05,  // seconds after cycle start to reach peak brightness
  fadeBy:    0.80,  // seconds after cycle start to be mostly faded
  doneBy:    1.20,  // seconds after cycle start to be fully back to normal
  peakBrightness: 2.8,
  glowColor: '#e060ff',
  glowRadius: '4px',
};

const BANGLE = {
  period:    7,
  stagger:   0.28,
  peakAt:    0.04,
  fadeBy:    0.55,
  doneBy:    0.9,
  peakBrightness: 3.2,
  glowColor: '#f090ff',
  glowRadius: '3px',
};

const UPPER = {
  period:    8,     // slow shimmer
  stagger:   0.30,
  peakBrightness: 1.45,
};

// Necklace gem + headdress rosette flashes
const MISC = {
  gemPeriod:          9.0,
  gemDelay:           2.1,
  gemBrightness:      2.4,
  gemGlow:            '#ff80ff',
  rosettePeriod:      7.0,
  rosetteDelay:       0.6,
  rosetteBrightness:  2.2,
  rosetteGlow:        '#ff44ff',
};

// Palm-rib chronometer visual states (colours/brightness used in CSS + clock ripple)
const CLOCK = {
  onColor:           '#00ffee',
  onBrightness:       2.8,
  dimColor:          '#007766',
  dimBrightness:      1.5,
  rippleBrightness:   3.2,
};

// Trace-etch: golden light draws the belt straps then the knot
const TRACE = {
  period:     30,     // full repeat cycle (seconds)
  traceFrac:  0.10,   // fraction of period used for the actual trace stroke
  decayFrac:  0.067,  // fraction for fill fade-in / glow decay after trace
  doneFrac:   0.20,   // fraction at which element is fully back to normal
  stagger:    1.5,    // seconds between each path's start
  glowColor:  '#962463',
  glowColor2: '#881784',
  strokeW:    '0.8px',
};

// Star sparkle: varied periods create organic non-synchronized twinkling
const STAR = {
  // Six prime-ish periods cycle through all stars so none synchronize
  periods:    [3.7, 4.1, 4.9, 5.3, 6.1, 7.0],
  delayStep:  0.41,   // irrational step keeps neighbours out of phase
  delaySpread: 18.0,  // total delay window in seconds
  peakBrightness: 4.0,
  glowColor1: '#fffacc',   // white-gold inner flash
  glowColor2: '#ffd700',   // gold outer halo
};

// ---------------------------------------------------------------------------
// CSS generator
// ---------------------------------------------------------------------------

function pct(seconds, period) {
  return (seconds / period * 100).toFixed(3) + '%';
}

function strandCSS(strands, keyframeName, timing) {
  return strands
    .map(([label, id], i) => {
      const delay = (i * timing.stagger).toFixed(3);
      return `  /* ${label} */ #${id} { animation: ${keyframeName} ${timing.period}s ${delay}s infinite ease-out; }`;
    })
    .join('\n');
}

function starSparkleCSS(stars, keyframeName, timing, indexOffset) {
  return stars
    .map((id, i) => {
      const idx = i + (indexOffset || 0);
      const period = timing.periods[idx % timing.periods.length];
      const delay  = ((idx * timing.delayStep) % timing.delaySpread).toFixed(2);
      return `  #${id} { animation: ${keyframeName} ${period}s ${delay}s infinite; }`;
    })
    .join('\n');
}

function traceCSSRules(paths, timing, indexOffset = 0) {
  const T = timing;
  return paths
    .map(([label, id], i) => {
      const delay = ((i + indexOffset) * T.stagger).toFixed(2);
      return `  /* ${label} */ #${id} { animation: trace-etch ${T.period}s ${delay}s infinite ease-in-out; }`;
    })
    .join('\n');
}

function generateCSS() {
  const H = HARP, B = BANGLE, U = UPPER, M = MISC, C = CLOCK;

  return `
  /* ================================================================
     SESHAT ANIMATION — generated by seshat-process.js
     ================================================================
     To tune timings, edit seshat-process.js and re-run:
       node seshat-process.js
     ================================================================ */

  /* ---- Keyframes: Long hair harp pluck ---- */
  @keyframes harp-pluck {
    0%                         { filter: none; }
    ${pct(H.peakAt, H.period)} { filter: brightness(${H.peakBrightness}) drop-shadow(0 0 ${H.glowRadius} ${H.glowColor}); }
    ${pct(H.fadeBy, H.period)} { filter: brightness(1.12); }
    ${pct(H.doneBy, H.period)}, 100% { filter: none; }
  }

  /* ---- Keyframes: Bangle-2 micro harp ---- */
  @keyframes bangle-pluck {
    0%                         { filter: none; }
    ${pct(B.peakAt, B.period)} { filter: brightness(${B.peakBrightness}) drop-shadow(0 0 ${B.glowRadius} ${B.glowColor}); }
    ${pct(B.fadeBy, B.period)} { filter: brightness(1.15); }
    ${pct(B.doneBy, B.period)}, 100% { filter: none; }
  }

  /* ---- Keyframes: Upper hair ambient shimmer ---- */
  @keyframes hair-shimmer {
    0%, 100% { filter: none;                          opacity: 1;    }
    50%      { filter: brightness(${U.peakBrightness}); opacity: 0.9; }
  }

  /* ---- Keyframes: Necklace gem flash ---- */
  @keyframes gem-flash {
    0%, 100% { filter: none; }
    7%       { filter: brightness(${M.gemBrightness}) drop-shadow(0 0 4px ${M.gemGlow}); }
    22%      { filter: brightness(1.1); }
    26%      { filter: none; }
  }

  /* ---- Keyframes: Rosette headdress sparkle ---- */
  @keyframes rosette-sparkle {
    0%, 100% { filter: none; }
    12%      { filter: brightness(${M.rosetteBrightness}) drop-shadow(0 0 6px ${M.rosetteGlow}); }
    28%      { filter: brightness(1.1); }
    35%      { filter: none; }
  }

  /* ---- Keyframes: Dress / upper star individual sparkle ---- */
  @keyframes star-sparkle {
    0%, 100% { filter: none; }
    5%       { filter: brightness(${STAR.peakBrightness}) drop-shadow(0 0 2px ${STAR.glowColor1}) drop-shadow(0 0 5px ${STAR.glowColor2}); }
    12%      { filter: brightness(1.8) drop-shadow(0 0 2px ${STAR.glowColor2}); }
    20%      { filter: brightness(1.2); }
    28%      { filter: none; }
  }

  /* ---- Long hair strands: harp sweep 1 → 21 ---- */
${strandCSS(LONG_HAIR, 'harp-pluck', H)}

  /* ---- Short hair strands: aligned to long hair (short-N fires with long-(N-1)) ---- */
${SHORT_HAIR.map(([label, id], i) => {
    const delay = ((i - 1) * H.stagger).toFixed(3);
    return `  /* ${label} */ #${id} { animation: harp-pluck ${H.period}s ${delay}s infinite ease-out; }`;
  }).join('\n')}

  /* ---- Bangle-2 strands: micro harp (left → right) ---- */
${strandCSS(BANGLE_STRANDS, 'bangle-pluck', B)}

  /* ---- Bangle stripes: micro harp (right → left, opposite direction) ---- */
${strandCSS(BANGLE_STRIPES, 'bangle-pluck', B)}

  /* ---- Upper hair strands: ambient shimmer ---- */
${UPPER_HAIR.map(([label, id], i) => {
    const delay = (i * U.stagger).toFixed(3);
    return `  /* ${label} */ #${id} { animation: hair-shimmer ${U.period}s ${delay}s infinite ease-in-out; }`;
  }).join('\n')}

  /* ---- Necklace: periodic gem flash ---- */
  #g10 { animation: gem-flash ${M.gemPeriod}s ${M.gemDelay}s infinite ease-in-out; }

  /* ---- Rosette headdress: occasional sparkle ---- */
  #g94 { animation: rosette-sparkle ${M.rosettePeriod}s ${M.rosetteDelay}s infinite ease-in-out; }

  /* ---- Dress stars: individual sparkle (39 paths) ---- */
${starSparkleCSS(DRESS_STARS, 'star-sparkle', STAR, 0)}

  /* ---- Upper body stars: individual sparkle (7 paths) ---- */
${starSparkleCSS(UPPER_STARS, 'star-sparkle', STAR, DRESS_STARS.length)}

  /* ---- Belt + knot: pathLength-normalised stroke-dashoffset trace ---- */
  /* base stroke-width on traced paths so the etching shows */
  ${[...BELT_PATHS, ...KNOT_PATHS].map(([,id]) => `#${id}`).join(', ')} {
    stroke-width: ${TRACE.strokeW};
  }

  @keyframes trace-etch {
    0% {
      fill: transparent;
      stroke: ${TRACE.glowColor};
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      filter: drop-shadow(0 0 1px ${TRACE.glowColor});
    }
    ${(TRACE.traceFrac * 100).toFixed(1)}% {
      fill: transparent;
      stroke: ${TRACE.glowColor};
      stroke-dasharray: 1;
      stroke-dashoffset: 0;
      filter: drop-shadow(0 0 4px ${TRACE.glowColor}) drop-shadow(0 0 8px ${TRACE.glowColor2});
    }
    ${((TRACE.traceFrac + TRACE.decayFrac) * 100).toFixed(1)}% {
      fill: currentColor;
      stroke: ${TRACE.glowColor};
      stroke-dasharray: 1;
      stroke-dashoffset: 0;
      filter: brightness(1.7) drop-shadow(0 0 2px ${TRACE.glowColor});
    }
    ${(TRACE.doneFrac * 100).toFixed(1)}%, 100% {
      fill: currentColor;
      stroke: none;
      filter: none;
    }
  }

  /* ---- Belt straps: trace left to right ---- */
${traceCSSRules(BELT_PATHS, TRACE)}

  /* ---- Knot: trace body then details then tails ---- */
${traceCSSRules(KNOT_PATHS, TRACE, BELT_PATHS.length)}

  /* ---- Palm-rib chronometer: runtime bud states (set by JS clock) ---- */

  /* Full-bright cyber cyan — current time position bud */
  .seshat-bud-on {
    color: ${C.onColor};
    filter: brightness(${C.onBrightness}) drop-shadow(0 0 3px ${C.onColor}) drop-shadow(0 0 8px ${C.dimColor});
  }

  /* Dim cyber cyan — half-hour intermediate bud */
  .seshat-bud-dim {
    color: ${C.dimColor};
    filter: brightness(${C.dimBrightness}) drop-shadow(0 0 2px ${C.dimColor});
  }

  /* Quarter-hour column ripple — triggered per-bud with staggered delay by JS */
  @keyframes seshat-ripple {
    0%   { filter: none; }
    18%  { filter: brightness(${C.rippleBrightness}) drop-shadow(0 0 4px ${C.onColor}) drop-shadow(0 0 12px ${C.dimColor}); }
    55%  { filter: brightness(${C.dimBrightness}) drop-shadow(0 0 2px ${C.dimColor}); }
    100% { filter: none; }
  }
`;
}

// ---------------------------------------------------------------------------
// Control Panel HTML generator
// ---------------------------------------------------------------------------

function generateControlPanel(svgContent) {

  // Serialize all timing data as JSON for embedding
  const paramsJSON = JSON.stringify({ HARP, BANGLE, UPPER, STAR, TRACE, MISC, CLOCK }, null, 2);
  const mapsJSON   = JSON.stringify({
    LONG_HAIR, SHORT_HAIR, UPPER_HAIR,
    BANGLE_STRANDS, BANGLE_STRIPES,
    BELT_PATHS, KNOT_PATHS,
    DRESS_STARS, UPPER_STARS,
  });

  // Build browser-side JS (uses plain string concat — no template literals —
  // so this string can be embedded inside a Node.js template literal safely)
  const browserJS = `
var params = ${paramsJSON};
var maps   = ${mapsJSON};

// ---- helpers ----------------------------------------------------------------
function pct(sec, period) { return (sec / period * 100).toFixed(3) + '%'; }
function px(v) { return typeof v === 'number' ? v + 'px' : v; }

function getParam(gKey, cKey) {
  var m = cKey.match(/^(\\w+)\\[(\\d+)\\]$/);
  return m ? params[gKey][m[1]][+m[2]] : params[gKey][cKey];
}
function setParam(gKey, cKey, val) {
  var m = cKey.match(/^(\\w+)\\[(\\d+)\\]$/);
  if (m) { params[gKey][m[1]][+m[2]] = val; } else { params[gKey][cKey] = val; }
}

// ---- CSS generator (mirrors seshat-process.js) ------------------------------
function generateCSS(p) {
  var H = p.HARP, B = p.BANGLE, U = p.UPPER, S = p.STAR, T = p.TRACE, M = p.MISC, C = p.CLOCK;
  var L = maps.LONG_HAIR, SH = maps.SHORT_HAIR, UH = maps.UPPER_HAIR;
  var BS = maps.BANGLE_STRANDS, BP = maps.BANGLE_STRIPES;
  var BELT = maps.BELT_PATHS, KNOT = maps.KNOT_PATHS;
  var DS = maps.DRESS_STARS, US = maps.UPPER_STARS;
  var css = '';

  css += '@keyframes harp-pluck {\\n';
  css += '  0% { filter: none; }\\n';
  css += '  ' + pct(H.peakAt, H.period) + ' { filter: brightness(' + H.peakBrightness + ') drop-shadow(0 0 ' + px(H.glowRadius) + ' ' + H.glowColor + '); }\\n';
  css += '  ' + pct(H.fadeBy,  H.period) + ' { filter: brightness(1.12); }\\n';
  css += '  ' + pct(H.doneBy,  H.period) + ', 100% { filter: none; }\\n';
  css += '}\\n\\n';

  css += '@keyframes bangle-pluck {\\n';
  css += '  0% { filter: none; }\\n';
  css += '  ' + pct(B.peakAt, B.period) + ' { filter: brightness(' + B.peakBrightness + ') drop-shadow(0 0 ' + px(B.glowRadius) + ' ' + B.glowColor + '); }\\n';
  css += '  ' + pct(B.fadeBy, B.period) + ' { filter: brightness(1.15); }\\n';
  css += '  ' + pct(B.doneBy, B.period) + ', 100% { filter: none; }\\n';
  css += '}\\n\\n';

  css += '@keyframes hair-shimmer {\\n';
  css += '  0%, 100% { filter: none; opacity: 1; }\\n';
  css += '  50% { filter: brightness(' + U.peakBrightness + '); opacity: 0.9; }\\n';
  css += '}\\n\\n';

  css += '@keyframes gem-flash {\\n';
  css += '  0%, 100% { filter: none; }\\n';
  css += '  7%  { filter: brightness(' + M.gemBrightness + ') drop-shadow(0 0 4px ' + M.gemGlow + '); }\\n';
  css += '  22% { filter: brightness(1.1); }\\n';
  css += '  26% { filter: none; }\\n';
  css += '}\\n\\n';

  css += '@keyframes rosette-sparkle {\\n';
  css += '  0%, 100% { filter: none; }\\n';
  css += '  12% { filter: brightness(' + M.rosetteBrightness + ') drop-shadow(0 0 6px ' + M.rosetteGlow + '); }\\n';
  css += '  28% { filter: brightness(1.1); }\\n';
  css += '  35% { filter: none; }\\n';
  css += '}\\n\\n';

  css += '@keyframes star-sparkle {\\n';
  css += '  0%, 100% { filter: none; }\\n';
  css += '  5%  { filter: brightness(' + S.peakBrightness + ') drop-shadow(0 0 2px ' + S.glowColor1 + ') drop-shadow(0 0 5px ' + S.glowColor2 + '); }\\n';
  css += '  12% { filter: brightness(1.8) drop-shadow(0 0 2px ' + S.glowColor2 + '); }\\n';
  css += '  20% { filter: brightness(1.2); }\\n';
  css += '  28% { filter: none; }\\n';
  css += '}\\n\\n';

  L.forEach(function(item, i) {
    css += '#' + item[1] + ' { animation: harp-pluck ' + H.period + 's ' + (i * H.stagger).toFixed(3) + 's infinite ease-out; }\\n';
  });
  SH.forEach(function(item, i) {
    css += '#' + item[1] + ' { animation: harp-pluck ' + H.period + 's ' + ((i - 1) * H.stagger).toFixed(3) + 's infinite ease-out; }\\n';
  });
  BS.forEach(function(item, i) {
    css += '#' + item[1] + ' { animation: bangle-pluck ' + B.period + 's ' + (i * B.stagger).toFixed(3) + 's infinite ease-out; }\\n';
  });
  BP.forEach(function(item, i) {
    css += '#' + item[1] + ' { animation: bangle-pluck ' + B.period + 's ' + (i * B.stagger).toFixed(3) + 's infinite ease-out; }\\n';
  });
  UH.forEach(function(item, i) {
    css += '#' + item[1] + ' { animation: hair-shimmer ' + U.period + 's ' + (i * U.stagger).toFixed(3) + 's infinite ease-in-out; }\\n';
  });

  css += '#g10 { animation: gem-flash ' + M.gemPeriod + 's ' + M.gemDelay + 's infinite ease-in-out; }\\n';
  css += '#g94 { animation: rosette-sparkle ' + M.rosettePeriod + 's ' + M.rosetteDelay + 's infinite ease-in-out; }\\n\\n';

  DS.forEach(function(id, i) {
    var period = S.periods[i % S.periods.length];
    var delay  = ((i * S.delayStep) % S.delaySpread).toFixed(2);
    css += '#' + id + ' { animation: star-sparkle ' + period + 's ' + delay + 's infinite; }\\n';
  });
  US.forEach(function(id, i) {
    var idx = i + DS.length;
    var period = S.periods[idx % S.periods.length];
    var delay  = ((idx * S.delayStep) % S.delaySpread).toFixed(2);
    css += '#' + id + ' { animation: star-sparkle ' + period + 's ' + delay + 's infinite; }\\n';
  });

  var traceIds = BELT.concat(KNOT).map(function(item) { return '#' + item[1]; }).join(', ');
  css += traceIds + ' { stroke-width: ' + T.strokeW + '; }\\n\\n';

  css += '@keyframes trace-etch {\\n';
  css += '  0% { fill: transparent; stroke: ' + T.glowColor + '; stroke-dasharray: 1; stroke-dashoffset: 1; filter: drop-shadow(0 0 1px ' + T.glowColor + '); }\\n';
  css += '  ' + (T.traceFrac * 100).toFixed(1) + '% { fill: transparent; stroke: ' + T.glowColor + '; stroke-dasharray: 1; stroke-dashoffset: 0; filter: drop-shadow(0 0 4px ' + T.glowColor + ') drop-shadow(0 0 8px ' + T.glowColor2 + '); }\\n';
  css += '  ' + ((T.traceFrac + T.decayFrac) * 100).toFixed(1) + '% { fill: currentColor; stroke: ' + T.glowColor + '; stroke-dasharray: 1; stroke-dashoffset: 0; filter: brightness(1.7) drop-shadow(0 0 2px ' + T.glowColor + '); }\\n';
  css += '  ' + (T.doneFrac * 100).toFixed(1) + '%, 100% { fill: currentColor; stroke: none; filter: none; }\\n';
  css += '}\\n\\n';

  BELT.forEach(function(item, i) {
    css += '#' + item[1] + ' { animation: trace-etch ' + T.period + 's ' + (i * T.stagger).toFixed(2) + 's infinite ease-in-out; }\\n';
  });
  KNOT.forEach(function(item, i) {
    css += '#' + item[1] + ' { animation: trace-etch ' + T.period + 's ' + ((i + BELT.length) * T.stagger).toFixed(2) + 's infinite ease-in-out; }\\n';
  });

  css += '.seshat-bud-on  { color: ' + C.onColor  + '; filter: brightness(' + C.onBrightness  + ') drop-shadow(0 0 3px ' + C.onColor  + ') drop-shadow(0 0 8px ' + C.dimColor + '); }\\n';
  css += '.seshat-bud-dim { color: ' + C.dimColor + '; filter: brightness(' + C.dimBrightness + ') drop-shadow(0 0 2px ' + C.dimColor + '); }\\n';
  css += '@keyframes seshat-ripple {\\n';
  css += '  0%   { filter: none; }\\n';
  css += '  18%  { filter: brightness(' + C.rippleBrightness + ') drop-shadow(0 0 4px ' + C.onColor + ') drop-shadow(0 0 12px ' + C.dimColor + '); }\\n';
  css += '  55%  { filter: brightness(' + C.dimBrightness + ') drop-shadow(0 0 2px ' + C.dimColor + '); }\\n';
  css += '  100% { filter: none; }\\n';
  css += '}\\n';

  return css;
}

// ---- live update ------------------------------------------------------------
function update() {
  var styleEl = document.getElementById('seshat-animation-style');
  if (styleEl) styleEl.textContent = generateCSS(params);
}

// ---- copy-to-clipboard ------------------------------------------------------
document.getElementById('copy-btn').addEventListener('click', function() {
  var lines = ['HARP','BANGLE','UPPER','STAR','TRACE','MISC','CLOCK'].map(function(k) {
    return 'const ' + k + ' = ' + JSON.stringify(params[k], null, 2) + ';';
  });
  navigator.clipboard.writeText(lines.join('\\n\\n')).then(function() {
    var msg = document.getElementById('copy-msg');
    msg.textContent = 'Copied! Paste into seshat-process.js and run node seshat-process.js';
    setTimeout(function() { msg.textContent = ''; }, 4000);
  });
});

// ---- control groups definition ----------------------------------------------
var GROUPS = [
  { key: 'HARP', label: '\\u29be Long Hair \u2014 Harp Pluck', controls: [
    { key:'period',         label:'Period (s)',       min:1,    max:30,  step:0.5  },
    { key:'stagger',        label:'Stagger (s)',      min:0.01, max:2,   step:0.01 },
    { key:'peakAt',         label:'Peak at (s)',      min:0.01, max:2,   step:0.01 },
    { key:'fadeBy',         label:'Fade by (s)',      min:0.05, max:8,   step:0.05 },
    { key:'doneBy',         label:'Done by (s)',      min:0.1,  max:10,  step:0.1  },
    { key:'peakBrightness', label:'Brightness',       min:1,    max:8,   step:0.1  },
    { key:'glowColor',      label:'Glow color',       type:'color' },
    { key:'glowRadius',     label:'Glow radius',      min:0,    max:20,  step:0.5, unit:'px' },
  ]},
  { key: 'BANGLE', label: '\\u29be Bangles \u2014 Micro Harp', controls: [
    { key:'period',         label:'Period (s)',       min:1,    max:20,  step:0.5  },
    { key:'stagger',        label:'Stagger (s)',      min:0.01, max:1,   step:0.01 },
    { key:'peakAt',         label:'Peak at (s)',      min:0.01, max:1,   step:0.01 },
    { key:'fadeBy',         label:'Fade by (s)',      min:0.05, max:5,   step:0.05 },
    { key:'doneBy',         label:'Done by (s)',      min:0.1,  max:8,   step:0.1  },
    { key:'peakBrightness', label:'Brightness',       min:1,    max:6,   step:0.1  },
    { key:'glowColor',      label:'Glow color',       type:'color' },
    { key:'glowRadius',     label:'Glow radius',      min:0,    max:15,  step:0.5, unit:'px' },
  ]},
  { key: 'UPPER', label: '\\u29be Upper Hair \u2014 Shimmer', controls: [
    { key:'period',         label:'Period (s)',       min:1,    max:30,  step:0.5  },
    { key:'stagger',        label:'Stagger (s)',      min:0.01, max:2,   step:0.01 },
    { key:'peakBrightness', label:'Brightness',       min:1,    max:4,   step:0.05 },
  ]},
  { key: 'STAR', label: '\\u2605 Dress Stars \u2014 Sparkle', controls: [
    { key:'periods[0]',     label:'Period A (s)',     min:1,    max:15,  step:0.1  },
    { key:'periods[1]',     label:'Period B (s)',     min:1,    max:15,  step:0.1  },
    { key:'periods[2]',     label:'Period C (s)',     min:1,    max:15,  step:0.1  },
    { key:'periods[3]',     label:'Period D (s)',     min:1,    max:15,  step:0.1  },
    { key:'periods[4]',     label:'Period E (s)',     min:1,    max:15,  step:0.1  },
    { key:'periods[5]',     label:'Period F (s)',     min:1,    max:15,  step:0.1  },
    { key:'delayStep',      label:'Delay step (s)',   min:0.01, max:3,   step:0.01 },
    { key:'delaySpread',    label:'Delay spread (s)', min:1,    max:60,  step:1    },
    { key:'peakBrightness', label:'Brightness',       min:1,    max:10,  step:0.1  },
    { key:'glowColor1',     label:'Inner glow',       type:'color' },
    { key:'glowColor2',     label:'Outer glow',       type:'color' },
  ]},
  { key: 'TRACE', label: '\\u25b7 Belt + Knot \u2014 Trace Etch', controls: [
    { key:'period',         label:'Cycle (s)',        min:5,    max:120, step:1    },
    { key:'stagger',        label:'Stagger (s)',      min:0.1,  max:10,  step:0.1  },
    { key:'traceFrac',      label:'Trace fraction',   min:0.01, max:0.3, step:0.005 },
    { key:'decayFrac',      label:'Decay fraction',   min:0.01, max:0.2, step:0.005 },
    { key:'doneFrac',       label:'Done fraction',    min:0.05, max:0.5, step:0.01  },
    { key:'glowColor',      label:'Trace color',      type:'color' },
    { key:'glowColor2',     label:'Bloom color',      type:'color' },
    { key:'strokeW',        label:'Stroke width',     min:0.1,  max:5,   step:0.1, unit:'px' },
  ]},
  { key: 'MISC', label: '\\u25c6 Necklace + Rosette', controls: [
    { key:'gemPeriod',          label:'Gem cycle (s)',      min:2,  max:30, step:0.5 },
    { key:'gemDelay',           label:'Gem delay (s)',      min:0,  max:10, step:0.1 },
    { key:'gemBrightness',      label:'Gem brightness',     min:1,  max:6,  step:0.1 },
    { key:'gemGlow',            label:'Gem glow',           type:'color' },
    { key:'rosettePeriod',      label:'Rosette cycle (s)',  min:2,  max:30, step:0.5 },
    { key:'rosetteDelay',       label:'Rosette delay (s)',  min:0,  max:10, step:0.1 },
    { key:'rosetteBrightness',  label:'Rosette brightness', min:1,  max:6,  step:0.1 },
    { key:'rosetteGlow',        label:'Rosette glow',       type:'color' },
  ]},
  { key: 'CLOCK', label: '\\u25cb Palm Rib \u2014 Chronometer', controls: [
    { key:'onColor',          label:'Active color',    type:'color' },
    { key:'onBrightness',     label:'Active bright',   min:1, max:6,  step:0.1 },
    { key:'dimColor',         label:'Half-hr color',   type:'color' },
    { key:'dimBrightness',    label:'Half-hr bright',  min:1, max:4,  step:0.05 },
    { key:'rippleBrightness', label:'Ripple peak',     min:1, max:8,  step:0.1 },
  ]},
];

// ---- build UI ---------------------------------------------------------------
function buildUI() {
  var panel   = document.getElementById('panel');
  var copyBtn = document.getElementById('copy-btn');

  GROUPS.forEach(function(group) {
    var section = document.createElement('div');
    section.className = 'group';

    var header = document.createElement('div');
    header.className = 'group-header';
    header.innerHTML = group.label + '<span class="chevron">&#9660;</span>';

    var body = document.createElement('div');
    body.className = 'group-body';

    header.addEventListener('click', function() {
      var open = body.classList.toggle('open');
      header.querySelector('.chevron').innerHTML = open ? '&#9650;' : '&#9660;';
    });

    group.controls.forEach(function(ctrl) {
      var row = document.createElement('div');
      row.className = 'ctrl';

      var lbl = document.createElement('label');
      lbl.textContent = ctrl.label;
      row.appendChild(lbl);

      var curRaw = getParam(group.key, ctrl.key);

      if (ctrl.type === 'color') {
        var inp = document.createElement('input');
        inp.type = 'color';
        // Ensure 6-digit hex for color picker
        try { inp.value = curRaw; } catch(e) { inp.value = '#ffffff'; }
        inp.addEventListener('input', function() {
          setParam(group.key, ctrl.key, inp.value);
          update();
        });
        row.appendChild(inp);
      } else {
        var numVal = typeof curRaw === 'string' ? parseFloat(curRaw) : curRaw;

        var range = document.createElement('input');
        range.type = 'range';
        range.min  = ctrl.min; range.max = ctrl.max; range.step = ctrl.step;
        range.value = numVal;

        var num = document.createElement('input');
        num.type = 'number';
        num.min  = ctrl.min; num.max = ctrl.max; num.step = ctrl.step;
        num.value = numVal;

        (function(r, n, gk, ck, unit) {
          function setVal(v) {
            var parsed = parseFloat(v);
            if (isNaN(parsed)) return;
            r.value = parsed; n.value = parsed;
            setParam(gk, ck, unit ? parsed + unit : parsed);
            update();
          }
          r.addEventListener('input',  function() { setVal(r.value); });
          n.addEventListener('change', function() { setVal(n.value); });
        })(range, num, group.key, ctrl.key, ctrl.unit || null);

        row.appendChild(range);
        row.appendChild(num);
      }

      body.appendChild(row);
    });

    section.appendChild(header);
    section.appendChild(body);
    panel.insertBefore(section, copyBtn);
  });

  // Open first group by default
  var firstBody    = panel.querySelector('.group-body');
  var firstChevron = panel.querySelector('.chevron');
  if (firstBody)    firstBody.classList.add('open');
  if (firstChevron) firstChevron.innerHTML = '&#9650;';
}

buildUI();
`;

  const panelCSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; background: #08080f; }
body { display: flex; font-family: 'Courier New', monospace; font-size: 12px; }

#svg-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-width: 0;
  padding: 20px;
}
#svg-view svg { max-height: 90vh; max-width: 100%; }

#panel {
  width: 340px;
  min-width: 340px;
  background: #0b0b18;
  border-left: 1px solid #00ffee33;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
#panel-title {
  padding: 12px 14px;
  font-size: 12px;
  letter-spacing: 4px;
  color: #ff44ff;
  border-bottom: 1px solid #00ffee22;
  flex-shrink: 0;
}
#panel-scroll { flex: 1; overflow-y: auto; }
#panel-scroll::-webkit-scrollbar { width: 4px; }
#panel-scroll::-webkit-scrollbar-track { background: transparent; }
#panel-scroll::-webkit-scrollbar-thumb { background: #00ffee44; border-radius: 2px; }

.group { border-bottom: 1px solid #00ffee11; }
.group-header {
  padding: 9px 14px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #00ffee;
  letter-spacing: 1.5px;
  font-size: 10px;
  text-transform: uppercase;
  user-select: none;
}
.group-header:hover { background: #00ffee0d; }
.chevron { font-size: 8px; color: #00ffee66; }

.group-body { display: none; padding: 8px 14px 12px; background: #0a0a16; }
.group-body.open { display: block; }

.ctrl {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 7px;
}
.ctrl label {
  width: 110px;
  flex-shrink: 0;
  font-size: 9px;
  color: #88aaaa;
  letter-spacing: 0.5px;
}
.ctrl input[type=range] {
  flex: 1;
  min-width: 0;
  accent-color: #00ffee;
  height: 3px;
  cursor: pointer;
}
.ctrl input[type=number] {
  width: 54px;
  background: #111;
  border: 1px solid #00ffee33;
  color: #00ffee;
  padding: 2px 4px;
  font-size: 10px;
  font-family: inherit;
  border-radius: 2px;
}
.ctrl input[type=number]:focus { outline: none; border-color: #00ffee88; }
.ctrl input[type=color] {
  width: 32px; height: 22px;
  border: 1px solid #00ffee33; border-radius: 2px;
  background: none; cursor: pointer; padding: 1px;
}

#copy-btn {
  margin: 10px 14px 4px;
  display: block;
  background: #00ffee11;
  border: 1px solid #00ffee44;
  color: #00ffee;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 2px;
  cursor: pointer;
  text-transform: uppercase;
  flex-shrink: 0;
}
#copy-btn:hover { background: #00ffee22; border-color: #00ffee; }
#copy-msg {
  font-size: 9px;
  text-align: center;
  color: #00ffee66;
  min-height: 18px;
  padding: 2px 14px 8px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seshat Control Panel</title>
  <style>${panelCSS}</style>
</head>
<body>
  <div id="svg-view">
    ${svgContent}
  </div>
  <div id="panel">
    <div id="panel-title">&#9672; SESHAT CONTROL PANEL</div>
    <div id="panel-scroll">
      <!-- groups injected by buildUI() -->
      <button id="copy-btn">&#8663; Copy Settings to Clipboard</button>
      <div id="copy-msg"></div>
    </div>
  </div>
  <script>${browserJS}</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Add pathLength="1" to specific paths so stroke-dashoffset 0→1 is normalised
// regardless of actual path length.  Applied BEFORE colour conversion.
// ---------------------------------------------------------------------------

function addPathLengths(content, ids) {
  for (const id of ids) {
    // Insert pathLength="1" immediately after the matching id attribute
    content = content.replace(
      new RegExp(` id="${id}"`, 'g'),
      ` id="${id}" pathLength="1"`
    );
  }
  return content;
}

// ---------------------------------------------------------------------------
// Convert all fill/stroke attributes to currentColor
// (preserves fill="none" and stroke="none")
// ---------------------------------------------------------------------------

function convertToCurrentColor(content) {
  // Inkscape stores fills/strokes inside style="fill:…;stroke:…" inline CSS.
  // Replace all non-none fill/stroke values with currentColor.
  return content
    .replace(/\bfill:(?!none\b)([^;}"]+)/g,   'fill:currentColor')
    .replace(/\bstroke:(?!none\b)([^;}"]+)/g, 'stroke:currentColor');
}

// ---------------------------------------------------------------------------
// Inject CSS into SVG source
// ---------------------------------------------------------------------------

function injectCSS(content, css) {
  const style = `<style id="seshat-animation-style">${css}  </style>`;

  // The Inkscape SVG has:  <defs\n     id="defs1" />
  // Replace it with a defs block containing our style element.
  const emptyDefs = /<defs\s[^>]*id="defs1"\s*\/>/;
  if (emptyDefs.test(content)) {
    return content.replace(emptyDefs, `<defs id="defs1">\n    ${style}\n  </defs>`);
  }

  // Fallback: inject after the opening <svg ...> tag
  return content.replace(/(<svg\b[^>]*>)/, `$1\n  ${style}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const TRACE_PATH_IDS = [...BELT_PATHS, ...KNOT_PATHS].map(([, id]) => id);

const src          = fs.readFileSync('SeshatDetailedPaths.svg', 'utf8');
const withLengths  = addPathLengths(src, TRACE_PATH_IDS);
const converted    = convertToCurrentColor(withLengths);
const css          = generateCSS();
const output       = injectCSS(converted, css);
fs.writeFileSync('SeshatAnimation.svg', output);

const panel = generateControlPanel(output);
fs.writeFileSync('SeshatControlPanel.html', panel);

const srcKB    = (src.length    / 1024).toFixed(1);
const outputKB = (output.length / 1024).toFixed(1);
const panelKB  = (panel.length  / 1024).toFixed(1);

console.log('');
console.log('  SeshatAnimation.svg    written successfully  (' + outputKB + ' KB)');
console.log('  SeshatControlPanel.html written              (' + panelKB  + ' KB)');
console.log(`  Source : ${srcKB} KB   →   Output: ${outputKB} KB`);
console.log(`  Animated: ${LONG_HAIR.length} long-hair strands (harp)`
          + ` + ${UPPER_HAIR.length} upper-hair (shimmer)`
          + ` + ${BANGLE_STRANDS.length} bangle-2 (micro-harp)`);
console.log('');
console.log('  Timing cheat-sheet:');
console.log(`    Harp period   : ${HARP.period}s  (${LONG_HAIR.length} strands × ${HARP.stagger}s = ${(LONG_HAIR.length * HARP.stagger).toFixed(1)}s sweep + ${(HARP.period - LONG_HAIR.length * HARP.stagger).toFixed(1)}s silence)`);
console.log(`    Bangle period : ${BANGLE.period}s  (${BANGLE_STRANDS.length} strands × ${BANGLE.stagger}s = ${(BANGLE_STRANDS.length * BANGLE.stagger).toFixed(1)}s sweep)`);
console.log(`    Upper shimmer : ${UPPER.period}s per strand, ${UPPER.stagger}s stagger`);
console.log('');
console.log('  To adjust timing, edit the HARP/BANGLE/UPPER objects at the top');
console.log('  of seshat-process.js and run:  node seshat-process.js');
console.log('');
