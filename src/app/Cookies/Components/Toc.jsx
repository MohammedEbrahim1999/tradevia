import StickyNote from "./StickyNote";
export default function Toc({ sections = [], pageIndex = 0, onSelect }) {
    return (
        <StickyNote tone="sky" title="On this page">
            <p className="text-xs text-gray-600">Jump to a “page” (question)</p>
            <nav className="mt-4">
                <ul className="space-y-1.5">
                    {sections.map((s, idx) => (
                        <li key={s.id || idx}>
                            <button
                                type="button"
                                onClick={() => onSelect?.(idx)}
                                className={[
                                    "w-full text-left group flex items-center justify-between rounded-2xl border px-3 py-2 text-sm",
                                    idx === pageIndex
                                        ? "border-gray-300 bg-white/70"
                                        : "border-transparent hover:border-gray-300 hover:bg-white/60",
                                ].join(" ")}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                                        {idx + 1}
                                    </span>
                                    <span className="leading-snug">{s.question || "Untitled"}</span>
                                </span>

                                <span className="text-xs text-gray-500 group-hover:text-gray-800">↗</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-5 rounded-2xl border border-gray-300 bg-white/60 p-3">
                <p className="text-xs text-gray-700 leading-relaxed">
                    If you need help, please contact TIVORA support or review our Privacy Policy.
                </p>
            </div>
        </StickyNote>
    );
}