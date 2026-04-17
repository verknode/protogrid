"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const LOCALES = ["en", "no"] as const;

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function select(next: "en" | "no") {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={[
        "flex h-[26px] border border-iris-dusk/25 rounded-sm overflow-hidden shrink-0",
        isPending ? "opacity-40 pointer-events-none" : "",
      ].join(" ")}
    >
      {LOCALES.map((lang, i) => (
        <span key={lang} className="contents">
          {i > 0 && <div className="w-px bg-iris-dusk/20 self-stretch shrink-0" />}
          <button
            type="button"
            onClick={() => select(lang)}
            aria-pressed={locale === lang}
            className={[
              "px-2.5 font-technical text-[11px] tracking-[0.1em] uppercase transition-colors duration-100",
              locale === lang
                ? "bg-iris-dusk/15 text-cold-pearl"
                : "text-lavender-smoke/50 hover:text-lavender-smoke hover:bg-iris-dusk/5",
            ].join(" ")}
          >
            {lang}
          </button>
        </span>
      ))}
    </div>
  );
}
