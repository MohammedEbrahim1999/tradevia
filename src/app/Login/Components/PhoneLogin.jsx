"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import ForwardOutlinedIcon from "@mui/icons-material/ForwardOutlined";
import dynamic from "next/dynamic";

const SnackItem = dynamic(() => import("../../FixedComponent/SnackItem"));

export default function PhoneLoginPro() {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [otpArray, setOtpArray] = useState([]);
    const [generatedOTP, setGeneratedOTP] = useState("");
    const [otpInput, setOtpInput] = useState("");
    const [snack, setSnack] = useState({
        open: false,
        message: "",
        severity: "error",
    });

    /* ================= FETCH OTP DIGITS ================= */
    useEffect(() => {
        fetch("http://localhost:5000/otps")
            .then((res) => res.json())
            .then((data) => {
                setOtpArray(data[0].Otp);
            });
    }, []);

    /* ================= GENERATE OTP ================= */
    const generateOTP = () => {
        if (!otpArray.length) return "";
        let result = "";
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * otpArray.length);
            result += otpArray[randomIndex];
        }
        return result;
    };

    /* ================= GENERATE USER TOKEN ================= */
    const generateToken = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const firstLetter = letters[Math.floor(Math.random() * letters.length)];
        const numbers = Math.floor(100000 + Math.random() * 900000); // 6 digits
        return `#${firstLetter}${numbers}`;
    };

    /* ================= STEP 1 LOGIN ================= */
    const handleLogin = () => {
        if (!phone) {
            setSnack({
                open: true,
                message: "Please enter your phone number",
                severity: "error",
            });
            return;
        }

        const otp = generateOTP();
        setGeneratedOTP(otp);

        setSnack({
            open: true,
            message: `Your OTP is: ${otp}`,
            severity: "success",
        });

        setStep(2);
    };

    /* ================= STEP 2 VERIFY OTP ================= */
    const handleVerifyOTP = async () => {
        if (otpInput !== generatedOTP) {
            setSnack({
                open: true,
                message: "Incorrect OTP",
                severity: "error",
            });
            return;
        }

        const customersRes = await fetch("http://localhost:5000/customers");
        const customers = await customersRes.json();

        let loggedUser = customers.find(
            (user) => user.phone === phone
        );

        /* ===== EXISTING USER ===== */
        if (loggedUser) {
            await fetch(`http://localhost:5000/customers/${loggedUser.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ loginStatus: true }),
            });

            localStorage.setItem("userToken", loggedUser.userTokens);

        } else {
            /* ===== NEW USER ===== */
            const newUser = {
                name: "Hello User",
                email: "",
                phone,
                userTokens: generateToken(),
                loginStatus: true,
            };

            const createRes = await fetch("http://localhost:5000/customers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            });

            loggedUser = await createRes.json();
            localStorage.setItem("userToken", loggedUser.userTokens);
        }

        /* ===== ADD TO loggedCustomers ===== */
        await fetch("http://localhost:5000/loggedCustomers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userTokens: loggedUser.userTokens,
                id: loggedUser.id,
            }),
        });

        setSnack({
            open: true,
            message: "Login successful",
            severity: "success",
        });

        setTimeout(() => {
            window.location.href = "/";
        }, 7000);
    };

    /* ================= UI ================= */
    return (
        <div
            className="min-h-screen w-full flex items-center justify-end bg-cover bg-center"
            style={{ backgroundImage: "url('/imgs/login.webp')" }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="relative z-10 text-center text-white px-6 md:mr-20"
            >
                <h1 className="text-4xl font-bold mb-3 leading-relaxed">
                    Welcome to Tradevia <br />
                    The Future of Trading in Egypt
                </h1>

                <div className="mt-10 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-10 rounded-2xl w-full max-w-md mx-auto shadow-xl">
                    {step === 1 && (
                        <>
                            <h2 className="text-2xl font-semibold mb-6">Log In</h2>

                            <div className="relative">
                                <PhoneIphoneIcon className="absolute left-4 top-4 text-gray-300" />
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Phone Number"
                                    className="w-full bg-white/10 border border-white/30 text-white placeholder-gray-300 pl-12 pr-4 py-4 rounded-xl outline-none"
                                />
                            </div>

                            <button
                                onClick={handleLogin}
                                className="w-full mt-6 bg-white text-orange-700 py-3 rounded-xl font-semibold text-lg hover:bg-orange-100 transition"
                            >
                                Log In
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 className="text-2xl font-semibold mb-6">Enter OTP</h2>

                            <input
                                type="text"
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                className="w-full bg-white/10 border border-white/30 text-white text-center py-4 rounded-xl outline-none"
                            />

                            <button
                                onClick={handleVerifyOTP}
                                className="w-full mt-6 bg-white text-orange-700 py-3 rounded-xl font-semibold text-lg hover:bg-orange-100 transition"
                            >
                                Verify OTP
                            </button>
                        </>
                    )}
                </div>
            </motion.div>

            <a
                href="/"
                className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-lg hover:bg-white/30 transition"
            >
                Home Page <ForwardOutlinedIcon />
            </a>

            <SnackItem
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={() => setSnack({ ...snack, open: false })}
            />
        </div>
    );
}
