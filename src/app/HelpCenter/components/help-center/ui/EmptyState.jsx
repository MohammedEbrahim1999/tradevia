export default function EmptyState({ title, desc, action }) {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-base font-semibold text-gray-900">{title}</div>
                    {desc ? <div className="mt-1 text-sm text-gray-600">{desc}</div> : null}
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </div>
        </div>
    );
}
