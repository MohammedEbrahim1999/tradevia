"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clamp, cx, highlight, scoreFaq } from "../helpers";
import { EASE } from "../motion";

export default function JumpSearch({ inputId, faqs, onPick }) {
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const boxRef = useRef(null);

    const results = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return [];
        const list = Array.isArray(faqs) ? faqs : [];

        const out = list
            .map((f) => ({ f, s: scoreFaq(f, query) }))
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s)
            .slice(0, 8)
            .map((x) => x.f);

        return out;
    }, [q, faqs]);

    useEffect(() => {
        setActiveIndex(0);
    }, [q]);

    useEffect(() => {
        const onDoc = (e) => {
            if (!boxRef.current) return;
            if (!boxRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    function pickAt(idx) {
        const item = results[idx];
        if (!item) return;
        onPick?.(item.id);
        setOpen(false);
    }

    return (
        <div ref={boxRef} className="relative mt-2">
            <div
                className={cx(
                    "group flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3",
                    "focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-900/10"
                )}
            >
                <span className="text-gray-400" aria-hidden="true">
                    ⌕
                </span>

                <input
                    id={inputId}
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => {
                        if (!open && e.key !== "Escape") setOpen(true);

                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setActiveIndex((i) => clamp(i + 1, 0, Math.max(0, results.length - 1)));
                        }
                        if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setActiveIndex((i) => clamp(i - 1, 0, Math.max(0, results.length - 1)));
                        }
                        if (e.key === "Enter") {
                            e.preventDefault();
                            pickAt(activeIndex);
                        }
                        if (e.key === "Escape") {
                            setOpen(false);
                        }
                    }}
                    placeholder="Search FAQs…"
                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls={`${inputId}-results`}
                />

                {q ? (
                    <button
                        type="button"
                        onClick={() => {
                            setQ("");
                            setOpen(false);
                        }}
                        className="rounded-xl px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        aria-label="Clear search"
                    >
                        Clear
                    </button>
                ) : null}
            </div>

            <AnimatePresence>
                {open && q.trim() ? (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15, ease: EASE }}
                        className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                            <div className="text-xs font-semibold text-gray-700">Results</div>
                            <div className="text-xs text-gray-500">{results.length ? `${results.length} shown` : "0 found"}</div>
                        </div>

                        {results.length === 0 ? (
                            <div className="p-4 text-sm text-gray-700">
                                No results. Try <b>returns</b>, <b>shipping</b>, <b>warranty</b>.
                            </div>
                        ) : (
                            <ul id={`${inputId}-results`} className="max-h-72 overflow-auto p-2" role="listbox">
                                {results.map((f, idx) => {
                                    const active = idx === activeIndex;
                                    return (
                                        <li key={f.id}>
                                            <button
                                                type="button"
                                                onMouseEnter={() => setActiveIndex(idx)}
                                                onClick={() => pickAt(idx)}
                                                className={cx(
                                                    "w-full rounded-2xl px-3 py-2 text-left",
                                                    active ? "bg-gray-50 ring-1 ring-black/5" : "hover:bg-gray-50",
                                                    "focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                                )}
                                                role="option"
                                                aria-selected={active}
                                            >
                                                <div className="text-sm font-semibold text-gray-900">{highlight(f.q, q)}</div>
                                                <div className="mt-1 line-clamp-2 text-xs text-gray-600">{highlight(f.a, q)}</div>

                                                {Array.isArray(f.tags) && f.tags.length ? (
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {f.tags.slice(0, 3).map((t) => (
                                                            <span key={`${f.id}-${t}`} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                                                                #{t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
