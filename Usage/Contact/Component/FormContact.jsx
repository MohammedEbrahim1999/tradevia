"use client";
import React, { useRef, useEffect, useState } from "react";
import { TextField, Button, Divider } from "@mui/material";
const FormContact = () => {
    const formRef = useRef(null);
    const [formHeight, setFormHeight] = useState(500);
    useEffect(() => {
        if (formRef.current) {
            setFormHeight(formRef.current.offsetHeight);
        }
        const handleResize = () => {
            if (formRef.current) {
                setFormHeight(formRef.current.offsetHeight);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return (
        <div className=" container py-5">
            <div className="flex row g-4 items-center gap-4 justify-center">
                <div className="col-12 columns-2xl justify-center">
                    <div className="flex flex-col  h-fit" ref={formRef}>
                        <h5 className="fw-bold" style={{ color: "#1976d2" }}>
                            Send us a message
                        </h5>
                        <Divider sx={{ mb: 3 }} />
                        <form className="flex flex-col ">
                            <TextField fullWidth label="Your Name" margin="normal" required sx={{ mb: 2 }} />
                            <TextField fullWidth label="Email Address" type="email" margin="normal" required sx={{ mb: 2 }} />
                            <TextField fullWidth label="Phone Number" type="tel" margin="normal" sx={{ mb: 2 }} />
                            <TextField fullWidth label="Subject" type="text" margin="normal" sx={{ mb: 2 }} />
                            <TextField fullWidth label="Message" multiline rows={5} margin="normal" required sx={{ mb: 3 }} />
                            <Button className="font-bold rounded mt-auto py-2" variant="contained" size="large" sx={{
                                    textTransform: "none",
                                    bgcolor: "#1976d2",
                                    "&:hover": { bgcolor: "#f7693e" },
                                }}
                            >
                                Send Message
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Google Map */}
                <div className="col-12 col-lg-6">
                    <div style={{ width: "100%", height: `${formHeight}px` }}>
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d111551.9926412813!2d31.3785!3d31.0409!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7e2f8e8e8e8e8%3A0x8e8e8e8e8e8e8e8e!2sMansoura%2C%20Egypt!5e0!3m2!1sen!2sbd!4v1597926938024!5m2!1sen!2sbd"
                            className="rounded w-100 h-100 border-0"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FormContact;