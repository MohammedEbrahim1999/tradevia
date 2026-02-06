'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
const PrivacyPolicyPage = dynamic(
    () => import('./Components/PrivacyPolicyPage.jsx'),
    { ssr: false }
);
const AboutBread = dynamic(
    () => import('../FixedComponent/AboutBread.jsx'),
    { ssr: false }
);
const page = () => {
    const [privacyPage, setPrivacyPage] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_Privacy = "http://localhost:5000/policySections";
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_Privacy);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setPrivacyPage(data);
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
            <AboutBread Name={"Privacy Policy"} text={"Last updated: January 2026"} />
            <PrivacyPolicyPage policySections={privacyPage} />
        </>
    )
}

export default page
