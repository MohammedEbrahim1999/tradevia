// app/category/[slug]/page.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

const API_PRODUCTS =
    process.env.NEXT_PUBLIC_API_PRODUCTS || "http://localhost:5000/products";

const IMG_FALLBACK =
    "https://dummyimage.com/800x800/e5e7eb/111827&text=No+Image";

function cn(...c) {
    return c.filter(Boolean).join(" ");
}

function slugToTitle(slug) {
    const s = String(slug || "").trim();
    if (!s) return "";
    return s
        .split("-")
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
        .join(" ");
}

function normalize(v) {
    return String(v ?? "").trim().toLowerCase();
}

function money(n) {
    const v = Number(n || 0);
    return `${v.toLocaleString("en-US")} SAR`;
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function pctOff(price, salePrice) {
    const p = Number(price || 0);
    const s = Number(salePrice || 0);
    if (!p || !s || s >= p) return 0;
    return Math.round(((p - s) / p) * 100);
}

function useDebouncedValue(value, delay = 250) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ✅ safe image url for Next/Image
function imgSrc(src) {
    const s = String(src || "").trim();
    if (!s) return IMG_FALLBACK;
    // allow remote http(s) OR local /public paths like "/imgs/17.jpg"
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/"))
        return s;
    return IMG_FALLBACK;
}

/**
 * LocalStorage-backed ordered set (keeps insertion order)
 * - safe against stale closures
 * - supports max cap
 */
function useLocalStorageSet(key, { max = Infinity } = {}) {
    const [setState, setSetState] = useState(() => new Set());

    useEffect(() => {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) setSetState(new Set(arr.map(String)));
        } catch { }
    }, [key]);

    const persist = useCallback(
        (nextSet) => {
            setSetState(new Set(nextSet));
            try {
                localStorage.setItem(key, JSON.stringify(Array.from(nextSet)));
            } catch { }
        },
        [key]
    );

    const toggle = useCallback(
        (id) => {
            const sid = String(id);
            let result = { ok: true, action: "added" };

            setSetState((prev) => {
                const next = new Set(prev);

                if (next.has(sid)) {
                    next.delete(sid);
                    result = { ok: true, action: "removed" };
                    try {
                        localStorage.setItem(key, JSON.stringify(Array.from(next)));
                    } catch { }
                    return next;
                }

                if (Number.isFinite(max) && next.size >= max) {
                    result = { ok: false, action: "blocked", reason: `Max ${max}` };
                    return prev;
                }

                next.add(sid);
                try {
                    localStorage.setItem(key, JSON.stringify(Array.from(next)));
                } catch { }
                return next;
            });

            return result;
        },
        [key, max]
    );

    const remove = useCallback(
        (id) => {
            const sid = String(id);
            setSetState((prev) => {
                const next = new Set(prev);
                next.delete(sid);
                try {
                    localStorage.setItem(key, JSON.stringify(Array.from(next)));
                } catch { }
                return next;
            });
        },
        [key]
    );

    const has = useCallback((id) => setState.has(String(id)), [setState]);
    const clear = useCallback(() => persist(new Set()), [persist]);
    const ids = useMemo(() => Array.from(setState), [setState]);

    return { setState, ids, toggle, remove, has, clear };
}

// ---------------- UI atoms ----------------
function Chip({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition",
                active
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
            )}
        >
            {children}
        </button>
    );
}

function IconBtn({ children, onClick, title, active }) {
    return (
        <button
            type="button"
            title={title}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick?.();
            }}
            className={cn(
                "grid h-10 w-10 place-items-center rounded-2xl transition ring-1 shadow-sm",
                active
                    ? "bg-zinc-900 text-white ring-zinc-900"
                    : "bg-white/95 text-zinc-900 ring-zinc-200 hover:bg-zinc-50"
            )}
        >
            {children}
        </button>
    );
}

function Skeleton() {
    return (
        <div className="rounded-3xl border border-zinc-200 bg-white p-3">
            <div className="aspect-[4/5] rounded-2xl bg-zinc-200 animate-pulse" />
            <div className="mt-3 h-4 w-3/4 rounded bg-zinc-200 animate-pulse" />
            <div className="mt-2 h-3 w-2/5 rounded bg-zinc-200 animate-pulse opacity-70" />
            <div className="mt-3 h-9 w-full rounded-2xl bg-zinc-200 animate-pulse opacity-60" />
        </div>
    );
}

function Banner({ title, desc, right }) {
    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 md:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-zinc-900/5 blur-3xl" />
                <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-zinc-900/5 blur-3xl" />
            </div>
            <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
                        {title}
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">{desc}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">{right}</div>
            </div>
        </div>
    );
}

