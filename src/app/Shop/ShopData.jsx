"use client";

import { useEffect, useMemo, useState } from "react";
import FilterSidebar from "./Components/FilterSidebar";
import FilterDrawer from "./Components/FilterDrawer";
import ProductGrid from "./Components/ProductGrid";
import Loading from "../loading";

const API_URL = "http://localhost:5000/products";

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [rating, setRating] = useState(0);
    const [priceRange, setPriceRange] = useState(null);

    // Mobile drawer
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
    // 1. Define the async function inside
    const fetchData = async () => {
        // Your delay
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Call it immediately
    fetchData();

    // 3. Optional: Return a cleanup function if needed
    // return () => { /* cleanup logic */ };
}, []);
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            if (category && p.type !== category) return false;
            if (brand && p.brand !== brand) return false;
            if (rating && Math.floor(p.rating) < rating) return false;

            if (priceRange) {
                const price = p.salePrice || p.price;
                if (price < priceRange.min || price > priceRange.max) return false;
            }
            return true;
        });
    }, [products, category, brand, rating, priceRange]);

    if (loading) {
        return(
            <>
                <Loading />
            </>
        );
    }

    return (
        <section className="max-w-7xl mx-auto px-4 py-8 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold mb-6">Shop Products</h1>
                <p className="text-sm text-gray-500 mb-4">
                    {filteredProducts.length} results found
                </p>
            </div>

            {/* Mobile filter button */}
            <button
                className="lg:hidden fixed top-32 right-2 z-50 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg"
                onClick={() => setFilterOpen(true)}
            >
                Filters
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
                <FilterSidebar
                    category={category}
                    setCategory={setCategory}
                    brand={brand}
                    setBrand={setBrand}
                    rating={rating}
                    setRating={setRating}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                />

                {filteredProducts.length === 0 ? (
                    <div className="flex items-start justify-center text-gray-500 text-center">
                        No products found matching your filters.
                    </div>
                ) : (
                    <ProductGrid product={filteredProducts} />
                )}
            </div>

            <FilterDrawer
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                category={category}
                setCategory={setCategory}
                brand={brand}
                setBrand={setBrand}
                rating={rating}
                setRating={setRating}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
            />
        </section>
    );
}