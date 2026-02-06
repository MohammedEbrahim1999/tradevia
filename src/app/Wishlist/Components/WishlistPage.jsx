"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";

const API_WISHLIST = "http://localhost:5000/wishList";
const API_LOGGED = "http://localhost:5000/loggedCustomers";

// ✅ Cart + total price
const API_TOTALPRICE = "http://localhost:5000/totalPrice";
const API_CART = "http://localhost:5000/cart";

const FALLBACK_IMG =
    "https://dummyimage.com/600x600/e2e8f0/64748b&text=No+Image";

/* ----------------------------- Helpers ----------------------------- */
function getProductImage(product) {
    if (product?.image) return product.image;
    if (Array.isArray(product?.images) && product.images[0]) return product.images[0];
    return FALLBACK_IMG;
}

function formatSAR(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return "0";
    return new Intl.NumberFormat("en-US").format(n);
}

function getFinalPrice(p) {
    const price = Number(p?.price || 0);
    const salePrice = Number(p?.salePrice || 0);
    return salePrice > 0 ? salePrice : price;
}

/* ----------------------------- UI ----------------------------- */
function SpinnerSm() {
    return (
        <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
            aria-hidden="true"
        />
    );
}

function Badge({ children, className = "" }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ${className}`}
        >
            {children}
        </span>
    );
}

function SoftCard({ children, className = "" }) {
    return (
        <div
            className={`rounded-3xl border border-slate-200 bg-white/80 shadow-[0_10px_30px_rgba(2,6,23,.06)] backdrop-blur ${className}`}
        >
            {children}
        </div>
    );
}

function AlertBox({ variant = "error", children, onRetry }) {
    const styles =
        variant === "error"
            ? "border-red-200 bg-red-50 text-red-900"
            : "border-amber-200 bg-amber-50 text-amber-950";

    return (
        <div className={`mb-4 rounded-2xl border p-4 text-sm font-extrabold ${styles}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>{children}</div>
                {onRetry ? (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                        <ReplayRoundedIcon fontSize="small" />
                        Retry
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl bg-white p-10 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-[#0587A7]/15 to-slate-100 text-[#0587A7] ring-1 ring-[#0587A7]/20">
                <FavoriteRoundedIcon />
            </div>
            <h2 className="text-xl font-black text-slate-900">No favorite products yet</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">
                Explore products and add items to your wishlist to see them here.
            </p>
            <Link
                href="/Shop"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#0587A7] px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-[#04748f]"
            >
                Browse products
            </Link>
        </div>
    );
}

function SkeletonRow() {
    return (
        <div className="flex gap-4 border-b border-slate-200/70 py-5">
            <div className="h-[140px] w-[140px] shrink-0 rounded-2xl bg-slate-200/70 animate-pulse" />
            <div className="min-w-0 flex-1">
                <div className="h-4 w-4/5 rounded bg-slate-200/70 animate-pulse" />
                <div className="mt-3 h-4 w-2/5 rounded bg-slate-200/70 animate-pulse" />
                <div className="mt-4 h-10 w-56 rounded-xl bg-slate-200/70 animate-pulse" />
            </div>
            <div className="h-6 w-24 rounded bg-slate-200/70 animate-pulse" />
        </div>
    );
}

function Toast({ show, message, actionLabel, onAction, onClose }) {
    if (!show) return null;
    return (
        <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-24px)] max-w-xl -translate-x-1/2">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white shadow-2xl">
                <span className="line-clamp-2">{message}</span>
                <div className="flex items-center gap-2">
                    {onAction ? (
                        <button
                            onClick={onAction}
                            className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-white/25"
                        >
                            {actionLabel || "Undo"}
                        </button>
                    ) : null}
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-white/20"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ----------------------------- Data Hook ----------------------------- */
function useWishlist() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);

    const removingIdsRef = useRef(new Set());
    const abortRef = useRef(null);

    // undo
    const lastRemovedRef = useRef(null);

    const fetchAll = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setLoading(true);
            setError(null);

            const [resWishlist, resLogged] = await Promise.all([
                fetch(API_WISHLIST, { signal: controller.signal }),
                fetch(API_LOGGED, { signal: controller.signal }),
            ]);

            if (!resWishlist.ok || !resLogged.ok) {
                throw new Error("Failed to fetch wishlist / logged customers");
            }

            const [wishlist, logged] = await Promise.all([resWishlist.json(), resLogged.json()]);

            const userToken = logged?.[0]?.userTokens;
            if (!userToken) {
                setItems([]);
                return;
            }

            const filtered = Array.isArray(wishlist)
                ? wishlist
                    .filter((item) => item?.userTokens === userToken)
                    .map((x) => ({ ...x, _addedAt: x?._addedAt || Date.now() }))
                : [];

            setItems(filtered);
        } catch (e) {
            if (e?.name !== "AbortError") setError(e?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [fetchAll]);

    const remove = useCallback(async (productId) => {
        if (!productId) return;
        if (removingIdsRef.current.has(productId)) return;

        removingIdsRef.current.add(productId);
        setActionError(null);

        let removedItem = null;

        setItems((prev) => {
            removedItem = prev.find((x) => x.id === productId) || null;
            return prev.filter((x) => x.id !== productId);
        });

        lastRemovedRef.current = removedItem;

        try {
            const res = await fetch(`${API_WISHLIST}/${productId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove product");
        } catch (e) {
            if (removedItem) setItems((prev) => [removedItem, ...prev]);
            setActionError(e?.message || "Failed to remove");
            lastRemovedRef.current = null;
        } finally {
            removingIdsRef.current.delete(productId);
        }
    }, []);

    const undoLastRemove = useCallback(async () => {
        const item = lastRemovedRef.current;
        if (!item) return;

        setItems((prev) => [item, ...prev]);

        try {
            const res = await fetch(API_WISHLIST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
            });
            if (!res.ok) throw new Error("Failed to restore item");
            lastRemovedRef.current = null;
        } catch (e) {
            setItems((prev) => prev.filter((x) => x.id !== item.id));
            setActionError(e?.message || "Undo failed");
        }
    }, []);

    // ✅ Clear all (delete from API + clear UI)
    const clearAll = useCallback(async () => {
        setActionError(null);

        const snapshot = items;
        setItems([]);
        lastRemovedRef.current = null;

        try {
            const results = await Promise.allSettled(
                (snapshot || []).map((p) =>
                    fetch(`${API_WISHLIST}/${p.id}`, { method: "DELETE" }).then((r) => {
                        if (!r.ok) throw new Error(`Failed to delete item ${p.id}`);
                        return true;
                    })
                )
            );

            const failed = results.filter((x) => x.status === "rejected");
            if (failed.length) throw new Error("Some items failed to delete");
        } catch (e) {
            setItems(snapshot || []);
            setActionError(e?.message || "Failed to clear");
        }
    }, [items]);

    return {
        items,
        setItems,
        loading,
        error,
        actionError,
        fetchAll,
        remove,
        clearAll,
        undoLastRemove,
        lastRemovedRef,
        removingIdsRef,
    };
}

/* ----------------------------- Row ----------------------------- */
function WishlistRow({
    product,
    onRemove,
    onMoveToCart,
    removing,
    selected,
    onToggleSelect,
    addingToCart,
}) {
    const [imgSrc, setImgSrc] = useState(() => getProductImage(product));

    useEffect(() => {
        setImgSrc(getProductImage(product));
    }, [product]);

    const price = Number(product?.price || 0);
    const salePrice = Number(product?.salePrice || 0);
    const finalPrice = salePrice > 0 ? salePrice : price;

    const discount =
        salePrice > 0 && price > 0 ? Math.round(((price - salePrice) / price) * 100) : null;

    const inStock = Number(product?.stock || 0) > 0;

    return (
        <div
            className={`group flex gap-4 border-b border-slate-200/70 py-5 transition ${removing ? "opacity-70" : ""
                }`}
        >
            {/* Select */}
            <div className="pt-2">
                <button
                    onClick={() => onToggleSelect(product.id)}
                    className={`grid h-7 w-7 place-items-center rounded-xl ring-1 transition ${selected
                            ? "bg-[#0587A7] text-white ring-[#0587A7]"
                            : "bg-white text-transparent ring-slate-300 hover:bg-slate-50"
                        }`}
                    aria-label="Select item"
                    disabled={removing}
                    title="Select"
                    type="button"
                >
                    <CheckCircleRoundedIcon fontSize="small" />
                </button>
            </div>

            {/* Image */}
            <Link
                href={`/Shop/${product.id}`}
                className={`relative h-[140px] w-[140px] shrink-0 overflow-hidden rounded-2xl bg-slate-100 p-2 ring-1 ring-slate-200 transition group-hover:shadow-sm ${removing ? "pointer-events-none" : ""
                    }`}
            >
                <Image
                    src={imgSrc}
                    alt={product?.name || "Product"}
                    fill
                    sizes="140px"
                    className="object-contain"
                    onError={() => setImgSrc(FALLBACK_IMG)}
                />
                {discount ? (
                    <span className="absolute left-2 top-2 rounded-xl bg-[#0587A7] px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                        -{discount}%
                    </span>
                ) : null}
            </Link>

            {/* Middle */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <Link
                        href={`/Shop/${product.id}`}
                        className="line-clamp-2 text-[15px] font-black text-slate-900 hover:text-[#C45500]"
                    >
                        {product?.name || "Untitled product"}
                    </Link>

                    {/* Mobile price */}
                    <div className="text-right sm:hidden">
                        <div className="text-base font-black text-slate-900">{formatSAR(finalPrice)} SAR</div>
                        {salePrice > 0 ? (
                            <div className="text-xs font-bold text-slate-400 line-through">
                                {formatSAR(price)} SAR
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {inStock ? (
                        <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                            In Stock
                        </Badge>
                    ) : (
                        <Badge className="bg-red-50 text-red-700 ring-1 ring-red-100">Out of Stock</Badge>
                    )}

                    <Badge className="bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                        FREE Shipping
                    </Badge>

                    <Badge className="bg-[#0587A7]/10 text-[#0587A7] ring-1 ring-[#0587A7]/20">
                        ✔ Prime
                    </Badge>
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => onMoveToCart?.(product)}
                        disabled={!inStock || removing || addingToCart}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#FFD814] px-4 py-2 text-sm font-black text-black shadow-sm hover:bg-[#F7CA00] disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                    >
                        {addingToCart ? <SpinnerSm /> : <ShoppingCartOutlinedIcon fontSize="small" />}
                        Add to Cart
                    </button>

                    <button
                        onClick={() => onRemove(product.id)}
                        disabled={removing}
                        className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Delete"
                        title="Delete"
                        type="button"
                    >
                        {removing ? <SpinnerSm /> : <DeleteOutlineIcon fontSize="small" />}
                        Delete
                    </button>

                    <Link
                        href={`/Shop/${product.id}`}
                        className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        title="View item"
                    >
                        <OpenInNewIcon fontSize="small" />
                        View item
                    </Link>
                </div>
            </div>

            {/* Right column price (desktop) */}
            <div className="hidden w-[190px] shrink-0 text-right sm:block">
                <div className="text-lg font-black text-slate-900">{formatSAR(finalPrice)} SAR</div>
                {salePrice > 0 ? (
                    <div className="mt-1 text-sm font-bold text-slate-400 line-through">
                        {formatSAR(price)} SAR
                    </div>
                ) : null}

                <div className="mt-3 text-xs font-bold text-slate-500">
                    Ships from: <span className="text-slate-700">TIVORA</span>
                </div>
            </div>
        </div>
    );
}

/* ----------------------------- Header UI ----------------------------- */
function HeaderKpi({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{label}</div>
            <div className="mt-1 text-lg font-black text-slate-900">{value}</div>
        </div>
    );
}

function ChipBtn({ active, children, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-full px-3 py-2 text-xs font-extrabold ring-1 transition ${active
                    ? "bg-[#0587A7] text-white ring-[#0587A7]"
                    : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                }`}
            type="button"
        >
            {children}
        </button>
    );
}

/* ----------------------------- Page ----------------------------- */
export default function WishlistPage() {
    const {
        items,
        loading,
        error,
        actionError,
        fetchAll,
        remove,
        clearAll,
        undoLastRemove,
        lastRemovedRef,
        removingIdsRef,
    } = useWishlist();

    const [toastOpen, setToastOpen] = useState(false);

    // ✅ Cart states (as you asked)
    const [products, setProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState([]);
    const [loggedCustomers, setLoggedCustomers] = useState(null);
    const [cartLoading, setCartLoading] = useState(true);
    const [cartError, setCartError] = useState(null);

    // ✅ add-to-cart loading per item
    const addingIdsRef = useRef(new Set());

    // search + sort + select
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("latest"); // latest | priceAsc | priceDesc
    const [stockFilter, setStockFilter] = useState("all"); // all | in | out

    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [confirmClear, setConfirmClear] = useState(false);

    const count = items.length;

    // toast on remove
    useEffect(() => {
        if (!lastRemovedRef.current) return;
        setToastOpen(true);
        const t = setTimeout(() => setToastOpen(false), 6000);
        return () => clearTimeout(t);
    }, [items, lastRemovedRef]);

    // ✅ load logged customers + totals (your code, adapted)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setCartLoading(true);
                setCartError(null);

                const [resTotal, resLogged] = await Promise.all([
                    fetch(API_TOTALPRICE),
                    fetch(API_LOGGED),
                ]);

                if (!resTotal.ok || !resLogged.ok) throw new Error("Failed to fetch data");

                const totalPriceData = await resTotal.json();
                const loggedCustomersData = await resLogged.json();

                setLoggedCustomers(loggedCustomersData);

                // (optional) keep products array, but wishlist already provides products
                setProducts([]); // not needed here, but kept to match your states

                if (loggedCustomersData?.length > 0) {
                    const userToken = loggedCustomersData[0].userTokens;
                    const filteredTotal = (totalPriceData || []).filter(
                        (order) => order.userTokens === userToken
                    );
                    setTotalPrice(filteredTotal);
                } else {
                    setTotalPrice([]);
                }
            } catch (err) {
                setCartError(err?.message || "Cart data error");
            } finally {
                setCartLoading(false);
            }
        };

        fetchData();
    }, []);

    // ✅ handle add to cart (your code, adapted to this page)
    const handleAddToCart = useCallback(
        async (product) => {
            try {
                if (!loggedCustomers || loggedCustomers.length === 0) return;

                if (!product?.id) return;
                if (addingIdsRef.current.has(product.id)) return;

                addingIdsRef.current.add(product.id);

                const userToken = loggedCustomers[0].userTokens;

                const productPrice =
                    product.salePrice && Number(product.salePrice) > 0
                        ? Number(product.salePrice)
                        : Number(product.price);

                // ================= GET CART =================
                const cartRes = await fetch(API_CART);
                const cartData = await cartRes.json();

                const existingItem = (cartData || []).find(
                    (item) => item.productId === product.id && item.userTokens === userToken
                );

                // ================= UPDATE CART =================
                if (existingItem) {
                    await fetch(`${API_CART}/${existingItem.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            quantity: Number(existingItem.quantity || 0) + 1,
                        }),
                    });
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
                        sellerId:product.sellerId,
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

                const userTotal = (totalData || []).find((item) => item.userTokens === userToken);

                if (userTotal) {
                    await fetch(`${API_TOTALPRICE}/${userTotal.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            totalPrice: Number(userTotal.totalPrice || 0) + productPrice,
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

                // ✅ better than reload
                // update local totalPrice state quickly (optional)
                setTotalPrice((prev) => {
                    const current = Array.isArray(prev) ? prev : [];
                    if (!current.length) return [{ userTokens: userToken, totalPrice: productPrice }];
                    const updated = current.map((x) =>
                        x.userTokens === userToken
                            ? { ...x, totalPrice: Number(x.totalPrice || 0) + productPrice }
                            : x
                    );
                    return updated;
                });
            } catch (error) {
                console.error("Add to cart error:", error);
            } finally {
                if (product?.id) addingIdsRef.current.delete(product.id);
            }
        },
        [loggedCustomers]
    );

    const hasItems = useMemo(() => items.length > 0, [items]);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        let list = items;

        if (query) list = list.filter((p) => (p?.name || "").toLowerCase().includes(query));

        if (stockFilter !== "all") {
            list = list.filter((p) => {
                const inStock = Number(p?.stock || 0) > 0;
                return stockFilter === "in" ? inStock : !inStock;
            });
        }

        const sorted = [...list].sort((a, b) => {
            if (sort === "priceAsc") return getFinalPrice(a) - getFinalPrice(b);
            if (sort === "priceDesc") return getFinalPrice(b) - getFinalPrice(a);
            return Number(b?._addedAt || 0) - Number(a?._addedAt || 0);
        });

        return sorted;
    }, [items, q, sort, stockFilter]);

    const selectedCount = selectedIds.size;

    const toggleSelect = useCallback((id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const selectAllVisible = useCallback(() => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            filtered.forEach((p) => next.add(p.id));
            return next;
        });
    }, [filtered]);

    const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

    const removeSelected = useCallback(async () => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        clearSelection();
        await Promise.all(ids.map((id) => remove(id)));
    }, [remove, selectedIds, clearSelection]);

    // ✅ connect row "Add to cart" button
    const onMoveToCart = useCallback(
        async (product) => {
            await handleAddToCart(product);
        },
        [handleAddToCart]
    );

    const totalVisible = useMemo(() => {
        return filtered.reduce((sum, p) => sum + getFinalPrice(p), 0);
    }, [filtered]);

    const inStockCount = useMemo(() => {
        return items.reduce((acc, p) => acc + (Number(p?.stock || 0) > 0 ? 1 : 0), 0);
    }, [items]);

    return (
        <section
            className="min-h-[70vh] bg-gradient-to-b from-slate-50 via-slate-100 to-slate-100 px-3 py-6 sm:px-6 md:px-10"
            aria-live="polite"
        >
            <div className="mx-auto w-full max-w-7xl">
                {/* Improved Header */}
                <div className="relative mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(5,135,167,.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(196,85,0,.12),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(2,6,23,.06),transparent_52%)]" />
                    <div className="relative p-5 sm:p-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0587A7] ring-1 ring-slate-200 shadow-sm">
                                        <FavoriteRoundedIcon />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Your Wishlist</h1>
                                        <p className="mt-1 text-sm font-bold text-slate-600">
                                            {count} item{count === 1 ? "" : "s"}
                                            {q?.trim() ? (
                                                <span className="ml-2 text-slate-500">• Showing {filtered.length}</span>
                                            ) : null}
                                        </p>

                                        {/* optional info */}
                                        {cartError ? (
                                            <p className="mt-1 text-xs font-bold text-red-600">{cartError}</p>
                                        ) : null}
                                        {cartLoading ? (
                                            <p className="mt-1 text-xs font-bold text-slate-500">Loading cart info...</p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {hasItems ? (
                                        <button
                                            onClick={() => setConfirmClear(true)}
                                            disabled={loading}
                                            className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
                                            type="button"
                                        >
                                            Clear All
                                        </button>
                                    ) : null}

                                    <Link
                                        href="/Shop"
                                        className="inline-flex items-center justify-center rounded-2xl bg-[#0587A7] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-[#04748f]"
                                    >
                                        Continue shopping
                                    </Link>
                                </div>
                            </div>

                            {/* KPIs */}
                            <div className="grid gap-2 sm:grid-cols-3">
                                <HeaderKpi label="Visible total" value={`${formatSAR(totalVisible)} SAR`} />
                                <HeaderKpi label="In stock" value={`${inStockCount}`} />
                                <HeaderKpi label="Selected" value={`${selectedCount}`} />
                            </div>

                            {/* Controls */}
                            {hasItems ? (
                                <SoftCard className="p-3 sm:p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        {/* Search */}
                                        <div className="relative w-full sm:max-w-md">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <SearchRoundedIcon fontSize="small" />
                                            </span>
                                            <input
                                                value={q}
                                                onChange={(e) => setQ(e.target.value)}
                                                placeholder="Search in wishlist..."
                                                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-extrabold text-slate-900 outline-none ring-0 focus:border-slate-300"
                                            />
                                            {q?.trim() ? (
                                                <button
                                                    onClick={() => setQ("")}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                                                    aria-label="Clear search"
                                                    type="button"
                                                >
                                                    <CloseRoundedIcon fontSize="small" />
                                                </button>
                                            ) : null}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Stock filter chips */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 sm:inline-flex">
                                                    <TuneRoundedIcon fontSize="small" />
                                                    Filter
                                                </span>
                                                <ChipBtn active={stockFilter === "all"} onClick={() => setStockFilter("all")}>
                                                    All
                                                </ChipBtn>
                                                <ChipBtn active={stockFilter === "in"} onClick={() => setStockFilter("in")}>
                                                    In Stock
                                                </ChipBtn>
                                                <ChipBtn active={stockFilter === "out"} onClick={() => setStockFilter("out")}>
                                                    Out
                                                </ChipBtn>
                                            </div>

                                            {/* Sort */}
                                            <select
                                                value={sort}
                                                onChange={(e) => setSort(e.target.value)}
                                                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-extrabold text-slate-900"
                                            >
                                                <option value="latest">Sort: Latest</option>
                                                <option value="priceAsc">Sort: Price (Low)</option>
                                                <option value="priceDesc">Sort: Price (High)</option>
                                            </select>

                                            {/* Bulk */}
                                            <button
                                                onClick={selectAllVisible}
                                                className="rounded-2xl bg-white px-3 py-2.5 text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                                                type="button"
                                            >
                                                Select visible
                                            </button>

                                            {selectedCount > 0 ? (
                                                <>
                                                    <button
                                                        onClick={removeSelected}
                                                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-3 py-2.5 text-sm font-extrabold text-white hover:bg-red-700"
                                                        type="button"
                                                    >
                                                        <DeleteSweepRoundedIcon fontSize="small" />
                                                        Remove ({selectedCount})
                                                    </button>
                                                    <button
                                                        onClick={clearSelection}
                                                        className="rounded-2xl bg-white px-3 py-2.5 text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                                                        type="button"
                                                    >
                                                        Clear selection
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                </SoftCard>
                            ) : null}
                        </div>
                    </div>
                </div>

                {error ? (
                    <AlertBox variant="error" onRetry={fetchAll}>
                        {error}
                    </AlertBox>
                ) : null}

                {actionError ? (
                    <AlertBox variant="warn" onRetry={fetchAll}>
                        {actionError}
                    </AlertBox>
                ) : null}

                {/* Content */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    {loading ? (
                        <div>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</div>
                    ) : hasItems ? (
                        filtered.length ? (
                            <div>
                                {filtered.map((p) => {
                                    const removing = removingIdsRef.current.has(p.id);
                                    const selected = selectedIds.has(p.id);
                                    const addingToCart = addingIdsRef.current.has(p.id);

                                    return (
                                        <WishlistRow
                                            key={p.id}
                                            product={p}
                                            onRemove={remove}
                                            removing={removing}
                                            onMoveToCart={onMoveToCart}
                                            selected={selected}
                                            onToggleSelect={toggleSelect}
                                            addingToCart={addingToCart}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
                                <p className="text-sm font-extrabold text-slate-700">No results for “{q}”</p>
                                <button
                                    onClick={() => setQ("")}
                                    className="mt-4 rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                                    type="button"
                                >
                                    Clear search
                                </button>
                            </div>
                        )
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </div>

            {/* Clear All confirm */}
            {confirmClear ? (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-3">
                    <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Clear wishlist?</h3>
                                <p className="mt-2 text-sm font-bold text-slate-500">
                                    This will remove all items from your wishlist.
                                </p>
                            </div>
                            <button
                                onClick={() => setConfirmClear(false)}
                                className="rounded-2xl p-2 text-slate-600 hover:bg-slate-100"
                                aria-label="Close"
                                type="button"
                            >
                                <CloseRoundedIcon />
                            </button>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button
                                onClick={() => setConfirmClear(false)}
                                className="rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setConfirmClear(false);
                                    setSelectedIds(new Set());
                                    await clearAll();
                                }}
                                className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-red-700"
                                type="button"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Toast Undo */}
            <Toast
                show={toastOpen && !!lastRemovedRef.current}
                message={`Removed: ${lastRemovedRef.current?.name || "Item"} from wishlist.`}
                actionLabel="Undo"
                onAction={() => {
                    undoLastRemove();
                    setToastOpen(false);
                }}
                onClose={() => setToastOpen(false)}
            />
        </section>
    );
}
