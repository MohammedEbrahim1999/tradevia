"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { TextField, Button, Card, CardContent, Typography, InputAdornment, LinearProgress, } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import dynamic from "next/dynamic";
const SnackItem = dynamic(() => import("../../FixedComponent/SnackItem"));
export default function SellerSignup() {
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' })
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        storeName: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (name === "password") {
            setPasswordStrength(calculateStrength(value));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // 1. Get all sellers to find the last numeric ID
        const allSellers = await fetch("http://localhost:5000/sellers")
            .then(res => res.json());
        // 2. Find max numeric ID
        const lastId = allSellers.length > 0
            ? Math.max(...allSellers.map(s => Number(s.id) || 0))
            : 0;
        // 3. Create seller with numeric id
        const newSeller = {
            id: lastId + 1,   // 👈 AUTO-INCREMENT
            ...form
        };
        // 4. POST with manual ID
        const response = await fetch("http://localhost:5000/sellers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSeller),
        });
        const data = await response.json();
        setSnack({ open: true, message: `Account Created successfully! With Id ${data.id}`, severity: 'success' });
        window.location.href = "/SellerLogin";
        setForm({ name: "", email: "", password: "", storeName: "" });
        setPasswordStrength(0);
    };
    const calculateStrength = (pass) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length >= 6) score += 30;
        if (/[A-Z]/.test(pass)) score += 20;
        if (/[0-9]/.test(pass)) score += 20;
        if (/[^A-Za-z0-9]/.test(pass)) score += 60;
        return score > 100 ? 100 : score;
    };
    const getStrengthColor = () => {
        if (passwordStrength < 40) return "#FF4C4C"; // Weak - Red
        if (passwordStrength < 70) return "#FFD93D"; // Medium - Yellow
        return "#4CAF50"; // Strong - Green
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0F1F] via-[#0F1C2E] to-[#00040A] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-xl"
            >
                <Card
                    className="rounded-3xl shadow-2xl"
                    sx={{
                        background: "rgba(255, 255, 255, 0.06)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                >
                    <CardContent className="p-10">
                        <div className="flex justify-center mb-6">
                            <StorefrontIcon sx={{ fontSize: 65, color: "#7BC6FF" }} />
                        </div>
                        <Typography
                            variant="h4"
                            className="font-bold text-center text-white mb-2"
                        >
                            Seller Registration
                        </Typography>
                        <Typography
                            variant="body2"
                            className="text-center text-gray-300 mb-8"
                        >
                            Create your seller account to start managing your online store.
                        </Typography>
                        <form className="space-y-5 flex flex-col gap-5 mt-4 mb-3"
                            onSubmit={handleSubmit}
                        >
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon sx={{ color: "#7BC6FF" }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    input: { color: "white" },
                                    label: { color: "#b3b3b3" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#4C6073" },
                                        "&:hover fieldset": { borderColor: "#7BC6FF" },
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: "#7BC6FF" }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    input: { color: "white" },
                                    label: { color: "#b3b3b3" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#4C6073" },
                                        "&:hover fieldset": { borderColor: "#7BC6FF" },
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Store Name"
                                name="storeName"
                                value={form.storeName}
                                onChange={handleChange}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            <StorefrontIcon sx={{ color: "#7BC6FF" }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    input: { color: "white" },
                                    label: { color: "#b3b3b3" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#4C6073" },
                                        "&:hover fieldset": { borderColor: "#7BC6FF" },
                                    },
                                }}
                            />
                            <div className="flex flex-col gap-2">
                                <TextField
                                    fullWidth
                                    type={showPassword ? "text" : "password"}
                                    label="Password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment
                                                position="end"
                                                className="flex items-end "
                                            >
                                                <Button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    sx={{ color: "#7BC6FF", textTransform: "none", minWidth: "10px" }}
                                                >
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </Button>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        input: { color: "white" },
                                        label: { color: "#b3b3b3" },
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": { borderColor: "#4C6073" },
                                            "&:hover fieldset": { borderColor: "#7BC6FF" },
                                        },
                                    }}
                                />
                                {form.password && (
                                    <LinearProgress
                                        variant="determinate"
                                        value={passwordStrength}
                                        sx={{
                                            height: 8,
                                            borderRadius: 5,
                                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                                            "& .MuiLinearProgress-bar": {
                                                backgroundColor: getStrengthColor(),
                                            },
                                        }}
                                    />
                                )}
                            </div>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    py: 1.6,
                                    borderRadius: "14px",
                                    fontWeight: "600",
                                    fontSize: "1.05rem",
                                    background: "linear-gradient(135deg, #7BC6FF, #4FA7E7)",
                                    color: "#000B14",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #9DD8FF, #6BB8F1)",
                                    },
                                }}
                            >
                                Create Seller Account
                            </Button>
                        </form>
                        <Typography className="text-center text-gray-300">
                            Already have an account?{" "}
                            <a
                                href="/SellerLogin"
                                className="text-[#7BC6FF] font-semibold cursor-pointer hover:underline"
                            >
                                Login
                            </a>
                        </Typography>
                    </CardContent>
                </Card>
            </motion.div>
            <SnackItem open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} />
        </div>
    );
}