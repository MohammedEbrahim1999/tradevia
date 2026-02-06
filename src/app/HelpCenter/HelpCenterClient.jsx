"use client";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cx, formatLastUpdated, clamp, uniqBy, scoreFaq, pickEnvBase, buildShareUrl } from "./components/help-center/helpers";
import Pill from "./components/help-center/ui/Pill";
import Dialog from "./components/help-center/ui/Dialog";
import Hero from "./components/help-center/sections/Hero";
import Tabs from "./components/help-center/sections/Tabs";
import OverviewTab from "./components/help-center/sections/OverviewTab";
import FaqsTab from "./components/help-center/sections/FaqsTab";
import CategoriesTab from "./components/help-center/sections/CategoriesTab";
import ContactTab from "./components/help-center/sections/ContactTab";
import HelpCenterDialogBody from "./components/help-center/sections/HelpCenterDialogBody";
export default function HelpCenterClient() {
    const API_BASE = useMemo(() => pickEnvBase(), []);
    const API_CATEGORIES = useMemo(() => `${API_BASE}/CATEGORIESHelp`, [API_BASE]);
    const API_LAST = useMemo(() => `${API_BASE}/LastUpdated`, [API_BASE]);
    const API_FAQS = useMemo(() => `${API_BASE}/FAQS`, [API_BASE]);
    const CACHE_KEY = "helpcenter_cache_v1"; // bump if schema changes
    const [categories, setCategories] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [lastUpdated, setLastUpdated] = useState("—");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [usedCache, setUsedCache] = useState(false);
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState("category"); // "category" | "faq"
    const [dialogCategoryId, setDialogCategoryId] = useState("");
    const [dialogFaqId, setDialogFaqId] = useState("");
    // Tabs
    const [tab, setTab] = useState("overview"); // overview | faqs | categories | contact
    // FAQs explorer state
    const [openAcc, setOpenAcc] = useState(""); // accordion open faq id
    const [allQuery, setAllQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState([]); // multi select tags
    // Pagination
    const PAGE_SIZE = 12;
    const [page, setPage] = useState(1);
    // recent FAQs
    const [recentIds, setRecentIds] = useState([]);
    const uid = useId();
    // Contact form (UI-only)
    const [contact, setContact] = useState({ name: "", email: "", subject: "", message: "" });
    const [contactTouched, setContactTouched] = useState(false);
    const contactErrors = useMemo(() => {
        if (!contactTouched) return {};
        const errs = {};
        if (!contact.name.trim()) errs.name = "Name is required.";
        if (!contact.email.trim()) errs.email = "Email is required.";
        else if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) errs.email = "Enter a valid email.";
        if (!contact.subject.trim()) errs.subject = "Subject is required.";
        if (!contact.message.trim()) errs.message = "Message is required.";
        return errs;
    }, [contact, contactTouched]);
    const canSubmitContact = useMemo(
        () => Object.keys(contactErrors).length === 0 && contactTouched,
        [contactErrors, contactTouched]
    );
    // load recent from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem("helpcenter_recent_faqs");
            const parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed)) setRecentIds(parsed.slice(0, 6));
        } catch {
            // ignore
        }
    }, []);
    function addRecentFaq(faqId) {
        if (!faqId) return;
        try {
            setRecentIds((prev) => {
                const next = [faqId, ...prev.filter((x) => x !== faqId)].slice(0, 6);
                localStorage.setItem("helpcenter_recent_faqs", JSON.stringify(next));
                return next;
            });
        } catch {
            // ignore
        }
    }
    // Deep link support: ?tab=faqs&faq=ID
    useEffect(() => {
        try {
            const u = new URL(window.location.href);
            const t = u.searchParams.get("tab");
            const faq = u.searchParams.get("faq");
            if (t && ["overview", "faqs", "categories", "contact"].includes(t)) setTab(t);
            if (faq) {
                setTab("faqs");
                setDialogMode("faq");
                setDialogFaqId(faq);
                setDialogCategoryId("");
                setDialogOpen(true);
                addRecentFaq(faq);
            }
        } catch {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fetch data + cache
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
            } catch {
                // ignore
            }
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

                if (!resCats.ok || !resLast.ok || !resFaqs.ok) throw new Error("Failed to fetch Help Center data");

                const catsData = await resCats.json();
                const lastData = await resLast.json();
                const faqsData = await resFaqs.json();

                const safeCats = Array.isArray(catsData) ? catsData : [];
                const safeFaqs = Array.isArray(faqsData) ? faqsData : [];
                const safeLast = formatLastUpdated(lastData);

                setCategories(safeCats);
                setFaqs(safeFaqs);
                setLastUpdated(safeLast);

                writeCache({
                    ts: Date.now(),
                    categories: safeCats,
                    faqs: safeFaqs,
                    lastUpdated: safeLast,
                });
            } catch (err) {
                if (err?.name === "AbortError") return;

                // fallback to cache
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

    const activeCategory = useMemo(
        () => categories.find((c) => c.id === dialogCategoryId) || null,
        [categories, dialogCategoryId]
    );

    const activeFaq = useMemo(() => faqs.find((f) => f.id === dialogFaqId) || null, [faqs, dialogFaqId]);

    const categoryFaqs = useMemo(() => {
        if (!activeCategory) return [];
        const catId = activeCategory.id;

        const byTag = faqs.filter((f) => (Array.isArray(f.tags) ? f.tags : []).some((t) => t === catId));
        const referencedIds = new Set((activeCategory.links || []).map((l) => l.faqId).filter(Boolean));
        const byRef = faqs.filter((f) => referencedIds.has(f.id));

        const map = new Map();
        [...byTag, ...byRef].forEach((f) => map.set(f.id, f));
        return Array.from(map.values());
    }, [activeCategory, faqs]);

    // Popular fallback: referenced in categories first, then fill by tags length
    const popularFaqs = useMemo(() => {
        const referenced = [];
        categories.forEach((c) => (c.links || []).forEach((l) => l?.faqId && referenced.push(l.faqId)));
        const refSet = new Set(referenced);
        const byRef = faqs.filter((f) => refSet.has(f.id));

        const bySignal = [...faqs]
            .sort((a, b) => {
                const at = Array.isArray(a?.tags) ? a.tags.length : 0;
                const bt = Array.isArray(b?.tags) ? b.tags.length : 0;
                return bt - at;
            })
            .slice(0, 12);

        return uniqBy([...byRef, ...bySignal], (x) => x.id).slice(0, 10);
    }, [faqs, categories]);

    const recentFaqs = useMemo(() => {
        if (!recentIds.length) return [];
        const map = new Map(faqs.map((f) => [f.id, f]));
        return recentIds.map((id) => map.get(id)).filter(Boolean);
    }, [recentIds, faqs]);

    const allTags = useMemo(() => {
        const tags = uniqBy(
            faqs.flatMap((f) => (Array.isArray(f?.tags) ? f.tags : [])),
            (x) => String(x)
        )
            .map((x) => String(x))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
        return tags;
    }, [faqs]);

    const allFaqsFiltered = useMemo(() => {
        const q = allQuery.trim().toLowerCase();

        const base = q
            ? [...faqs]
                .map((f) => ({ f, s: scoreFaq(f, q) }))
                .filter((x) => x.s > 0)
                .sort((a, b) => b.s - a.s)
                .map((x) => x.f)
            : faqs;

        if (!selectedTags.length) return base;

        return base.filter((f) => {
            const tags = Array.isArray(f?.tags) ? f.tags : [];
            return selectedTags.every((t) => tags.includes(t));
        });
    }, [faqs, allQuery, selectedTags]);

    // Reset pagination when filters change
    useEffect(() => setPage(1), [allQuery, selectedTags]);

    const pagedFaqs = useMemo(() => {
        const total = allFaqsFiltered.length;
        const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const p = clamp(page, 1, pages);
        const start = (p - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return { page: p, pages, items: allFaqsFiltered.slice(start, end), total };
    }, [allFaqsFiltered, page]);

    function openCategoryDialog(categoryId) {
        setDialogMode("category");
        setDialogCategoryId(categoryId);
        setDialogFaqId("");
        setDialogOpen(true);

        try {
            const u = new URL(window.location.href);
            u.searchParams.set("tab", "categories");
            u.searchParams.delete("faq");
            window.history.replaceState({}, "", u.toString());
        } catch { }
    }

    function openFaqDialog(faqId, categoryId = "") {
        setDialogMode("faq");
        setDialogFaqId(faqId);
        setDialogCategoryId(categoryId || "");
        setDialogOpen(true);
        addRecentFaq(faqId);

        try {
            const share = buildShareUrl({ tab: "faqs", faqId });
            window.history.replaceState({}, "", share || window.location.href);
        } catch { }
    }

    function closeDialog() {
        setDialogOpen(false);
        try {
            const u = new URL(window.location.href);
            u.searchParams.delete("faq");
            window.history.replaceState({}, "", u.toString());
        } catch { }
    }

    const statusPill = useMemo(() => {
        if (loading) return <Pill tone="amber">Loading…</Pill>;
        if (error && !usedCache) return <Pill tone="red">Offline</Pill>;
        if (usedCache) return <Pill tone="amber">Cached</Pill>;
        return <Pill tone="green">Updated</Pill>;
    }, [loading, error, usedCache]);

    const stats = useMemo(() => {
        const totalCats = categories.length;
        const totalFaqs = faqs.length;
        const totalTags = uniqBy(
            faqs.flatMap((f) => (Array.isArray(f?.tags) ? f.tags : [])),
            (x) => String(x)
        ).length;

        return { totalCats, totalFaqs, totalTags };
    }, [categories, faqs]);

    const tabs = useMemo(
        () => [
            { id: "overview", label: "Overview" },
            { id: "faqs", label: "FAQs Explorer" },
            { id: "categories", label: "Categories" },
            { id: "contact", label: "Contact" },
        ],
        []
    );

    function setTabAndUrl(nextTab) {
        setTab(nextTab);
        try {
            const u = new URL(window.location.href);
            u.searchParams.set("tab", nextTab);
            if (nextTab !== "faqs") u.searchParams.delete("faq");
            window.history.replaceState({}, "", u.toString());
        } catch { }
    }

    async function copyCurrentFaqLink() {
        const url = buildShareUrl({ tab: "faqs", faqId: dialogFaqId });
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            alert("Link copied!");
        } catch {
            // fallback
            try {
                const ta = document.createElement("textarea");
                ta.value = url;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                ta.remove();
                alert("Link copied!");
            } catch {
                alert("Could not copy link.");
            }
        }
    }

    function clearRecent() {
        try {
            localStorage.removeItem("helpcenter_recent_faqs");
        } catch { }
        setRecentIds([]);
    }

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white">
            {/* subtle background accents */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gray-200/40 blur-3xl" />
                <div className="absolute -bottom-56 -left-40 h-[560px] w-[560px] rounded-full bg-gray-200/30 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-14">
                {/* Top bar */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <nav className="text-xs text-gray-500">
                        <Link href="/" className="hover:text-gray-800">
                            Home
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="font-semibold text-gray-700">Help Center</span>
                    </nav>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setTabAndUrl("contact")}
                            className={cx(
                                "inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700",
                                "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                            )}
                        >
                            Contact support
                        </button>

                        <Link
                            href="/TrackOrder"
                            className={cx(
                                "inline-flex items-center justify-center rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white",
                                "hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                            )}
                        >
                            Track order
                        </Link>
                    </div>
                </div>

                <Hero
                    uid={uid}
                    lastUpdated={lastUpdated}
                    statusPill={statusPill}
                    loading={loading}
                    error={error}
                    usedCache={usedCache}
                    onRetry={() => window.location.reload()}
                    onJumpPick={(faqId) => {
                        setTabAndUrl("faqs");
                        openFaqDialog(faqId);
                    }}
                    faqs={faqs}
                    tabs={tabs}
                    tab={tab}
                    onTabChange={setTabAndUrl}
                    stats={stats}
                />

                {/* =======================
            TAB CONTENT
        ======================= */}
                <div className="mt-8">
                    {tab === "overview" ? (
                        <OverviewTab
                            loading={loading}
                            stats={stats}
                            lastUpdated={lastUpdated}
                            statusPill={statusPill}
                            recentFaqs={recentFaqs}
                            onOpenFaq={(id) => {
                                setTabAndUrl("faqs");
                                openFaqDialog(id);
                            }}
                            onClearRecent={clearRecent}
                            usedCache={usedCache}
                            error={error}
                        />
                    ) : null}

                    {tab === "faqs" ? (
                        <FaqsTab
                            loading={loading}
                            faqs={faqs}
                            popularFaqs={popularFaqs}
                            openAcc={openAcc}
                            setOpenAcc={setOpenAcc}
                            allQuery={allQuery}
                            setAllQuery={setAllQuery}
                            allTags={allTags}
                            selectedTags={selectedTags}
                            setSelectedTags={setSelectedTags}
                            pagedFaqs={pagedFaqs}
                            setPage={setPage}
                            onOpenFaq={(id) => openFaqDialog(id)}
                        />
                    ) : null}

                    {tab === "categories" ? (
                        <CategoriesTab
                            loading={loading}
                            categories={categories}
                            onOpenCategoryDialog={(id) => openCategoryDialog(id)}
                            onOpenFaqFromCategory={(faqId, catId) => {
                                setTabAndUrl("faqs");
                                openFaqDialog(faqId, catId);
                            }}
                        />
                    ) : null}

                    {tab === "contact" ? (
                        <ContactTab
                            contact={contact}
                            setContact={setContact}
                            contactErrors={contactErrors}
                            canSubmitContact={canSubmitContact}
                            setContactTouched={setContactTouched}
                            contactTouched={contactTouched}
                        />
                    ) : null}
                </div>

                <p className="mt-10 text-center text-xs text-gray-500">
                    This Help Center provides general guidance and does not replace your legal rights.
                </p>
            </div>

            {/* Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                title={
                    dialogMode === "faq"
                        ? activeFaq?.q || "Help"
                        : activeCategory
                            ? `${activeCategory.title} — FAQs`
                            : "Help"
                }
                subtitle={dialogMode === "faq" ? "Answer" : activeCategory ? "All questions and answers in this category." : ""}
            >
                <HelpCenterDialogBody
                    dialogMode={dialogMode}
                    activeFaq={activeFaq}
                    activeCategory={activeCategory}
                    categoryFaqs={categoryFaqs}
                    onCopyLink={copyCurrentFaqLink}
                    onClose={closeDialog}
                    onGoContact={() => {
                        closeDialog();
                        setTabAndUrl("contact");
                    }}
                    onOpenFaq={(id) => openFaqDialog(id, activeCategory?.id || "")}
                />
            </Dialog>
        </section>
    );
}