function Drawer({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-black/30"
                aria-label="Close filters"
            />
            <div className="absolute right-0 top-0 h-full w-[92%] max-w-md bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                    <p className="text-sm font-semibold text-zinc-900">{title}</p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
                    >
                        Close
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

/* ✅ IMPROVED MODAL */
function Modal({ open, onClose, title, children, widthClass = "max-w-6xl" }) {
    const panelRef = useRef(null);

    // ESC close
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // lock body scroll
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // focus panel (simple)
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => panelRef.current?.focus?.(), 0);
        return () => clearTimeout(t);
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60]">
            {/* backdrop */}
            <button
                type="button"
                className="absolute inset-0 bg-black/45"
                onClick={onClose}
                aria-label="Close modal"
            />

            {/* container */}
            <div className="absolute inset-0 grid place-items-center p-3 sm:p-6">
                {/* panel */}
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    className={cn(
                        "relative w-full outline-none",
                        widthClass,
                        "max-h-[92vh] overflow-hidden rounded-[1.75rem] bg-white shadow-2xl ring-1 ring-zinc-200",
                        // animation
                        "animate-[modalIn_160ms_ease-out]"
                    )}
                >
                    {/* header (sticky) */}
                    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white/85 px-5 py-4 backdrop-blur">
                        <div className="min-w-0">
                            {title ? (
                                <p className="truncate text-sm font-semibold text-zinc-900">
                                    {title}
                                </p>
                            ) : (
                                <p className="text-sm font-semibold text-zinc-900">Details</p>
                            )}
                            <p className="mt-0.5 text-xs text-zinc-500">
                                Press ESC or click outside to close
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                        >
                            ✕
                        </button>
                    </div>

                    {/* body (scroll) */}
                    <div className="max-h-[calc(92vh-72px)] overflow-auto">
                        {children}
                    </div>
                </div>

                {/* keyframes */}
                <style jsx global>{`
          @keyframes modalIn {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
            </div>
        </div>
    );
}

function Toast({ show, text }) {
    if (!show) return null;
    return (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2">
            <div className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-lg">
                {text}
            </div>
        </div>
    );
}

function Badge({ children, tone = "neutral" }) {
    const toneCls =
        tone === "sale"
            ? "bg-emerald-600 text-white"
            : tone === "danger"
                ? "bg-red-600 text-white"
                : "bg-white/90 text-zinc-800 ring-1 ring-zinc-200";
    return (
        <span
            className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur",
                toneCls
            )}
        >
            {children}
        </span>
    );
}

// --------------- Card ---------------
function ProductCard({
    p,
    density = 3,
    wish,
    compare,
    onQuickView,
    onCompareBlocked,
}) {
    const id = p?.id;
    const title = p?.name || p?.title || "Untitled";
    const price = Number(p?.price || 0);
    const salePrice = Number(p?.salePrice || 0);
    const hasSale = salePrice > 0 && salePrice < price;
    const off = pctOff(price, salePrice);

    const out = Number(p?.stock ?? 0) === 0;
    const rating = Number(p?.rating ?? 0);
    const brand = p?.brand ? String(p.brand) : "";

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white transition",
                "hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(0,0,0,0.10)]"
            )}
        >
            {/* image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                <img
                    src={imgSrc(p?.image)}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.06]"
                />

                {/* top left badges */}
                <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
                    {p?.type ? <Badge>{p.type}</Badge> : null}
                    {hasSale ? <Badge tone="sale">-{off}%</Badge> : null}
                    {out ? <Badge tone="danger">Out</Badge> : null}
                </div>

                {/* top right actions */}
                <div className="absolute right-3 top-3 flex flex-col gap-2">
                    <IconBtn title="Wishlist" active={wish.has(id)} onClick={() => wish.toggle(id)}>
                        {wish.has(id) ? "♥" : "♡"}
                    </IconBtn>

                    <IconBtn
                        title="Compare (max 4)"
                        active={compare.has(id)}
                        onClick={() => {
                            const res = compare.toggle(id);
                            if (res?.ok === false) onCompareBlocked?.(res?.reason || "Limit reached");
                        }}
                    >
                        ≋
                    </IconBtn>
                </div>

                {/* quick view */}
                <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onQuickView(p);
                            }}
                            className="flex-1 rounded-2xl bg-white/90 px-3 py-2 text-xs font-semibold text-zinc-900 ring-1 ring-zinc-200 backdrop-blur hover:bg-white"
                        >
                            Quick view
                        </button>
                        <Link
                            href={`/Shop/${id}`}
                            className="rounded-2xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
                        >
                            Open
                        </Link>
                    </div>
                </div>
            </div>

            {/* body */}
            <div className={cn("p-4", density === 4 && "p-3")}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="line-clamp-1 text-[15px] font-semibold text-zinc-900">{title}</p>
                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-zinc-500">
                            {brand ? brand : p?.sku ? `SKU: ${p.sku}` : " "}
                        </p>
                    </div>

                    {rating ? (
                        <span className="shrink-0 rounded-full bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
                            ★ {rating.toFixed(1)}
                        </span>
                    ) : null}
                </div>

                <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                        {hasSale ? (
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-zinc-900">{money(salePrice)}</p>
                                <p className="text-xs font-semibold text-zinc-400 line-through">{money(price)}</p>
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-zinc-900">{money(price)}</p>
                        )}
                        <p className={cn("mt-1 text-xs font-semibold", out ? "text-red-600" : "text-emerald-600")}>
                            {out ? "Unavailable" : `In stock: ${Number(p?.stock ?? 0)}`}
                        </p>
                    </div>

                    {p?.returnPolicy ? (
                        <span className="rounded-full bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-600 ring-1 ring-zinc-200">
                            {String(p.returnPolicy)}
                        </span>
                    ) : null}
                </div>

                <div className="mt-4">
                    <Link
                        href={`/Shop/${id}`}
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition"
                    >
                        View details
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ---------------- Pagination ----------------
function Pagination({ page, pages, onPage }) {
    if (pages <= 1) return null;

    const items = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);

    if (start > 1) items.push(1, "…");
    for (let i = start; i <= end; i++) items.push(i);
    if (end < pages) items.push("…", pages);

    return (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
                type="button"
                onClick={() => onPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
            >
                Prev
            </button>

            {items.map((it, idx) =>
                it === "…" ? (
                    <span key={`d-${idx}`} className="px-2 text-zinc-500">
                        …
                    </span>
                ) : (
                    <button
                        key={it}
                        type="button"
                        onClick={() => onPage(it)}
                        className={cn(
                            "h-10 min-w-10 rounded-2xl px-3 text-sm font-semibold ring-1 transition",
                            it === page
                                ? "bg-zinc-900 text-white ring-zinc-900"
                                : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-50"
                        )}
                    >
                        {it}
                    </button>
                )
            )}

            <button
                type="button"
                onClick={() => onPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
}

// ✅ sticky compare bar with small previews
function CompareBar({ items = [], onOpen, onClear }) {
    if (!items.length) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3">
            <div className="mx-auto max-w-7xl">
                <div className="rounded-[1.75rem] border border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur shadow-[0_18px_55px_rgba(0,0,0,0.12)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-900 text-white font-bold">
                                ≋
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">
                                    Compare list ({items.length}/4)
                                </p>
                                <p className="text-xs text-zinc-500">Compare full specs side-by-side.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            {/* previews */}
                            <div className="hidden sm:flex items-center -space-x-2">
                                {items.slice(0, 4).map((p) => (
                                    <div
                                        key={p?.id}
                                        className="relative h-9 w-9 overflow-hidden rounded-xl ring-2 ring-white bg-zinc-100"
                                        title={p?.name || p?.title || "Product"}
                                    >
                                        <img
                                            src={imgSrc(p?.image)}
                                            alt={p?.name || p?.title || "Product"}
                                            fill
                                            sizes="36px"
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={onClear}
                                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={onOpen}
                                    className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                                >
                                    Open compare
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ✅ FULL compare modal: fields + specs (dynamic)
function CompareModal({ open, onClose, items = [], onRemove, onClear }) {
    const baseFields = [
        { key: "salePrice", label: "Sale price", render: (p) => (p?.salePrice ? money(p.salePrice) : "—") },
        { key: "price", label: "Price", render: (p) => money(p?.price) },
        { key: "brand", label: "Brand", render: (p) => String(p?.brand || "—") },
        { key: "sku", label: "SKU", render: (p) => String(p?.sku || "—") },
        { key: "rating", label: "Rating", render: (p) => (p?.rating ? `★ ${Number(p.rating).toFixed(1)} (${p?.reviewCount ?? 0})` : "—") },
        { key: "stock", label: "Stock", render: (p) => (Number(p?.stock ?? 0) > 0 ? String(p.stock) : "Out") },
        { key: "category", label: "Category", render: (p) => String(p?.category || "—") },
        { key: "type", label: "Type", render: (p) => String(p?.type || "—") },
        { key: "releaseYear", label: "Release year", render: (p) => String(p?.specs?.releaseYear || "—") },
        { key: "warranty", label: "Warranty", render: (p) => String(p?.specs?.warranty || "—") },
        { key: "returnPolicy", label: "Return policy", render: (p) => String(p?.returnPolicy || "—") },
    ];

    const specKeys = useMemo(() => {
        const s = new Set();
        for (const p of items) {
            const specs = p?.specs || {};
            Object.keys(specs).forEach((k) => s.add(k));
        }
        const preferred = [
            "screen",
            "resolution",
            "storage",
            "ram",
            "processor",
            "gpu",
            "battery",
            "charging",
            "os",
            "connectivity",
            "ports",
            "cameraFront",
            "cameraBack",
            "audio",
            "sensors",
            "weight",
            "dimensions",
            "color",
            "releaseYear",
            "warranty",
        ];
        const rest = Array.from(s).filter((k) => !preferred.includes(k));
        return [...preferred.filter((k) => s.has(k)), ...rest];
    }, [items]);

    const specFields = specKeys.map((k) => ({
        key: `spec_${k}`,
        label: k.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase()),
        render: (p) => String(p?.specs?.[k] ?? "—"),
    }));

    const fields = [
        ...baseFields,
        ...(specFields.length ? [{ key: "__specs__", label: "Specs", render: () => "" }] : []),
        ...specFields,
    ];

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Compare products"
            widthClass="max-w-[1100px]"
        >
            <div className="p-5 md:p-7">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold text-zinc-500">Compare</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                            Full comparison (fields + specs)
                        </h2>
                        <p className="mt-2 text-sm text-zinc-500">
                            Up to 4 products. Scroll sideways to view.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClear}
                            className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                        >
                            Clear all
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                        >
                            Done
                        </button>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="mt-6 rounded-[2rem] border border-zinc-200 bg-zinc-50 p-10 text-center">
                        <p className="text-lg font-semibold text-zinc-900">No items to compare</p>
                        <p className="mt-2 text-sm text-zinc-500">Tap ≋ on products to add them here.</p>
                    </div>
                ) : (
                    <div className="mt-6 overflow-auto">
                        <div className="min-w-[980px]">
                            {/* header row */}
                            <div className="grid grid-cols-[240px_repeat(4,1fr)] gap-3">
                                <div className="sticky left-0 z-10 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                                    <p className="text-sm font-semibold text-zinc-900">Product</p>
                                    <p className="mt-1 text-xs text-zinc-500">Up to 4 items</p>
                                </div>

                                {Array.from({ length: 4 }).map((_, idx) => {
                                    const p = items[idx];
                                    return (
                                        <div key={idx} className="relative rounded-2xl border border-zinc-200 bg-white p-4">
                                            {p ? (
                                                <>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-semibold text-zinc-900 line-clamp-2">
                                                            {p?.name || p?.title || "Untitled"}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => onRemove?.(p?.id)}
                                                            className="rounded-xl px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                                                            title="Remove"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    <div className="mt-3 flex gap-3">
                                                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200">
                                                            <img
                                                                src={imgSrc(p?.image)}
                                                                alt={p?.name || p?.title || "Product"}
                                                                fill
                                                                sizes="64px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-zinc-900">
                                                                {p?.salePrice && Number(p.salePrice) < Number(p.price || 0)
                                                                    ? money(p.salePrice)
                                                                    : money(p?.price)}
                                                            </p>
                                                            <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                                                                {p?.description || "—"}
                                                            </p>

                                                            <div className="mt-3 flex gap-2">
                                                                <Link
                                                                    href={`/Shop/${p?.id}`}
                                                                    className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
                                                                >
                                                                    Open
                                                                </Link>
                                                                {p?.salePrice && Number(p.salePrice) < Number(p.price || 0) ? (
                                                                    <span className="inline-flex items-center rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                                                                        -{pctOff(p.price, p.salePrice)}%
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="h-full grid place-items-center text-sm font-semibold text-zinc-400">
                                                    Empty
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* rows */}
                            <div className="mt-3 space-y-3">
                                {fields.map((f) => {
                                    const isSection = f.key === "__specs__";
                                    if (isSection) {
                                        return (
                                            <div key={f.key} className="rounded-2xl bg-zinc-900 px-5 py-3">
                                                <p className="text-sm font-semibold text-white">Specs</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={f.key} className="grid grid-cols-[240px_repeat(4,1fr)] gap-3">
                                            <div className="sticky left-0 z-10 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                                                <p className="text-sm font-semibold text-zinc-900">{f.label}</p>
                                            </div>

                                            {Array.from({ length: 4 }).map((_, idx) => {
                                                const p = items[idx];
                                                return (
                                                    <div key={`${f.key}-${idx}`} className="rounded-2xl border border-zinc-200 bg-white p-4">
                                                        <p className="text-sm font-semibold text-zinc-900 break-words">
                                                            {p ? f.render(p) : "—"}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

// ---------------- Main page ----------------
export default function CategoryProductsPage() {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const slug = params?.slug;
    const categoryTitle = useMemo(() => slugToTitle(slug), [slug]);

    const wish = useLocalStorageSet("wishlist_ids_v1");
    const compare = useLocalStorageSet("compare_ids_v1", { max: 4 });

    const initial = useMemo(() => {
        const q = searchParams?.get("q") || "";
        const sort = searchParams?.get("sort") || "newest";
        const density = Number(searchParams?.get("cols") || 3);
        const inStock = searchParams?.get("stock") === "1";
        const min = Number(searchParams?.get("min") || 0);
        const max = Number(searchParams?.get("max") || 0);
        const rating = Number(searchParams?.get("rating") || 0);
        const page = Number(searchParams?.get("page") || 1);
        return {
            q,
            sort,
            density: clamp(density, 2, 4),
            inStock,
            min,
            max,
            rating: clamp(rating, 0, 5),
            page: Math.max(1, page),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [q, setQ] = useState(initial.q);
    const qDebounced = useDebouncedValue(q, 250);

    const [sort, setSort] = useState(initial.sort);
    const [density, setDensity] = useState(initial.density);

    const [inStock, setInStock] = useState(initial.inStock);
    const [minPrice, setMinPrice] = useState(initial.min);
    const [maxPrice, setMaxPrice] = useState(initial.max);
    const [minRating, setMinRating] = useState(initial.rating);

    const [page, setPage] = useState(initial.page);
    const PAGE_SIZE = 12;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [quick, setQuick] = useState(null);

    const [compareOpen, setCompareOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, text: "" });

    const showToast = useCallback((text) => {
        setToast({ show: true, text });
        window.clearTimeout(showToast._t);
        showToast._t = window.setTimeout(() => setToast({ show: false, text: "" }), 1800);
    }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    showToast._t = showToast._t || null;

    const fetchProducts = useCallback(async (signal) => {
        const res = await fetch(API_PRODUCTS, { signal, cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    }, []);

    const load = useCallback(async () => {
        const controller = new AbortController();
        try {
            setLoading(true);
            setError("");
            const data = await fetchProducts(controller.signal);
            setProducts(data);
        } catch (e) {
            if (e?.name !== "AbortError") setError(e?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
        return () => controller.abort();
    }, [fetchProducts]);

    useEffect(() => {
        const cleanupPromise = load();
        return () => {
            if (typeof cleanupPromise === "function") cleanupPromise();
        };
    }, [load]);

    const categoryProducts = useMemo(() => {
        if (!categoryTitle) return [];
        const cat = normalize(categoryTitle);
        return products.filter((p) => normalize(p?.category) === cat);
    }, [products, categoryTitle]);

    const range = useMemo(() => {
        let min = Infinity;
        let max = 0;
        for (const p of categoryProducts) {
            const pr = Number(
                p?.salePrice && Number(p.salePrice) < Number(p.price || 0) ? p.salePrice : p?.price ?? 0
            );
            if (Number.isFinite(pr)) {
                min = Math.min(min, pr);
                max = Math.max(max, pr);
            }
        }
        if (!Number.isFinite(min)) min = 0;
        return { min, max };
    }, [categoryProducts]);

    const filtered = useMemo(() => {
        const query = normalize(qDebounced);
        let list = categoryProducts;

        if (query) {
            list = list.filter((p) => {
                const name = normalize(p?.name);
                const title = normalize(p?.title);
                const desc = normalize(p?.description);
                const brand = normalize(p?.brand);
                const sku = normalize(p?.sku);
                return (
                    name.includes(query) ||
                    title.includes(query) ||
                    desc.includes(query) ||
                    brand.includes(query) ||
                    sku.includes(query)
                );
            });
        }

        if (inStock) list = list.filter((p) => Number(p?.stock ?? 0) > 0);
        if (minRating > 0) list = list.filter((p) => Number(p?.rating ?? 0) >= minRating);

        const useMin = Number(minPrice) > 0;
        const useMax = Number(maxPrice) > 0;
        if (useMin || useMax) {
            list = list.filter((p) => {
                const pr = Number(
                    p?.salePrice && Number(p.salePrice) < Number(p.price || 0) ? p.salePrice : p?.price ?? 0
                );
                if (useMin && pr < Number(minPrice)) return false;
                if (useMax && pr > Number(maxPrice)) return false;
                return true;
            });
        }

        const out = [...list];

        if (sort === "newest") {
            out.sort((a, b) => {
                const da = new Date(a?.date || a?.createdAt || 0).getTime();
                const db = new Date(b?.date || b?.createdAt || 0).getTime();
                return db - da;
            });
        } else if (sort === "price_asc") {
            out.sort((a, b) => {
                const pa = Number(a?.salePrice && a.salePrice < a.price ? a.salePrice : a?.price || 0);
                const pb = Number(b?.salePrice && b.salePrice < b.price ? b.salePrice : b?.price || 0);
                return pa - pb;
            });
        } else if (sort === "price_desc") {
            out.sort((a, b) => {
                const pa = Number(a?.salePrice && a.salePrice < a.price ? a.salePrice : a?.price || 0);
                const pb = Number(b?.salePrice && b.salePrice < b.price ? b.salePrice : b?.price || 0);
                return pb - pa;
            });
        } else if (sort === "title_asc") {
            out.sort((a, b) =>
                String(a?.title || a?.name || "").localeCompare(String(b?.title || b?.name || ""))
            );
        }

        return out;
    }, [categoryProducts, qDebounced, inStock, minPrice, maxPrice, minRating, sort]);

    const filterKey = useMemo(
        () => [qDebounced, sort, density, inStock, minPrice, maxPrice, minRating].join("|"),
        [qDebounced, sort, density, inStock, minPrice, maxPrice, minRating]
    );

    useEffect(() => {
        setPage(1);
    }, [filterKey]);

    const pages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered.length]);
    const pageSafe = clamp(page, 1, pages);

    const paged = useMemo(() => {
        const start = (pageSafe - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, pageSafe]);

    const lastUrlRef = useRef("");
    useEffect(() => {
        const sp = new URLSearchParams(searchParams?.toString() || "");

        if (q) sp.set("q", q);
        else sp.delete("q");

        if (sort !== "newest") sp.set("sort", sort);
        else sp.delete("sort");

        if (density !== 3) sp.set("cols", String(density));
        else sp.delete("cols");

        if (inStock) sp.set("stock", "1");
        else sp.delete("stock");

        if (Number(minPrice) > 0) sp.set("min", String(minPrice));
        else sp.delete("min");

        if (Number(maxPrice) > 0) sp.set("max", String(maxPrice));
        else sp.delete("max");

        if (minRating > 0) sp.set("rating", String(minRating));
        else sp.delete("rating");

        if (pageSafe > 1) sp.set("page", String(pageSafe));
        else sp.delete("page");

        const next = sp.toString();
        if (next === lastUrlRef.current) return;
        lastUrlRef.current = next;

        const url = next ? `${pathname}?${next}` : pathname;
        router.replace(url, { scroll: false });
    }, [q, sort, density, inStock, minPrice, maxPrice, minRating, pageSafe, pathname, router, searchParams]);

    const gridClass = useMemo(() => {
        if (density === 2) return "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-5";
        if (density === 4) return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5";
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5";
    }, [density]);

    const resetAll = useCallback(() => {
        setQ("");
        setSort("newest");
        setDensity(3);
        setInStock(false);
        setMinPrice(0);
        setMaxPrice(0);
        setMinRating(0);
        setPage(1);
    }, []);

    const onRetry = useCallback(() => load(), [load]);

    const compareItems = useMemo(() => {
        if (!compare.ids.length) return [];
        const map = new Map(products.map((p) => [String(p?.id), p]));
        return compare.ids.map((id) => map.get(String(id))).filter(Boolean);
    }, [compare.ids, products]);

    useEffect(() => {
        if (compareOpen && compareItems.length === 0) setCompareOpen(false);
    }, [compareOpen, compareItems.length]);

    const FiltersUI = (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold text-zinc-700">Availability</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    <Chip active={!inStock} onClick={() => setInStock(false)}>
                        All
                    </Chip>
                    <Chip active={inStock} onClick={() => setInStock(true)}>
                        In stock only
                    </Chip>
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold text-zinc-700">Minimum rating</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {[0, 3, 4, 4.5].map((r) => (
                        <Chip key={r} active={minRating === r} onClick={() => setMinRating(r)}>
                            {r === 0 ? "Any" : `★ ${r}+`}
                        </Chip>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold text-zinc-700">Price range</p>
                <p className="mt-1 text-xs text-zinc-500">
                    Category range: {money(range.min)} – {money(range.max)}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-zinc-200 bg-white px-3 py-2.5">
                        <label className="text-[11px] font-semibold text-zinc-500">Min</label>
                        <input
                            type="number"
                            value={minPrice}
                            min={0}
                            onChange={(e) => setMinPrice(Number(e.target.value || 0))}
                            className="mt-1 w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none"
                            placeholder="0"
                        />
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white px-3 py-2.5">
                        <label className="text-[11px] font-semibold text-zinc-500">Max</label>
                        <input
                            type="number"
                            value={maxPrice}
                            min={0}
                            onChange={(e) => setMaxPrice(Number(e.target.value || 0))}
                            className="mt-1 w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none"
                            placeholder="0 (no max)"
                        />
                    </div>
                </div>

                <div className="mt-3 flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setMinPrice(0);
                            setMaxPrice(0);
                        }}
                        className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                    >
                        Clear
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMinPrice((v) => clamp(Number(v || 0), 0, range.max));
                            setMaxPrice((v) => clamp(Number(v || 0), 0, range.max));
                        }}
                        className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                    >
                        Apply
                    </button>
                </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
                <button
                    type="button"
                    onClick={resetAll}
                    className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                    Reset all
                </button>
                <button
                    type="button"
                    onClick={() => {
                        wish.clear();
                        compare.clear();
                    }}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                    Clear wishlist & compare
                </button>
            </div>
        </div>
    );

    return (
        <main className="min-h-[80vh] bg-zinc-50 pb-24">
            <Toast show={toast.show} text={toast.text} />

            <div className="mx-auto max-w-7xl px-4 py-8">
                <nav className="mb-4 text-sm text-zinc-500">
                    <Link href="/" className="hover:text-zinc-900">
                        Home
                    </Link>{" "}
                    <span className="mx-2">/</span>
                    <span className="text-zinc-800 font-semibold">{categoryTitle || "Category"}</span>
                </nav>

                <Banner
                    title={categoryTitle || "Category"}
                    desc="Improved UI + FULL compare (fields + specs), better MODAL, better images, proper scrolling."
                    right={
                        <>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                            >
                                Back
                            </Link>
                            <button
                                type="button"
                                onClick={resetAll}
                                className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
                            >
                                Reset
                            </button>
                        </>
                    }
                />

                {/* sticky controls */}
                <div className="sticky top-2 z-30 mt-6">
                    <div className="rounded-[2rem] border border-zinc-200 bg-white/85 p-4 backdrop-blur shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            {/* search */}
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-zinc-600" htmlFor="q">
                                    Search
                                </label>
                                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-zinc-200">
                                    <span className="text-zinc-400">⌕</span>
                                    <input
                                        id="q"
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder={`Search in ${categoryTitle || "category"}...`}
                                        className="w-full bg-transparent text-sm outline-none text-zinc-900 placeholder:text-zinc-400"
                                        autoComplete="off"
                                        inputMode="search"
                                    />
                                    {q ? (
                                        <button
                                            type="button"
                                            onClick={() => setQ("")}
                                            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                                        >
                                            Clear
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            {/* sort */}
                            <div className="w-full md:w-64">
                                <label className="text-xs font-semibold text-zinc-600" htmlFor="sort">
                                    Sort
                                </label>
                                <select
                                    id="sort"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">Price: Low → High</option>
                                    <option value="price_desc">Price: High → Low</option>
                                    <option value="title_asc">Title: A → Z</option>
                                </select>
                            </div>

                            {/* right actions */}
                            <div className="flex items-center justify-between gap-3 md:justify-end">
                                {/* density */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-zinc-600">Cols</span>
                                    <div className="inline-flex rounded-2xl bg-zinc-50 ring-1 ring-zinc-200 p-1">
                                        {[2, 3, 4].map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setDensity(c)}
                                                className={cn(
                                                    "px-3 py-2 text-sm rounded-xl font-semibold transition",
                                                    density === c ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                                                )}
                                                aria-pressed={density === c}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* filters */}
                                <button
                                    type="button"
                                    onClick={() => setFiltersOpen(true)}
                                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                                >
                                    Filters
                                </button>
                            </div>
                        </div>

                        {/* info row */}
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                            <span className="rounded-full bg-zinc-50 px-3 py-1 ring-1 ring-zinc-200">
                                {filtered.length} results
                            </span>

                            {inStock ? (
                                <span className="rounded-full bg-zinc-50 px-3 py-1 ring-1 ring-zinc-200">
                                    In stock only
                                </span>
                            ) : null}

                            {minRating > 0 ? (
                                <span className="rounded-full bg-zinc-50 px-3 py-1 ring-1 ring-zinc-200">
                                    Rating ≥ {minRating}
                                </span>
                            ) : null}

                            {Number(minPrice) > 0 || Number(maxPrice) > 0 ? (
                                <span className="rounded-full bg-zinc-50 px-3 py-1 ring-1 ring-zinc-200">
                                    Price {Number(minPrice) > 0 ? `≥ ${money(minPrice)}` : ""}
                                    {Number(maxPrice) > 0 ? ` ≤ ${money(maxPrice)}` : ""}
                                </span>
                            ) : null}

                            {compare.setState.size ? (
                                <button
                                    type="button"
                                    onClick={() => setCompareOpen(true)}
                                    className="rounded-full bg-zinc-900 text-white px-3 py-1 font-semibold hover:bg-zinc-800"
                                    title="Open compare"
                                >
                                    Compare: {compare.setState.size}
                                </button>
                            ) : null}

                            {wish.setState.size ? (
                                <span className="rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
                                    Wishlist: {wish.setState.size}
                                </span>
                            ) : null}

                            {error ? (
                                <span className="rounded-full bg-red-50 text-red-700 px-3 py-1 ring-1 ring-red-100">
                                    {error}
                                </span>
                            ) : null}

                            {error ? (
                                <button
                                    type="button"
                                    onClick={onRetry}
                                    className="rounded-full bg-zinc-900 px-3 py-1 font-semibold text-white hover:bg-zinc-800"
                                >
                                    Retry
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* desktop layout */}
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-28 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                            <p className="text-sm font-semibold text-zinc-900">Filters</p>
                            <div className="mt-5">{FiltersUI}</div>
                        </div>
                    </aside>

                    <section>
                        {loading ? (
                            <div className={gridClass}>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <Skeleton key={i} />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-3xl bg-zinc-100 text-zinc-600">
                                    ☐
                                </div>
                                <p className="text-lg font-semibold text-zinc-900">No products found</p>
                                <p className="mt-2 text-sm text-zinc-500">Try a different search, or reset filters.</p>
                                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setQ("")}
                                        className="rounded-2xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-zinc-50"
                                    >
                                        Clear search
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetAll}
                                        className="rounded-2xl bg-zinc-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-zinc-800"
                                    >
                                        Reset filters
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={gridClass} aria-live="polite">
                                    {paged.map((p) => (
                                        <ProductCard
                                            key={p.id}
                                            p={p}
                                            density={density}
                                            wish={wish}
                                            compare={compare}
                                            onQuickView={setQuick}
                                            onCompareBlocked={(msg) => showToast(`Compare limit reached (${msg})`)}
                                        />
                                    ))}
                                </div>

                                <Pagination page={pageSafe} pages={pages} onPage={setPage} />
                            </>
                        )}
                    </section>
                </div>

                {/* mobile drawer */}
                <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
                    {FiltersUI}
                </Drawer>

                {/* ✅ quick view (now uses improved Modal) */}
                <Modal
                    open={!!quick}
                    onClose={() => setQuick(null)}
                    title={quick?.name || quick?.title || "Quick view"}
                    widthClass="max-w-5xl"
                >
                    {quick ? (
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="relative aspect-[4/5] bg-zinc-100">
                                <img
                                    src={imgSrc(quick?.image)}
                                    alt={quick?.name || quick?.title || "Product"}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>

                            <div className="p-6 md:p-8">
                                <p className="text-xs font-semibold text-zinc-500">
                                    {categoryTitle || quick?.category || "Category"}
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
                                    {quick?.name || quick?.title || "Untitled"}
                                </h2>

                                <p className="mt-3 text-sm text-zinc-600 line-clamp-4">
                                    {quick?.description || "No description provided."}
                                </p>

                                <div className="mt-5 flex items-center justify-between">
                                    <div>
                                        {quick?.salePrice && Number(quick.salePrice) < Number(quick.price || 0) ? (
                                            <div className="flex items-center gap-2">
                                                <p className="text-lg font-bold text-zinc-900">{money(quick.salePrice)}</p>
                                                <p className="text-sm font-semibold text-zinc-400 line-through">{money(quick.price)}</p>
                                            </div>
                                        ) : (
                                            <p className="text-lg font-bold text-zinc-900">{money(quick?.price)}</p>
                                        )}
                                    </div>

                                    <p
                                        className={cn(
                                            "text-sm font-semibold",
                                            Number(quick?.stock ?? 0) > 0 ? "text-emerald-600" : "text-red-600"
                                        )}
                                    >
                                        {Number(quick?.stock ?? 0) > 0 ? `In stock: ${quick.stock}` : "Unavailable"}
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-col gap-2">
                                    <Link
                                        href={`/Shop/${quick?.id}`}
                                        className="rounded-2xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-800"
                                    >
                                        Open product page
                                    </Link>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => wish.toggle(quick?.id)}
                                            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                                        >
                                            {wish.has(quick?.id) ? "Remove ♥" : "Wishlist ♡"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const res = compare.toggle(quick?.id);
                                                if (res?.ok === false)
                                                    showToast(`Compare limit reached (${res?.reason || "Max 4"})`);
                                                else showToast(compare.has(quick?.id) ? "Removed from compare" : "Added to compare");
                                            }}
                                            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                                        >
                                            {compare.has(quick?.id) ? "Remove ≋" : "Compare ≋"}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 text-xs text-zinc-500">
                                    Tip: wishlist & compare are saved in your browser (localStorage).
                                </div>
                            </div>
                        </div>
                    ) : null}
                </Modal>
            </div>

            {/* sticky compare bar */}
            <CompareBar
                items={compareItems}
                onOpen={() => setCompareOpen(true)}
                onClear={() => {
                    compare.clear();
                    showToast("Compare cleared");
                }}
            />

            {/* compare modal */}
            <CompareModal
                open={compareOpen}
                onClose={() => setCompareOpen(false)}
                items={compareItems}
                onRemove={(id) => compare.remove(id)}
                onClear={() => {
                    compare.clear();
                    showToast("Compare cleared");
                }}
            />
        </main>
    );
}
