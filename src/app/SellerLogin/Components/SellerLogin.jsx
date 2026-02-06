"use client";
import { useEffect, useState } from "react";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const SnackItem = dynamic(() => import("../../FixedComponent/SnackItem"));
export default function SellerLogin() {
    const router = useRouter();
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' })
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // 🚨 1️⃣ CHECK IF USER ALREADY LOGGED IN
    useEffect(() => {
        const checkLoggedUser = async () => {
            try {
                const res = await fetch("http://localhost:5000/loggedUsers");
                const data = await res.json();

                if (data.length > 0) {
                    // User already logged in → redirect to dashboard
                    router.push("/SellerDashboard");
                } else {
                    setLoading(false); // show login page
                }
            } catch (err) {
                alert(err);
                setLoading(false);
            }
        };

        checkLoggedUser();
    }, [router]);

    // 🚫 Prevent UI flashing while checking login
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    // LOGIN HANDLER
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:5000/sellers");
            const sellers = await res.json();

            const foundSeller = sellers.find(
                (seller) =>
                    seller.email.toLowerCase() === email.toLowerCase() &&
                    seller.password === password
            );

            if (!foundSeller) {
                setSnack({ open: true, message: `Incorrect email or password`, severity: 'error' });
                return;
            }

            // Save login status to loggedUsers
            await fetch("http://localhost:5000/loggedUsers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sellerId: Number(foundSeller.id),
                    email: foundSeller.email,
                    password: foundSeller.password,
                    loginStatus: true,
                    store: foundSeller.storeName,
                }),
            });
            setSnack({ open: true, message: `Logged In successfully`, severity: 'success' });
            setTimeout(() => {
                router.push("/SellerDashboard");
            }, 5000);
        } catch (err) {
            alert(err);
            setError("Server error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black px-4">
            <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-gray-800 shadow-2xl rounded-3xl p-10">

                <div className="flex items-center justify-center mb-10">
                    <div className="flex items-center gap-3">
                        <StorefrontIcon className="text-indigo-400" style={{ fontSize: 42 }} />
                        <h1 className="text-3xl font-bold text-white">Seller Login</h1>
                    </div>
                </div>

                {error && (
                    <p className="text-center text-red-400 mb-4 font-medium">
                        {error}
                    </p>
                )}

                <form onSubmit={handleLogin} className="space-y-7">

                    {/* Email */}
                    <div>
                        <label className="block mb-1 text-gray-300 font-medium">
                            Email Address
                        </label>
                        <div className="flex items-center bg-gray-800/60 rounded-xl px-3 ring-1 ring-gray-700 focus-within:ring-indigo-500/70 transition shadow-inner">
                            <input
                                type="email"
                                required
                                className="w-full bg-transparent p-3 focus:outline-none text-gray-200"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <EmailIcon className="text-gray-400" />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block mb-1 text-gray-300 font-medium">
                            Password
                        </label>
                        <div className="flex items-center bg-gray-800/60 rounded-xl px-3 ring-1 ring-gray-700 focus-within:ring-indigo-500/70 transition shadow-inner">
                            <input
                                type="password"
                                required
                                className="w-full bg-transparent p-3 focus:outline-none text-gray-200"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <LockIcon className="text-gray-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-900/30 transition-all duration-200"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-4">
                    Don’t have an account?{" "}
                    <a href="/SellerSignUp" className="text-indigo-400 font-semibold hover:underline">
                        Sign Up
                    </a>
                </p>
            </div>
            <SnackItem open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} />
        </div>
    );
}
