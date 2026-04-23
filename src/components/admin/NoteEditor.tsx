"use client";

import { useState, useTransition } from "react";
import { updateAdminNote } from "@/app/actions/adminActions";

type Props = { requestId: string; initialNote: string | null };

export function NoteEditor({ requestId, initialNote }: Props) {
  const [note, setNote]       = useState(initialNote ?? "");
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateAdminNote(requestId, note);
      if ("error" in result) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => { setNote(e.target.value); setSaved(false); }}
        rows={4}
        placeholder="Internal notes — not visible to client"
        className="w-full px-4 py-3 bg-transparent border border-iris-dusk/40 rounded-sm text-[13px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150 resize-none"
      />
      <div className="min-h-[16px]">
        {error && (
          <p className="font-technical text-[11px] text-red-400">{error}</p>
        )}
      </div>
      <button
        onClick={handleSave}
        disabled={isPending}
        className="h-9 px-5 border border-iris-dusk/40 rounded-sm font-technical text-[11px] tracking-[0.08em] text-lavender-smoke hover:border-iris-dusk/60 hover:text-cold-pearl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {isPending ? "Saving…" : saved ? "Saved" : "Save note"}
      </button>
    </div>
  );
}
