"use client";

import ProductCard from "./ProductCard";
import { useEffect, useMemo, useState } from "react";

export default function ProductGrid({ product }) {
    const API_TOTALPRICE = "http://localhost:5000/totalPrice";
    const API_Products = "http://localhost:5000/products";
    const API_loggedCustomers = "http://localhost:5000/loggedCustomers";
    const API_BASE = "http://localhost:5000/wishList";
    const API_CART = "http://localhost:5000/cart";

    // ✅ نخزن منتجات الـ API هنا فقط (المصدر الأساسي)
    const [allProducts, setAllProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState([]);
    const [loggedCustomers, setLoggedCustomers] = useState(null);
    const [favorites, setFavorites] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ لو props موجودة (فلتر) اعرضها، غير كذا اعرض كل المنتجات
    const displayedProducts = useMemo(() => {
        return Array.isArray(product) && product.length >= 0 ? product : allProducts;
    }, [product, allProducts]);
    console.log(displayedProducts)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resTotal, resProducts, resLogged] = await Promise.all([
                    fetch(API_TOTALPRICE),
                    fetch(API_Products),
                    fetch(API_loggedCustomers),
                ]);

                if (!resTotal.ok || !resProducts.ok || !resLogged.ok) {
                    throw new Error("Failed to fetch data");
                }

                const totalPriceData = await resTotal.json();
                const productsData = await resProducts.json();
                const loggedCustomersData = await resLogged.json();

                // ✅ ما نلمس props نهائيًا
                setAllProducts(productsData);
                setLoggedCustomers(loggedCustomersData);

                if (loggedCustomersData?.length > 0) {
                    const userToken = loggedCustomersData[0].userTokens;
                    const filteredTotal = totalPriceData.filter(
                        (order) => order.userTokens === userToken
                    );
                    setTotalPrice(filteredTotal);
                }
            } catch (err) {
                setError(err?.message || "Error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!loggedCustomers || loggedCustomers.length === 0) return;

        const loadWishlist = async () => {
            try {
                const res = await fetch(API_BASE);
                const wishlist = await res.json();

                const userToken = loggedCustomers[0].userTokens;

                const favMap = {};
                wishlist
                    .filter((item) => item.userTokens === userToken)
                    .forEach((item) => {
                        favMap[item.id] = true;
                    });

                setFavorites(favMap);
            } catch (err) {
                alert(err);
            }
        };

        loadWishlist();
    }, [loggedCustomers]);

    const toggleFavorite = async (productId, productItem) => {
        try {
            if (!loggedCustomers || loggedCustomers.length === 0) return;

            const userToken = loggedCustomers[0].userTokens;

            const res = await fetch(API_BASE);
            const wishlist = await res.json();

            // ✅ لازم نفحص كمان userTokens عشان ما نحذف لشخص ثاني
            const existingItem = wishlist.find(
                (item) => item.id === productId && item.userTokens === userToken
            );

            // ================= REMOVE =================
            if (existingItem) {
                const deleteRes = await fetch(`${API_BASE}/${existingItem.id}`, {
                    method: "DELETE",
                });

                if (!deleteRes.ok) throw new Error("Failed to remove product");

                setFavorites((prev) => ({ ...prev, [productId]: false }));
                return;
            }

            // ================= ADD =================
            const newProduct = {
                id: productItem.id,
                sellerId: productItem.sellerId,
                name: productItem.name,
                description: productItem.description,
                price: productItem.price,
                salePrice: productItem.salePrice,
                stock: productItem.stock,
                category: productItem.category,
                image: productItem.image,
                ...(productItem.onSale && { salePrice: String(productItem.salePrice) }),
                userTokens: userToken,
                type: productItem.type,
                brand: productItem.brand,
            };

            const postRes = await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct),
            });

            if (!postRes.ok) throw new Error("Failed to add product");

            setFavorites((prev) => ({ ...prev, [productId]: true }));
        } catch (error) {
            alert(error);
        }
    };

    const handleAddToCart = async (productItem) => {
        try {
            if (!loggedCustomers || loggedCustomers.length === 0) return;

            const userToken = loggedCustomers[0].userTokens;

            const productPrice =
                productItem.salePrice && Number(productItem.salePrice) > 0
                    ? Number(productItem.salePrice)
                    : Number(productItem.price);

            // ================= GET CART =================
            const cartRes = await fetch(API_CART);
            const cartData = await cartRes.json();

            const existingItem = cartData.find(
                (item) => item.productId === productItem.id && item.userTokens === userToken
            );

            // ================= UPDATE CART =================
            if (existingItem) {
                await fetch(`${API_CART}/${existingItem.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        quantity: existingItem.quantity + 1,
                    }),
                });
            } else {
                const newCartItem = {
                    productId: productItem.id,
                    name: productItem.name,
                    sellerId: productItem.sellerId,
                    price: productItem.price,
                    salePrice: productItem.salePrice,
                    image: productItem.image,
                    quantity: 1,
                    userTokens: userToken,
                    category: productItem.category,
                    description: productItem.description,
                };

                await fetch(API_CART, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newCartItem),
                });
            }

            // ================= TOTAL PRICE =================
            const totalRes = await fetch(API_TOTALPRICE);
            const totalData = await totalRes.json();

            const userTotal = totalData.find((item) => item.userTokens === userToken);

            if (userTotal) {
                await fetch(`${API_TOTALPRICE}/${userTotal.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        totalPrice: Number(userTotal.totalPrice) + productPrice,
                    }),
                });
            } else {
                await fetch(API_TOTALPRICE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userTokens: userToken,
                        totalPrice: productPrice,
                    }),
                });
            }

            window.location.reload();
        } catch (error) {
            console.error("Add to cart error:", error);
        }
    };

    if (loading) return <div className="py-10 text-center">Loading...</div>;
    if (error) return <div className="py-10 text-center text-red-500">{error}</div>;

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedProducts.map((p) => (
                    <ProductCard
                        key={p.id}
                        product={p}
                        handleAddToCart={handleAddToCart}
                        toggleFavorite={toggleFavorite}
                        favorites={favorites}
                        loggedCustomers={loggedCustomers}
                    />
                ))}
            </div>
        </div>
    );
}
