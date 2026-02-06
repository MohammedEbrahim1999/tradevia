"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Badge,
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";

const API_ORDERS = "http://localhost:5000/orders";
const API_LOGGED = "http://localhost:5000/loggedCustomers";

/* ----------------------------- Helpers ----------------------------- */
const formatEGP = (value) => {
    const n = Number(value);
    if (Number.isFinite(n)) return `${n.toFixed(2)} EG`;
    return `${value ?? 0} EG`;
};

function safeDate(value) {
    const d = value ? new Date(value) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
}

function copyText(text) {
    if (!text) return;
    navigator.clipboard?.writeText(String(text)).catch(() => { });
}

function normalizeStatus(status) {
    const s = String(status || "").trim().toLowerCase();
    if (s === "delivered") return "delivered";
    if (s === "shipped") return "shipped";
    if (s === "pending") return "pending";
    if (s === "cancelled" || s === "canceled") return "cancelled";
    return "unknown";
}

function statusMeta(status) {
    const s = normalizeStatus(status);

    if (s === "delivered")
        return {
            label: "Delivered",
            color: "success",
            icon: <DoneAllRoundedIcon fontSize="small" />,
            track: "success.light",
        };

    if (s === "shipped")
        return {
            label: "Shipped",
            color: "primary",
            icon: <LocalShippingRoundedIcon fontSize="small" />,
            track: "primary.light",
        };

    if (s === "pending")
        return {
            label: "Pending",
            color: "warning",
            icon: <PendingRoundedIcon fontSize="small" />,
            track: "warning.light",
        };

    if (s === "cancelled")
        return {
            label: "Cancelled",
            color: "error",
            icon: <CancelRoundedIcon fontSize="small" />,
            track: "error.light",
        };

    return {
        label: status || "Unknown",
        color: "default",
        icon: <ErrorOutlineRoundedIcon fontSize="small" />,
        track: "grey.300",
    };
}

/**
 * Normalize multi-product orders.
 * Supports common shapes:
 * - order.products: [{ productName, name, title, quantity, qty, price, unitPrice, totalPrice, image }]
 * - order.items: same shape
 * - fallback to single product fields on order: { productName, quantity, price }
 */
function getOrderItems(order) {
    const raw =
        (Array.isArray(order?.products) && order.products) ||
        (Array.isArray(order?.items) && order.items) ||
        (Array.isArray(order?.cartItems) && order.cartItems) ||
        [];

    if (raw.length > 0) {
        return raw
            .filter(Boolean)
            .map((it, idx) => {
                const name = it?.productName ?? it?.name ?? it?.title ?? `Item ${idx + 1}`;
                const quantity = Number(it?.quantity ?? it?.qty ?? 0) || 0;
                const unitPrice =
                    Number(it?.unitPrice ?? it?.price ?? it?.unit_cost ?? it?.unit_cost_price) || 0;

                // itemTotal: prefer explicit totals, else qty * unit
                const itemTotal =
                    Number(it?.totalPrice ?? it?.total ?? it?.lineTotal) ||
                    (quantity && unitPrice ? quantity * unitPrice : 0);

                return {
                    name,
                    quantity,
                    unitPrice,
                    itemTotal,
                    image: it?.image || it?.img || it?.thumbnail || "",
                    raw: it,
                };
            });
    }

    // fallback single product order (your old schema)
    const fallbackName = order?.productName ?? order?.name ?? "Product";
    const fallbackQty = Number(order?.quantity ?? 0) || 0;
    const fallbackTotal = Number(order?.totalPrice ?? 0) || 0;

    // if we only have totalPrice, estimate unitPrice
    const fallbackUnit = fallbackQty ? fallbackTotal / fallbackQty : Number(order?.unitPrice ?? order?.price ?? 0) || 0;

    return [
        {
            name: fallbackName,
            quantity: fallbackQty,
            unitPrice: fallbackUnit,
            itemTotal: fallbackTotal,
            image: order?.image || "",
            raw: order,
        },
    ];
}

function sumItemsQty(items) {
    return items.reduce((acc, it) => acc + (Number(it?.quantity) || 0), 0);
}

function sumItemsTotal(items) {
    return items.reduce((acc, it) => acc + (Number(it?.itemTotal) || 0), 0);
}

