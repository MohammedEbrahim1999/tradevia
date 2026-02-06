import Link from "next/link";

export default function HelpCenterDialogBody({
    dialogMode,
    activeFaq,
    activeCategory,
    categoryFaqs,
    onCopyLink,
    onGoContact,
    onClose,
    onOpenFaq,
}) {
    if (dialogMode === "faq") {
        return activeFaq ? (
            <div className="space-y-5">
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                    <h4 className="text-base font-semibold text-gray-900">{activeFaq.q}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-gray-700">{activeFaq.a}</p>

                    {Array.isArray(activeFaq.tags) && activeFaq.tags.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {activeFaq.tags.map((t) => (
                                <span key={`tag-${t}`} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500">Need more help? Use the Contact tab.</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={onCopyLink}
                            className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                        >
                            Copy link
                        </button>

                        <button
                            type="button"
                            onClick={onGoContact}
                            className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                        >
                            Contact support
                        </button>

                        <Link
                            href="/track-order"
                            className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black text-center focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                            onClick={onClose}
                        >
                            Track order
                        </Link>
                    </div>
                </div>
            </div>
        ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-700">FAQ not found.</div>
        );
    }

    // category mode
    return (
        <div className="space-y-4">
            {categoryFaqs.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-700">
                    No FAQs available for this category yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {categoryFaqs.map((f) => (
                        <div key={f.id} className="rounded-3xl border border-gray-200 bg-white p-5 hover:shadow-sm transition">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{f.q}</h4>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-700">{f.a}</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onOpenFaq(f.id, activeCategory?.id || "")}
                                    className="shrink-0 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                    title="Open this answer alone"
                                >
                                    Open
                                </button>
                            </div>

                            {Array.isArray(f.tags) && f.tags.length ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {f.tags.map((t) => (
                                        <span key={`${f.id}-${t}`} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">Need more help? Use the Contact tab.</p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onGoContact}
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    >
                        Contact support
                    </button>

                    <Link
                        href="/track-order"
                        className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black text-center focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        onClick={onClose}
                    >
                        Track order
                    </Link>
                </div>
            </div>
        </div>
    );
}
