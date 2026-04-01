"use client";
import { useEffect, useRef } from "react";
import { Button } from "@mui/material";

export default function NotFound() {
    const canvasRef = useRef(null);

    useEffect(() => {
        document.body.classList.add("not-found-page");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles = [];

        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 3 + 1,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.5
            });
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(5, 135, 167, 0.7)";
                ctx.fill();
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > width) p.dx *= -1;
                if (p.y < 0 || p.y > height) p.dy *= -1;
            });
            requestAnimationFrame(animate);
        }
        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            document.body.classList.remove("not-found-page");
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleBackHome = () => {
        document.body.classList.remove("not-found-page");
    };
    const handleGoBack = () => {
        document.body.classList.remove("not-found-page");
        window.history.back();
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#001F27] via-[#023046] to-[#000]">

            {/* Canvas Particles */}
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>

            {/* Floating Card */}
            <div className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl p-12 max-w-2xl w-full text-center animate-float">

                {/* Neon 404 */}
                <h1 className="text-9xl font-extrabold text-[#0587A7] drop-shadow-[0_0_20px_rgba(5,135,167,0.7)] tracking-tight animate-neon">
                    404
                </h1>

                {/* Title */}
                <h2 className="mt-4 text-3xl font-semibold text-white animate-fadeIn">
                    Oops! Page Lost in Space
                </h2>

                {/* Description */}
                <p className="mt-3 text-gray-300 text-sm leading-relaxed max-w-sm mx-auto animate-fadeIn delay-100">
                    The page you’re looking for doesn’t exist or has been abducted by aliens. Let's get you back!
                </p>

                {/* Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn delay-200">
                    <Button
                        href="/"
                        onClick={handleBackHome}
                        className="!px-6 !py-3 !rounded-xl !bg-[#0587A7] !text-white hover:!bg-[#046F88] hover:!scale-110 transition-all duration-300 shadow-lg shadow-[#0587A7]/40"
                    >
                        Back to Home
                    </Button>

                    <Button
                        href="/Contact"
                        onClick={handleBackHome}
                        className="!px-6 !py-3 !rounded-xl !border !border-[#0587A7]/40 !text-[#0587A7] hover:!bg-[#0587A7]/20 hover:!scale-110 transition-all duration-300"
                    >
                        Contact Support
                    </Button>

                    <Button
                        onClick={handleGoBack}
                        className="!px-6 !py-3 !rounded-xl !border !border-[#0587A7]/40 !text-[#0587A7] hover:!bg-[#0587A7]/20 hover:!scale-110 transition-all duration-300"
                    >
                        Go Back
                    </Button>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s infinite ease-in-out; }

        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 1s forwards; }
        .animate-fadeIn.delay-100 { animation-delay: 0.2s; }
        .animate-fadeIn.delay-200 { animation-delay: 0.4s; }

        @keyframes neon {
          0%, 100% { text-shadow: 0 0 10px #fff, 0 0 20px #0587A7, 0 0 30px #0587A7, 0 0 40px #0587A7; }
          50% { text-shadow: 0 0 20px #fff, 0 0 30px #0587A7, 0 0 40px #0587A7, 0 0 50px #0587A7; }
        }
        .animate-neon { animation: neon 1.5s infinite alternate; }
      `}</style>
        </div>
    );
}