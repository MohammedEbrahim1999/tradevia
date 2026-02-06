"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { safeNumber } from "../utils/format";

export default function useCart({
    id,
    product,
    loggedCustomers,
    API_CART,
    API_TOTALPRICE,
    setSnack,
    stock,
    hasStock,
}) {
    const [qty, setQty] = useState(1);
    useEffect(() => setQty(1), [id]);

    const maxQty = useMemo(() => (hasStock ? Math.max(1, safeNumber(stock)) : 99), [hasStock, stock]);

    const clampQty = useCallback(
        (n) => Math.min(maxQty, Math.max(1, safeNumber(n))),
        [maxQty]
    );

    const handleAddToCart = useCallback(
        async (productToAdd) => {
            try {
                if (!productToAdd?.id) return;

                if (!loggedCustomers || !Array.isArray(loggedCustomers) || loggedCustomers.length === 0) {
                    setSnack?.({ open: true, msg: "Please login first" });
                    return;
                }

                const userToken = loggedCustomers[0].userTokens;

                const productPrice =
                    productToAdd.salePrice && Number(productToAdd.salePrice) > 0
                        ? Number(productToAdd.salePrice)
                        : Number(productToAdd.price);

                const addQty = clampQty(qty);

                const cartRes = await fetch(API_CART, { cache: "no-store" });
                if (!cartRes.ok) throw new Error("Failed to fetch cart");
                const cartData = await cartRes.json();

                const existingItem = (Array.isArray(cartData) ? cartData : []).find(
                    (item) => String(item.productId) === String(productToAdd.id) && item.userTokens === userToken
                );

                if (existingItem) {
                    const patchRes = await fetch(`${API_CART}/${existingItem.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            quantity: Number(existingItem.quantity || 0) + addQty,
                        }),
                    });
                    if (!patchRes.ok) throw new Error("Failed to update cart item");
                } else {
                    const newCartItem = {
                        productId: productToAdd.id,
                        name: productToAdd.name,
                        price: productToAdd.price,
                        salePrice: productToAdd.salePrice,
                        image: productToAdd.image,
                        quantity: addQty,
                        userTokens: userToken,
                        category: productToAdd.category,
                        description: productToAdd.description,
                    };

                    const postRes = await fetch(API_CART, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newCartItem),
                    });
                    if (!postRes.ok) throw new Error("Failed to add cart item");
                }

                const totalRes = await fetch(API_TOTALPRICE, { cache: "no-store" });
                if (!totalRes.ok) throw new Error("Failed to fetch totals");
                const totalData = await totalRes.json();

                const userTotal = (Array.isArray(totalData) ? totalData : []).find(
                    (item) => item.userTokens === userToken
                );

                const added = productPrice * addQty;

                if (userTotal) {
                    const patchTotal = await fetch(`${API_TOTALPRICE}/${userTotal.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            totalPrice: Number(userTotal.totalPrice || 0) + added,
                        }),
                    });
                    if (!patchTotal.ok) throw new Error("Failed to update total price");
                } else {
                    const postTotal = await fetch(API_TOTALPRICE, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userTokens: userToken,
                            totalPrice: added,
                        }),
                    });
                    if (!postTotal.ok) throw new Error("Failed to create total price");
                }

                setSnack?.({ open: true, msg: `Added to cart (x${addQty})` });
            } catch {
                setSnack?.({ open: true, msg: "Add to cart error" });
            }
        },
        [loggedCustomers, API_CART, API_TOTALPRICE, clampQty, qty, setSnack]
    );

    return { qty, setQty, maxQty, clampQty, handleAddToCart };
}
