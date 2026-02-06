"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

export default function Newsletter() {
    const API_newsLetter = "http://localhost:5000/newsLetter";
    const [newsLetter, setnewsLetter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_newsLetter);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setnewsLetter(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);
    return (
        <section className="relative overflow-hidden py-20 px-4">
            {/* Background Shapes */}
            <div className="absolute inset-0 -z-10">
                <motion.div
                    animate={{ y: [0, 30, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute top-10 left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ y: [0, -30, 0] }}
                    transition={{ duration: 7, repeat: Infinity }}
                    className="absolute bottom-10 right-10 w-52 h-52 bg-pink-500/20 rounded-full blur-3xl"
                />
            </div>

            {/* Wrapper */}
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-10 shadow-lg">

                    {/* LEFT - CONTENT */}
                    <div className="text-center md:text-left">
                        <div className="flex md:justify-start justify-center mb-6">
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-600 text-white">
                                <MailOutlineIcon fontSize="large" />
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {newsLetter.length > 0 ? newsLetter[0].title : "Subscribe to our Newsletter"}
                        </h2>

                        <p className="text-gray-600 mb-8">
                            {newsLetter.length > 0 ? newsLetter[0].subtitle : "Get exclusive offers, latest updates, and special discounts delivered straight to your inbox."}
                        </p>

                        <form className="flex flex-col sm:flex-row gap-4 max-w-xl">
                            <input
                                type="email"
                                placeholder={newsLetter.length > 0 ? newsLetter[0].placeholder : "Enter your email address"}
                                className="flex-1 px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                            >
                                {newsLetter.length > 0 ? newsLetter[0].Subscribe : "Subscribe"}
                            </button>
                        </form>

                        <p className="text-sm text-gray-500 mt-6">
                            {newsLetter.length > 0 ? newsLetter[0].respect : "We respect your privacy. Unsubscribe anytime."}
                        </p>
                    </div>

                    {/* RIGHT - IMAGE */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="relative w-full h-[320px] md:h-[380px]"
                    >
                        <img
                            src={newsLetter.length > 0 ? newsLetter[0].imageUrl : "https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg"} // replace with your image
                            alt="Newsletter"
                            fill="true"
                            className="object-contain rounded"
                            priority="true"
                        />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
