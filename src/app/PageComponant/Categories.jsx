"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useEffect, useMemo, useState } from "react";

const FALLBACK_IMG = "https://dummyimage.com/600x600/e5e7eb/111827&text=Category";

function safeText(v) {
    return typeof v === "string" ? v : "";
}

export default function CategoriesCarousel() {
    const API_categories = "http://localhost:5000/categories";

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(API_categories, {
                    signal: controller.signal,
                    cache: "no-store",
                });

                if (!res.ok) throw new Error("Failed to fetch categories");

                const data = await res.json();
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                if (err?.name !== "AbortError") setError(err?.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    // skeleton count depends on width-ish via Swiper breakpoints (simple reasonable number)
    const skeletons = useMemo(() => Array.from({ length: 10 }), []);

    const hasData = categories?.length > 0;

    const slideAnim = useMemo(
        () => ({
            initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 },
            whileInView: reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.4 },
            transition: { duration: 0.45, ease: "easeOut" },
        }),
        [reduceMotion]
    );

    const slides = useMemo(() => {
        if (loading) {
            return skeletons.map((_, i) => (
                <SwiperSlide key={`sk-${i}`}>
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="h-[122px] w-[122px] md:h-[140px] md:w-[140px] rounded-full bg-zinc-200 animate-pulse" />
                            <div className="absolute inset-0 rounded-full ring-1 ring-black/5" />
                        </div>
                        <div className="mt-4 h-3 w-24 rounded bg-zinc-200 animate-pulse" />
                        <div className="mt-2 h-2 w-16 rounded bg-zinc-200 animate-pulse opacity-70" />
                    </div>
                </SwiperSlide>
            ));
        }

        return categories.map((cat, index) => {
            const title = safeText(cat?.title) || "Category";
            const href = safeText(cat?.link);
            const isDisabled = !href;

            return (
                <SwiperSlide key={cat?.id ?? `${title}-${index}`}>
                    <motion.div {...slideAnim} className="group">
                        {isDisabled ? (
                            <div
                                aria-label={`${title} category`}
                                className="flex flex-col items-center opacity-70 cursor-not-allowed"
                            >
                                <CategoryCard title={title} image={cat?.image} disabled />
                            </div>
                        ) : (
                            <Link
                                href={href}
                                aria-label={`Open category ${title}`}
                                className="flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-4 rounded-2xl"
                            >
                                <CategoryCard title={title} image={cat?.image} />
                            </Link>
                        )}
                    </motion.div>
                </SwiperSlide>
            );
        });
    }, [loading, skeletons, categories, slideAnim]);

    return (
        <section className="py-14 md:py-20 bg-gradient-to-b from-white to-zinc-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center">
                    <motion.h2
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-3xl md:text-5xl font-semibold tracking-tight text-zinc-900"
                    >
                        Shop by Category
                    </motion.h2>

                    <motion.p
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
                        className="mt-3 text-zinc-500 text-base md:text-lg"
                    >
                        Curated collections for every style
                    </motion.p>
                </div>

                {/* Error */}
                {error ? (
                    <div
                        role="alert"
                        className="mt-10 max-w-xl mx-auto rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                ) : null}

                {/* Empty state */}
                {!loading && !error && !hasData ? (
                    <div className="mt-10 max-w-xl mx-auto rounded-2xl border border-zinc-200 bg-white px-6 py-8 text-center">
                        <p className="text-zinc-900 font-semibold">No categories found</p>
                        <p className="mt-2 text-sm text-zinc-500">Please add categories in your API and try again.</p>
                    </div>
                ) : null}

                {/* Carousel */}
                <div className="mt-10 md:mt-14">
                    <Swiper
                        modules={[Autoplay]}
                        autoplay={{
                            delay: 2600,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        loop={hasData} // loop فقط لو فيه بيانات
                        speed={650}
                        grabCursor
                        spaceBetween={18}
                        breakpoints={{
                            0: { slidesPerView: 2.2 },
                            520: { slidesPerView: 3.2 },
                            768: { slidesPerView: 4.6 },
                            1024: { slidesPerView: 7 },
                        }}
                    >
                        {slides}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}

function CategoryCard({ title, image, disabled = false }) {
    const imgSrc = typeof image === "string" && image.trim() ? image : FALLBACK_IMG;

    return (
        <>
            {/* Image Card */}
            <div className="relative">
                {/* gradient ring */}
                <div
                    className={[
                        "absolute -inset-[2px] rounded-full bg-gradient-to-br",
                        "from-zinc-200 via-zinc-100 to-zinc-300 opacity-80 transition-opacity",
                        disabled ? "" : "group-hover:opacity-100",
                    ].join(" ")}
                />

                <div
                    className={[
                        "relative h-[122px] w-[122px] md:h-[140px] md:w-[140px]",
                        "rounded-full overflow-hidden bg-white ring-1 ring-black/5",
                        "shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300",
                        disabled ? "" : "group-hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)] group-hover:-translate-y-1",
                    ].join(" ")}
                >
                    <img
                        src={imgSrc}
                        alt={title}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMG;
                        }}
                        className={[
                            "w-full h-full object-cover transition-transform duration-700",
                            disabled ? "" : "group-hover:scale-110",
                        ].join(" ")}
                    />

                    {/* soft overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* tiny glow */}
                <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-black/5" />
            </div>

            {/* Title */}
            <span className="mt-4 text-[13px] md:text-sm font-semibold tracking-wide text-zinc-900 group-hover:text-black">
                {title}
            </span>
            <span className="mt-1 text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore →
            </span>
        </>
    );
}
