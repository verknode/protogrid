"use client";

import { useTransition } from "react";
import { updateRequestStatus } from "@/app/actions/adminActions";

const STATUSES = ["NEW", "IN_REVIEW", "ACCEPTED", "REJECTED", "DONE"] as const;
const LABELS: Record<string, string> = {
  NEW:       "New",
  IN_REVIEW: "In Review",
  ACCEPTED:  "Accepted",
  REJECTED:  "Rejected",
  DONE:      "Done",
};

type Props = { requestId: string; current: string };

export function StatusSelector({ requestId, current }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(status: string) {
    if (status === current) return;
    startTransition(async () => {
      await updateRequestStatus(requestId, status);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => handleChange(s)}
          disabled={isPending}
          className={`h-8 px-3 rounded-sm font-technical text-[11px] tracking-[0.08em] border transition-colors duration-150 disabled:cursor-not-allowed ${
            current === s
              ? "border-lavender-smoke/60 text-cold-pearl"
              : "border-iris-dusk/25 text-lavender-smoke hover:border-iris-dusk/50 hover:text-cold-pearl disabled:opacity-60"
          }`}
        >
          {LABELS[s]}
        </button>
      ))}
      {isPending && (
        <span className="font-technical text-[11px] text-iris-dusk self-center">Saving…</span>
      )}
    </div>
  );
}
