"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

function draw(delay: number, dur = 0.85) {
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { duration: dur, delay, ease },
      opacity: { duration: 0.01, delay },
    },
  } as const;
}

function fade(delay: number, dur = 0.4) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: dur, delay, ease },
  } as const;
}

const FONT = { fontFamily: "var(--font-dm-mono), monospace" } as const;

// Line colors
const GL = "#8E90A6"; // geometry lines
const DL = "#6A6C85"; // dimension / leader lines
const AT = "#9EA0B6"; // annotation text
const HT = "#C8C9D8"; // heavy title-block text
const BG = "#1E2028"; // background (knockout fill)

const HOLES: [number, number][] = [
  [72, 70],
  [285, 70],
  [285, 216],
  [72, 216],
];

export function TechnicalGraphic() {
  return (
    <svg
      viewBox="0 0 520 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-hidden="true"
    >
      <defs>
        {/* Minor grid 10×10 */}
        <pattern id="tg-g10" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" stroke="#31334A" strokeWidth="0.35" fill="none" />
        </pattern>
        {/* Major grid 50×50 */}
        <pattern id="tg-g50" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0H0V50" stroke="#393B52" strokeWidth="0.7" fill="none" />
        </pattern>
        {/* Arrowhead → */}
        <marker
          id="tg-ah"
          viewBox="0 0 8 5"
          refX="7.5"
          refY="2.5"
          markerWidth="5"
          markerHeight="3.5"
          orient="auto"
        >
          <path d="M0 0L8 2.5L0 5Z" fill={DL} />
        </marker>
        {/* Arrowhead ← */}
        <marker
          id="tg-ahl"
          viewBox="0 0 8 5"
          refX="0.5"
          refY="2.5"
          markerWidth="5"
          markerHeight="3.5"
          orient="auto"
        >
          <path d="M8 0L0 2.5L8 5Z" fill={DL} />
        </marker>
      </defs>

      {/* ── Background grid ── */}
      <rect width="520" height="460" fill="url(#tg-g10)" opacity="0.2" />
      <rect width="520" height="460" fill="url(#tg-g50)" opacity="0.28" />

      {/* ── Drawing frame ── */}
      <motion.rect
        x="11" y="11" width="498" height="438"
        stroke={GL} strokeWidth="1.1" opacity="0.55"
        {...fade(0, 0.6)}
      />
      <motion.rect
        x="24" y="24" width="472" height="412"
        stroke={GL} strokeWidth="0.45" opacity="0.22"
        {...fade(0.05, 0.5)}
      />

      {/* Fold marks */}
      <motion.g {...fade(0.05, 0.5)}>
        <line x1="11" y1="50" x2="24" y2="50" stroke={GL} strokeWidth="0.5" opacity="0.3" />
        <line x1="50" y1="11" x2="50" y2="24" stroke={GL} strokeWidth="0.5" opacity="0.3" />
        <line x1="470" y1="449" x2="509" y2="449" stroke={GL} strokeWidth="0.5" opacity="0.3" />
        <line x1="470" y1="436" x2="470" y2="449" stroke={GL} strokeWidth="0.5" opacity="0.3" />
        <line x1="11" y1="412" x2="24" y2="412" stroke={GL} strokeWidth="0.5" opacity="0.3" />
        <line x1="50" y1="436" x2="50" y2="449" stroke={GL} strokeWidth="0.5" opacity="0.3" />
      </motion.g>

      {/* ══════════════════════════════════════
          PART — FRONT VIEW
      ══════════════════════════════════════ */}

      {/* Main outline: rect 175×130, chamfer C25×45° top-right */}
      <motion.path
        d="M45,38 H275 L312,75 V248 H45 Z"
        stroke={GL}
        strokeWidth="1.3"
        opacity="0.8"
        {...draw(0.18, 1.05)}
      />

      {/* Chamfer helper lines (thin dashed, show where chamfer breaks the ideal corner) */}
      <motion.g {...fade(0.65, 0.4)}>
        <line x1="275" y1="38" x2="275" y2="56" stroke={DL} strokeWidth="0.4" strokeDasharray="3 3" opacity="0.28" />
        <line x1="294" y1="75" x2="312" y2="75" stroke={DL} strokeWidth="0.4" strokeDasharray="3 3" opacity="0.28" />
      </motion.g>

      {/* Milled pocket — dashed (hidden geometry / depth feature) */}
      <motion.path
        d="M120,103 H237 V183 H120 Z"
        stroke={GL}
        strokeWidth="0.8"
        strokeDasharray="6 4"
        opacity="0.5"
        {...fade(0.72, 0.5)}
      />

      {/* Pocket corner radii R5 (small arcs, dashed) */}
      <motion.g {...fade(0.76, 0.4)}>
        <path d="M120,108 A5,5 0 0,1 125,103" stroke={GL} strokeWidth="0.6" strokeDasharray="4 3" opacity="0.35" />
        <path d="M232,103 A5,5 0 0,1 237,108" stroke={GL} strokeWidth="0.6" strokeDasharray="4 3" opacity="0.35" />
        <path d="M237,178 A5,5 0 0,1 232,183" stroke={GL} strokeWidth="0.6" strokeDasharray="4 3" opacity="0.35" />
        <path d="M125,183 A5,5 0 0,1 120,178" stroke={GL} strokeWidth="0.6" strokeDasharray="4 3" opacity="0.35" />
      </motion.g>

      {/* ── Centerlines (chain-dash: 12 3 2 3) ── */}
      <motion.g {...fade(0.82, 0.4)}>
        {/* Horizontal through top holes row (y=70) */}
        <line x1="50" y1="70" x2="300" y2="70"
          stroke={DL} strokeWidth="0.5" strokeDasharray="12 3 2 3" opacity="0.42" />
        {/* Horizontal through bottom holes row (y=216) */}
        <line x1="50" y1="216" x2="300" y2="216"
          stroke={DL} strokeWidth="0.5" strokeDasharray="12 3 2 3" opacity="0.42" />
        {/* Vertical through left holes col (x=72) */}
        <line x1="72" y1="26" x2="72" y2="262"
          stroke={DL} strokeWidth="0.5" strokeDasharray="12 3 2 3" opacity="0.42" />
        {/* Vertical through right holes col (x=285) */}
        <line x1="285" y1="26" x2="285" y2="262"
          stroke={DL} strokeWidth="0.5" strokeDasharray="12 3 2 3" opacity="0.42" />
        {/* Pocket horizontal center */}
        <line x1="97" y1="143" x2="265" y2="143"
          stroke={DL} strokeWidth="0.4" strokeDasharray="12 3 2 3" opacity="0.25" />
        {/* Pocket vertical center */}
        <line x1="178" y1="80" x2="178" y2="210"
          stroke={DL} strokeWidth="0.4" strokeDasharray="12 3 2 3" opacity="0.25" />
      </motion.g>

      {/* ── Mounting holes ── */}
      {HOLES.map(([cx, cy], i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.65, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.78 + i * 0.05, ease }}
          style={{ transformBox: "fill-box", transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r={9} stroke={GL} strokeWidth="0.9" />
        </motion.g>
      ))}

      {/* ══════════════════════════════════════
          DIMENSION LINES
      ══════════════════════════════════════ */}

      {/* Width — 175 (horizontal, below part, y=274) */}
      <motion.g {...fade(0.9, 0.4)}>
        {/* Extension lines */}
        <line x1="45" y1="252" x2="45" y2="282" stroke={DL} strokeWidth="0.5" opacity="0.45" />
        <line x1="312" y1="252" x2="312" y2="282" stroke={DL} strokeWidth="0.5" opacity="0.45" />
        {/* Dimension line with arrowheads */}
        <line x1="49" y1="275" x2="308" y2="275"
          stroke={DL} strokeWidth="0.65" opacity="0.55"
          markerEnd="url(#tg-ah)" markerStart="url(#tg-ahl)" />
        {/* Knockout + text */}
        <rect x="161" y="266" width="34" height="12" fill={BG} />
        <text x="178" y="275" fontSize="9.5" fill={AT}
          textAnchor="middle" dominantBaseline="middle"
          letterSpacing="0.06em" style={FONT} opacity="0.9">
          175
        </text>
      </motion.g>

      {/* Height — 130 (vertical, right of part, x=332) */}
      <motion.g {...fade(0.92, 0.4)}>
        {/* Extension lines */}
        <line x1="316" y1="38" x2="340" y2="38" stroke={DL} strokeWidth="0.5" opacity="0.45" />
        <line x1="316" y1="248" x2="340" y2="248" stroke={DL} strokeWidth="0.5" opacity="0.45" />
        {/* Dimension line */}
        <line x1="336" y1="42" x2="336" y2="244"
          stroke={DL} strokeWidth="0.65" opacity="0.55"
          markerEnd="url(#tg-ah)" markerStart="url(#tg-ahl)" />
        {/* Rotated text */}
        <g transform="translate(336,143) rotate(-90)">
          <rect x="-17" y="-7" width="34" height="13" fill={BG} />
          <text x="0" y="0" fontSize="9.5" fill={AT}
            textAnchor="middle" dominantBaseline="middle"
            letterSpacing="0.06em" style={FONT} opacity="0.9">
            130
          </text>
        </g>
      </motion.g>

      {/* Bolt pattern H — 145 (y=32, above part) */}
      <motion.g {...fade(0.94, 0.38)}>
        {/* Extension lines down from hole centers */}
        <line x1="72" y1="61" x2="72" y2="28" stroke={DL} strokeWidth="0.5" opacity="0.38" />
        <line x1="285" y1="61" x2="285" y2="28" stroke={DL} strokeWidth="0.5" opacity="0.38" />
        {/* Dim line */}
        <line x1="76" y1="32" x2="281" y2="32"
          stroke={DL} strokeWidth="0.6" opacity="0.48"
          markerEnd="url(#tg-ah)" markerStart="url(#tg-ahl)" />
        {/* Knockout + text */}
        <rect x="162" y="23" width="30" height="11" fill={BG} />
        <text x="178" y="31" fontSize="9" fill={AT}
          textAnchor="middle" dominantBaseline="middle"
          letterSpacing="0.05em" style={FONT} opacity="0.78">
          145
        </text>
      </motion.g>

      {/* Bolt pattern V — 110 (x=302, right of holes) */}
      <motion.g {...fade(0.96, 0.38)}>
        {/* Extension lines left from hole centers */}
        <line x1="294" y1="70" x2="310" y2="70" stroke={DL} strokeWidth="0.5" opacity="0.38" />
        <line x1="294" y1="216" x2="310" y2="216" stroke={DL} strokeWidth="0.5" opacity="0.38" />
        {/* Dim line */}
        <line x1="306" y1="74" x2="306" y2="212"
          stroke={DL} strokeWidth="0.6" opacity="0.48"
          markerEnd="url(#tg-ah)" markerStart="url(#tg-ahl)" />
        {/* Rotated text */}
        <g transform="translate(306,143) rotate(-90)">
          <rect x="-15" y="-7" width="30" height="13" fill={BG} />
          <text x="0" y="0" fontSize="9" fill={AT}
            textAnchor="middle" dominantBaseline="middle"
            letterSpacing="0.05em" style={FONT} opacity="0.78">
            110
          </text>
        </g>
      </motion.g>

      {/* ══════════════════════════════════════
          CALLOUT LEADERS
      ══════════════════════════════════════ */}

      {/* Hole callout: 4×⌀8 THRU */}
      <motion.g {...fade(1.0, 0.42)}>
        <path d="M292,64 L346,46" stroke={DL} strokeWidth="0.6" opacity="0.5" />
        <line x1="346" y1="46" x2="450" y2="46" stroke={DL} strokeWidth="0.6" opacity="0.5" />
        <circle cx="291" cy="65" r="1.8" fill={DL} opacity="0.65" />
        <text x="350" y="43" fontSize="9" fill={AT}
          letterSpacing="0.05em" style={FONT} opacity="0.88">
          4×⌀8 THRU
        </text>
        <text x="350" y="55" fontSize="7.5" fill={AT}
          letterSpacing="0.05em" style={FONT} opacity="0.58">
          EQ.SP. ON 145×110
        </text>
      </motion.g>

      {/* Pocket callout */}
      <motion.g {...fade(1.02, 0.42)}>
        <path d="M238,143 L285,128" stroke={DL} strokeWidth="0.6" opacity="0.45" />
        <line x1="285" y1="128" x2="450" y2="128" stroke={DL} strokeWidth="0.6" opacity="0.45" />
        <circle cx="237" cy="143" r="1.6" fill={DL} opacity="0.55" />
        <text x="289" y="125" fontSize="9" fill={AT}
          letterSpacing="0.05em" style={FONT} opacity="0.82">
          POCKET 80×60 DEEP 10
        </text>
        <text x="289" y="136" fontSize="7.5" fill={AT}
          letterSpacing="0.05em" style={FONT} opacity="0.55">
          R5 CORNERS
        </text>
      </motion.g>

      {/* Chamfer callout */}
      <motion.g {...fade(1.04, 0.38)}>
        <path d="M294,58 L326,84" stroke={DL} strokeWidth="0.55" opacity="0.42" />
        <line x1="326" y1="84" x2="430" y2="84" stroke={DL} strokeWidth="0.55" opacity="0.42" />
        <circle cx="293" cy="57" r="1.5" fill={DL} opacity="0.5" />
        <text x="330" y="81" fontSize="9" fill={AT}
          letterSpacing="0.05em" style={FONT} opacity="0.72">
          C25×45°
        </text>
      </motion.g>

      {/* Surface finish symbol ▽ on top edge */}
      <motion.g {...fade(1.06, 0.35)}>
        {/* Triangle symbol */}
        <path d="M154,33 L158,40 L150,40 Z" stroke={AT} strokeWidth="0.7" opacity="0.5" />
        <text x="161" y="39" fontSize="7.5" fill={AT}
          letterSpacing="0.04em" style={FONT} opacity="0.55">
          Ra 1.6
        </text>
      </motion.g>

      {/* ══════════════════════════════════════
          TITLE BLOCK  (x=290, y=320, 218×128)
      ══════════════════════════════════════ */}

      {/* Title block borders */}
      <motion.g {...fade(0.45, 0.65)}>
        {/* Outer rect */}
        <rect x="290" y="320" width="218" height="128"
          stroke={GL} strokeWidth="0.85" opacity="0.5" />
        {/* Horizontal dividers */}
        <line x1="290" y1="350" x2="508" y2="350" stroke={GL} strokeWidth="0.5" opacity="0.28" />
        <line x1="290" y1="378" x2="508" y2="378" stroke={GL} strokeWidth="0.5" opacity="0.28" />
        <line x1="290" y1="408" x2="508" y2="408" stroke={GL} strokeWidth="0.5" opacity="0.28" />
        <line x1="290" y1="426" x2="508" y2="426" stroke={GL} strokeWidth="0.5" opacity="0.28" />
        {/* Vertical dividers */}
        <line x1="400" y1="320" x2="400" y2="448" stroke={GL} strokeWidth="0.5" opacity="0.28" />
        <line x1="350" y1="378" x2="350" y2="448" stroke={GL} strokeWidth="0.5" opacity="0.22" />
        <line x1="454" y1="408" x2="454" y2="448" stroke={GL} strokeWidth="0.5" opacity="0.22" />
      </motion.g>

      {/* Title block content */}
      <motion.g {...fade(1.1, 0.5)}>
        {/* Row 1: Company name | DWG NO. */}
        <text x="344" y="339" fontSize="11" fill={HT}
          textAnchor="middle" letterSpacing="0.18em"
          style={FONT} fontWeight="500" opacity="0.92">
          PROTOGRID
        </text>
        <text x="454" y="331" fontSize="6.5" fill={AT}
          textAnchor="middle" letterSpacing="0.12em"
          style={FONT} opacity="0.48">
          DWG NO.
        </text>
        <text x="454" y="344" fontSize="9" fill={HT}
          textAnchor="middle" letterSpacing="0.1em"
          style={FONT} opacity="0.88">
          PG-001
        </text>

        {/* Row 2: Part name | Scale */}
        <text x="293" y="360" fontSize="6.5" fill={AT}
          letterSpacing="0.12em" style={FONT} opacity="0.42">
          PART NAME
        </text>
        <text x="293" y="373" fontSize="9" fill={HT}
          letterSpacing="0.06em" style={FONT} opacity="0.92">
          MOUNTING BRACKET
        </text>
        <text x="403" y="360" fontSize="6.5" fill={AT}
          letterSpacing="0.12em" style={FONT} opacity="0.42">
          SCALE
        </text>
        <text x="403" y="373" fontSize="9" fill={HT}
          letterSpacing="0.06em" style={FONT} opacity="0.88">
          1:1
        </text>

        {/* Row 3: Material | Finish | Drawn */}
        <text x="293" y="388" fontSize="6.5" fill={AT}
          letterSpacing="0.1em" style={FONT} opacity="0.42">
          MATERIAL
        </text>
        <text x="293" y="401" fontSize="8.5" fill={AT}
          letterSpacing="0.05em" style={FONT} opacity="0.72">
          AL 6061-T6
        </text>
        <text x="353" y="388" fontSize="6.5" fill={AT}
          letterSpacing="0.1em" style={FONT} opacity="0.42">
          FINISH
        </text>
        <text x="353" y="401" fontSize="8" fill={AT}
          letterSpacing="0.04em" style={FONT} opacity="0.65">
          ANODIZED
        </text>
        <text x="403" y="388" fontSize="6.5" fill={AT}
          letterSpacing="0.1em" style={FONT} opacity="0.42">
          DRAWN
        </text>
        <text x="403" y="401" fontSize="8" fill={AT}
          letterSpacing="0.04em" style={FONT} opacity="0.62">
          A.U.
        </text>

        {/* Row 4: Tolerances */}
        <text x="293" y="417" fontSize="6.5" fill={AT}
          letterSpacing="0.08em" style={FONT} opacity="0.38">
          UNLESS OTHERWISE SPECIFIED
        </text>
        <text x="293" y="424" fontSize="7" fill={AT}
          letterSpacing="0.04em" style={FONT} opacity="0.5">
          LIN ±0.1  ·  ANG ±0.5°
        </text>

        {/* Row 5: REV | DATE | SHEET */}
        <text x="372" y="436" fontSize="6.5" fill={AT}
          textAnchor="middle" letterSpacing="0.1em" style={FONT} opacity="0.42">
          REV
        </text>
        <text x="372" y="445" fontSize="9" fill={HT}
          textAnchor="middle" letterSpacing="0.06em" style={FONT} opacity="0.88">
          A
        </text>
        <text x="430" y="436" fontSize="6.5" fill={AT}
          textAnchor="middle" letterSpacing="0.08em" style={FONT} opacity="0.42">
          DATE
        </text>
        <text x="430" y="445" fontSize="7.5" fill={AT}
          textAnchor="middle" letterSpacing="0.04em" style={FONT} opacity="0.6">
          2024-04
        </text>
        <text x="481" y="436" fontSize="6.5" fill={AT}
          textAnchor="middle" letterSpacing="0.08em" style={FONT} opacity="0.42">
          SHEET
        </text>
        <text x="481" y="445" fontSize="7.5" fill={AT}
          textAnchor="middle" letterSpacing="0.04em" style={FONT} opacity="0.6">
          1 OF 1
        </text>

        {/* "DO NOT SCALE" */}
        <text x="293" y="447" fontSize="5.5" fill={AT}
          letterSpacing="0.06em" style={FONT} opacity="0.28">
          DO NOT SCALE THIS DRAWING
        </text>
      </motion.g>

      {/* ══════════════════════════════════════
          REVISION BLOCK  (bottom-left strip)
      ══════════════════════════════════════ */}
      <motion.g {...fade(0.48, 0.6)}>
        <rect x="24" y="356" width="252" height="36"
          stroke={GL} strokeWidth="0.5" opacity="0.25" />
        {/* Header row */}
        <line x1="24" y1="369" x2="276" y2="369" stroke={GL} strokeWidth="0.4" opacity="0.2" />
        {/* Col dividers */}
        <line x1="50" y1="356" x2="50" y2="392" stroke={GL} strokeWidth="0.4" opacity="0.2" />
        <line x1="100" y1="356" x2="100" y2="392" stroke={GL} strokeWidth="0.4" opacity="0.2" />
        {/* Headers */}
        <text x="37" y="364" fontSize="6" fill={AT}
          textAnchor="middle" letterSpacing="0.1em" style={FONT} opacity="0.38">
          REV
        </text>
        <text x="75" y="364" fontSize="6" fill={AT}
          textAnchor="middle" letterSpacing="0.08em" style={FONT} opacity="0.38">
          DATE
        </text>
        <text x="150" y="364" fontSize="6" fill={AT}
          textAnchor="middle" letterSpacing="0.08em" style={FONT} opacity="0.38">
          DESCRIPTION
        </text>
      </motion.g>

      <motion.g {...fade(1.12, 0.45)}>
        <text x="37" y="383" fontSize="7.5" fill={AT}
          textAnchor="middle" letterSpacing="0.05em" style={FONT} opacity="0.55">
          A
        </text>
        <text x="75" y="383" fontSize="7" fill={AT}
          textAnchor="middle" letterSpacing="0.04em" style={FONT} opacity="0.45">
          2024-04
        </text>
        <text x="108" y="383" fontSize="7" fill={AT}
          letterSpacing="0.04em" style={FONT} opacity="0.38">
          INITIAL RELEASE
        </text>
      </motion.g>

      {/* ══════════════════════════════════════
          GENERAL NOTES
      ══════════════════════════════════════ */}
      <motion.g {...fade(1.1, 0.45)}>
        <text x="30" y="304" fontSize="7.5" fill={AT}
          letterSpacing="0.1em" style={FONT} opacity="0.4">
          NOTES:
        </text>
        <text x="30" y="316" fontSize="7" fill={AT}
          letterSpacing="0.04em" style={FONT} opacity="0.3">
          1. ALL DIMS IN mm UNLESS NOTED
        </text>
        <text x="30" y="326" fontSize="7" fill={AT}
          letterSpacing="0.04em" style={FONT} opacity="0.3">
          2. REMOVE ALL BURRS AND SHARP EDGES
        </text>
        <text x="30" y="336" fontSize="7" fill={AT}
          letterSpacing="0.04em" style={FONT} opacity="0.3">
          3. CLEAN BEFORE FINAL INSPECTION
        </text>
      </motion.g>

      {/* ── Third-angle projection symbol (title block) ── */}
      <motion.g {...fade(1.14, 0.4)}>
        {/* Simplified: cone (truncated triangle) + circle */}
        <path d="M403,412 L395,422 L411,422 Z" stroke={AT} strokeWidth="0.6" opacity="0.3" />
        <circle cx="417" cy="417" r="4" stroke={AT} strokeWidth="0.6" opacity="0.3" />
      </motion.g>

    </svg>
  );
}
