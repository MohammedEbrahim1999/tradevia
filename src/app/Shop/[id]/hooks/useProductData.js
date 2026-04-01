"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { safeNumber } from "../utils/format";

export default function useProductData({ id, API_PRODUCTS }) {
    const API_PRODUCT = useMemo(() => `${API_PRODUCTS}/${id}`, [API_PRODUCTS, id]);

    const [products, setProducts] = useState([]);
    const [productOne, setProductOne] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) setRefreshing(true);
                else setLoading(true);

                setError(null);

                // try single product endpoint
                try {
                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    const r1 = await fetch(API_PRODUCT, { cache: "no-store" });
                    if (r1.ok) {
                        const one = await r1.json();
                        setProductOne(one || null);
                        setProducts([]);
                        return;
                    }
                } catch { }

                // fallback list endpoint
                const res = await fetch(API_PRODUCTS, { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();

                setProducts(Array.isArray(data) ? data : []);
                setProductOne(null);
            } catch (err) {
                setError(err?.message || "Something went wrong");
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [API_PRODUCTS, API_PRODUCT]
    );

    useEffect(() => {
        fetchProducts(false);
    }, [fetchProducts]);

    const product = useMemo(() => {
        if (productOne) return productOne;
        return products.find((p) => String(p.id) === String(id));
    }, [products, id, productOne]);

    const galleryImages = useMemo(() => {
        const arr = Array.isArray(product?.images) ? product.images : [];
        const main = product?.image ? [product.image] : [];
        const merged = [...main, ...arr].filter(Boolean);
        const fallback = "https://via.placeholder.com/1400x1000?text=No+Image";
        return merged.length ? merged : [fallback];
    }, [product]);

    const specsEntries = useMemo(() => {
        const s = product?.specs;
        const specsObj = s && typeof s === "object" && !Array.isArray(s) ? s : {};

        const prettyKey = (k) =>
            String(k)
                .replace(/([A-Z])/g, " $1")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
                .trim();

        return Object.entries(specsObj)
            .filter(([_, v]) => v !== null && v !== undefined && String(v).trim() !== "")
            .map(([k, v]) => [prettyKey(k), String(v)]);
    }, [product]);

    const derived = useMemo(() => {
        const title = product?.name || product?.title || "Product";
        const description = product?.description || "No description provided for this product.";
        const brand = product?.brand || "";
        const type = product?.type || "";
        const rating = safeNumber(product?.rating);

        const price = safeNumber(product?.price);
        const salePrice = safeNumber(product?.salePrice);

        const isOnSale = salePrice > 0 && salePrice < Math.max(price, 1);
        const discount = isOnSale ? Math.round(((price - salePrice) / Math.max(price, 1)) * 100) : null;
        const saving = isOnSale ? Math.max(0, price - salePrice) : 0;

        const hasStock = product?.stock !== undefined && product?.stock !== null;
        const stock = hasStock ? safeNumber(product?.stock) : null;
        const inStock = hasStock ? stock > 0 : true;

        const category = product?.category || "";
        const sku = product?.sku || product?.code || "";
        const reviewCount = safeNumber(product?.reviewCount);
        const releaseDate = product?.date || "";
        const slug = product?.slug || "";

        const unitPrice = isOnSale ? salePrice : price;

        return {
            title,
            description,
            brand,
            type,
            rating,
            price,
            salePrice,
            isOnSale,
            discount,
            saving,
            hasStock,
            stock,
            inStock,
            category,
            sku,
            reviewCount,
            releaseDate,
            slug,
            unitPrice,
        };
    }, [product]);

    return {
        product,
        loading,
        error,
        refreshing,
        fetchProducts,
        galleryImages,
        specsEntries,
        derived,
    };
}
