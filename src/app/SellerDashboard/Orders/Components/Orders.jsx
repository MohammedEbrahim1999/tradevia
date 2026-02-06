"use client";

import { useEffect, useMemo, useState } from "react";

export default function OrderDetail() {
    const [orders, setOrders] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [logged, setLogged] = useState(null);
    const [currentSeller, setCurrentSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI state
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expanded, setExpanded] = useState({}); // { [orderId]: boolean }

    const API_ORDERS = "http://localhost:5000/orders";
    const API_USERS = "http://localhost:5000/loggedUsers";
    const API_SELLERS = "http://localhost:5000/sellers";

    // ✅ Dark / colorful palette (no pure white backgrounds)
    const ui = {
        page: "bg-slate-950 text-slate-100",
        card: "bg-slate-900/60 border-slate-800",
        card2: "bg-slate-900/40 border-slate-800",
        soft: "bg-slate-950/60 border-slate-800",
        input:
            "bg-slate-950/70 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500/70 focus:ring-4 focus:ring-indigo-500/15",
        btn:
            "bg-slate-950/60 border-slate-800 text-slate-100 hover:bg-slate-900/70 active:scale-[0.99]",
        btnPrimary:
            "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99]",
        muted: "text-slate-300",
        subtle: "text-slate-400",
        divider: "border-slate-800",
        badge: "bg-slate-950/60 border-slate-800 text-slate-200",
    };

    const statusUI = {
        Pending: {
            pill: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30",
            dot: "bg-amber-400",
        },
        Shipped: {
            pill: "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/30",
            dot: "bg-sky-400",
        },
        Delivered: {
            pill: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30",
            dot: "bg-emerald-400",
        },
        Cancelled: {
            pill: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30",
            dot: "bg-rose-400",
        },
    };

    useEffect(() => {
        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [userRes, ordersRes, sellerRes] = await Promise.all([
                fetch(API_USERS),
                fetch(API_ORDERS),
                fetch(API_SELLERS),
            ]);

            if (!userRes.ok || !ordersRes.ok || !sellerRes.ok) {
                throw new Error("Failed to fetch data");
            }

            const userData = await userRes.json();
            const ordersData = await ordersRes.json();
            const sellerData = await sellerRes.json();

            const currentLogged = userData?.[0] || null;

            setLogged(currentLogged);
            setSellers(sellerData || []);

            const resolvedSeller =
                (sellerData || []).find(
                    (s) => String(s.id) === String(currentLogged?.sellerId)
                ) || null;

            setCurrentSeller(resolvedSeller);

            if (!resolvedSeller?.id) {
                setOrders([]);
                return;
            }

            const filtered = (ordersData || []).filter(
                (o) => String(o.sellerId) === String(resolvedSeller.id)
            );

            filtered.sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );

            setOrders(filtered);
        } catch (err) {
            setError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const getAvailableStatuses = (currentStatus) => {
        if (currentStatus === "Pending") return ["Shipped", "Cancelled"];
        if (currentStatus === "Shipped") return ["Delivered", "Cancelled"];
        return [];
    };

    const handleNextStatus = async (order, newStatus) => {
        try {
            const res = await fetch(`${API_ORDERS}/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
            );
            window.location.reload();
        } catch (err) {
            alert("Error updating status: " + (err?.message || ""));
        }
    };

    const formatMoney = (n) => {
        const num = Number(n || 0);
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(num);
        } catch {
            return `$${num.toFixed(2)}`;
        }
    };

    const formatDate = (iso) => {
        if (!iso) return "-";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "-";
        try {
            return new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }).format(d);
        } catch {
            return d.toLocaleString();
        }
    };

    const filteredOrders = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return (orders || []).filter((o) => {
            const matchesId = term
                ? String(o.orderId || "").toLowerCase().includes(term)
                : true;
            const matchesStatus =
                statusFilter === "all" ? true : o.status === statusFilter;
            return matchesId && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const summary = useMemo(() => {
        const total = filteredOrders.length;
        const pending = filteredOrders.filter((o) => o.status === "Pending").length;
        const shipped = filteredOrders.filter((o) => o.status === "Shipped").length;
        const delivered = filteredOrders.filter((o) => o.status === "Delivered")
            .length;
        const cancelled = filteredOrders.filter((o) => o.status === "Cancelled")
            .length;

        const revenue = filteredOrders.reduce(
            (acc, o) => acc + Number(o.totalPrice || 0),
            0
        );

        return { total, pending, shipped, delivered, cancelled, revenue };
    }, [filteredOrders]);

    if (loading)
        return (
            <div className={`${ui.page} mt-8 rounded-2xl border ${ui.card} p-6 shadow-sm`}>
                <div className="flex items-center gap-3">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-slate-700" />
                    <p className={`text-sm ${ui.muted}`}>Loading orders…</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className={`${ui.page} mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200 shadow-sm`}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-base font-semibold text-rose-100">
                            Couldn’t load orders
                        </p>
                        <p className="mt-1 text-sm opacity-90">{error}</p>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 active:scale-[0.99]"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );

    const storeName =
        currentSeller?.storeName || logged?.store || currentSeller?.name || "Seller";

    return (
        <div
            className={`${ui.page} mt-8 w-full rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/60 p-4 sm:p-6`}
        >
            {/* Header */}
            <div className={`mb-4 rounded-2xl border ${ui.card} p-5 shadow-sm`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-100 sm:text-2xl">
                            Orders for{" "}
                            <span className="text-indigo-300">{storeName}</span>
                        </h1>

                        <p className={`mt-1 text-sm ${ui.muted}`}>
                            Showing <span className="font-semibold">{summary.total}</span>{" "}
                            order(s) • Total{" "}
                            <span className="font-semibold text-slate-100">
                                {formatMoney(summary.revenue)}
                            </span>
                        </p>

                        {currentSeller?.id && (
                            <p className={`mt-1 text-xs ${ui.subtle}`}>
                                Seller ID:{" "}
                                <span className="font-semibold text-slate-200">
                                    {currentSeller.id}
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                🔎
                            </span>
                            <input
                                type="text"
                                placeholder="Search by Order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2 pl-9 text-sm outline-none ${ui.input}`}
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${ui.input} sm:w-44`}
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        {/* Refresh */}
                        <button
                            onClick={fetchAllData}
                            className={`rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm ${ui.btn}`}
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Quick stats pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <StatPill label="Pending" value={summary.pending} tone="amber" />
                    <StatPill label="Shipped" value={summary.shipped} tone="sky" />
                    <StatPill label="Delivered" value={summary.delivered} tone="emerald" />
                    <StatPill label="Cancelled" value={summary.cancelled} tone="rose" />
                </div>
            </div>

            {/* List */}
            {filteredOrders.length === 0 ? (
                <div className={`rounded-2xl border ${ui.card} p-8 text-center shadow-sm`}>
                    <p className="text-base font-semibold text-slate-100">
                        No orders found
                    </p>
                    <p className={`mt-1 text-sm ${ui.muted}`}>
                        Try changing search or filter.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map((order) => {
                        const available = getAvailableStatuses(order.status);
                        const open = !!expanded[order.id];
                        const st = statusUI[order.status] || statusUI.Pending;

                        const items = Array.isArray(order.items) ? order.items : [];

                        return (
                            <div
                                key={order.id}
                                className={`rounded-2xl border ${ui.card} shadow-sm transition hover:shadow-md`}
                            >
                                {/* Top row */}
                                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-base font-extrabold text-slate-100">
                                                {order.orderId}
                                            </p>

                                            <span
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${st.pill}`}
                                            >
                                                <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                                                {order.status}
                                            </span>

                                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${ui.badge}`}>
                                                {items.length} item(s)
                                            </span>

                                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${ui.badge}`}>
                                                Payment: {String(order.paymentMethod || "-").toUpperCase()}
                                            </span>
                                        </div>

                                        <div className={`mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm ${ui.muted}`}>
                                            <span>
                                                Customer:{" "}
                                                <span className="font-semibold text-slate-100">
                                                    {order.customer || "-"}
                                                </span>
                                            </span>
                                            <span>
                                                Created:{" "}
                                                <span className="font-semibold text-slate-100">
                                                    {formatDate(order.createdAt)}
                                                </span>
                                            </span>
                                            <span>
                                                Total:{" "}
                                                <span className="font-extrabold text-slate-100">
                                                    {formatMoney(order.totalPrice)}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {available.length > 0 ? (
                                            <select
                                                className={`rounded-xl border px-3 py-2 text-sm font-semibold outline-none ${ui.input}`}
                                                onChange={(e) =>
                                                    e.target.value && handleNextStatus(order, e.target.value)
                                                }
                                                defaultValue=""
                                            >
                                                <option value="" disabled>
                                                    Next status…
                                                </option>
                                                {available.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={`rounded-xl border px-3 py-2 text-sm font-semibold ${ui.badge}`}>
                                                Done
                                            </span>
                                        )}

                                        <button
                                            onClick={() =>
                                                setExpanded((prev) => ({
                                                    ...prev,
                                                    [order.id]: !prev[order.id],
                                                }))
                                            }
                                            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${ui.btn}`}
                                        >
                                            {open ? "Hide" : "View"} details
                                        </button>
                                    </div>
                                </div>

                                {/* Details */}
                                {open && (
                                    <div className={`border-t ${ui.divider} px-5 pb-5 pt-4`}>
                                        <div className="grid gap-4 lg:grid-cols-2">
                                            {/* Items */}
                                            <div className={`rounded-2xl border ${ui.soft} p-4`}>
                                                <p className="mb-3 text-sm font-extrabold text-slate-100">
                                                    Items
                                                </p>

                                                <div className="space-y-2">
                                                    {items.map((it) => {
                                                        const lineTotal =
                                                            Number(it.quantity || 0) * Number(it.unitPrice || 0);
                                                        return (
                                                            <div
                                                                key={it.id}
                                                                className={`flex items-start justify-between gap-3 rounded-xl border ${ui.card2} p-3`}
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-bold text-slate-100">
                                                                        {it.productName}
                                                                    </p>
                                                                    <p className={`mt-0.5 text-xs ${ui.muted}`}>
                                                                        Qty:{" "}
                                                                        <span className="font-semibold text-slate-100">
                                                                            {it.quantity}
                                                                        </span>{" "}
                                                                        • Unit:{" "}
                                                                        <span className="font-semibold text-slate-100">
                                                                            {formatMoney(it.unitPrice)}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                                <p className="whitespace-nowrap text-sm font-extrabold text-slate-100">
                                                                    {formatMoney(lineTotal)}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Shipping / Address */}
                                            <div className={`rounded-2xl border ${ui.soft} p-4`}>
                                                <p className="mb-3 text-sm font-extrabold text-slate-100">
                                                    Shipping & Address
                                                </p>

                                                <div className={`space-y-2 rounded-xl border ${ui.card2} p-4`}>
                                                    <Row label="Ship Cost" value={formatMoney(order.shipCost)} />
                                                    <Row label="Discount" value={formatMoney(order.discount)} />
                                                    <Row
                                                        label="Phone"
                                                        value={order.address?.phone || order.address?.raw?.phone || "-"}
                                                    />
                                                    <Row
                                                        label="Address"
                                                        value={
                                                            [
                                                                order.address?.line1 || order.address?.raw?.addressLine1,
                                                                order.address?.line2 || order.address?.raw?.addressLine2,
                                                                [
                                                                    order.address?.city || order.address?.raw?.city,
                                                                    order.address?.region || order.address?.raw?.state,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(", "),
                                                                order.address?.country || order.address?.raw?.country,
                                                                order.address?.postalCode || order.address?.raw?.postalCode,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(" • ") || "-"
                                                        }
                                                        wrap
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function StatPill({ label, value, tone = "slate" }) {
    const tones = {
        amber: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30",
        sky: "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/30",
        emerald: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30",
        rose: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30",
        slate: "bg-slate-500/15 text-slate-200 ring-1 ring-slate-500/30",
    };

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${tones[tone] || tones.slate
                }`}
        >
            <span className="text-[11px] opacity-80">{label}</span>
            <span className="rounded-full bg-slate-950/60 px-2 py-0.5 text-[11px] font-extrabold text-slate-100 ring-1 ring-slate-800">
                {value}
            </span>
        </span>
    );
}

function Row({ label, value, wrap = false }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold text-slate-400">{label}</p>
            <p
                className={`text-right text-xs font-bold text-slate-100 ${wrap ? "max-w-[70%] whitespace-normal" : "whitespace-nowrap"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}
