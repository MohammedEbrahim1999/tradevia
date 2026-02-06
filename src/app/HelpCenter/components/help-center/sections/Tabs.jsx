import { cx } from "../helpers";

export default function Tabs({ tabs, tab, onTabChange }) {
    return (
        <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1" role="tablist" aria-label="Help Center tabs">
            {tabs.map((t) => (
                <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => onTabChange(t.id)}
                    className={cx(
                        "rounded-2xl px-4 py-2 text-sm font-semibold transition",
                        tab === t.id ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
                    )}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}
