"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

/* ===========================
   Config
=========================== */
const API_orders = "http://localhost:5000/wishList";
const API_loggedUser = "http://localhost:5000/loggedCustomers";

const FALLBACK_IMG =
  "https://dummyimage.com/600x600/e2e8f0/64748b&text=No+Image";

/* ===========================
   Helpers
=========================== */
function getProductImage(product) {
  if (product?.image) return product.image;
  if (Array.isArray(product?.images) && product.images[0]) return product.images[0];
  return FALLBACK_IMG;
}

function formatSAR(value) {
  const n = Number(value || 0);
  return `${n.toLocaleString("en-US")} SAR`;
}

function calcDiscount(price, salePrice) {
  const p = Number(price);
  const s = Number(salePrice);
  if (!p || !s || s <= 0 || s >= p) return null;
  return Math.round(((p - s) / p) * 100);
}

function safeText(v) {
  return String(v ?? "").trim();
}

function priceValue(p) {
  const sale = Number(p?.salePrice || 0);
  const price = Number(p?.price || 0);
  return sale > 0 ? sale : price;
}

/* ===========================
   Small UI Pieces
=========================== */
function SpinnerSm() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
      aria-hidden="true"
    />
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3">
      <div className="h-44 w-full rounded-xl bg-slate-200" />
      <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
      <div className="mt-4 h-9 w-full rounded-lg bg-slate-200" />
    </div>
  );
}

function AlertBox({ variant = "error", title, children, onRetry }) {
  const styles =
    variant === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className={`rounded-2xl border p-4 ${styles}`}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div className="text-sm">{children}</div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
        >
          <ReplayRoundedIcon fontSize="small" />
          Retry
        </button>
      )}
    </div>
  );
}

function EmptyState({ onResetFilters }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100">
        <FavoriteRoundedIcon className="text-[#0587A7]" />
      </div>

      <h3 className="text-lg font-extrabold text-slate-900">No favorites yet</h3>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Save items you love and they’ll appear here for quick access.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          href="/Shop"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0587A7] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#05868e]"
        >
          Browse products
          <ArrowForwardRoundedIcon fontSize="small" />
        </Link>

        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-200"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({ active, icon, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold transition",
        active
          ? "bg-[#0587A7] text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200",
      ].join(" ")}
      type="button"
    >
      {icon ? <span className="grid h-4 w-4 place-items-center">{icon}</span> : null}
      {children}
    </button>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-[11px] font-extrabold text-slate-500">{label}</p>
      <p className="text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

