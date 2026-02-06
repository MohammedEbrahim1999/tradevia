"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    ChevronLeftOutlined,
    ChevronRightOutlined,
} from "@mui/icons-material";

export default function Testimonials() {
    const API_Testimonials = "http://localhost:5000/Testimonials";

    const [testimonialsData, setTestimonialsData] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch(API_Testimonials);
                if (!res.ok) throw new Error("Failed to fetch testimonials");
                const data = await res.json();
                setTestimonialsData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    /* ========================
        SAFE GUARDS
    ======================== */
    if (loading)
        return (
            <section className="py-24 text-center">
                <p className="text-gray-500">Loading testimonials...</p>
            </section>
        );

    if (error)
        return (
            <section className="py-24 text-center text-red-500">
                {error}
            </section>
        );

    if (!testimonialsData.length) return null;

    const testimonials = testimonialsData[0].testimonialsOpinion;
    const total = testimonials.length;
    const currentTestimonial = testimonials[current];
    const achievements = testimonialsData[0]?.achievements;
    /* ========================
        HANDLERS
    ======================== */
    const handlePrev = () => {
        setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
    };

    return (
        <section className="relative bg-gray-50 py-24 overflow-hidden">
            {/* Decorative Shapes */}
            <div className="absolute top-0 -left-20 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -right-24 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center md:text-left text-gray-900">
                    {testimonialsData[0].customerSay}
                </h2>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* LEFT: Testimonial */}
                    <div className="md:w-1/2 flex flex-col">
                        <motion.div
                            key={currentTestimonial.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-white shadow-2xl rounded-3xl p-8 flex-1"
                        >
                            <p className="text-gray-700 mb-6 text-lg italic">
                                "{currentTestimonial.message}"
                            </p>

                            <div className="flex items-center gap-4">
                                <img
                                    src={currentTestimonial.avatar}
                                    alt={currentTestimonial.name}
                                    className="w-14 h-14 rounded-full border-2 border-blue-500"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {currentTestimonial.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {currentTestimonial.role}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Controls */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handlePrev}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                            >
                                <ChevronLeftOutlined />
                                {testimonialsData[0].previous}
                            </button>

                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                            >
                                {testimonialsData[0].next}
                                <ChevronRightOutlined />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Stats / CTA */}
                    <div className="md:w-1/2 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            className="bg-gradient-to-tr from-blue-500 to-pink-500 text-white p-8 rounded-3xl shadow-xl"
                        >
                            <h3 className="text-xl font-bold mb-4">
                                {testimonialsData[0].ourAchivements}
                            </h3>
                            <ul className="space-y-2 ">
                                {achievements.map((achivement, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <span className="inline-block w-3 h-3 bg-pink-200 rounded-full"></span>
                                        <span>{achivement}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.a
                            href="/SellerSignUp"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-block text-center px-6 py-3 bg-white text-blue-500 font-semibold rounded-2xl shadow-lg hover:bg-gray-100 transition w-fit"
                        >
                            {testimonialsData[0].beSeller}
                        </motion.a>
                    </div>
                </div>
            </div>
        </section>
    );
}