/* ----------------------------- Highlight Helpers ----------------------------- */
function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightText({ text, query, maxWidth, variant = "body2", fontWeight, color, title }) {
    const raw = String(text ?? "");
    const q = String(query ?? "").trim();
    const qLower = q.toLowerCase();

    if (!q) {
        return (
            <Typography
                variant={variant}
                fontWeight={fontWeight}
                color={color}
                noWrap
                sx={{ maxWidth }}
                title={title ?? raw}
            >
                {raw}
            </Typography>
        );
    }

    const rawLower = raw.toLowerCase();
    if (!rawLower.includes(qLower)) {
        return (
            <Typography
                variant={variant}
                fontWeight={fontWeight}
                color={color}
                noWrap
                sx={{ maxWidth }}
                title={title ?? raw}
            >
                {raw}
            </Typography>
        );
    }

    const re = new RegExp(escapeRegExp(q), "ig");
    const parts = raw.split(re);
    const matches = raw.match(re) || [];

    return (
        <Typography
            variant={variant}
            fontWeight={fontWeight}
            color={color}
            noWrap
            sx={{ maxWidth }}
            title={title ?? raw}
        >
            {parts.map((part, i) => (
                <span key={i}>
                    {part}
                    {i < matches.length ? (
                        <Box
                            component="mark"
                            sx={{
                                px: 0.35,
                                py: 0.05,
                                borderRadius: 0.6,
                                bgcolor: "warning.lighter",
                                color: "text.primary",
                                fontWeight: 950,
                            }}
                        >
                            {matches[i]}
                        </Box>
                    ) : null}
                </span>
            ))}
        </Typography>
    );
}

/* ----------------------------- UI Pieces ----------------------------- */
function EmptyState() {
    return (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 46, height: 46 }}>
                    <ReceiptLongRoundedIcon />
                </Avatar>
                <Box>
                    <Typography fontWeight={900}>No orders yet</Typography>
                    <Typography variant="body2" color="text.secondary">
                        When you place an order, it will show up here with its status and total.
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}

function ErrorState({ message, onRetry }) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 3,
                borderRadius: 3,
                borderColor: "error.light",
                bgcolor: "error.lighter",
            }}
        >
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ width: 46, height: 46, bgcolor: "error.main" }}>
                        <ErrorOutlineRoundedIcon />
                    </Avatar>
                    <Box>
                        <Typography fontWeight={900}>Couldn’t load orders</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {message || "Something went wrong. Please try again."}
                        </Typography>
                    </Box>
                </Stack>

                <Button onClick={onRetry} variant="contained" startIcon={<RefreshRoundedIcon />}>
                    Retry
                </Button>
            </Stack>
        </Paper>
    );
}

function OrdersSkeleton() {
    return (
        <Stack spacing={2}>
            {[...Array(5)].map((_, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center" flex={1} width="100%">
                            <Skeleton variant="rounded" width={46} height={46} />
                            <Box flex={1} width="100%">
                                <Skeleton width="45%" />
                                <Skeleton width="70%" />
                                <Skeleton width="35%" />
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Skeleton variant="rounded" width={115} height={28} />
                            <Skeleton variant="rounded" width={130} height={36} />
                        </Stack>
                    </Stack>
                </Paper>
            ))}
        </Stack>
    );
}

function StatCard({ icon, label, value, sub }) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 3,
                flex: 1,
                minWidth: 200,
                bgcolor: "background.paper",
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar variant="rounded" sx={{ width: 42, height: 42, borderRadius: 2.25 }}>
                    {icon}
                </Avatar>
                <Box minWidth={0}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {label}
                    </Typography>
                    <Typography fontWeight={950} sx={{ fontSize: 18 }} noWrap>
                        {value}
                    </Typography>
                    {sub ? (
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {sub}
                        </Typography>
                    ) : null}
                </Box>
            </Stack>
        </Paper>
    );
}

