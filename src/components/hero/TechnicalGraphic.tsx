"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

function drawPath(delay: number, duration = 0.85) {
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { duration, delay, ease },
      opacity: { duration: 0.2, delay },
    },
  } as const;
}

function fadeIn(delay: number, duration = 0.5) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration, delay, ease },
  } as const;
}

const DRILL_HOLES: [number, number][] = [
  [155, 115],
  [270, 115],
  [270, 230],
  [155, 230],
];

const LABELS = [
  { x: 107, y: 65, text: "A1", delay: 0.93 },
  { x: 306, y: 296, text: "B3", delay: 0.95 },
  { x: 131, y: 244, text: "C2", delay: 0.97 },
  { x: 330, y: 182, text: "D4", delay: 0.99 },
];

export function TechnicalGraphic() {
  return (
    <svg
      viewBox="0 0 460 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[440px] h-auto"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="grid-minor"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            stroke="#5C5F7A"
            strokeWidth="0.4"
            fill="none"
          />
        </pattern>
        <pattern
          id="grid-major"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 60 0 L 0 0 0 60"
            stroke="#5C5F7A"
            strokeWidth="0.7"
            fill="none"
          />
        </pattern>
      </defs>

      {/* Grid background */}
      <motion.g {...fadeIn(0.2, 0.7)}>
        <rect width="460" height="460" fill="url(#grid-minor)" opacity="0.18" />
        <rect width="460" height="460" fill="url(#grid-major)" opacity="0.28" />
      </motion.g>

      {/* Partial frame — top-left corner */}
      <motion.path
        d="M 0 32 H 90"
        stroke="#5C5F7A"
        strokeWidth="0.8"
        opacity="0.5"
        {...drawPath(0.3, 0.5)}
      />
      <motion.path
        d="M 32 0 V 90"
        stroke="#5C5F7A"
        strokeWidth="0.8"
        opacity="0.5"
        {...drawPath(0.32, 0.5)}
      />

      {/* Partial frame — bottom-right corner */}
      <motion.path
        d="M 370 438 H 460"
        stroke="#5C5F7A"
        strokeWidth="0.8"
        opacity="0.5"
        {...drawPath(0.34, 0.5)}
      />
      <motion.path
        d="M 438 370 V 460"
        stroke="#5C5F7A"
        strokeWidth="0.8"
        opacity="0.5"
        {...drawPath(0.36, 0.5)}
      />

      {/* Main outer geometry: rectangle with L-notch at top-right */}
      <motion.path
        d="M 125 75 H 260 V 105 H 300 V 285 H 125 Z"
        stroke="#8E90A6"
        strokeWidth="1"
        opacity="0.6"
        {...drawPath(0.42, 0.95)}
      />

      {/* Inner pocket — dashed, fade only (pathLength conflicts with strokeDasharray) */}
      <motion.path
        d="M 155 115 H 270 V 230 H 155 Z"
        stroke="#8E90A6"
        strokeWidth="0.7"
        strokeDasharray="6 4"
        opacity="0.4"
        {...fadeIn(0.6, 0.5)}
      />

      {/* Construction diagonal lines */}
      <motion.g {...fadeIn(0.65, 0.5)}>
        <path
          d="M 125 75 L 155 115"
          stroke="#5C5F7A"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          opacity="0.35"
        />
        <path
          d="M 260 105 L 270 115"
          stroke="#5C5F7A"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          opacity="0.35"
        />
      </motion.g>

      {/* Center lines through inner pocket */}
      <motion.g {...fadeIn(0.7, 0.5)}>
        <path
          d="M 213 98 V 248"
          stroke="#5C5F7A"
          strokeWidth="0.4"
          strokeDasharray="8 3 2 3"
          opacity="0.3"
        />
        <path
          d="M 138 172 H 288"
          stroke="#5C5F7A"
          strokeWidth="0.4"
          strokeDasharray="8 3 2 3"
          opacity="0.3"
        />
      </motion.g>

      {/* Drill holes */}
      {DRILL_HOLES.map(([cx, cy], i) => (
        <motion.circle
          key={`drill-${i}`}
          cx={cx}
          cy={cy}
          r={7}
          stroke="#8E90A6"
          strokeWidth="0.8"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.45 }}
          transition={{ duration: 0.4, delay: 0.76 + i * 0.05, ease }}
        />
      ))}

      {/* Crosshair markers at drill holes */}
      {DRILL_HOLES.map(([cx, cy], i) => (
        <motion.g key={`cross-${i}`} {...fadeIn(0.84 + i * 0.04, 0.35)}>
          <line
            x1={cx - 10}
            y1={cy}
            x2={cx + 10}
            y2={cy}
            stroke="#8E90A6"
            strokeWidth="0.6"
            opacity="0.38"
          />
          <line
            x1={cx}
            y1={cy - 10}
            x2={cx}
            y2={cy + 10}
            stroke="#8E90A6"
            strokeWidth="0.6"
            opacity="0.38"
          />
        </motion.g>
      ))}

      {/* Horizontal dimension line */}
      <motion.g {...fadeIn(0.88, 0.5)}>
        <line
          x1={125}
          y1={307}
          x2={300}
          y2={307}
          stroke="#F1F2F4"
          strokeWidth="0.6"
          opacity="0.2"
        />
        <line
          x1={125}
          y1={300}
          x2={125}
          y2={314}
          stroke="#F1F2F4"
          strokeWidth="0.6"
          opacity="0.2"
        />
        <line
          x1={300}
          y1={300}
          x2={300}
          y2={314}
          stroke="#F1F2F4"
          strokeWidth="0.6"
          opacity="0.2"
        />
        <line
          x1={125}
          y1={285}
          x2={125}
          y2={307}
          stroke="#F1F2F4"
          strokeWidth="0.4"
          strokeDasharray="2 2"
          opacity="0.15"
        />
        <line
          x1={300}
          y1={285}
          x2={300}
          y2={307}
          stroke="#F1F2F4"
          strokeWidth="0.4"
          strokeDasharray="2 2"
          opacity="0.15"
        />
      </motion.g>

      {/* Vertical dimension line */}
      <motion.g {...fadeIn(0.9, 0.5)}>
        <line
          x1={320}
          y1={75}
          x2={320}
          y2={285}
          stroke="#F1F2F4"
          strokeWidth="0.6"
          opacity="0.2"
        />
        <line
          x1={313}
          y1={75}
          x2={327}
          y2={75}
          stroke="#F1F2F4"
          strokeWidth="0.6"
          opacity="0.2"
        />
        <line
          x1={313}
          y1={285}
          x2={327}
          y2={285}
          stroke="#F1F2F4"
          strokeWidth="0.6"
          opacity="0.2"
        />
        <line
          x1={300}
          y1={75}
          x2={320}
          y2={75}
          stroke="#F1F2F4"
          strokeWidth="0.4"
          strokeDasharray="2 2"
          opacity="0.15"
        />
        <line
          x1={300}
          y1={285}
          x2={320}
          y2={285}
          stroke="#F1F2F4"
          strokeWidth="0.4"
          strokeDasharray="2 2"
          opacity="0.15"
        />
      </motion.g>

      {/* Alphanumeric labels */}
      {LABELS.map(({ x, y, text, delay }) => (
        <motion.text
          key={text}
          x={x}
          y={y}
          fontSize={9}
          fill="#8E90A6"
          letterSpacing="0.08em"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.4, delay, ease }}
        >
          {text}
        </motion.text>
      ))}
    </svg>
  );
}
