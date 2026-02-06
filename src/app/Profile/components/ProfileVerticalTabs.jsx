"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

import TabProfile from "./TabProfile";
import TabAddresses from "./TabAddresses";
import TabWishlist from "./TabWishlist";
import TabWallet from "./TabWallet";
import TabOrders from "./TabOrders";

/* ----------------------------- Helpers ----------------------------- */
function stringToInitials(name = "") {
    const parts = String(name).trim().split(" ").filter(Boolean);
    if (!parts.length) return "A";
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0].slice(0, 1) + parts[1].slice(0, 1)).toUpperCase();
}

function formatSAR(value) {
    const n = Number(value || 0);
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "SAR",
            maximumFractionDigits: 2,
        }).format(n);
    } catch {
        return `${n.toFixed(2)} SAR`;
    }
}

function safeDateLabel() {
    try {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "2-digit",
            year: "numeric",
        }).format(new Date());
    } catch {
        return new Date().toLocaleDateString();
    }
}

/* ----------------------------- UI pieces ----------------------------- */
function Surface({ children, sx }) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                bgcolor: theme.palette.background.paper,
                boxShadow: "0 10px 28px rgba(2, 6, 23, 0.06)",
                overflow: "hidden",
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

function MiniStat({ label, value, icon }) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                flex: "1 1 0",
                minWidth: 120,
                borderRadius: 2.5,
                border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                p: 1.25,
                bgcolor: alpha(theme.palette.text.primary, 0.015),
                display: "flex",
                alignItems: "center",
                gap: 1,
            }}
        >
            <Box
                sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.10),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                }}
            >
                {icon}
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 800 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontWeight: 1000, lineHeight: 1.2 }} className="truncate">
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

