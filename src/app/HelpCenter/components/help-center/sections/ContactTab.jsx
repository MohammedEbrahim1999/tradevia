"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "../motion";
import { cx } from "../helpers";
import { useState, useEffect } from "react";
/* =========================
   Country calling codes (ALL COUNTRIES)
========================= */


/* =========================
   Helpers
========================= */
function onlyDigitsMax10(v) {
    const digits = String(v || "").replace(/\D/g, "");
    return digits.slice(0, 10);
}

function displayCode(code) {
    // keep "+1-242" visible as is
    return code;
}

export default function ContactTab({
    contact,
    setContact,
    contactErrors,
    canSubmitContact,
    setContactTouched,
    contactTouched,
}) {
    const API_URL = "http://localhost:5000/HelpCenterMessage";
    const API_Countery_Code = "http://localhost:5000/COUNTRYCALLINGCODES";
    const API_Orders = "http://localhost:5000/orders";

    // Ensure defaults exist (important if your parent state doesn't include these yet)
    const countryCode = contact?.countryCode || "+966"; // default Saudi Arabia
    const phoneDigits = contact?.phone || "";

    async function handleSubmit(e) {
        e.preventDefault();
        setContactTouched(true);
        if (!canSubmitContact) return;

        try {
            const cleanPhone = onlyDigitsMax10(phoneDigits);
            const payload = {
                ...contact,
                countryCode,
                phone: cleanPhone, // digits only, max 10
                fullPhone: `${countryCode}${cleanPhone ? " " : ""}${cleanPhone}`,
                createdAt: new Date().toISOString(),
                orderId: contact.orderId || "", 
            };

            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let msg = "Failed to send message";
                try {
                    const data = await res.json();
                    msg = data?.message || msg;
                } catch {
                    // ignore
                }
                throw new Error(msg);
            }

            setContact({
                name: "",
                email: "",
                countryCode: "+966",
                phone: "",
                subject: "",
                message: "",
                orderId:""
            });
            setContactTouched(false);
            alert("Message sent successfully ✅");
        } catch (err) {
            console.error(err);
            alert(err?.message || "Something went wrong while sending your message.");
        }
    }
    const [CountryCode, setCountryCode] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_Countery_Code);
                const res1 = await fetch(API_Orders);
                if (!res.ok || !res1.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                const dataOrders = await res1.json();
                setCountryCode(data);
                setOrders(dataOrders)
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "0px 0px -120px 0px" }}
                custom={0.05}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-7"
            >
                <h2 className="text-xl font-semibold text-gray-900">Contact support</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Send a message and our team will get back to you.
                </p>

                <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                    {/* Full name */}
                    <div>
                        <label className="text-sm font-medium text-gray-800">Full name</label>
                        <input
                            value={contact.name}
                            onChange={(e) => setContact((s) => ({ ...s, name: e.target.value }))}
                            onBlur={() => setContactTouched(true)}
                            className={cx(
                                "mt-2 w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2",
                                contactErrors.name
                                    ? "border-red-200 focus:ring-red-200"
                                    : "border-gray-200 focus:ring-gray-900/10"
                            )}
                            placeholder="Your name"
                            autoComplete="name"
                        />
                        {contactErrors.name ? (
                            <p className="mt-2 text-xs text-red-700">{contactErrors.name}</p>
                        ) : null}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-gray-800">Email</label>
                        <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => setContact((s) => ({ ...s, email: e.target.value }))}
                            onBlur={() => setContactTouched(true)}
                            className={cx(
                                "mt-2 w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2",
                                contactErrors.email
                                    ? "border-red-200 focus:ring-red-200"
                                    : "border-gray-200 focus:ring-gray-900/10"
                            )}
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                        {contactErrors.email ? (
                            <p className="mt-2 text-xs text-red-700">{contactErrors.email}</p>
                        ) : null}
                    </div>

                    {/* ✅ Phone + Subject same line (md: 2 columns) */}
                    {/* Phone */}
                    <div>
                        <label className="text-sm font-medium text-gray-800">Phone</label>

                        <div className="mt-2 flex gap-2">
                            {/* Country key */}
                            <select
                                value={countryCode}
                                onChange={(e) => setContact((s) => ({ ...s, countryCode: e.target.value }))}
                                onBlur={() => setContactTouched(true)}
                                className={cx(
                                    "w-[44%] rounded-2xl border bg-gray-50 px-3 py-3 text-sm outline-none focus:bg-white focus:ring-2",
                                    contactErrors.phone ? "border-red-200 focus:ring-red-200" : "border-gray-200 focus:ring-gray-900/10"
                                )}
                                aria-label="Country calling code"
                            >
                                {CountryCode.map((c) => (
                                    <option key={`${c.name}-${c.code}`} value={c.code}>
                                        {c.name} ({displayCode(c.code)})
                                    </option>
                                ))}
                            </select>

                            {/* Digits */}
                            <input
                                type="tel"
                                value={phoneDigits}
                                onChange={(e) =>
                                    setContact((s) => ({ ...s, phone: onlyDigitsMax10(e.target.value) }))
                                }
                                onBlur={() => setContactTouched(true)}
                                className={cx(
                                    "flex-1 rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2",
                                    contactErrors.phone ? "border-red-200 focus:ring-red-200" : "border-gray-200 focus:ring-gray-900/10"
                                )}
                                placeholder="Numbers only (max 10)"
                                autoComplete="tel"
                                inputMode="numeric"
                                maxLength={10}
                            />
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                            {contactErrors.phone ? (
                                <p className="text-xs text-red-700">{contactErrors.phone}</p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    Example: {countryCode} {phoneDigits || "XXXXXXXXXX"}
                                </p>
                            )}
                            <p className="text-xs text-gray-400">{(phoneDigits || "").length}/10</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-800">Order Id</label>
                        <select
                            value={contact.orderId}
                            onChange={(e) => setContact((s) => ({ ...s, orderId: e.target.value }))}
                            onBlur={() => setContactTouched(true)}
                            className={cx(
                                "mt-2 w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2",
                                contactErrors.orderId
                                    ? "border-red-200 focus:ring-red-200"
                                    : "border-gray-200 focus:ring-gray-900/10"
                            )}
                            placeholder="Order issue, return request, payment problem..."
                        >
                            {orders.map((order,index)=>{
                                return(
                                    <>
                                        <option key={index}>{order.orderId}</option>
                                    </>
                                )
                            })}
                        </select>
                        {contactErrors.orderId ? (
                            <p className="mt-2 text-xs text-red-700">{contactErrors.orderId}</p>
                        ) : null}
                    </div>
                    {/* Subject */}


                    {/* Message */}
                    <div className="md:col-span-2">
                        <div className="flex-1 w-12/12">
                            <label className="text-sm font-medium text-gray-800">Subject</label>
                            <input
                                value={contact.subject}
                                onChange={(e) => setContact((s) => ({ ...s, subject: e.target.value }))}
                                onBlur={() => setContactTouched(true)}
                                className={cx(
                                    "mt-2 w-full flex-1 rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2",
                                    contactErrors.subject
                                        ? "border-red-200 focus:ring-red-200"
                                        : "border-gray-200 focus:ring-gray-900/10"
                                )}
                                placeholder="Order issue, return request, payment problem..."
                            />
                            {contactErrors.subject ? (
                                <p className="mt-2 text-xs text-red-700">{contactErrors.subject}</p>
                            ) : null}
                        </div>
                        <label className="text-sm font-medium text-gray-800">Message</label>
                        <textarea
                            rows={5}
                            value={contact.message}
                            onChange={(e) => setContact((s) => ({ ...s, message: e.target.value }))}
                            onBlur={() => setContactTouched(true)}
                            className={cx(
                                "mt-2 w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2",
                                contactErrors.message
                                    ? "border-red-200 focus:ring-red-200"
                                    : "border-gray-200 focus:ring-gray-900/10"
                            )}
                            placeholder="Tell us what happened. Include your order number if available."
                        />
                        {contactErrors.message ? (
                            <p className="mt-2 text-xs text-red-700">{contactErrors.message}</p>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-500">Add your order number for faster support.</p>

                        <button
                            type="submit"
                            onClick={() => setContactTouched(true)}
                            className={cx(
                                "rounded-2xl px-5 py-3 text-sm font-semibold text-white",
                                canSubmitContact ? "bg-gray-900 hover:bg-black" : "cursor-not-allowed bg-gray-900/40",
                                "focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                            )}
                            aria-disabled={!canSubmitContact}
                            disabled={!canSubmitContact}
                        >
                            Send message
                        </button>
                    </div>
                </form>
            </motion.div>

            <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "0px 0px -120px 0px" }}
                custom={0.12}
                className="space-y-6 lg:col-span-5"
            >
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                    <h3 className="font-semibold text-gray-900">Support hours</h3>
                    <p className="mt-2 text-sm text-gray-700">
                        Sunday – Thursday: 9:00 AM – 6:00 PM (local time)
                        <br />
                        Friday – Saturday: Limited support
                    </p>
                    <p className="mt-3 text-xs text-gray-500">
                        Response times may be longer during sales and holidays.
                    </p>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                    <h3 className="font-semibold text-gray-900">Quick actions</h3>
                    <div className="mt-4 space-y-2">
                        <Link
                            href="/track-order"
                            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                        >
                            <span>Track an order</span>
                            <span className="text-gray-400" aria-hidden="true">
                                →
                            </span>
                        </Link>

                        <Link
                            href="/returns"
                            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                        >
                            <span>Start a return</span>
                            <span className="text-gray-400" aria-hidden="true">
                                →
                            </span>
                        </Link>

                        <Link
                            href="/Profile"
                            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                        >
                            <span>Manage my account</span>
                            <span className="text-gray-400" aria-hidden="true">
                                →
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                    <h3 className="font-semibold text-gray-900">To resolve faster</h3>
                    <p className="mt-2 text-sm text-gray-700">Include:</p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                        <li>Order number (if any)</li>
                        <li>Screenshot of the issue (if any)</li>
                        <li>Device and browser</li>
                        <li>Phone number (optional)</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
}
