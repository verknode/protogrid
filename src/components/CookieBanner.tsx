"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "pg_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50"
        >
          <div className="bg-surface border border-iris-dusk/40 rounded-sm p-5 shadow-lg">
            <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk mb-2">
              Cookies
            </p>
            <p className="font-sans text-[13px] leading-[1.6] text-lavender-smoke mb-4">
              We use essential cookies to keep the site working. No tracking, no ads.{" "}
              <Link href="/privacy" className="text-cold-pearl hover:underline underline-offset-2">
                Privacy policy
              </Link>
              .
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={accept}
                className="h-9 px-4 bg-cold-pearl text-ink-shadow font-technical text-[11px] tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-150"
              >
                Accept
              </button>
              <button
                onClick={decline}
                className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
