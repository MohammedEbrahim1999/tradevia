"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionTitle from "../ui/SectionTitle";
import SkeletonCard from "../ui/SkeletonCard";
import EmptyState from "../ui/EmptyState";
import { Icon } from "../icons";
import { clamp, cx } from "../helpers";
import { EASE } from "../motion";

export default function CategoriesTab({ loading, categories, onOpenCategoryDialog, onOpenFaqFromCategory }) {
    return (
        <div>
            <SectionTitle
                title="Browse by Category"
                desc="Only shown here (not repeated elsewhere)."
                right={<div className="text-xs text-gray-500">{loading ? "Loading…" : `${categories.length} categories`}</div>}
            />

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : categories.length === 0 ? (
                    <div className="sm:col-span-2 lg:col-span-3">
                        <EmptyState
                            title="No categories yet"
                            desc="Add categories to show help topics here."
                            action={
                                <Link
                                    href="/"
                                    className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Back to home
                                </Link>
                            }
                        />
                    </div>
                ) : (
                    categories.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                            transition={{ duration: 0.45, ease: EASE, delay: clamp(i * 0.05, 0, 0.25) }}
                            className={cx(
                                "group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm",
                                "ring-1 ring-black/0 hover:ring-black/5 hover:shadow-md transition"
                            )}
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                                        <Icon name={c.icon} />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900">{c.title}</h3>
                                        <p className="mt-1 text-sm text-gray-600">{c.desc}</p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-2">
                                    {(c.links || []).slice(0, 3).map((l) => {
                                        if (l.faqId) {
                                            return (
                                                <button
                                                    key={l.label}
                                                    type="button"
                                                    onClick={() => onOpenFaqFromCategory(l.faqId, c.id)}
                                                    className={cx(
                                                        "group/button flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700",
                                                        "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                                    )}
                                                >
                                                    <span className="truncate">{l.label}</span>
                                                    <span className="text-gray-400 group-hover/button:text-gray-600" aria-hidden="true">
                                                        →
                                                    </span>
                                                </button>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={l.label}
                                                href={l.href}
                                                className={cx(
                                                    "group/link flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700",
                                                    "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                                )}
                                            >
                                                <span className="truncate">{l.label}</span>
                                                <span className="text-gray-400 group-hover/link:text-gray-600" aria-hidden="true">
                                                    →
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => onOpenCategoryDialog(c.id)}
                                    className={cx(
                                        "w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white",
                                        "hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                    )}
                                >
                                    View related FAQs
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
