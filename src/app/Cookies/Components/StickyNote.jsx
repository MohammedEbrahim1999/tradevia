export default function StickyNote({ title, tone = "amber", children }) {
    const toneStyles =
        tone === "sky"
            ? "bg-sky-50 border-sky-200"
            : tone === "mint"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200";

    const tapeStyles =
        tone === "sky"
            ? "bg-sky-100/80 border-sky-200"
            : tone === "mint"
                ? "bg-emerald-100/70 border-emerald-200"
                : "bg-amber-100/80 border-amber-200";

    return (
        <div
            className={[
                "relative rounded-[28px] border p-5 shadow-[0_18px_40px_rgba(0,0,0,0.10)]",
                "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),rgba(255,255,255,0))]",
                "overflow-hidden",
                toneStyles,
            ].join(" ")}
        >
            <div className="pointer-events-none absolute inset-0 opacity-[0.20]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.06),rgba(0,0,0,0.06)_1px,transparent_1px,transparent_24px)]" />
            </div>
            <div
                className={[
                    "pointer-events-none absolute left-8 top-0 h-6 w-28 -translate-y-1/2 rotate-[-3deg]",
                    "rounded-lg border shadow-sm",
                    tapeStyles,
                ].join(" ")}
            />
            <div
                className={[
                    "pointer-events-none absolute right-10 top-0 h-6 w-20 -translate-y-1/2 rotate-[6deg]",
                    "rounded-lg border shadow-sm",
                    tapeStyles,
                ].join(" ")}
            />
            <div className="relative">
                {title ? (
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-semibold tracking-wide text-gray-900">{title}</p>
                        <span className="text-[11px] text-gray-500">TIVORA</span>
                    </div>
                ) : null}
                <div className={title ? "mt-3" : ""}>{children}</div>
            </div>
        </div>
    );
}