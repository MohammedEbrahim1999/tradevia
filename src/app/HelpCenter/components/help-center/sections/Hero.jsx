"use client";

import { motion } from "framer-motion";
import Pill from "../ui/Pill";
import Notice from "../ui/Notice";
import JumpSearch from "../widgets/JumpSearch";
import Tabs from "./Tabs";
import { fadeUp } from "../motion";
import { cx } from "../helpers";

export default function Hero({
    uid,
    lastUpdated,
    statusPill,
    loading,
    error,
    usedCache,
    onRetry,
    onJumpPick,
    faqs,
    tabs,
    tab,
    onTabChange,
    stats,
}) {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-3xl border border-gray-200 bg-white/80 p-7 shadow-sm backdrop-blur md:p-10"
        >
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                    <div className="inline-flex flex-wrap items-center gap-2">
                        <Pill>Support Dataset</Pill>
                        {statusPill}
                        <Pill tone="gray">Last updated: {lastUpdated}</Pill>
                    </div>

                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">Help Center</h1>
                    <p className="mt-2 text-gray-600">A clean “presentation mode” to browse your support knowledge base without repeating sections.</p>

                    {error ? (
                        <div className="mt-4">
                            <Notice
                                tone={usedCache ? "amber" : "red"}
                                title={usedCache ? "Using cached data" : "Couldn’t load Help Center data"}
                                desc={error}
                                right={
                                    <button
                                        type="button"
                                        onClick={onRetry}
                                        className={cx(
                                            "rounded-xl bg-white px-3 py-2 text-xs font-semibold ring-1 hover:bg-gray-50",
                                            usedCache ? "text-amber-900 ring-amber-200" : "text-red-800 ring-red-200 hover:bg-red-50"
                                        )}
                                    >
                                        Retry
                                    </button>
                                }
                            />
                        </div>
                    ) : null}
                </div>

                {/* Jump Search */}
                <div className="w-full md:w-[460px]">
                    <label htmlFor={`${uid}-jump`} className="text-sm font-medium text-gray-800">
                        Jump to an FAQ
                    </label>
                    <JumpSearch inputId={`${uid}-jump`} faqs={faqs} onPick={onJumpPick} />
                    <p className="mt-2 text-xs text-gray-500">Try: returns, shipping, tracking, warranty…</p>
                </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Tabs tabs={tabs} tab={tab} onTabChange={onTabChange} />

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <Pill tone="blue">{loading ? "…" : `${stats.totalFaqs} FAQs`}</Pill>
                    <Pill tone="blue">{loading ? "…" : `${stats.totalCats} categories`}</Pill>
                    <Pill tone="blue">{loading ? "…" : `${stats.totalTags} tags`}</Pill>
                </div>
            </div>
        </motion.div>
    );
}
