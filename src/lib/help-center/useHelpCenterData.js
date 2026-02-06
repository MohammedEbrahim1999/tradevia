// lib/help-center/useHelpCenterData.js
"use client";
import { useEffect, useMemo, useState } from "react";
import { formatLastUpdated, pickEnvBase } from "./helpers";
export function useHelpCenterData() {
    const API_BASE = useMemo(() => pickEnvBase(), []);
    const API_CATEGORIES = useMemo(() => `${API_BASE}/CATEGORIESHelp`, [API_BASE]);
    const API_LAST = useMemo(() => `${API_BASE}/LastUpdated`, [API_BASE]);
    const API_FAQS = useMemo(() => `${API_BASE}/FAQS`, [API_BASE]);
    const CACHE_KEY = "helpcenter_cache_v1";
    const [categories, setCategories] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [lastUpdated, setLastUpdated] = useState("—");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [usedCache, setUsedCache] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        const readCache = () => {
            try {
                const raw = localStorage.getItem(CACHE_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed !== "object") return null;
                return parsed;
            } catch {
                return null;
            }
        };
        const writeCache = (payload) => {
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
            } catch { }
        };
        (async () => {
            try {
                setLoading(true);
                setError("");
                setUsedCache(false);
                const [resCats, resLast, resFaqs] = await Promise.all([
                    fetch(API_CATEGORIES, { signal: controller.signal }),
                    fetch(API_LAST, { signal: controller.signal }),
                    fetch(API_FAQS, { signal: controller.signal }),
                ]);
                if (!resCats.ok || !resLast.ok || !resFaqs.ok) {
                    throw new Error("Failed to fetch Help Center data");
                }
                const catsData = await resCats.json();
                const lastData = await resLast.json();
                const faqsData = await resFaqs.json();
                const safeCats = Array.isArray(catsData) ? catsData : [];
                const safeFaqs = Array.isArray(faqsData) ? faqsData : [];
                const safeLast = formatLastUpdated(lastData);
                setCategories(safeCats);
                setFaqs(safeFaqs);
                setLastUpdated(safeLast);
                writeCache({ ts: Date.now(), categories: safeCats, faqs: safeFaqs, lastUpdated: safeLast });
            } catch (err) {
                if (err?.name === "AbortError") return;
                const cached = readCache();
                if (cached?.categories && cached?.faqs) {
                    setCategories(Array.isArray(cached.categories) ? cached.categories : []);
                    setFaqs(Array.isArray(cached.faqs) ? cached.faqs : []);
                    setLastUpdated(cached.lastUpdated || "—");
                    setUsedCache(true);
                    setError("API offline — showing last saved data on this device.");
                } else {
                    setError(err?.message || "Something went wrong");
                }
            } finally {
                setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [API_CATEGORIES, API_LAST, API_FAQS]);
    return { categories, faqs, lastUpdated, loading, error, usedCache, API_BASE };
}