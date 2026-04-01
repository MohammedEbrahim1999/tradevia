export default function Loading() {
    return (
        <div className="p-4 space-y-6 animate-pulse">

            {/* Top bar */}
            <div className="h-6 w-32 mx-auto bg-gray-300 rounded"></div>

            {/* Hero / Banner */}
            <div className="h-32 bg-gray-300 rounded-lg"></div>

            {/* Grid (products / content) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-2">

                        {/* Image */}
                        <div className="h-40 bg-gray-300 rounded-lg"></div>

                        {/* Title */}
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>

                        {/* Price / text */}
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                ))}
            </div>

        </div>
    );
}