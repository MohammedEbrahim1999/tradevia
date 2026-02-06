"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "./Components/Header";
import Toc from "./Components/Toc";
import Pager from "./Components/Pager";
import BookShell from "./Components/BookShell";
import BookPage from "./Components/BookPage";
import StickyNote from "./Components/StickyNote";
import AnswerRenderer from "./Components/AnswerRenderer";
const TONES = ["amber", "sky", "mint"];
export default function CookiesClient() {
    // ✅ change this to your deployed JSON server if needed
    const API_URL = "http://localhost:5000/cookiesPolicy";
    const [data, setData] = useState(null); // { lastUpdated, sections }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch(API_URL, { signal: controller.signal });
                if (!res.ok) throw new Error("Failed to fetch Cookies Policy");
                const json = await res.json();
                const safe = {
                    lastUpdated: json?.lastUpdated || "—",
                    sections: Array.isArray(json?.sections) ? json.sections : [],
                };
                setData(safe);
                setPageIndex(0);
            } catch (err) {
                if (err?.name !== "AbortError") setError(err?.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [API_URL]);
    const sections = useMemo(() => data?.sections || [], [data]);
    const pageCount = sections.length;
    const current = sections[pageIndex];
    const goPrev = () => setPageIndex((p) => Math.max(0, p - 1));
    const goNext = () => setPageIndex((p) => Math.min(pageCount - 1, p + 1));
    if (loading) {
        return (
            <section className="mx-auto max-w-6xl px-6 py-16">
                <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                    <p className="text-sm text-gray-600">Loading Cookies Policy…</p>
                </div>
            </section>
        );
    }
    if (error) {
        return (
            <section className="mx-auto max-w-6xl px-6 py-16">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
                    <p className="text-sm font-semibold text-red-900">Could not load Cookies Policy</p>
                    <p className="mt-2 text-sm text-red-800">{error}</p>
                    <p className="mt-4 text-xs text-red-700">
                        Check your JSON server is running and the endpoint exists:{" "}
                        <span className="font-mono">{API_URL}</span>
                    </p>
                </div>
            </section>
        );
    }
    if (!pageCount) {
        return (
            <section className="mx-auto max-w-6xl px-6 py-16">
                <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                    <p className="text-sm text-gray-700">No Cookies Policy sections found in db.json.</p>
                </div>
            </section>
        );
    }
    return (
        <section className="mx-auto max-w-6xl px-6 py-16">
            {/* ========= TOP HEADER ========= */}
            <Header lastUpdated={data?.lastUpdated} />
            {/* ========= BODY ========= */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* TOC */}
                <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-6 space-y-4">
                        <Toc sections={sections} pageIndex={pageIndex} onSelect={setPageIndex} />
                        <StickyNote tone="mint" title="Tip">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                For the best experience, keep essential cookies enabled. You can still disable
                                marketing cookies anytime from your browser.
                            </p>
                        </StickyNote>
                    </div>
                </aside>
                {/* BOOK */}
                <main className="lg:col-span-8">
                    <Pager
                        pageIndex={pageIndex}
                        pageCount={pageCount}
                        onPrev={goPrev}
                        onNext={goNext}
                    />
                    <BookShell>
                        <BookPage
                            key={current.id || pageIndex}
                            pageNo={pageIndex + 1}
                            pageCount={pageCount}
                            question={current.question || "—"}
                            tone={TONES[pageIndex % TONES.length]}
                        >
                            <div className="space-y-4">
                                <StickyNote tone="sky" title="Question">
                                    <p className="text-sm text-gray-900 font-semibold leading-relaxed">
                                        {current.question}
                                    </p>
                                </StickyNote>
                                <StickyNote tone="amber" title="Answer">
                                    <div className="text-sm text-gray-800 leading-relaxed">
                                        <AnswerRenderer answer={current.answer} />
                                    </div>
                                </StickyNote>
                            </div>
                        </BookPage>
                    </BookShell>
                    <p className="mt-4 text-xs text-gray-500">
                        Tip: Use the TOC on the left to jump directly to any “page”.
                    </p>
                </main>
            </div>
        </section>
    );
}