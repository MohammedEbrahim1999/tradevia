import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useState, useEffect } from "react";
export default function Main() {
    const API_mainSlides = "http://localhost:5000/mainSlides";
    const [mainSlides, setMainSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_mainSlides);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setMainSlides(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);
    return (
        <Swiper
            navigation
            loop
            modules={[Navigation]}
            className="mySwiper"
        >
            {mainSlides.map((slide, index) => (
                <SwiperSlide key={index}>
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            height: "87.9vh",
                            overflow: "hidden",
                        }}
                    >
                        {/* Image */}
                        <img
                            src={slide.src}
                            alt={slide.title}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />

                        {/* Gradient Overlay */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                    "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.55))",
                            }}
                        />

                        {/* Text Content */}
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                textAlign: "center",
                                color: "#fff",
                                maxWidth: "720px",
                                padding: "0 20px",
                            }}
                        >
                            <h1
                                style={{
                                    fontSize: "3rem",
                                    marginBottom: "10px",
                                }}
                            >
                                {slide.title}
                            </h1>

                            <h3
                                style={{
                                    fontSize: "1.5rem",
                                    marginBottom: "15px",
                                    opacity: 0.9,
                                }}
                            >
                                {slide.subtitle}
                            </h3>

                            <p
                                style={{
                                    fontSize: "1.1rem",
                                    marginBottom: "30px",
                                    opacity: 0.85,
                                    lineHeight: 1.6,
                                }}
                            >
                                {slide.description}
                            </p>

                            <button
                                style={{
                                    padding: "12px 32px",
                                    fontSize: "1rem",
                                    borderRadius: "30px",
                                    border: "none",
                                    cursor: "pointer",
                                    backgroundColor: "#fff",
                                    color: "#000",
                                    fontWeight: "600",
                                }}
                            >
                                {slide.button}
                            </button>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
