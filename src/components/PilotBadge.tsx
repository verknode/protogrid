/**
 * PilotBadge — consistent Early Access / pilot-phase indicator.
 *
 * Variants:
 *   "hero"   — pill + supporting line, stacked (hero area)
 *   "row"    — pill + text inline (account, admin)
 *   "line"   — text only, no pill (footer, mobile menu)
 */

const PILL =
  "inline-flex items-center font-technical text-[10px] tracking-[0.13em] uppercase text-red-400 border border-red-400/40 rounded-full px-2.5 py-0.5";

const SUPPORTING =
  "font-technical text-[11px] tracking-[0.04em] text-red-400/80";

type Variant = "hero" | "row" | "line";

export function PilotBadge({ variant = "row" }: { variant?: Variant }) {
  if (variant === "hero") {
    return (
      <div className="flex flex-col gap-2">
        <span className={PILL}>Early Access</span>
        <span className={`${SUPPORTING} tracking-[0.04em]`}>
          Pilot phase — platform actively being refined
        </span>
      </div>
    );
  }

  if (variant === "line") {
    return (
      <span className="font-technical text-[11px] tracking-[0.06em] text-red-400/70">
        Early Access · Platform in pilot phase
      </span>
    );
  }

  // "row" — default
  return (
    <div className="flex items-center gap-2.5">
      <span className={PILL}>Early Access</span>
      <span className={SUPPORTING}>Some features are still being refined</span>
    </div>
  );
}