function EmptyState({ onLogin }) {
    const theme = useTheme();
    return (
        <Surface sx={{ p: { xs: 2.5, md: 3.5 }, textAlign: "center" }}>
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    mx: "auto",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.10),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.20)}`,
                    mb: 1.25,
                }}
            >
                <LoginRoundedIcon />
            </Box>

            <Typography sx={{ fontWeight: 1000, fontSize: 18 }}>You’re not signed in</Typography>
            <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.75 }}>
                Please login to access your profile, orders, wallet and wishlist.
            </Typography>

            <Button
                onClick={onLogin}
                sx={{ mt: 2, borderRadius: 2.5, fontWeight: 900, px: 3, py: 1.1 }}
                variant="contained"
            >
                Go to Login
            </Button>
        </Surface>
    );
}

const tabsConfig = [
    { label: "Profile", icon: <PersonOutlineRoundedIcon />, value: 0 },
    { label: "Addresses", icon: <LocationOnOutlinedIcon />, value: 1 },
    { label: "Wishlist", icon: <FavoriteBorderRoundedIcon />, value: 2 },
    { label: "Wallet", icon: <AccountBalanceWalletOutlinedIcon />, value: 3 },
    { label: "Orders", icon: <ReceiptLongOutlinedIcon />, value: 4 },
];

export default function ProfileVerticalTabs() {
    const router = useRouter();
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

    const [value, setValue] = useState(0);
    const [loggedCustomers, setLoggedCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ orders: 0, wishlist: 0, wallet: 0 });

    /* =========================== APIs =========================== */
    const API_LOGGED = "http://localhost:5000/loggedCustomers";
    const API_ORDERS = "http://localhost:5000/orders";
    const API_WISHLIST = "http://localhost:5000/wishList";
    const API_WALLET = "http://localhost:5000/WalletBalance";

    const fetchLoggedCustomers = useCallback(async (signal) => {
        const res = await fetch(API_LOGGED, { cache: "no-store", signal });
        if (!res.ok) throw new Error("Failed to fetch logged customers");
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    }, [API_LOGGED]);

    const fetchStats = useCallback(async (userToken, signal) => {
        if (!userToken) return;

        const safeFetch = async (url) => {
            try {
                const r = await fetch(url, { cache: "no-store", signal });
                if (!r.ok) return null;
                return await r.json();
            } catch {
                return null;
            }
        };

        const [ordersData, wishlistData, walletData] = await Promise.all([
            safeFetch(API_ORDERS),
            safeFetch(API_WISHLIST),
            safeFetch(API_WALLET),
        ]);

        const ordersCount = Array.isArray(ordersData)
            ? ordersData.filter((o) => o?.userTokens === userToken).length
            : 0;

        const wishlistCount = Array.isArray(wishlistData)
            ? wishlistData.filter((w) => w?.userTokens === userToken).length
            : 0;

        const walletBalance = Array.isArray(walletData)
            ? walletData
                .filter((x) => x?.userTokens === userToken)
                .reduce((acc, cur) => acc + Number(cur?.balance || cur?.amount || 0), 0)
            : 0;

        setStats({ orders: ordersCount, wishlist: wishlistCount, wallet: walletBalance });
    }, [API_ORDERS, API_WALLET, API_WISHLIST]);

    const loadAll = useCallback(async ({ isRefresh = false } = {}) => {
        const controller = new AbortController();
        const { signal } = controller;

        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            setError(null);

            const customers = await fetchLoggedCustomers(signal);
            setLoggedCustomers(customers);

            const user = customers?.[0] || null;
            const token = user?.userTokens;

            await fetchStats(token, signal);
        } catch (err) {
            if (err?.name !== "AbortError") setError(err?.message || "Something went wrong");
        } finally {
            isRefresh ? setRefreshing(false) : setLoading(false);
        }

        return () => controller.abort();
    }, [fetchLoggedCustomers, fetchStats]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const user = loggedCustomers?.[0] || null;
    const userName = user?.name || user?.username || "My Account";
    const userEmail = user?.email || "";
    const userToken = user?.userTokens || null;

    const userInitials = useMemo(() => stringToInitials(userName), [userName]);
    const panelTitle = useMemo(
        () => tabsConfig.find((t) => t.value === value)?.label || "Account",
        [value]
    );

    const handleLogout = useCallback(async () => {
        try {
            if (!loggedCustomers?.length) {
                window.location.href = "/";
                return;
            }

            // 1️⃣ Delete all logged sessions
            await Promise.all(
                loggedCustomers.map((u) =>
                    fetch(`${API_LOGGED}/${u.id}`, { method: "DELETE" })
                )
            );

            // 2️⃣ Clear local state
            setLoggedCustomers([]);

            // 3️⃣ Store redirect target
            sessionStorage.setItem("logoutRedirect", "/");

            // 4️⃣ Force full page reload
            window.location.reload();

        } catch (err) {
            console.error("Logout error:", err);
        }
    }, [API_LOGGED, loggedCustomers]);


    const handleLogin = useCallback(() => router.push("/Login"), [router]);

    /* =========================== Loading =========================== */
    if (loading) {
        return (
            <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1.5, md: 0 } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "340px 1fr" }, gap: 3 }}>
                    <Surface sx={{ p: 2 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Skeleton variant="circular" width={52} height={52} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton width="60%" height={26} />
                                    <Skeleton width="40%" height={18} />
                                </Box>
                            </Stack>
                            <Divider />
                            <Stack spacing={1}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} height={44} sx={{ borderRadius: 2 }} />
                                ))}
                            </Stack>
                            <Skeleton height={44} sx={{ borderRadius: 2 }} />
                        </Stack>
                    </Surface>

                    <Surface sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Skeleton width={160} height={26} />
                                <Skeleton width={120} height={22} />
                            </Stack>
                            <Divider />
                            <Stack spacing={1.2}>
                                <Skeleton height={46} sx={{ borderRadius: 2 }} />
                                <Skeleton height={46} sx={{ borderRadius: 2 }} />
                                <Skeleton height={120} sx={{ borderRadius: 2 }} />
                            </Stack>
                        </Stack>
                    </Surface>
                </Box>
            </Box>
        );
    }

    /* =========================== Error =========================== */
    if (error) {
        return (
            <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 1.5, md: 0 } }}>
                <Alert
                    severity="error"
                    sx={{ borderRadius: 3, alignItems: "center" }}
                    action={
                        <Button
                            size="small"
                            onClick={() => loadAll({ isRefresh: true })}
                            startIcon={<RefreshRoundedIcon />}
                            sx={{ fontWeight: 900 }}
                        >
                            Retry
                        </Button>
                    }
                >
                    <Typography sx={{ fontWeight: 950 }}>{error}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Please refresh the page or try again.
                    </Typography>
                </Alert>
            </Box>
        );
    }

    /* =========================== Not logged in =========================== */
    if (!userToken) {
        return (
            <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 1.5, md: 0 } }}>
                <EmptyState onLogin={handleLogin} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1.5, md: 0 } }}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "340px 1fr" },
                    gap: 3,
                    alignItems: "start",
                }}
            >
                {/* LEFT */}
                <Surface sx={{ position: { md: "sticky" }, top: { md: 18 } }}>
                    <Box sx={{ p: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                                sx={{
                                    width: 52,
                                    height: 52,
                                    fontWeight: 1000,
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    color: theme.palette.primary.main,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                }}
                            >
                                {userInitials}
                            </Avatar>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography sx={{ fontWeight: 1000 }} className="truncate">
                                    {userName}
                                </Typography>
                                {!!userEmail && (
                                    <Typography variant="body2" sx={{ opacity: 0.7 }} className="truncate">
                                        {userEmail}
                                    </Typography>
                                )}
                            </Box>

                            <Tooltip title="Refresh">
                                <span>
                                    <IconButton
                                        onClick={() => loadAll({ isRefresh: true })}
                                        disabled={refreshing}
                                        sx={{
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                                        }}
                                    >
                                        {refreshing ? <CircularProgress size={18} /> : <RefreshRoundedIcon />}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 1.75, flexWrap: "wrap", gap: 1 }}>
                            <MiniStat label="Orders" value={stats.orders} icon={<ReceiptLongOutlinedIcon fontSize="small" />} />
                            <MiniStat label="Wishlist" value={stats.wishlist} icon={<FavoriteBorderRoundedIcon fontSize="small" />} />
                            <MiniStat label="Wallet" value={formatSAR(stats.wallet)} icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />} />
                        </Stack>
                    </Box>

                    <Divider />

                    <Box sx={{ p: 1.5 }}>
                        <Tabs
                            orientation={isMdDown ? "horizontal" : "vertical"}
                            value={value}
                            onChange={(e, newValue) => setValue(newValue)}
                            variant="scrollable"
                            scrollButtons={isMdDown}
                            allowScrollButtonsMobile
                            sx={{
                                "& .MuiTabs-indicator": {
                                    height: 3,
                                    borderRadius: 99,
                                },
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    justifyContent: "flex-start",
                                    minHeight: 44,
                                    borderRadius: 2,
                                    px: 1.25,
                                    gap: 1,
                                    fontWeight: 850,
                                    color: "text.secondary",
                                },
                                "& .MuiTab-root.Mui-selected": {
                                    color: "text.primary",
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                },
                            }}
                        >
                            {tabsConfig.map((t) => (
                                <Tab key={t.value} icon={t.icon} iconPosition="start" label={t.label} />
                            ))}
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 1.5, pt: 0 }}>
                        <Button
                            fullWidth
                            onClick={handleLogout}
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutRoundedIcon />}
                            sx={{ borderRadius: 2, py: 1, fontWeight: 900 }}
                        >
                            Log Out
                        </Button>
                    </Box>
                </Surface>

                {/* RIGHT */}
                <Surface>
                    <Box
                        sx={{
                            p: { xs: 2, md: 2.5 },
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                            display: "flex",
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            gap: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 1000, fontSize: 18 }}>{panelTitle}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.72, mt: 0.25 }}>
                                Manage everything related to <b>{panelTitle}</b>.
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                    px: 1.2,
                                    py: 0.8,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                                    bgcolor: alpha(theme.palette.text.primary, 0.02),
                                }}
                            >
                                <CalendarMonthRoundedIcon fontSize="small" />
                                <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.85 }}>
                                    {safeDateLabel()}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: 420 }}>
                        {value === 0 && <TabProfile />}
                        {value === 1 && <TabAddresses />}
                        {value === 2 && <TabWishlist />}
                        {value === 3 && <TabWallet />}
                        {value === 4 && <TabOrders />}
                    </Box>
                </Surface>
            </Box>
        </Box>
    );
}
