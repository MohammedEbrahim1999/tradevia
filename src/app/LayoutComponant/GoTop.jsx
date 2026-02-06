"use client";
import React, { useState, useEffect } from "react";
import NorthIcon from '@mui/icons-material/North';
const GoTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 10) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    // Scroll to top smoothly
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            {isVisible && (
                <button className="fixed rounded-full border-none text-white flex items-center justify-center  bottom-8 right-8 text-2xl bg-[#0587A7] cursor-pointer w-13 h-13 hover:bg-[#102c4c] hover:text-amber-900"
                    onClick={scrollToTop}
                    aria-label="Go to top"
                    style={{
                        boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                        transition: "all 0.3s ease",
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)", // slide in
                        zIndex: 10000,
                    }}
                >
                    <NorthIcon fontSize="inherit" />
                </button>


            )}
        </>
    );
};

export default GoTop;
