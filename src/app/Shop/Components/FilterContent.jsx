"use client";
import { useEffect,useState } from "react";
const CATEGORIES = ["New Arrivals", "Best Sellers", "Special Offers"];
const RATINGS = [5, 4, 3];
const PRICE_RANGES = [
    { label: "Under 500 SAR", min: 0, max: 499 },
    { label: "500 - 1000 SAR", min: 500, max: 1000 },
    { label: "1001 - 2000 SAR", min: 1001, max: 2000 },
    { label: "Above 2000 SAR", min: 2001, max: Infinity },
];

export default function FilterContent({
    category,
    setCategory,
    brand,
    setBrand,
    rating,
    setRating,
    priceRange,
    setPriceRange,
}) {
    const [Brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_Brands = "http://localhost:5000/Brands";
    // const API_Brands = "http://localhost:5000/Brands";
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_Brands);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setBrands(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);
    return (
        <aside className="w-full bg-white p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-6">Filters</h2>

            <div className="space-y-8">
                {/* Category */}
                <FilterSection title="Category">
                    <ModernRadio
                        label="All Products"
                        checked={!category}
                        onClick={() => setCategory("")}
                    />
                    {CATEGORIES.map((c) => (
                        <ModernRadio
                            key={c}
                            label={c}
                            checked={category === c}
                            onClick={() => setCategory(c)}
                        />
                    ))}
                </FilterSection>

                {/* Brand */}
                <FilterSection title="Brand">
                    <ModernRadio
                        label="All Brands"
                        checked={!brand}
                        onClick={() => setBrand("")}
                    />
                    {Brands.map((b) => (
                        <ModernRadio
                            key={b}
                            label={b.name}
                            checked={brand === b.name}
                            onClick={() => setBrand(b.name)}
                        />
                    ))}
                </FilterSection>

                {/* Rating */}
                <FilterSection title="Rating">
                    <ModernRadio
                        label="All Ratings"
                        checked={rating === 0}
                        onClick={() => setRating(0)}
                    />
                    {RATINGS.map((r) => (
                        <ModernRadio
                            key={r}
                            label={`${r} stars & up`}
                            checked={rating === r}
                            onClick={() => setRating(r)}
                        />
                    ))}
                </FilterSection>

                {/* Price */}
                <FilterSection title="Price">
                    <ModernRadio
                        label="All Prices"
                        checked={!priceRange}
                        onClick={() => setPriceRange(null)}
                    />
                    {PRICE_RANGES.map((p) => (
                        <ModernRadio
                            key={p.label}
                            label={p.label}
                            checked={priceRange?.label === p.label}
                            onClick={() => setPriceRange(p)}
                        />
                    ))}
                </FilterSection>
            </div>
        </aside>
    );
}

/* ================== Components ================== */
const FilterSection = ({ title, children }) => {
    const [open, setOpen] = useState(true); // open by default

    return (
        <div className="border-b pb-4 last:border-none">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between text-left"
            >
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    {title}
                </h3>

                <span
                    className={`text-lg transition-transform ${open ? "rotate-180" : ""
                        }`}
                >
                    ▾
                </span>
            </button>

            <div
                className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                    }`}
            >
                <div className="overflow-hidden space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};


const ModernRadio = ({ label, checked, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg border text-sm transition
            ${checked
                ? "border-black bg-black text-white"
                : "border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            }`}
    >
        <span>{label}</span>

        <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center
                ${checked ? "border-white" : "border-gray-400"}`}
        >
            {checked && <span className="w-2 h-2 bg-white rounded-full" />}
        </span>
    </button>
);
