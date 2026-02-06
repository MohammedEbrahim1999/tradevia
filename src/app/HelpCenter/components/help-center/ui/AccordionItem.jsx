"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cx } from "../helpers";
import { EASE } from "../motion";

export default function AccordionItem({ title, desc, right, children, open, onToggle }) {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={onToggle}
                className={cx(
                    "flex w-full items-start justify-between gap-4 p-5 text-left sm:p-6",
                    "focus:outline-none focus:ring-2 focus:ring-gray-900/10 rounded-3xl"
                )}
                aria-expanded={open}
            >
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 sm:text-base">{title}</div>
                    {desc ? <div className="mt-1 text-sm text-gray-600">{desc}</div> : null}
                </div>

                <div className="flex items-center gap-2">
                    {right}
                    <span
                        className={cx(
                            "grid h-9 w-9 place-items-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 transition",
                            open ? "rotate-180" : ""
                        )}
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </div>
            </button>

            <AnimatePresence initial={false}>
                {open ? (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: EASE }}
                    >
                        <div className="border-t border-gray-100 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">{children}</div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
