export default function Pager({ pageIndex, pageCount, onPrev, onNext }) {
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={pageIndex === 0}
                    className={[
                        "rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm",
                        pageIndex === 0
                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                            : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
                    ].join(" ")}
                >
                    ← Previous
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={pageIndex === pageCount - 1}
                    className={[
                        "rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm",
                        pageIndex === pageCount - 1
                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                            : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
                    ].join(" ")}
                >
                    Next →
                </button>
            </div>
            <div className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{pageIndex + 1}</span> of{" "}
                <span className="font-semibold text-gray-900">{pageCount}</span>
            </div>
        </div>
    );
}