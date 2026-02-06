"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CTABanner() {
    const API_CtaBannar = "http://localhost:5000/CtaBannar";
    const [ctaBannar, setCtaBannar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_CtaBannar);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setCtaBannar(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);
    return (
        <section className="relative bg-gradient-to-r from-[#0587A7] to-[#603a48] text-white overflow-hidden py-25 px-6 md:px-16">
            {/* Decorative blurred shapes */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 -full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex flex-col-reverse md:flex-row flex-wrap lg:flex-nowrap items-center justify-between max-w-7xl mx-auto gap-8"
            >
                {/* Text Section */}
                <div className="text-center md:text-left md:max-w-xl">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        {ctaBannar.length > 0 ? ctaBannar[0].title : 'Explore Our New Collection'}
                    </h2>
                    <p className="text-white/90 text-lg md:text-xl mb-6">
                        {ctaBannar.length > 0 ? ctaBannar[0].subtitle : 'Discover the latest trends and styles in our new arrivals. Upgrade your wardrobe with our exclusive collection today!'}
                    </p>
                    <a
                        href="/shop"
                        className="inline-block bg-white text-[#0587A7] font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-white/90 transition-all duration-300"
                    >
                        {ctaBannar.length > 0 ? ctaBannar[0].buttonText : 'Shop Now'}
                    </a>
                </div>
                {/* Center Shape */}
                <div className="hidden md:flex justify-center items-center relative z-10 animate-pulse">
                    {/* Outer Shape */}
                    <div className="w-16 h-80 bg-white/20 backdrop-blur-md rounded-full rotate-12 shadow-lg relative flex justify-center items-center">
                        {/* Inner Arrow */}
                        <div className="w-16 h-16 border-l-2 border-b-2 border-white rotate-210 animate-bounce"></div>
                    </div>
                </div>

                {/* Image Section */}
                <div className="w-full lg:w-1/2 flex justify-center md:justify-end ">
                    <img
                        src={ctaBannar.length > 0 ? ctaBannar[0].imageUrl : '/default-cta-image.jpg'}
                        alt="New Collection"
                        className="w-full max-w-md rounded-xl shadow-2xl object-cover hover:translate-1.5"
                    />
                </div>
            </motion.div>
        </section>
    );
}
