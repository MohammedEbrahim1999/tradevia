'use client';
import React from 'react'
import dynamic from 'next/dynamic'
import { useState, useEffect } from "react";
const FaqsContent = dynamic(() => import('./Components/FaqsContent'), { ssr: false })
const AboutBread = dynamic(() => import('../FixedComponent/AboutBread'), { ssr: false })
const faqPage = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_orders = "http://localhost:5000/faqs";
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_orders);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setFaqs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);
    return (
        <>
            <AboutBread Name="Frequently Asked Questions" text="Find answers to the most common questions about our services." />
            <FaqsContent faqs={faqs} />
        </>
    )
}

export default faqPage
