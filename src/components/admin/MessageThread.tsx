"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/app/actions/adminActions";
import { Send } from "lucide-react";

type Message = {
  id: string;
  body: string;
  isAdmin: boolean;
  authorId: string;
  createdAt: Date;
};

type Props = {
  requestId: string;
  messages: Message[];
  /** true = viewing as admin, false = viewing as client */
  isAdmin: boolean;
};

export function MessageThread({ requestId, messages, isAdmin }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Poll for new messages every 6 seconds
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 6000);
    return () => clearInterval(id);
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || isPending) return;
    const text = body;
    setBody("");
    startTransition(async () => {
      await sendMessage(requestId, text, isAdmin);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Message list */}
      <div className="min-h-[120px] max-h-[300px] sm:max-h-[400px] overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="font-sans text-[13px] text-iris-dusk text-center py-6">
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg) => {
          const mine = isAdmin ? msg.isAdmin : !msg.isAdmin;
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-0.5 ${mine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-sm text-[13px] leading-[1.55] font-sans break-words ${
                  mine
                    ? "bg-iris-dusk/25 text-cold-pearl"
                    : "bg-iris-dusk/10 text-lavender-smoke"
                }`}
              >
                {msg.body}
              </div>
              <span className="font-technical text-[10px] text-iris-dusk px-0.5">
                {msg.isAdmin ? "ProtoGrid" : isAdmin ? "Client" : "You"} ·{" "}
                {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 px-5 pb-4 pt-3 border-t border-iris-dusk/15"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 bg-transparent border border-iris-dusk/40 rounded-sm px-3 py-2 font-sans text-[13px] text-cold-pearl placeholder:text-iris-dusk resize-none focus:outline-none focus:border-lavender-smoke transition-colors duration-150"
          style={{ minHeight: "38px", maxHeight: "120px" }}
        />
        <button
          type="submit"
          disabled={!body.trim() || isPending}
          className="h-[38px] w-[38px] flex items-center justify-center border border-iris-dusk/40 rounded-sm text-iris-dusk hover:text-lavender-smoke hover:border-iris-dusk/60 transition-colors duration-150 disabled:opacity-30 shrink-0"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
