import SectionTitle from "../ui/SectionTitle";
import DataCard from "../ui/DataCard";
import Notice from "../ui/Notice";
import SkeletonCard from "../ui/SkeletonCard";
import { cx } from "../helpers";

export default function OverviewTab({
    loading,
    stats,
    lastUpdated,
    statusPill,
    recentFaqs,
    onOpenFaq,
    onClearRecent,
}) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
                <SectionTitle title="Dataset Snapshot" desc="High-level summary (like a university slide)." />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DataCard icon="spark" label="Total FAQs" value={loading ? "…" : stats.totalFaqs} hint="Total answers stored in FAQS" />
                    <DataCard icon="box" label="Total Categories" value={loading ? "…" : stats.totalCats} hint="Total topics in CATEGORIESHelp" />
                    <div className="sm:col-span-2">
                        <DataCard icon="shield" label="Last Updated" value={loading ? "…" : lastUpdated} hint="From LastUpdated endpoint" right={statusPill} />
                    </div>
                </div>

                <div className="mt-6">
                    <SectionTitle
                        title="Recently Viewed FAQs"
                        desc="Saved on this device."
                        right={
                            recentFaqs.length ? (
                                <button
                                    type="button"
                                    onClick={onClearRecent}
                                    className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Clear history
                                </button>
                            ) : null
                        }
                    />

                    <div className="mt-4 space-y-3">
                        {loading ? (
                            <SkeletonCard />
                        ) : recentFaqs.length === 0 ? (
                            <Notice tone="gray" title="No history yet" desc="Open any FAQ from the Explorer tab and it will appear here." />
                        ) : (
                            recentFaqs.map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => onOpenFaq(f.id)}
                                    className={cx(
                                        "w-full rounded-3xl border border-gray-200 bg-white p-5 text-left shadow-sm",
                                        "hover:shadow-md hover:ring-1 hover:ring-black/5 transition"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-gray-900 sm:text-base">{f.q}</div>
                                            <div className="mt-1 line-clamp-2 text-sm text-gray-600">{f.a}</div>
                                        </div>
                                        <span className="text-gray-400" aria-hidden="true">
                                            →
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-7">
                <SectionTitle title="How to use this page" desc="No repeated sections: every dataset view is scoped to one tab." />
                <div className="mt-4 space-y-4">
                    <Notice tone="blue" title="FAQs Explorer" desc="Search, read popular answers, browse tags, and paginate results." />
                    <Notice tone="gray" title="Categories" desc="All category cards live inside the Categories tab only." />
                    <Notice tone="green" title="Contact" desc="Support form and hours are inside Contact tab only." />
                </div>

                <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold text-gray-900">Recommended “presentation flow”</div>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                        <li>Start on Overview → show totals + lastUpdated.</li>
                        <li>Go to FAQs Explorer → show popular answers + filtering.</li>
                        <li>Show Categories → explain topic grouping.</li>
                        <li>Finish with Contact → explain support operations.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