/* ===========================
   Main Component
=========================== */
export default function TabWishlist() {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all | in | out
  const [sortBy, setSortBy] = useState("recent"); // recent | priceLow | priceHigh | name
  const [showFilters, setShowFilters] = useState(false);

  const [removingId, setRemovingId] = useState(null);

  // ✅ detect small screens (client-only)
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 640); // tailwind "sm" breakpoint
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [resWishlist, resLoggedCustomer] = await Promise.all([
        fetch(API_orders),
        fetch(API_loggedUser),
      ]);

      if (!resWishlist.ok || !resLoggedCustomer.ok) {
        throw new Error("Failed to fetch wishlist / logged customers");
      }

      const wishlist = await resWishlist.json();
      const loggedCustomerData = await resLoggedCustomer.json();

      const userToken = loggedCustomerData?.[0]?.userTokens;
      const filteredOrders = (wishlist || []).filter(
        (order) => order.userTokens === userToken
      );

      setOrdersData(filteredOrders);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Better UX: optimistic delete + local undo (10s)
  const [undoStack, setUndoStack] = useState(null); // { item, timerId }

  const removeFavorite = useCallback(
    async (productId) => {
      const item = ordersData.find((p) => p.id === productId);
      if (!item) return;

      if (undoStack?.timerId) clearTimeout(undoStack.timerId);
      setUndoStack(null);

      setRemovingId(productId);
      setOrdersData((prev) => prev.filter((p) => p.id !== productId));

      try {
        const res = await fetch(`${API_orders}/${productId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to remove product");

        const timerId = window.setTimeout(() => setUndoStack(null), 10000);
        setUndoStack({ item, timerId });
      } catch (e) {
        setOrdersData((prev) => [item, ...prev]);
        alert(e);
      } finally {
        setRemovingId(null);
      }
    },
    [ordersData, undoStack]
  );

  const undoRemove = useCallback(async () => {
    if (!undoStack?.item) return;

    try {
      const res = await fetch(`${API_orders}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(undoStack.item),
      });

      if (!res.ok) {
        setOrdersData((prev) => [undoStack.item, ...prev]);
      } else {
        const created = await res.json();
        setOrdersData((prev) => [created, ...prev]);
      }
    } catch {
      setOrdersData((prev) => [undoStack.item, ...prev]);
    } finally {
      if (undoStack?.timerId) clearTimeout(undoStack.timerId);
      setUndoStack(null);
    }
  }, [undoStack]);

  // Derived list (filter + sort)
  const filteredSorted = useMemo(() => {
    let list = [...ordersData];

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const name = safeText(p?.name).toLowerCase();
        const brand = safeText(p?.brand).toLowerCase();
        return name.includes(q) || brand.includes(q);
      });
    }

    if (stockFilter === "in") list = list.filter((p) => Number(p?.stock || 0) > 0);
    if (stockFilter === "out") list = list.filter((p) => Number(p?.stock || 0) <= 0);

    if (sortBy === "priceLow") list.sort((a, b) => priceValue(a) - priceValue(b));
    if (sortBy === "priceHigh") list.sort((a, b) => priceValue(b) - priceValue(a));
    if (sortBy === "name")
      list.sort((a, b) => safeText(a?.name).localeCompare(safeText(b?.name)));

    return list;
  }, [ordersData, query, stockFilter, sortBy]);

  // ✅ On small screens show ONLY 1 card; otherwise show top 3
  const topThree = useMemo(
    () => (isSmall ? filteredSorted.slice(0, 1) : filteredSorted.slice(0, 3)),
    [filteredSorted, isSmall]
  );

  const hasMoreThanThree = filteredSorted.length > 3;

  const stats = useMemo(() => {
    const total = ordersData.length;
    const inStock = ordersData.filter((p) => Number(p?.stock || 0) > 0).length;
    const outStock = total - inStock;

    const min = total ? Math.min(...ordersData.map((p) => priceValue(p))) : 0;
    const max = total ? Math.max(...ordersData.map((p) => priceValue(p))) : 0;

    return { total, inStock, outStock, min, max };
  }, [ordersData]);

  const resetFilters = useCallback(() => {
    setQuery("");
    setStockFilter("all");
    setSortBy("recent");
    setShowFilters(false);
  }, []);

  const renderProductCard = useCallback(
    (product) => {
      const image = getProductImage(product);
      const discount = calcDiscount(product?.price, product?.salePrice);
      const stock = Number(product?.stock || 0);

      const finalPrice =
        Number(product?.salePrice || 0) > 0
          ? Number(product.salePrice)
          : Number(product?.price || 0);

      const hasSale = Number(product?.salePrice || 0) > 0;

      return (
        <div
          key={product.id}
          className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[#0587A7]/10 blur-2xl" />
            <div className="absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-slate-200/40 blur-2xl" />
          </div>

          <div className="absolute right-3 top-3 z-40 flex items-center gap-2">
            <button
              aria-label="Remove from favorites"
              onClick={() => removeFavorite(product.id)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-2.5 py-2 text-red-600 shadow-sm ring-1 ring-black/5 transition hover:bg-red-50 disabled:opacity-60"
              title="Remove"
              disabled={removingId === product.id}
              type="button"
            >
              {removingId === product.id ? <SpinnerSm /> : <DeleteOutlineIcon fontSize="small" />}
            </button>
          </div>

          <Link href={`/Shop/${product.id}`} className="block">
            <div className="relative flex h-[230px] w-full items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
              <img
                src={image}
                alt={safeText(product?.name) || "Product"}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {discount ? (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-2xl bg-[#0587A7] px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">
                  <LocalFireDepartmentRoundedIcon fontSize="inherit" />
                  -{discount}%
                </span>
              ) : null}

              <span
                className={[
                  "absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-2xl px-2.5 py-1 text-xs font-extrabold shadow-sm",
                  stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                ].join(" ")}
              >
                {stock > 0 ? (
                  <>
                    <CheckRoundedIcon fontSize="inherit" />
                    In stock
                  </>
                ) : (
                  <>
                    <BlockRoundedIcon fontSize="inherit" />
                    Out of stock
                  </>
                )}
              </span>
            </div>
          </Link>

          <div className="relative flex flex-grow flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-sm font-extrabold text-slate-900">
                  {safeText(product?.name) || "Untitled product"}
                </h3>

                {(product?.brand || product?.category) && (
                  <p className="mt-0.5 line-clamp-1 text-xs font-bold text-slate-500">
                    {safeText(product?.brand)}
                    {product?.brand && product?.category ? " • " : ""}
                    {safeText(product?.category)}
                  </p>
                )}
              </div>

              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-extrabold text-slate-700">
                #{product.id}
              </span>
            </div>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-lg font-black text-[#0587A7]">{formatSAR(finalPrice)}</span>

              {hasSale ? (
                <span className="pb-0.5 text-sm font-extrabold text-slate-400 line-through">
                  {formatSAR(product?.price)}
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                <AutoAwesomeRoundedIcon fontSize="inherit" />
                Prime FREE Delivery
              </span>

              {stock > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700">
                  <CheckRoundedIcon fontSize="inherit" />
                  Ready to ship
                </span>
              )}
            </div>

            <div className="mt-auto flex gap-2 pt-4">
              <Link
                href={`/Shop/${product.id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 p-2 text-slate-800 transition hover:bg-slate-200"
                aria-label={`View ${safeText(product?.name)}`}
                title="Open"
              >
                <OpenInNewIcon fontSize="small" />
              </Link>

              <button
                disabled={stock === 0}
                className="w-full rounded-2xl bg-[#0587A7] py-2 text-sm font-black text-white transition hover:bg-[#05868e] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={() => {
                  // hook your add-to-cart handler here
                }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      );
    },
    [removeFavorite, removingId]
  );

  if (loading) {
    return (
      <section className="px-4 py-10 md:px-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="h-10 w-60 animate-pulse rounded-2xl bg-slate-200" />
          <div className="flex gap-2">
            <div className="h-10 w-24 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-10 w-24 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>

        {/* ✅ 1 column on mobile */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-10 md:px-10">
        <AlertBox variant="error" title="Couldn’t load wishlist" onRetry={fetchWishlist}>
          {error}
        </AlertBox>
      </section>
    );
  }

  return (
    <section className="px-4 py-12 pt-0 md:px-10">
      <header className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative p-4 sm:p-6">
          <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[#0587A7]/10 blur-2xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-slate-200/40 blur-2xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100">
                <FavoriteRoundedIcon className="text-[#0587A7]" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">Wishlist</h2>
                <p className="text-xs font-extrabold text-slate-500">
                  Your saved items • quick access anytime
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {ordersData.length > 0 && (
                <Link
                  href="/Wishlist"
                  className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-[#0587A7] shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                >
                  Show all{ordersData.length > 3 ? ` (${ordersData.length})` : ""}
                </Link>
              )}

              <button
                onClick={() => setShowFilters((s) => !s)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-800 hover:bg-slate-200"
                type="button"
              >
                <TuneRoundedIcon fontSize="small" />
                Filters
              </button>

              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-800 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                type="button"
              >
                <ReplayRoundedIcon fontSize="small" />
                Reset
              </button>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Items" value={stats.total} />
            <Kpi label="In stock" value={stats.inStock} />
            <Kpi label="Out of stock" value={stats.outStock} />
            <Kpi
              label="Price range"
              value={stats.total ? `${formatSAR(stats.min)} – ${formatSAR(stats.max)}` : "—"}
            />
          </div>

          {ordersData.length > 0 && (
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100">
                  <SearchRoundedIcon className="text-slate-700" />
                </div>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search in wishlist (name, brand)…"
                  className="h-10 w-full rounded-2xl bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none ring-1 ring-transparent focus:ring-[#0587A7]"
                />

                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="rounded-2xl bg-slate-100 p-2 hover:bg-slate-200"
                    aria-label="Clear search"
                    type="button"
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-3">
                <div className="flex flex-wrap gap-2">
                  <Chip
                    active={stockFilter === "all"}
                    onClick={() => setStockFilter("all")}
                    icon={<FavoriteRoundedIcon fontSize="inherit" />}
                  >
                    All
                  </Chip>
                  <Chip
                    active={stockFilter === "in"}
                    onClick={() => setStockFilter("in")}
                    icon={<CheckRoundedIcon fontSize="inherit" />}
                  >
                    In stock
                  </Chip>
                  <Chip
                    active={stockFilter === "out"}
                    onClick={() => setStockFilter("out")}
                    icon={<BlockRoundedIcon fontSize="inherit" />}
                  >
                    Out of stock
                  </Chip>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 rounded-2xl bg-slate-100 px-3 text-xs font-black text-slate-800 outline-none hover:bg-slate-200"
                  >
                    <option value="recent">Recent</option>
                    <option value="priceLow">Price: Low</option>
                    <option value="priceHigh">Price: High</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>

              {showFilters && (
                <div className="border-t border-slate-200 p-3">
                  <p className="text-xs font-bold text-slate-500">
                    Add more filters later (brand, rating, price range, etc).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {topThree.length > 0 ? (
        <>
          {/* ✅ 1 card on mobile, then 2 on sm, 3 on lg */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topThree.map(renderProductCard)}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            {undoStack?.item ? (
              <div className="flex w-full items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-extrabold text-slate-800">
                  Removed{" "}
                  <span className="text-[#0587A7]">
                    {safeText(undoStack.item?.name) || "item"}
                  </span>
                </p>
                <button
                  onClick={undoRemove}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-900 hover:bg-slate-200"
                  type="button"
                >
                  Undo
                </button>
              </div>
            ) : null}

            {hasMoreThanThree && (
              <div className="flex w-full justify-center">
                <Link
                  href="/Wishlist"
                  className="inline-flex items-center gap-2 rounded-3xl bg-[#0587A7] px-6 py-3 text-sm font-black text-white shadow-sm hover:bg-[#05868e]"
                >
                  View all favorites ({filteredSorted.length})
                  <ArrowForwardRoundedIcon fontSize="small" />
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptyState onResetFilters={resetFilters} />
      )}
    </section>
  );
}
