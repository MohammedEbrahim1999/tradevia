"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useState, useEffect, useCallback, useMemo } from "react";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState([]); // filtered for current user
    const [loggedCustomers, setLoggedCustomers] = useState(null);
    const [favorites, setFavorites] = useState({});
    const [addingToCart, setAddingToCart] = useState({}); // { [productId]: boolean }

    const API_TOTALPRICE = "http://localhost:5000/totalPrice";
    const API_Products = "http://localhost:5000/products";
    const API_loggedCustomers = "http://localhost:5000/loggedCustomers";
    const API_BASE = "http://localhost:5000/wishList";
    const API_CART = "http://localhost:5000/cart";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ================= Helpers =================
    const getUserToken = useCallback(() => {
        return loggedCustomers?.[0]?.userTokens || null;
    }, [loggedCustomers]);

    const refetchUserTotal = useCallback(async () => {
        const userToken = getUserToken();
        if (!userToken) return;

        const resTotal = await fetch(API_TOTALPRICE);
        if (!resTotal.ok) throw new Error("Failed to fetch total price");
        const totalPriceData = await resTotal.json();

        const filteredTotal = totalPriceData.filter(
            (order) => order.userTokens === userToken
        );

        setTotalPrice(filteredTotal);
    }, [API_TOTALPRICE, getUserToken]);

    // ================= Initial Fetch =================
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

                const [totalPriceData, productsData, loggedCustomersData] =
                    await Promise.all([resTotal.json(), resProducts.json(), resLogged.json()]);

                setProducts(productsData);
                setLoggedCustomers(loggedCustomersData);

                if (loggedCustomersData.length > 0) {
                    const userToken = loggedCustomersData[0].userTokens;
                    const filteredTotal = totalPriceData.filter(
                        (order) => order.userTokens === userToken
                    );
                    setTotalPrice(filteredTotal);
                }
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // ================= Load Wishlist =================
    useEffect(() => {
        if (!loggedCustomers || loggedCustomers.length === 0) return;

        const loadWishlist = async () => {
            try {
                const res = await fetch(API_BASE);
                if (!res.ok) throw new Error("Failed to fetch wishlist");
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

    // ================= Toggle Favorite =================
    const toggleFavorite = async (productId, product, loggedCustomers) => {
        try {
            const res = await fetch(API_BASE);
            if (!res.ok) throw new Error("Failed to fetch wishlist");
            const wishlist = await res.json();

            const existingItem = wishlist.find((item) => item.id === productId);

            // REMOVE
            if (existingItem) {
                const deleteRes = await fetch(`${API_BASE}/${existingItem.id}`, {
                    method: "DELETE",
                });
                if (!deleteRes.ok) throw new Error("Failed to remove product");

                setFavorites((prev) => ({ ...prev, [productId]: false }));
                return;
            }

            // ADD
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
                ...(product.onSale && { salePrice: String(product.salePrice) }),
                userTokens: loggedCustomers?.[0]?.userTokens,
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
    // ================= Add To Cart (NO page reload) =================
    const handleAddToCart = useCallback(
        async (product) => {
            try {
                const userToken = getUserToken();
                if (!userToken) return;

                // prevent double clicks per product
                setAddingToCart((prev) => ({ ...prev, [product.id]: true }));

                const productPrice =
                    product.salePrice && Number(product.salePrice) > 0
                        ? Number(product.salePrice)
                        : Number(product.price);

                // 1) GET CART
                const cartRes = await fetch(API_CART);
                if (!cartRes.ok) throw new Error("Failed to fetch cart");
                const cartData = await cartRes.json();

                const existingItem = cartData.find(
                    (item) => item.productId === product.id && item.userTokens === userToken
                );

                // 2) UPDATE CART
                if (existingItem) {
                    const patchRes = await fetch(`${API_CART}/${existingItem.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            quantity: existingItem.quantity + 1,
                        }),
                    });
                    if (!patchRes.ok) throw new Error("Failed to update cart item");
                } else {
                    const newCartItem = {
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        salePrice: product.salePrice,
                        image: product.image,
                        quantity: 1,
                        userTokens: userToken,
                        category: product.category,
                        description: product.description,
                        sellerId: product.sellerId,

                    };

                    const postCart = await fetch(API_CART, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newCartItem),
                    });
                    if (!postCart.ok) throw new Error("Failed to add cart item");
                }

                // 3) TOTAL PRICE
                const totalRes = await fetch(API_TOTALPRICE);
                if (!totalRes.ok) throw new Error("Failed to fetch total price");
                const totalData = await totalRes.json();

                const userTotal = totalData.find((item) => item.userTokens === userToken);

                if (userTotal) {
                    const newTotal = Number(userTotal.totalPrice) + productPrice;

                    const patchTotal = await fetch(`${API_TOTALPRICE}/${userTotal.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ totalPrice: newTotal }),
                    });
                    if (!patchTotal.ok) throw new Error("Failed to update total price");

                    // Update UI instantly (no visible reload)
                    setTotalPrice([{ ...userTotal, totalPrice: newTotal }]);
                } else {
                    const postTotal = await fetch(API_TOTALPRICE, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userTokens: userToken,
                            totalPrice: productPrice,
                        }),
                    });
                    if (!postTotal.ok) throw new Error("Failed to create total price");

                    // silent refetch to get created record with id
                    await refetchUserTotal();
                }

                // Optional: if you have cart badge elsewhere, you can dispatch event here:
                // window.dispatchEvent(new Event("cart-updated"));

            } catch (error) {
                console.error("Add to cart error:", error);
            } finally {
                setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
            }
        },
        [API_CART, API_TOTALPRICE, getUserToken, refetchUserTotal]
    );

    const useSwiper = products.length > 5;

    const renderProductCard = (product) => {
        const discount =
            product.salePrice && product.salePrice > 0
                ? Math.round(((product.price - product.salePrice) / product.price) * 100)
                : null;

        const isAdding = !!addingToCart[product.id];

        return (
            <div
                key={product.id}
                className="relative flex h-full flex-col rounded-2xl border border-blue-100 bg-white p-[6px]"
            >
                {/* Favorite */}
                <div className="absolute right-4 top-4 z-40">
                    <button
                        aria-label="Add to favorites"
                        onClick={() => toggleFavorite(product.id, product, loggedCustomers)}
                        className={`p-1 rounded-md transition text-white
              ${favorites[product.id]
                                ? "bg-red-500"
                                : "bg-[#0587A7] hover:bg-[#05868e]"
                            }
            `}
                    >
                        {favorites[product.id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </button>
                </div>

                {/* Image */}
                <Link href={`/Shop/${product.id}`}>
                    <div className="relative flex h-[240px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#E5E7EB] p-4">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                        />

                        {discount && (
                            <span className="absolute left-2 top-2 rounded-md bg-[#0587A7] px-2 py-1 text-sm font-semibold text-white">
                                Sale -{discount}%
                            </span>
                        )}
                        {product.type && (
                            <span className="absolute right-2 bottom-2 rounded-md bg-[#bcc2c3] px-2 py-1 text-sm font-semibold text-black">
                                {product.type}
                            </span>
                        )}
                    </div>
                </Link>

                {/* Content */}
                <div className="flex flex-grow flex-col p-2 pt-0">
                    <h3 className="mb-3 mt-5 line-clamp-1 text-md font-bold text-black">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-2 flex items-center">
                        <span className="mr-2 text-lg font-medium text-[#0587A7]">
                            {product.salePrice > 0 ? product.salePrice : product.price} Sar
                        </span>

                        {product.salePrice > 0 && (
                            <span className="font-medium text-[#C9C9C9] line-through">
                                {product.price} Sar
                            </span>
                        )}
                    </div>

                    {/* Stock */}
                    {product.stock > 0 ? (
                        <span className="mb-2 text-gray-500">Available In Stock</span>
                    ) : (
                        <span className="mb-2 text-red-800">Out of Stock</span>
                    )}

                    <div className="mb-4 w-fit rounded-2xl bg-[#0587A7] p-1 text-xs font-semibold text-white">
                        ✔ Prime FREE Delivery
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-[10px]">
                        <Link
                            href={`/product/${product.id}`}
                            className="rounded-md bg-[#E5E7EB] p-2 text-black hover:bg-[#e1e2e6]"
                            aria-label={`View ${product.name}`}
                        >
                            <OpenInNewIcon />
                        </Link>

                        <button
                            disabled={product.stock === 0 || isAdding}
                            onClick={() => handleAddToCart(product)}
                            className="w-full rounded-md bg-[#0587A7] py-[6px] font-medium text-white transition hover:bg-[#05868e] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isAdding ? "Adding..." : "Add to cart"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return null;
    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <section className="bg-[#F5F6F7] px-4 py-16 md:px-10">
            <div className="mb-10 flex items-center justify-between">
                <h2 className="text-3xl font-semibold text-gray-900">
                    Featured Products
                </h2>
                <a
                    href="#"
                    className="font-semibold text-black transition hover:text-orange-600 hover:underline"
                >
                    View All
                </a>
            </div>

            {useSwiper ? (
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={20}
                    slidesPerView={2}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 5 },
                    }}
                    navigation
                    pagination={{ clickable: true }}
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id}>{renderProductCard(product)}</SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                    {products.map(renderProductCard)}
                </div>
            )}
        </section>
    );
}
