"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LinkIcon from "@mui/icons-material/Link";
import CloseIcon from "@mui/icons-material/Close";

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState(""); // ✅ optional now
    const [order, setOrder] = useState(null);
    const [error, setError] = useState("");
    const [note, setNote] = useState(""); // ✅ new small info note
    const [loading, setLoading] = useState(false);

    // copy states
    const [copiedOrder, setCopiedOrder] = useState(false);
    const [copiedTracking, setCopiedTracking] = useState(false);

    // ✅ change to your deployed API in production
    const API_ORDERS = "http://localhost:5000/orders";

    // ✅ NEW: remember last orderId
    const STORAGE_KEY = "lastTrackedOrderId";

    const inputRef = useRef(null);

    useEffect(() => {
        // focus input
        inputRef.current?.focus?.();

        // load last tracked id (optional)
        const last = localStorage.getItem(STORAGE_KEY);
        if (last) setOrderId(last);
    }, []);

    // helpers
    const normalize = (v) => String(v ?? "").trim().replace(/^#/, "");
    const normalizeEmail = (v) => String(v ?? "").trim().toLowerCase();

    // richer statuses
    const steps = useMemo(
        () => ["Pending", "Shipped", "Delivered"],
        []
    );

    const isCancelled = (s) => String(s || "").toLowerCase() === "cancelled";
    const isReturned = (s) => String(s || "").toLowerCase() === "returned";

    const statusLabel = (status) => (status ? status : "Pending");

    const normalizeStatus = (status) => {
        const s = String(status || "").trim();
        if (!s) return "Pending";
        const match = steps.find((x) => x.toLowerCase() === s.toLowerCase());
        return match || s;
    };

    const getStepIndex = (status) => {
        const s = normalizeStatus(status);
        return steps.findIndex((x) => x.toLowerCase() === s.toLowerCase());
    };

    const progressWidth = (status) => {
        if (isCancelled(status) || isReturned(status)) return "0%";
        const idx = getStepIndex(status);
        if (idx < 0) return "0%";
        const max = Math.max(steps.length - 1, 1);
        const pct = Math.round((idx / max) * 100);
        return `${pct}%`;
    };

    const statusBadge = (status) => {
        const s = normalizeStatus(status);

        if (isCancelled(s)) return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
        if (isReturned(s)) return "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200";
        if (s === "Delivered") return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
        if (s === "Out for delivery") return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
        if (s === "Shipped") return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
        if (s === "Packed") return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
        if (s === "Processing") return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";

        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    };

    const formatSAR = (n) => {
        const value = Number(n ?? 0);
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "SAR",
                maximumFractionDigits: 0,
            }).format(value);
        } catch {
            return `${value} SAR`;
        }
    };

    const formatDate = (d) => {
        if (!d) return "";
        const date = d instanceof Date ? d : new Date(d);
        if (Number.isNaN(date.getTime())) return "";
        try {
            return new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                month: "short",
                day: "2-digit",
                year: "numeric",
            }).format(date);
        } catch {
            return date.toDateString();
        }
    };

    // ETA logic
    const getETA = (o) => {
        if (!o) return null;

        if (o.etaStart || o.etaEnd) {
            const a = o.etaStart ? formatDate(o.etaStart) : "";
            const b = o.etaEnd ? formatDate(o.etaEnd) : "";
            if (a && b) return `${a} – ${b}`;
            return a || b || null;
        }

        if (o.eta) {
            const s = formatDate(o.eta);
            return s || null;
        }

        const created = o.createdAt ? new Date(o.createdAt) : null;
        if (!created || Number.isNaN(created.getTime())) return null;

        const days = Number(o.estimatedDeliveryDays ?? 5) || 5;
        const start = new Date(created);
        start.setDate(start.getDate() + Math.max(days - 1, 1));
        const end = new Date(created);
        end.setDate(end.getDate() + Math.max(days + 1, 2));

        const a = formatDate(start);
        const b = formatDate(end);
        if (a && b) return `${a} – ${b}`;
        return a || b || null;
    };

    // prefer querying API then fallback to all
    const findOrder = async (inputId) => {
        const tryQuery = async (url) => {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) return null;
            const data = await res.json();
            if (Array.isArray(data)) return data[0] || null;
            return data || null;
        };

        const q1 = await tryQuery(`${API_ORDERS}?orderId=${encodeURIComponent(inputId)}`);
        if (q1) return q1;

        const q2 = await tryQuery(`${API_ORDERS}?id=${encodeURIComponent(inputId)}`);
        if (q2) return q2;

        const res = await fetch(API_ORDERS, { cache: "no-store" });
        if (!res.ok) throw new Error("Bad response");
        const data = await res.json();

        const found =
            data.find((o) => normalize(o.orderId) === inputId) ||
            data.find((o) => normalize(o.id) === inputId);

        return found || null;
    };

    const handleTrack = async () => {
        const inputId = normalize(orderId);
        const inputEmail = normalizeEmail(email); // can be empty

        if (!inputId) {
            setError("Please enter your Order ID.");
            return;
        }

        setLoading(true);
        setError("");
        setNote("");
        setOrder(null);

        try {
            const found = await findOrder(inputId);

            if (!found) {
                setError("We couldn't find an order with that ID.");
                return;
            }

            // ✅ NEW: save last tracked
            localStorage.setItem(STORAGE_KEY, inputId);

            // ✅ OPTIONAL email validation:
            // - if user typed email AND order has email => must match
            // - if user didn't type email => allow
            // - if order has no email => allow, show note
            const orderEmail = normalizeEmail(found.email || found.customerEmail || "");

            if (inputEmail) {
                if (!orderEmail) {
                    setNote("Note: This order has no email stored, so email verification was skipped.");
                } else if (orderEmail !== inputEmail) {
                    setError("Email does not match this Order ID. Please check and try again.");
                    return;
                }
            } else {
                // user did not provide email
                if (orderEmail) {
                    setNote("Tip: Add email to verify and prevent viewing someone else's order.");
                }
            }

            setOrder(found);
        } catch (e) {
            setError("Something went wrong while fetching your order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setOrderId("");
        setEmail("");
        setOrder(null);
        setError("");
        setNote("");
        setCopiedOrder(false);
        setCopiedTracking(false);
        localStorage.removeItem(STORAGE_KEY);
        inputRef.current?.focus?.();
    };

    const copyText = async (text, which = "order") => {
        try {
            await navigator.clipboard.writeText(String(text || ""));
            if (which === "order") {
                setCopiedOrder(true);
                setTimeout(() => setCopiedOrder(false), 1200);
            } else {
                setCopiedTracking(true);
                setTimeout(() => setCopiedTracking(false), 1200);
            }
        } catch { }
    };

    const ItemImage = ({ src, alt }) => {
        const [broken, setBroken] = useState(false);

        if (!src || broken) {
            return (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 grid place-items-center text-[11px] text-gray-400 ring-1 ring-gray-200">
                    No image
                </div>
            );
        }

        return (
            <img
                src={src}
                alt={alt}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-gray-100 ring-1 ring-gray-200"
                onError={() => setBroken(true)}
                loading="lazy"
            />
        );
    };

    const Skeleton = () => (
        <div className="mt-8 bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between gap-6 border-b pb-6">
                    <div className="space-y-3 w-full">
                        <div className="h-5 w-56 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-28 bg-gray-100 rounded-full animate-pulse" />
                </div>

                <div className="mt-6">
                    <div className="h-4 w-28 bg-gray-100 rounded mb-4 animate-pulse" />
                    <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                </div>

                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="h-3 w-80 bg-gray-100 rounded animate-pulse" />
            </div>
        </div>
    );

    const orderShownId = order?.orderId || (order?.id ? `#${order.id}` : "");
    const etaText = getETA(order);

    // tracking fields (optional)
    const trackingNumber = order?.trackingNumber || order?.trackingNo || "";
    const carrier = order?.carrier || order?.shippingCarrier || "";
    const trackingUrl = order?.trackingUrl || order?.carrierUrl || "";

    const stepIcon = (step) => {
        const s = step.toLowerCase();
        if (s === "pending") return <Inventory2Icon />;
        if (s === "processing") return <ScheduleIcon />;
        if (s === "packed") return <Inventory2Icon />;
        if (s === "shipped") return <LocalShippingIcon />;
        if (s === "out for delivery") return <LocalShippingIcon />;
        if (s === "delivered") return <CheckCircleIcon />;
        return <Inventory2Icon />;
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-white to-gray-50 px-4 py-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-xs shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-white/80" />
                        Order Tracking
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold mt-4 tracking-tight text-gray-900">
                        Track your order
                    </h1>

                    <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                        Enter your Order ID to view status, items, and shipping details. Email is optional.
                    </p>
                </div>

                {/* Search Card */}
                <div className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Order ID */}
                        <div className="relative md:col-span-1">
                            <SearchIcon className="absolute left-3 top-7 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="numeric"
                                placeholder="Order ID (e.g. #4329760)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                                aria-label="Order ID"
                                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-black/10 focus:border-black transition"
                            />
                            <p className="text-xs text-gray-500 mt-2 ml-1">
                                Tip: You can paste with or without <span className="font-semibold">#</span>.
                            </p>
                        </div>

                        {/* Email (optional) */}
                        <div className="relative md:col-span-2">
                            <input
                                type="email"
                                inputMode="email"
                                placeholder="Email (optional)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                                aria-label="Email"
                                className="w-full  px-4 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-black/10 focus:border-black transition"
                            />
                            <p className="text-xs text-gray-500 mt-2 ml-1">
                                If provided, we’ll verify it (when available).
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="md:col-span-1 flex gap-2">
                            <button
                                onClick={handleTrack}
                                disabled={loading}
                                className="flex-1 h-fit rounded-2xl bg-black text-white px-6 py-3.5 font-semibold hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
                            >
                                {loading ? "Tracking..." : "Track"}
                            </button>

                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={loading}
                                className="rounded-2xl h-fit px-4 py-3.5 font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 ring-1 ring-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                title="Clear"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>

                    {/* Inline Error */}
                    {error && (
                        <div className="mt-4 rounded-2xl bg-rose-50 text-rose-800 ring-1 ring-rose-200 p-4 flex gap-3">
                            <div className="mt-0.5">
                                <WarningAmberIcon />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold">We couldn’t complete your request</p>
                                <p className="mt-0.5 text-rose-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* ✅ NEW: Note */}
                    {note && !error && (
                        <div className="mt-4 rounded-2xl bg-amber-50 text-amber-900 ring-1 ring-amber-200 p-4 flex gap-3">
                            <div className="mt-0.5">
                                <WarningAmberIcon />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold">Note</p>
                                <p className="mt-0.5 text-amber-800">{note}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {loading && <Skeleton />}

                {/* Empty state */}
                {!loading && !error && !order && (
                    <div className="mt-10 bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 p-10 text-center">
                        <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 grid place-items-center ring-1 ring-gray-200">
                            <Inventory2Icon className="text-gray-700" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No order loaded</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Enter your Order ID above to see tracking progress and order details.
                        </p>
                    </div>
                )}

                {/* Order Card */}
                {!loading && order && (
                    <div className="mt-10 bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                        {/* Top Section */}
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b pb-6">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                                            Order {orderShownId}
                                        </h2>

                                        <button
                                            onClick={() => copyText(orderShownId, "order")}
                                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition ring-1 ring-gray-200"
                                            title="Copy Order ID"
                                            type="button"
                                        >
                                            <ContentCopyIcon sx={{ fontSize: 14 }} />
                                            {copiedOrder ? "Copied" : "Copy"}
                                        </button>
                                    </div>

                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-gray-600">
                                            Customer:{" "}
                                            <span className="font-medium text-gray-900">
                                                {order.customer || order.address?.fullName || "—"}
                                            </span>
                                        </p>

                                        {etaText && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <ScheduleIcon sx={{ fontSize: 18 }} />
                                                Estimated delivery:{" "}
                                                <span className="font-semibold text-gray-900">{etaText}</span>
                                            </p>
                                        )}

                                        <p className="text-xs text-gray-400">
                                            Internal ID: <span className="font-medium">{order.id}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusBadge(
                                            statusLabel(order.status)
                                        )}`}
                                    >
                                        {normalizeStatus(order.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Cancelled/Returned message */}
                            {(isCancelled(order.status) || isReturned(order.status)) && (
                                <div className="mt-5 rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4 text-rose-800 flex items-start gap-3">
                                    <CancelIcon className="mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-semibold">
                                            This order was {isReturned(order.status) ? "returned" : "cancelled"}
                                        </p>
                                        <p className="mt-0.5 text-rose-700">
                                            If you think this is a mistake, contact support and share your Order ID.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tracking info block */}
                            {(trackingNumber || trackingUrl || carrier) && (
                                <div className="mt-6 rounded-3xl bg-gray-50 p-5 ring-1 ring-gray-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <LinkIcon sx={{ fontSize: 18 }} />
                                                Shipment Tracking
                                            </p>
                                            <div className="mt-2 text-sm text-gray-700 space-y-1">
                                                {carrier && (
                                                    <p>
                                                        Carrier:{" "}
                                                        <span className="font-semibold text-gray-900">{carrier}</span>
                                                    </p>
                                                )}
                                                {trackingNumber && (
                                                    <p className="break-all">
                                                        Tracking #:{" "}
                                                        <span className="font-semibold text-gray-900">{trackingNumber}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {trackingNumber && (
                                                <button
                                                    type="button"
                                                    onClick={() => copyText(trackingNumber, "tracking")}
                                                    className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-700 transition ring-1 ring-gray-200"
                                                >
                                                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                                                    {copiedTracking ? "Copied" : "Copy"}
                                                </button>
                                            )}

                                            {trackingUrl && (
                                                <a
                                                    href={trackingUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center justify-center text-xs px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-900 transition"
                                                >
                                                    Open tracking
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="mt-7">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900">Progress</p>
                                    <p className="text-xs text-gray-500">Based on latest order status</p>
                                </div>

                                <div className="mt-4 relative">
                                    <div className="absolute left-0 right-0 top-5 h-[2px] bg-gray-200" />
                                    <div
                                        className="absolute left-0 top-5 h-[2px] bg-black transition-all"
                                        style={{ width: progressWidth(order.status) }}
                                    />

                                    <div
                                        className="grid gap-2"
                                        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
                                    >
                                        {steps.map((step, i) => {
                                            const idx = getStepIndex(order.status);
                                            const active =
                                                !isCancelled(order.status) && !isReturned(order.status) && idx >= i;
                                            const isCurrent =
                                                !isCancelled(order.status) && !isReturned(order.status) && idx === i;

                                            return (
                                                <div key={step} className="text-center">
                                                    <div
                                                        className={`mx-auto w-11 h-11 rounded-full grid place-items-center relative z-10 transition
                              ${active ? "bg-black text-white" : "bg-gray-200 text-gray-500"}
                              ${isCurrent ? "ring-4 ring-black/10" : ""}
                            `}
                                                        title={step}
                                                    >
                                                        {stepIcon(step)}
                                                    </div>
                                                    <p
                                                        className={`mt-2 text-[12px] sm:text-sm ${active ? "font-semibold text-gray-900" : "text-gray-400"
                                                            }`}
                                                    >
                                                        {step}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {getStepIndex(order.status) < 0 &&
                                        !isCancelled(order.status) &&
                                        !isReturned(order.status) && (
                                            <p className="mt-3 text-xs text-gray-500">
                                                Status “{String(order.status)}” isn’t mapped yet — add it to{" "}
                                                <span className="font-semibold">steps</span> to show progress.
                                            </p>
                                        )}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mt-10">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                    <h3 className="text-sm font-bold text-gray-900">Items</h3>
                                    <p className="text-sm text-gray-600">
                                        Total:{" "}
                                        <span className="font-bold text-gray-900">{formatSAR(order.totalPrice)}</span>
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {(order.items || []).map((item) => {
                                        const qty = Number(item.quantity || 0);
                                        const unit = Number(item.unitPrice || 0);
                                        const lineTotal = unit * qty;

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-4 p-4 sm:p-5 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition"
                                            >
                                                <ItemImage src={item.image} alt={item.productName} />

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{item.productName}</p>

                                                    <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                                                        <span>
                                                            Qty: <span className="font-semibold text-gray-900">{qty}</span>
                                                        </span>
                                                        <span>
                                                            Unit:{" "}
                                                            <span className="font-semibold text-gray-900">{formatSAR(unit)}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Subtotal</p>
                                                    <p className="font-bold text-gray-900">{formatSAR(lineTotal)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {(!order.items || order.items.length === 0) && (
                                        <div className="p-6 rounded-3xl bg-gray-50 text-gray-600 text-sm text-center ring-1 ring-gray-100">
                                            No items found for this order.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="mt-10 border-t pt-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Shipping Address</h3>

                                <div className="rounded-3xl bg-gray-50 p-5 text-sm text-gray-700 leading-6 ring-1 ring-gray-100">
                                    <p className="font-semibold text-gray-900">{order.address?.fullName || "—"}</p>
                                    <p>
                                        {order.address?.line1 || "—"}
                                        {order.address?.line2 ? `, ${order.address.line2}` : ""}
                                    </p>
                                    <p>
                                        {order.address?.city || "—"}
                                        {order.address?.region ? `, ${order.address.region}` : ""}
                                    </p>
                                    <p className="text-gray-600">{order.address?.phone || "—"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom info bar */}
                        <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                            <p className="text-xs text-gray-600">
                                If your status hasn’t updated in 24 hours, contact support with your Order ID.
                            </p>
                            <span className="text-xs text-gray-500">
                                Tracking • Updated from your orders database
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}