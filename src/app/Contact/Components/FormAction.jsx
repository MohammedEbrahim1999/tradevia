import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";

const FormAction = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        subject: "",
        phone: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/messageFromContact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to send message");
            }

            setFormData({
                fullName: "",
                email: "",
                subject: "",
                phone: "",
                message: "",
            });

            alert("Message sent successfully ✅");
        } catch (error) {
            console.error(error);
            alert("Something went wrong ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-10">
                <h3 className="text-2xl font-semibold text-gray-900">
                    Send a Message
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                    Please fill in the form below and our team will contact you shortly.
                </p>

                <form onSubmit={handleSubmit} className="mt-10 grid gap-6">
                    {/* Name + Email */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <TextField
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                    </div>

                    {/* Subject + Phone */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <TextField
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <MuiTelInput
                            label="Mobile Number"
                            value={formData.phone}
                            onChange={(value) =>
                                setFormData({ ...formData, phone: value })
                            }
                            defaultCountry="SA"
                            fullWidth
                            required

                        />
                    </div>

                    {/* Message */}
                    <TextField
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        fullWidth
                        multiline
                        rows={6}
                    />

                    {/* Submit */}
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            width: "fit-content",
                            px: 4,
                            py: 1.5,
                            borderRadius: "12px",
                            backgroundColor: "#111827",
                            "&:hover": {
                                backgroundColor: "#1f2937",
                            },
                        }}
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default FormAction;
