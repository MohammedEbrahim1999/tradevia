"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cx } from "../helpers";
import { scaleIn } from "../motion";

export default function Dialog({ open, title, subtitle, onClose, children }) {
    const titleId = useId();
    const panelRef = useRef(null);
    const previouslyFocused = useRef(null);

    useEffect(() => {
        if (!open) return;

        previouslyFocused.current = document.activeElement;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();

            if (e.key === "Tab") {
                const root = panelRef.current;
                if (!root) return;

                const focusables = root.querySelectorAll(
                    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
                );
                const list = Array.from(focusables).filter((el) => !el.hasAttribute("disabled"));
                if (list.length === 0) return;

                const first = list[0];
                const last = list[list.length - 1];

                if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                } else if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            }
        };

        window.addEventListener("keydown", onKeyDown);

        const t = setTimeout(() => {
            const root = panelRef.current;
            if (!root) return;
            const focusables = root.querySelectorAll(
                'button:not([disabled]), a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
            );
            (focusables[0] || root).focus?.();
        }, 0);

        return () => {
            clearTimeout(t);
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", onKeyDown);
            previouslyFocused.current?.focus?.();
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open ? (
                <motion.div className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button type="button" onClick={onClose} aria-label="Close dialog" className="absolute inset-0 h-full w-full bg-black/40" />
                    <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={titleId}
                            ref={panelRef}
                            tabIndex={-1}
                            variants={scaleIn}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5"
                        >
                            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
                                <div className="min-w-0">
                                    <h3 id={titleId} className="text-lg font-semibold text-gray-900 sm:text-xl">
                                        {title}
                                    </h3>
                                    {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={cx(
                                        "shrink-0 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700",
                                        "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                    )}
                                >
                                    Close
                                </button>
                            </div>

                            <div className="max-h-[72vh] overflow-auto p-5 sm:p-6">{children}</div>
                        </motion.div>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
