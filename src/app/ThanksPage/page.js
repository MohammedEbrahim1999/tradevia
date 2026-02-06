"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useEffect, useMemo, useState } from "react";

export default function OrderSuccessPage({
    // keep props for fallback (optional)
    orderNumber: orderNumberProp = "#123456",
    estimatedDelivery = "3–5 business days",
    email = "your email",
}) {
    const searchParams = useSearchParams();

    // ✅ read orderId from URL like: /ThanksPage?orderId=#123456
    const orderIdFromUrl = useMemo(() => {
        const v = searchParams?.get("orderId") || "";
        return String(v || "").trim();
    }, [searchParams]);

    // ✅ final orderNumber (URL -> localStorage -> props)
    const [orderNumber, setOrderNumber] = useState(orderNumberProp);

    useEffect(() => {
        // URL first
        if (orderIdFromUrl) {
            setOrderNumber(orderIdFromUrl);
            try {
                localStorage.setItem("lastOrderId", orderIdFromUrl);
            } catch { }
            return;
        }

        // fallback localStorage
        try {
            const saved = localStorage.getItem("lastOrderId") || "";
            if (saved) setOrderNumber(saved);
        } catch {
            // ignore
        }
    }, [orderIdFromUrl]);

    const today = useMemo(() => new Date(), []);
    const [copied, setCopied] = useState(false);

    const formattedDate = useMemo(() => {
        try {
            return new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                month: "short",
                day: "2-digit",
                year: "numeric",
            }).format(today);
        } catch {
            return today.toDateString();
        }
    }, [today]);

    const formattedDateTime = useMemo(() => {
        try {
            return new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(today);
        } catch {
            return today.toString();
        }
    }, [today]);

    // auto-clear copied state
    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 1400);
        return () => clearTimeout(t);
    }, [copied]);

    const copyOrder = async () => {
        try {
            await navigator.clipboard.writeText(String(orderNumber || ""));
            setCopied(true);
        } catch {
            // ignore
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(900px_circle_at_50%_-120px,rgba(16,185,129,0.18),transparent_55%),linear-gradient(to_bottom,rgba(249,250,251,1),rgba(255,255,255,1))] px-4 py-10 sm:py-14">
            {/* soft background blobs */}
            <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -right-40 top-24 h-[28rem] w-[28rem] rounded-full bg-green-200/35 blur-3xl" />

            <div className="mx-auto w-full max-w-4xl">
                {/* floating top notice (adds polish) */}
                <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 text-xs text-gray-700 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-35" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="font-semibold text-gray-900">Payment confirmed</span>
                        <span className="text-gray-500">• {formattedDateTime}</span>
                    </div>
                    <span className="hidden sm:inline text-gray-500">
                        Order placed {formattedDate}
                    </span>
                </div>

                {/* Main card */}
                <div className="relative overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-[0_18px_55px_rgba(0,0,0,0.09)]">
                    {/* subtle header sheen */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(650px_circle_at_50%_0px,rgba(16,185,129,0.22),transparent_65%)]" />
                    <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
                    <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-green-100/60 blur-3xl" />

                    <div className="relative px-5 pb-7 pt-7 sm:px-10 sm:pb-10 sm:pt-9">
                        {/* Header */}
                        <div className="mx-auto flex max-w-2xl flex-col items-center">
                            {/* Icon ring */}
                            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 shadow-sm">
                                <CheckCircleIcon className="text-emerald-600" sx={{ fontSize: 40 }} />
                            </div>

                            <h1 className="text-center text-[22px] font-semibold tracking-tight text-gray-900 sm:text-3xl">
                                Order confirmed 🎉
                            </h1>

                            <p className="mt-2 max-w-xl text-center text-sm leading-6 text-gray-600">
                                We sent your confirmation to{" "}
                                <span className="font-medium text-gray-900">{email}</span>.
                            </p>

                            {/* Highlight strip */}
                            <div className="mt-6 w-full rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs font-medium text-emerald-800">
                                        Your order is being prepared
                                    </p>
                                    <p className="text-xs text-emerald-800/80">
                                        Estimated delivery:{" "}
                                        <span className="font-semibold text-emerald-900">
                                            {estimatedDelivery}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* mini reassurance chips */}
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                {["Secure payment", "Carefully packed", "Fast support"].map((t) => (
                                    <span
                                        key={t}
                                        className="rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Details cards */}
                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
                                        <ReceiptLongIcon className="text-gray-800" sx={{ fontSize: 20 }} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-gray-500">Order number</p>

                                        <div className="mt-1 flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                {orderNumber}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={copyOrder}
                                                className={[
                                                    "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-4",
                                                    copied
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 focus:ring-emerald-200"
                                                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200",
                                                ].join(" ")}
                                                aria-label="Copy order number"
                                                title="Copy order number"
                                            >
                                                <ContentCopyIcon sx={{ fontSize: 16 }} />
                                                {copied ? "Copied" : "Copy"}
                                            </button>
                                        </div>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Keep it for support reference.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
                                        <LocalShippingIcon className="text-gray-800" sx={{ fontSize: 20 }} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-500">Delivery</p>
                                        <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                                            Standard delivery
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Your package will arrive within the estimated delivery window.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next steps timeline (nice UX) */}
                        <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold text-gray-900">What happens next</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                {[
                                    { title: "Processing", desc: "We’re confirming your items." },
                                    { title: "Shipped", desc: "You’ll get tracking once it leaves." },
                                    { title: "Delivered", desc: "Arrives at your address." },
                                ].map((s, i) => (
                                    <div
                                        key={s.title}
                                        className="rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="grid h-6 w-6 place-items-center rounded-full bg-white ring-1 ring-gray-200 text-[11px] font-bold text-gray-800">
                                                {i + 1}
                                            </span>
                                            <p className="text-xs font-semibold text-gray-900">{s.title}</p>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-600">{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                        {/* Actions */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Link
                                href="/Profile"
                                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-200"
                            >
                                View my orders
                                <ArrowForwardIcon
                                    className="transition group-hover:translate-x-0.5"
                                    sx={{ fontSize: 18 }}
                                />
                            </Link>

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
                            >
                                Continue shopping
                            </Link>
                        </div>

                        {/* Help row */}
                        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="text-center text-xs text-gray-600">
                                Need help with your order?{" "}
                                <Link
                                    href="/HelpCenter"
                                    className="font-semibold text-gray-900 underline underline-offset-4 hover:text-black"
                                >
                                    Contact support
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />
                </div>

                {/* Footnote */}
                <p className="mt-6 text-center text-xs text-gray-400">
                    You can review invoices anytime from your profile.
                </p>
            </div>
        </div>
    );
}
