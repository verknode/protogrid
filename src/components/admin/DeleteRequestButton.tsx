"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteRequest } from "@/app/actions/adminActions";

export function DeleteRequestButton({ requestId }: { requestId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteRequest(requestId);
      if ("success" in result) {
        router.push("/admin/requests");
        router.refresh();
      } else {
        setError(result.error);
        setConfirm(false);
      }
    });
  }

  if (!confirm) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {error && (
          <p className="font-technical text-[11px] text-red-400">{error}</p>
        )}
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="flex items-center gap-2 font-technical text-[11px] tracking-[0.08em] text-iris-dusk hover:text-red-400 transition-colors duration-150"
        >
          <Trash2 size={13} />
          Delete request
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-technical text-[11px] tracking-[0.06em] text-lavender-smoke">
        Are you sure?
      </span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="h-8 px-4 bg-red-500/15 border border-red-500/40 text-red-400 font-technical text-[11px] tracking-[0.08em] rounded-sm hover:bg-red-500/25 disabled:opacity-50 transition-colors duration-150"
      >
        {isPending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
      >
        Cancel
      </button>
    </div>
  );
}
