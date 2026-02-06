export default function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="p-6">
                <div className="flex items-start gap-3">
                    <div className="h-11 w-11 animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                    <div className="min-w-0 flex-1">
                        <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                        <div className="mt-3 h-3 w-64 animate-pulse rounded bg-gray-100" />
                    </div>
                </div>
                <div className="mt-5 space-y-2">
                    <div className="h-10 w-full animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                    <div className="h-10 w-full animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                    <div className="h-10 w-full animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                <div className="h-11 w-full animate-pulse rounded-2xl bg-gray-900/15" />
            </div>
        </div>
    );
}