/* ----------------------------- Main Component ----------------------------- */
export default function TabOrders() {
    const [ordersData, setOrdersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // UI state
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest"); // newest | oldest | totalHigh | totalLow
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 6;

    // Drawer
    const [openDetails, setOpenDetails] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [resOrders, resLogged] = await Promise.all([
                fetch(API_ORDERS, { cache: "no-store" }),
                fetch(API_LOGGED, { cache: "no-store" }),
            ]);

            if (!resOrders.ok || !resLogged.ok) {
                throw new Error("Failed to fetch orders or logged user.");
            }

            const [orders, logged] = await Promise.all([resOrders.json(), resLogged.json()]);
            const userToken = logged?.[0]?.userTokens;

            if (!userToken) {
                setOrdersData([]);
                return;
            }

            const filtered = Array.isArray(orders) ? orders.filter((o) => o?.userTokens === userToken) : [];

            // default sort newest first
            filtered.sort((a, b) => {
                const da = safeDate(a?.createdAt)?.getTime() ?? 0;
                const db = safeDate(b?.createdAt)?.getTime() ?? 0;
                return db - da;
            });

            setOrdersData(filtered);
        } catch (e) {
            setError(e?.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const stats = useMemo(() => {
        const totalOrders = ordersData.length;

        const sum = ordersData.reduce((acc, o) => {
            // prefer order.totalPrice, else sum of items
            const items = getOrderItems(o);
            const fallback = Number(o?.totalPrice) || 0;
            const itemsTotal = sumItemsTotal(items);
            return acc + (fallback || itemsTotal || 0);
        }, 0);

        const delivered = ordersData.filter((o) => normalizeStatus(o?.status) === "delivered").length;
        const shipped = ordersData.filter((o) => normalizeStatus(o?.status) === "shipped").length;
        const pending = ordersData.filter((o) => normalizeStatus(o?.status) === "pending").length;
        const cancelled = ordersData.filter((o) => normalizeStatus(o?.status) === "cancelled").length;

        const latest = ordersData
            .map((o) => safeDate(o?.createdAt))
            .filter(Boolean)
            .sort((a, b) => b.getTime() - a.getTime())[0];

        return { totalOrders, sum, delivered, shipped, pending, cancelled, latest };
    }, [ordersData]);

    const filteredSorted = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = [...ordersData];

        if (statusFilter !== "all") {
            list = list.filter((o) => normalizeStatus(o?.status) === statusFilter);
        }

        if (q) {
            list = list.filter((o) => {
                const orderId = String(o?.orderId || o?.id || "").toLowerCase();

                const items = getOrderItems(o);
                const productNames = items.map((it) => String(it?.name || "").toLowerCase()).join(" ");

                return orderId.includes(q) || productNames.includes(q);
            });
        }

        list.sort((a, b) => {
            const da = safeDate(a?.createdAt)?.getTime() ?? 0;
            const db = safeDate(b?.createdAt)?.getTime() ?? 0;

            const ta = Number(a?.totalPrice) || sumItemsTotal(getOrderItems(a)) || 0;
            const tb = Number(b?.totalPrice) || sumItemsTotal(getOrderItems(b)) || 0;

            if (sortBy === "oldest") return da - db;
            if (sortBy === "totalHigh") return tb - ta;
            if (sortBy === "totalLow") return ta - tb;
            return db - da; // newest
        });

        return list;
    }, [ordersData, query, statusFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));

    const pageSlice = useMemo(() => {
        const safePage = Math.min(Math.max(page, 1), totalPages);
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredSorted.slice(start, start + PAGE_SIZE);
    }, [filteredSorted, page, totalPages]);

    useEffect(() => {
        setPage(1);
    }, [query, statusFilter, sortBy]);

    const openOrderDetails = (order) => {
        setActiveOrder(order);
        setOpenDetails(true);
    };
    return (
        <Stack spacing={2}>
            {/* Sticky Header */}
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 3,
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    backdropFilter: "blur(10px)",
                    bgcolor: "background.paper",
                }}
            >
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Badge
                                overlap="circular"
                                badgeContent={stats.totalOrders}
                                color="primary"
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            >
                                <Avatar sx={{ width: 44, height: 44 }}>
                                    <ReceiptLongRoundedIcon />
                                </Avatar>
                            </Badge>

                            <Box>
                                <Typography fontWeight={950} lineHeight={1.1}>
                                    Orders
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {loading
                                        ? "Loading…"
                                        : `${filteredSorted.length} result${filteredSorted.length === 1 ? "" : "s"} • Total spent: ${formatEGP(
                                            stats.sum
                                        )}`}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title="Refresh">
                                <span>
                                    <IconButton onClick={fetchOrders} disabled={loading}>
                                        <RefreshRoundedIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    {/* Controls */}
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={1.5}
                        alignItems={{ xs: "stretch", md: "center" }}
                    >
                        <TextField
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by order id or product name…"
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flex: 1 }}
                        />

                        <Stack direction="row" spacing={1.2} alignItems="center">
                            <Chip icon={<TuneRoundedIcon />} label="Filters" variant="outlined" sx={{ fontWeight: 800 }} />

                            <Select
                                size="small"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                sx={{ minWidth: 160, borderRadius: 999 }}
                            >
                                <MenuItem value="all">All statuses</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="shipped">Shipped</MenuItem>
                                <MenuItem value="delivered">Delivered</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                            </Select>

                            <Select
                                size="small"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                sx={{ minWidth: 170, borderRadius: 999 }}
                            >
                                <MenuItem value="newest">Newest first</MenuItem>
                                <MenuItem value="oldest">Oldest first</MenuItem>
                                <MenuItem value="totalHigh">Total: High → Low</MenuItem>
                                <MenuItem value="totalLow">Total: Low → High</MenuItem>
                            </Select>
                        </Stack>
                    </Stack>

                    {loading ? <LinearProgress /> : null}
                </Stack>
            </Paper>

            {/* Stats Row */}
            {!loading && !error && ordersData.length > 0 && (
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ flexWrap: "wrap" }}>
                    <StatCard
                        icon={<PaymentsRoundedIcon />}
                        label="Total spent"
                        value={formatEGP(stats.sum)}
                        sub={stats.totalOrders ? `${stats.totalOrders} order${stats.totalOrders === 1 ? "" : "s"}` : ""}
                    />
                    <StatCard
                        icon={<DoneAllRoundedIcon />}
                        label="Delivered"
                        value={stats.delivered}
                        sub={stats.shipped ? `${stats.shipped} shipped` : ""}
                    />
                    <StatCard
                        icon={<PendingRoundedIcon />}
                        label="In progress"
                        value={stats.pending + stats.shipped}
                        sub={stats.pending ? `${stats.pending} pending` : ""}
                    />
                    <StatCard
                        icon={<CalendarMonthRoundedIcon />}
                        label="Last order"
                        value={stats.latest ? stats.latest.toLocaleDateString() : "—"}
                        sub={stats.latest ? stats.latest.toLocaleTimeString() : ""}
                    />
                </Stack>
            )}

            {/* States */}
            {loading && <OrdersSkeleton />}
            {!loading && error && <ErrorState message={error} onRetry={fetchOrders} />}
            {!loading && !error && filteredSorted.length === 0 && <EmptyState />}

            {/* List */}
            {!loading && !error && filteredSorted.length > 0 && (
                <Stack spacing={2}>
                    {pageSlice.map((order) => {
                        const meta = statusMeta(order?.status);

                        const items = getOrderItems(order);
                        const itemsQty = sumItemsQty(items);

                        const orderTotal =
                            Number(order?.totalPrice) || sumItemsTotal(items) || 0;

                        const progress =
                            normalizeStatus(order?.status) === "pending"
                                ? 25
                                : normalizeStatus(order?.status) === "shipped"
                                    ? 70
                                    : normalizeStatus(order?.status) === "delivered"
                                        ? 100
                                        : normalizeStatus(order?.status) === "cancelled"
                                            ? 0
                                            : 40;

                        const orderLabel = order?.orderId || `Order #${order?.id}`;
                        const visibleNames = items.slice(0, 2).map((it) => it.name);
                        const moreCount = Math.max(0, items.length - visibleNames.length);

                        const productsLine =
                            visibleNames.join(" • ") + (moreCount ? ` • +${moreCount} more` : "");

                        return (
                            <Paper
                                key={order?.id ?? order?.orderId}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    transition: "transform .12s ease, box-shadow .12s ease",
                                    "&:hover": { transform: "translateY(-2px)", boxShadow: 2 },
                                }}
                            >
                                {/* top track */}
                                <Box sx={{ mx: -2, mt: -2, mb: 1.5 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            height: 6,
                                            "& .MuiLinearProgress-bar": { borderRadius: 999 },
                                        }}
                                    />
                                </Box>

                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={2}
                                    alignItems={{ xs: "stretch", md: "center" }}
                                    justifyContent="space-between"
                                >
                                    {/* Left */}
                                    <Stack direction="row" spacing={2} alignItems="center" flex={1} minWidth={0}>
                                        <Avatar variant="rounded" sx={{ width: 48, height: 48, borderRadius: 2.25 }}>
                                            <ReceiptLongRoundedIcon />
                                        </Avatar>

                                        <Box flex={1} minWidth={0}>
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                <HighlightText
                                                    text={orderLabel}
                                                    query={query}
                                                    variant="body1"
                                                    fontWeight={950}
                                                    maxWidth={240}
                                                    title={orderLabel}
                                                />

                                                <Chip
                                                    icon={meta.icon}
                                                    label={meta.label}
                                                    color={meta.color}
                                                    size="small"
                                                    variant="filled"
                                                    sx={{ fontWeight: 850 }}
                                                />

                                                <Chip
                                                    icon={<ShoppingBagRoundedIcon fontSize="small" />}
                                                    label={`${items.length} product${items.length === 1 ? "" : "s"}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 850 }}
                                                />
                                            </Stack>

                                            {/* ✅ Highlight across product names */}
                                            <Box sx={{ maxWidth: "100%", mt: 0.25 }}>
                                                <HighlightText
                                                    text={`${productsLine} • ${itemsQty} item${itemsQty === 1 ? "" : "s"}`}
                                                    query={query}
                                                    variant="body2"
                                                    fontWeight={700}
                                                    color="text.secondary"
                                                    title={`${productsLine} • ${itemsQty} item${itemsQty === 1 ? "" : "s"}`}
                                                />
                                            </Box>

                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.8 }} flexWrap="wrap">
                                                <Typography fontWeight={950}>{formatEGP(orderTotal)}</Typography>

                                                {order?.createdAt ? (
                                                    <>
                                                        <Divider orientation="vertical" flexItem />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(order.createdAt).toLocaleString()}
                                                        </Typography>
                                                    </>
                                                ) : null}
                                            </Stack>
                                        </Box>
                                    </Stack>

                                    {/* Right */}
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<OpenInNewRoundedIcon />}
                                            onClick={() => openOrderDetails(order)}
                                            sx={{ borderRadius: 999 }}
                                        >
                                            Details
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Paper>
                        );
                    })}

                    {/* Pagination */}
                    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                            <Typography variant="body2" color="text.secondary">
                                Page {page} of {totalPages} • Showing{" "}
                                {Math.min((page - 1) * PAGE_SIZE + 1, filteredSorted.length)}-
                                {Math.min(page * PAGE_SIZE, filteredSorted.length)} of {filteredSorted.length}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    sx={{ borderRadius: 999 }}
                                >
                                    Prev
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    sx={{ borderRadius: 999 }}
                                >
                                    Next
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </Stack>
            )}

            {/* Details Drawer */}
            <Drawer
                anchor="right"
                open={openDetails}
                onClose={() => setOpenDetails(false)}
                PaperProps={{ sx: { width: { xs: "100%", sm: 440 }, p: 2 } }}
            >
                <Stack spacing={2} height="100%">
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Avatar variant="rounded" sx={{ borderRadius: 2.25 }}>
                                <Inventory2RoundedIcon />
                            </Avatar>
                            <Box>
                                <Typography fontWeight={950}>Order details</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {activeOrder?.orderId || (activeOrder?.id ? `Order #${activeOrder.id}` : "—")}
                                </Typography>
                            </Box>
                        </Stack>

                        <IconButton onClick={() => setOpenDetails(false)}>
                            <CloseRoundedIcon />
                        </IconButton>
                    </Stack>

                    <Divider />

                    {activeOrder ? (
                        <Stack spacing={1.6} flex={1}>
                            {/* Status */}
                            {(() => {
                                const meta = statusMeta(activeOrder?.status);
                                return (
                                    <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 3 }}>
                                        <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="space-between">
                                            <Stack direction="row" spacing={1.25} alignItems="center">
                                                <Avatar sx={{ width: 40, height: 40 }}>{meta.icon}</Avatar>
                                                <Box>
                                                    <Typography fontWeight={900}>{meta.label}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Status
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                );
                            })()}

                            {/* Items */}
                            {(() => {
                                const items = getOrderItems(activeOrder);
                                const itemsQty = sumItemsQty(items);
                                const orderTotal = Number(activeOrder?.totalPrice) || sumItemsTotal(items) || 0;

                                return (
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                        <Stack spacing={1.4}>
                                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                                <Typography fontWeight={950}>Products</Typography>
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    icon={<ShoppingBagRoundedIcon fontSize="small" />}
                                                    label={`${items.length} product${items.length === 1 ? "" : "s"} • ${itemsQty} item${itemsQty === 1 ? "" : "s"
                                                        }`}
                                                    sx={{ fontWeight: 850 }}
                                                />
                                            </Stack>

                                            <Divider />

                                            <Stack spacing={1}>
                                                {items.map((it, idx) => {
                                                    const initials = String(it?.name || "P")
                                                        .trim()
                                                        .split(/\s+/)
                                                        .slice(0, 2)
                                                        .map((w) => w[0]?.toUpperCase())
                                                        .join("");

                                                    const lineTotal = Number(it?.itemTotal) || 0;
                                                    const unit = Number(it?.unitPrice) || 0;
                                                    const qty = Number(it?.quantity) || 0;

                                                    return (
                                                        <Paper
                                                            key={idx}
                                                            variant="outlined"
                                                            sx={{ p: 1.25, borderRadius: 2.5, bgcolor: "background.paper" }}
                                                        >
                                                            <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="space-between">
                                                                <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
                                                                    <Avatar variant="rounded" sx={{ width: 38, height: 38, borderRadius: 2 }}>
                                                                        {initials || <ShoppingBagRoundedIcon fontSize="small" />}
                                                                    </Avatar>

                                                                    <Box minWidth={0}>
                                                                        <Typography fontWeight={900} noWrap title={it?.name}>
                                                                            {it?.name}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary" noWrap>
                                                                            Qty: {qty} • Unit: {formatEGP(unit || (qty ? lineTotal / qty : 0))}
                                                                        </Typography>
                                                                    </Box>
                                                                </Stack>

                                                                <Typography fontWeight={950} sx={{ whiteSpace: "nowrap" }}>
                                                                    {formatEGP(lineTotal || (unit && qty ? unit * qty : 0))}
                                                                </Typography>
                                                            </Stack>
                                                        </Paper>
                                                    );
                                                })}
                                            </Stack>

                                            <Divider />

                                            <Stack spacing={1.2}>
                                                <Row label="Total" value={formatEGP(orderTotal)} strong />
                                                <Row label="Discount" value={ordersData[0]?.discount + " EGP"} strong />
                                                <Row
                                                    label="Created"
                                                    value={activeOrder?.createdAt ? new Date(activeOrder.createdAt).toLocaleString() : "—"}
                                                />
                                                <Row
                                                    label="Order id"
                                                    value={activeOrder?.orderId || activeOrder?.id || "—"}
                                                    trailing={
                                                        <Tooltip title="Copy">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => copyText(activeOrder?.orderId || activeOrder?.id)}
                                                            >
                                                                <ContentCopyRoundedIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    }
                                                />
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                );
                            })()}

                            
                        </Stack>
                    ) : (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                            <Typography color="text.secondary">No order selected.</Typography>
                        </Paper>
                    )}
                </Stack>
            </Drawer>
        </Stack>
    );
}

/* ----------------------------- Small Row UI ----------------------------- */
function Row({ label, value, strong, trailing }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ maxWidth: "70%" }}>
                <Typography
                    variant="body2"
                    fontWeight={strong ? 950 : 700}
                    sx={{ textAlign: "right" }}
                    noWrap
                    title={String(value ?? "")}
                >
                    {value ?? "—"}
                </Typography>
                {trailing || null}
            </Stack>
        </Stack>
    );
}
