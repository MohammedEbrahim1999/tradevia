export default function BookPage({ pageNo, pageCount, question, tone = "amber", children }) {
    const toneRing =
        tone === "sky" ? "ring-sky-200" : tone === "mint" ? "ring-emerald-200" : "ring-amber-200";
    return (
        <div className="relative">
            <div className="mb-4 flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-700">TIVORA • Cookies Policy</div>
                <div className="text-xs text-gray-600">
                    {pageNo}/{pageCount}
                </div>
            </div>
            <div
                className={[
                    "relative overflow-hidden rounded-[28px] border border-gray-200 bg-white",
                    "shadow-[0_18px_45px_rgba(0,0,0,0.08)] ring-1",
                    toneRing,
                ].join(" ")}
            >
                <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.06),rgba(0,0,0,0.06)_1px,transparent_1px,transparent_24px)]" />
                </div>
                <div className="relative border-b border-gray-200 bg-gray-50/70 px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-900">{question}</h2>
                    <p className="mt-1 text-xs text-gray-600">This page explains the answer clearly.</p>
                </div>
                <div className="relative px-5 py-5">{children}</div>
                <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 bg-[radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.10),transparent_55%)]" />
            </div>
        </div>
    );
}