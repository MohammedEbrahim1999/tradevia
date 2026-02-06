import { useState } from "react";
import FilterContent from "./FilterContent";

export default function FilterDrawer({
    open,
    onClose,
    ...filters
}) {
    const [tempFilters, setTempFilters] = useState(filters);

    if (!open) return null;

    const applyFilters = () => {
        Object.entries(tempFilters).forEach(([key, value]) => {
            filters[`set${key.charAt(0).toUpperCase() + key.slice(1)}`]?.(value);
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
            <div className="bg-white w-72 p-4 h-full overflow-auto">
                <div className="flex justify-between mb-4">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                <FilterContent {...tempFilters} {...setters(setTempFilters)} />

                <button
                    onClick={applyFilters}
                    className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
}

const setters = (setState) => ({
    setCategory: (v) => setState((s) => ({ ...s, category: v })),
    setBrand: (v) => setState((s) => ({ ...s, brand: v })),
    setRating: (v) => setState((s) => ({ ...s, rating: v })),
    setPriceRange: (v) => setState((s) => ({ ...s, priceRange: v })),
});
