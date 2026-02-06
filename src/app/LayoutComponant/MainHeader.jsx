"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { PersonOutlineOutlined } from "@mui/icons-material";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";

const API_MainHeader = "http://localhost:5000/mainHeader";
const API_customers = "http://localhost:5000/customers";
const API_loggedCustomers = "http://localhost:5000/loggedCustomers";
const API_totalPrice = "http://localhost:5000/totalPrice";

function HeaderSkeleton() {
    return (
        <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex items-center justify-between py-4">
                    <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="hidden lg:flex gap-6">
                        <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
                        <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
                        <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
                        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
                        <div className="h-9 w-20 animate-pulse rounded-full bg-slate-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function IconButton({ children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] " +
                className
            }
        >
            {children}
        </button>
    );
}

function Pill({ children, className = "" }) {
    return (
        <span
            className={
                "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition hover:bg-slate-50 " +
                className
            }
        >
            {children}
        </span>
    );
}

function Badge({ children }) {
    return (
        <span className="absolute -right-1 -top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-slate-900 px-1 text-[11px] font-semibold text-white">
            {children}
        </span>
    );
}

export default function MainHeader() {
    const pathname = usePathname();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [main, setMain] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [loggedCustomers, setLoggedCustomers] = useState([]);
    const [totalPriceValue, setTotalPriceValue] = useState(0);

    const toggleDrawer = useCallback((value) => setOpen(value), []);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [mainRes, custRes, loggedRes, priceRes] = await Promise.all([
                    fetch(API_MainHeader, { signal: controller.signal }),
                    fetch(API_customers, { signal: controller.signal }),
                    fetch(API_loggedCustomers, { signal: controller.signal }),
                    fetch(API_totalPrice, { signal: controller.signal }),
                ]);

                if (!mainRes.ok || !custRes.ok || !loggedRes.ok || !priceRes.ok) {
                    throw new Error("Failed to fetch data");
                }

                const [mainData, custData, loggedData, priceData] = await Promise.all([
                    mainRes.json(),
                    custRes.json(),
                    loggedRes.json(),
                    priceRes.json(),
                ]);

                setMain(Array.isArray(mainData) ? mainData[0] : mainData);
                setCustomers(Array.isArray(custData) ? custData : []);
                setLoggedCustomers(Array.isArray(loggedData) ? loggedData : []);

                const token =
                    Array.isArray(loggedData) && loggedData.length > 0
                        ? loggedData[0]?.userTokens
                        : null;

                if (!token) {
                    setTotalPriceValue(0);
                    return;
                }

                const row = (Array.isArray(priceData) ? priceData : []).find(
                    (x) => x.userTokens === token
                );

                setTotalPriceValue(Number(row?.totalPrice ?? 0));
            } catch (err) {
                if (err?.name !== "AbortError") setError(err?.message || "Error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, []);

    const loggedInUser = useMemo(() => {
        const token = loggedCustomers?.[0]?.userTokens;
        if (!token || !customers?.length) return null;
        return customers.find((u) => u.userTokens === token && u.loginStatus) || null;
    }, [customers, loggedCustomers]);

    const navItems = main?.navigate || [];
    const title = main?.mainTitle || "Store";

    const isActive = (href) =>
        href === "/"
            ? pathname === "/"
            : pathname === href || pathname?.startsWith(href + "/");

    const DrawerList = (
        <Box sx={{ width: 320 }} role="presentation">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Menu</span>
                    <span className="text-lg font-semibold text-slate-900">{title}</span>
                </div>
                <IconButton onClick={() => toggleDrawer(false)} aria-label="Close menu">
                    <CloseIcon />
                </IconButton>
            </div>

            <div className="px-5 py-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-2">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.link}
                            onClick={() => toggleDrawer(false)}
                            className={
                                "flex items-center justify-between rounded-xl px-4 py-3 text-sm transition " +
                                (isActive(item.link)
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-800 hover:bg-slate-50")
                            }
                        >
                            <span className="font-medium">{item.name}</span>
                            <span
                                className={
                                    "h-2 w-2 rounded-full " +
                                    (isActive(item.link) ? "bg-white" : "bg-transparent")
                                }
                            />
                        </Link>
                    ))}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                    {loggedInUser ? (
                        <Link
                            href="/Profile"
                            onClick={() => toggleDrawer(false)}
                            className="flex items-center gap-3"
                        >
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-white">
                                <PersonOutlineOutlined />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Signed in as</span>
                                <span className="font-semibold text-slate-900">
                                    {loggedInUser.name}
                                </span>
                            </div>
                        </Link>
                    ) : (
                        <Link
                            href="/Login"
                            onClick={() => toggleDrawer(false)}
                            className="flex items-center gap-3"
                        >
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-900">
                                <PersonOutlineOutlined />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Account</span>
                                <span className="font-semibold text-slate-900">
                                    Log In / Sign Up
                                </span>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </Box>
    );

    if (loading) return <HeaderSkeleton />;

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex items-center justify-between py-4">
                        {/* Left */}
                        <div className="flex items-center gap-3">
                            <IconButton
                                className="lg:hidden"
                                onClick={() => toggleDrawer(true)}
                                aria-label="Open menu"
                            >
                                <MenuIcon />
                            </IconButton>

                            <Link href="/" className="flex items-baseline gap-2">
                                <span className="text-lg font900 font-extrabold tracking-tight text-slate-900">
                                    {title}
                                </span>
                                <span className="hidden sm:inline text-xs text-slate-500">
                                    minimal commerce
                                </span>
                            </Link>
                        </div>

                        {/* Center (Desktop nav) */}
                        <nav className="hidden lg:flex items-center gap-2">
                            {navItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.link}
                                    className={
                                        "rounded-full px-4 py-2 text-sm font-medium transition " +
                                        (isActive(item.link)
                                            ? "bg-slate-900 text-white"
                                            : "text-slate-800 hover:bg-slate-50")
                                    }
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Right */}
                        <div className="flex items-center gap-2">
                            {/* Profile */}
                            <div className="hidden lg:block">
                                {loggedInUser ? (
                                    <Link href="/Profile" className="no-underline">
                                        <Pill>
                                            <PersonOutlineOutlined />
                                            <span className="max-w-[140px] truncate font-semibold">
                                                {loggedInUser.name}
                                            </span>
                                        </Pill>
                                    </Link>
                                ) : (
                                    <Link href="/Login" className="no-underline">
                                        <Pill>
                                            <PersonOutlineOutlined />
                                            <span className="font-semibold">Login</span>
                                        </Pill>
                                    </Link>
                                )}
                            </div>

                            {/* Wishlist */}
                            <Link href="/Wishlist" aria-label="Wishlist" className="no-underline">
                                <IconButton>
                                    <FavoriteBorderIcon />
                                </IconButton>
                            </Link>

                            {/* Cart */}
                            <Link href="/Cart" aria-label="Cart" className="no-underline">
                                <Pill className="gap-2">
                                    <span className="relative">
                                        <ShoppingBagOutlinedIcon />
                                        {/* لو عندك عدد منتجات فعلي، بدّلها هنا */}
                                        {/* <Badge>3</Badge> */}
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {Number(totalPriceValue || 0).toFixed(2)}
                                    </span>
                                </Pill>
                            </Link>
                        </div>
                    </div>

                    {/* Error bar */}
                    {error && (
                        <div className="pb-4">
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <Drawer open={open} onClose={() => toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </>
    );
}
