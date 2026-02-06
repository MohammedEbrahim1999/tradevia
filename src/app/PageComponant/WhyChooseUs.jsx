"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SecurityIcon from '@mui/icons-material/Security';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import StarIcon from '@mui/icons-material/Star';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function WhyChooseUs() {
    const API_reasons = "http://localhost:5000/reasonsToChooseUs";
    const [reasons, setReasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_reasons);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setReasons(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);
    const iconMap = {
        security: SecurityIcon,
        shipping: LocalShippingIcon,
        support: HeadsetMicIcon,
        quality: StarIcon,
    };
    if (loading) { return <p>Loading...</p>; }
    if (error) { return <p>Error: {error}</p>; }
    return (
        <section className="relative overflow-hidden py-28 bg-gradient-to-b from-white to-gray-100">

            {/* === Premium Background Shapes === */}
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-[#0587A788] to-purple-500/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 -right-40 w-[550px] h-[550px] bg-gradient-to-tr from-pink-500/20 to-orange-400/20 rounded-full blur-[120px]" />

            {/* Ring */}
            <div className="absolute top-1/3 left-10 w-64 h-64 border border-indigo-300/30 rounded-full" />
            <div className="absolute bottom-20 right-20 w-40 h-40 border border-pink-300/30 rounded-full" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

            <div className="relative container mx-auto px-6">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center max-w-2xl mx-auto mb-20"
                >
                    <p className="text-indigo-600 font-medium mb-3">
                        WHY CHOOSE US
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                        Built for Quality & Trust
                    </h2>
                    <p className="text-gray-600 mt-4">
                        We focus on delivering premium experiences with reliability
                        and performance at every step.
                    </p>
                </motion.div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {reasons.map((item, i) => {
                        const Icon = iconMap[item.icon] || HelpOutlineIcon;

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ y: -8 }}
                                className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/40 to-pink-500/40"
                            >
                                <div className="h-full rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-lg hover:shadow-2xl transition">

                                    {/* Icon */}
                                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white mb-6 group-hover:scale-110 transition">
                                        <Icon fontSize="large" />
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {item.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}

                </div>
            </div>
        </section>
    );
}
