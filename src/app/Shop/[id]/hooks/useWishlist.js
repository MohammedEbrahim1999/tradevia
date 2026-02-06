"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export default function useWishlist({ product, loggedCustomers, API_WISHLIST, setSnack }) {
    const [favorites, setFavorites] = useState({}); // { [productId]: true }

    useEffect(() => {
        if (!loggedCustomers || !Array.isArray(loggedCustomers) || loggedCustomers.length === 0) {
            setFavorites({});
            return;
        }

        const loadWishlist = async () => {
            try {
                const res = await fetch(API_WISHLIST, { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to fetch wishlist");
                const wishlist = await res.json();

                const userToken = loggedCustomers[0].userTokens;
                const favMap = {};

                (Array.isArray(wishlist) ? wishlist : [])
                    .filter((item) => item.userTokens === userToken)
                    .forEach((item) => {
                        favMap[String(item.id)] = true;
                    });

                setFavorites(favMap);
            } catch { }
        };

        loadWishlist();
    }, [loggedCustomers, API_WISHLIST]);

    const isFav = useMemo(() => {
        if (!product?.id) return false;
        return Boolean(favorites?.[String(product.id)]);
    }, [favorites, product?.id]);

    const toggleFavorite = useCallback(async () => {
        try {
            if (!product?.id) return;

            if (!loggedCustomers || !Array.isArray(loggedCustomers) || loggedCustomers.length === 0) {
                setSnack?.({ open: true, msg: "Please login first" });
                return;
            }

            const userToken = loggedCustomers[0].userTokens;

            const res = await fetch(API_WISHLIST, { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to fetch wishlist");
            const wishlist = await res.json();

            const existingItem = (Array.isArray(wishlist) ? wishlist : []).find(
                (item) => String(item.id) === String(product.id) && item.userTokens === userToken
            );

            if (existingItem) {
                const deleteRes = await fetch(`${API_WISHLIST}/${existingItem.id}`, { method: "DELETE" });
                if (!deleteRes.ok) throw new Error("Failed to remove product");

                setFavorites((prev) => ({ ...prev, [String(product.id)]: false }));
                setSnack?.({ open: true, msg: "Removed from favorites" });
                return;
            }

            const newProduct = {
                id: product.id,
                sellerId: product.sellerId,
                name: product.name,
                description: product.description,
                price: product.price,
                salePrice: product.salePrice,
                stock: product.stock,
                category: product.category,
                image: product.image,
                userTokens: userToken,
                type: product.type,
                brand: product.brand,
            };

            const postRes = await fetch(API_WISHLIST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct),
            });
            if (!postRes.ok) throw new Error("Failed to add product");

            setFavorites((prev) => ({ ...prev, [String(product.id)]: true }));
            setSnack?.({ open: true, msg: "Added to favorites" });
        } catch {
            setSnack?.({ open: true, msg: "Wishlist error" });
        }
    }, [product, loggedCustomers, API_WISHLIST, setSnack]);

    return { isFav, toggleFavorite };
}
