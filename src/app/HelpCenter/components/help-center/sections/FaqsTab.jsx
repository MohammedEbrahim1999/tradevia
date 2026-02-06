"use client";

import { motion } from "framer-motion";
import SectionTitle from "../ui/SectionTitle";
import SkeletonCard from "../ui/SkeletonCard";
import EmptyState from "../ui/EmptyState";
import AccordionItem from "../ui/AccordionItem";
import { clamp, cx } from "../helpers";
import { EASE } from "../motion";

export default function FaqsTab({
    loading,
    faqs,
    popularFaqs,
    openAcc,
    setOpenAcc,
    allQuery,
    setAllQuery,
    allTags,
    selectedTags,
    setSelectedTags,
    pagedFaqs,
    setPage,
    onOpenFaq,
}) {
    return (
        <div className="space-y-6">
            <SectionTitle
                title="FAQs Explorer"
                desc="Popular + All FAQs + Tag filters + Pagination (still no duplication)."
                right={<div className="text-xs text-gray-500">{loading ? "Loading…" : `${faqs.length} total FAQs`}</div>}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Popular */}
                <div className="lg:col-span-6">
                    <SectionTitle
                        title="Popular Answers"
                        desc="Accordion for fast browsing."
                        right={<div className="text-xs text-gray-500">{loading ? "Loading…" : `${popularFaqs.length} items`}</div>}
                    />
                    <div className="mt-4 space-y-3">
                        {loading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : popularFaqs.length === 0 ? (
                            <EmptyState title="No popular FAQs yet" desc="Once your FAQS and CATEGORIESHelp are linked, items appear here." />
                        ) : (
                            popularFaqs.map((f) => {
                                const isOpen = openAcc === f.id;
                                return (
                                    <AccordionItem
                                        key={f.id}
                                        title={f.q}
                                        desc={Array.isArray(f.tags) && f.tags.length ? `Tags: ${f.tags.slice(0, 4).map((t) => `#${t}`).join(" ")}` : "FAQ"}
                                        open={isOpen}
                                        onToggle={() => setOpenAcc((prev) => (prev === f.id ? "" : f.id))}
                                        right={
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenFaq(f.id);
                                                }}
                                                className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                Open
                                            </button>
                                        }
                                    >
                                        <div className="text-sm leading-relaxed text-gray-700">{f.a}</div>
                                    </AccordionItem>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* All FAQs */}
                <div className="lg:col-span-6">
                    <SectionTitle
                        title="All FAQs"
                        desc="Search + tags + pagination."
                        right={<div className="text-xs text-gray-500">{loading ? "Loading…" : `${pagedFaqs.total} results`}</div>}
                    />

                    <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                            <span className="text-gray-400" aria-hidden="true">
                                ⌕
                            </span>
                            <input
                                value={allQuery}
                                onChange={(e) => setAllQuery(e.target.value)}
                                placeholder="Search (question, answer, tags)…"
                                className="w-full text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                            />
                            {allQuery ? (
                                <button
                                    type="button"
                                    onClick={() => setAllQuery("")}
                                    className="rounded-xl px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                >
                                    Clear
                                </button>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {["returns", "shipping", "warranty", "tracking"].map((k) => (
                                <button
                                    key={k}
                                    type="button"
                                    onClick={() => setAllQuery(k)}
                                    className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    {k}
                                </button>
                            ))}
                        </div>

                        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-gray-900">Filter by tags</div>
                                {selectedTags.length ? (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTags([])}
                                        className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Clear filters
                                    </button>
                                ) : null}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {loading ? (
                                    <span className="text-xs text-gray-500">Loading tags…</span>
                                ) : allTags.length === 0 ? (
                                    <span className="text-xs text-gray-500">No tags found</span>
                                ) : (
                                    allTags.slice(0, 24).map((t) => {
                                        const active = selectedTags.includes(t);
                                        return (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedTags((prev) => (active ? prev.filter((x) => x !== t) : [...prev, t]))
                                                }
                                                className={cx(
                                                    "rounded-full border px-3 py-2 text-xs font-semibold transition",
                                                    active
                                                        ? "border-gray-900 bg-gray-900 text-white"
                                                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-white"
                                                )}
                                            >
                                                #{t}
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {allTags.length > 24 ? (
                                <div className="mt-2 text-xs text-gray-500">Showing 24 tags. (You can add a “Show all tags” dialog later.)</div>
                            ) : null}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="mt-5 grid grid-cols-1 gap-4">
                        {loading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : pagedFaqs.total === 0 ? (
                            <EmptyState title="No matching FAQs" desc="Try different keywords or clear filters." />
                        ) : (
                            pagedFaqs.items.map((f, i) => (
                                <motion.div
                                    key={f.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                                    transition={{ duration: 0.35, ease: EASE, delay: clamp(i * 0.03, 0, 0.18) }}
                                    className={cx(
                                        "rounded-3xl border border-gray-200 bg-white p-5 shadow-sm",
                                        "hover:shadow-md hover:ring-1 hover:ring-black/5 transition"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-gray-900 sm:text-base">{f.q}</div>
                                            <div className="mt-2 line-clamp-3 text-sm text-gray-700">{f.a}</div>

                                            {Array.isArray(f.tags) && f.tags.length ? (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {f.tags.slice(0, 6).map((t) => (
                                                        <span
                                                            key={`${f.id}-${t}`}
                                                            className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700"
                                                        >
                                                            #{t}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onOpenFaq(f.id)}
                                            className="shrink-0 rounded-2xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
                                        >
                                            Open
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && pagedFaqs.total > 0 ? (
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-xs text-gray-500">
                                Page {pagedFaqs.page} of {pagedFaqs.pages} • {pagedFaqs.total} results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => clamp(p - 1, 1, pagedFaqs.pages))}
                                    disabled={pagedFaqs.page <= 1}
                                    className={cx(
                                        "rounded-2xl border px-4 py-2 text-xs font-semibold",
                                        pagedFaqs.page <= 1
                                            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    Prev
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => clamp(p + 1, 1, pagedFaqs.pages))}
                                    disabled={pagedFaqs.page >= pagedFaqs.pages}
                                    className={cx(
                                        "rounded-2xl border px-4 py-2 text-xs font-semibold",
                                        pagedFaqs.page >= pagedFaqs.pages
                                            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
