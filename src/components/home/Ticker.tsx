"use client";

const ITEMS = [
  "CNC Fabrication",
  "Rapid Prototyping",
  "Small Batch Production",
  "Custom Parts",
  "Part Redesign",
  "Concept to Object",
  "Enclosures & Brackets",
  "Functional Prototypes",
];

const SEP = "·";

export function Ticker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y border-iris-dusk/20 py-3 bg-surface/20">
      <div className="flex whitespace-nowrap animate-ticker">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center shrink-0 gap-5 px-5">
            <span className="font-technical text-[11px] tracking-[0.14em] uppercase text-lavender-smoke/55">
              {item}
            </span>
            <span className="text-iris-dusk/40 text-[10px]">{SEP}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
