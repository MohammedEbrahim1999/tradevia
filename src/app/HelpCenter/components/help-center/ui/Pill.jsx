import { cx } from "../helpers";

export default function Pill({ tone = "gray", children }) {
    const tones = {
        gray: "border-gray-200 bg-gray-50 text-gray-700",
        green: "border-emerald-200 bg-emerald-50 text-emerald-800",
        red: "border-red-200 bg-red-50 text-red-800",
        amber: "border-amber-200 bg-amber-50 text-amber-800",
        blue: "border-sky-200 bg-sky-50 text-sky-800",
    };

    return (
        <span className={cx("inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold", tones[tone] || tones.gray)}>
            {children}
        </span>
    );
}
