import { cx } from "../helpers";

export default function Notice({ tone = "red", title, desc, right }) {
    const tones = {
        red: "border-red-200 bg-red-50 text-red-800",
        amber: "border-amber-200 bg-amber-50 text-amber-900",
        gray: "border-gray-200 bg-gray-50 text-gray-800",
        green: "border-emerald-200 bg-emerald-50 text-emerald-900",
        blue: "border-sky-200 bg-sky-50 text-sky-900",
    };

    return (
        <div className={cx("rounded-2xl border px-4 py-3", tones[tone] || tones.red)}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    {title ? <div className="text-sm font-semibold">{title}</div> : null}
                    {desc ? <div className="mt-1 text-sm opacity-90">{desc}</div> : null}
                </div>
                {right ? <div className="shrink-0">{right}</div> : null}
            </div>
        </div>
    );
}
