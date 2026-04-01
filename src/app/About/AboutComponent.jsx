'use client';
import React from 'react';
import dynamic from "next/dynamic";
import { useState, useEffect } from 'react';
// Import your custom loading component
import Loading from '../loading.js'; 

const AboutBread = dynamic(() => import("../FixedComponent/AboutBread.jsx"));
const Detail = dynamic(() => import("./Component/Detail.jsx"));

const Page = () => {
    const [about, setAbout] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const API_orders = "http://localhost:5000/About";

    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                // 1. Simulate a 5-second network delay
                await new Promise((resolve) => setTimeout(resolve, 5000));
                
                const res = await fetch(API_orders);
                if (!res.ok) throw new Error("Failed to fetch data");
                
                const data = await res.json();
                setAbout(data);
            } catch (err) {
                setError(err.message);
            } finally {
                // 2. Turn off loading state
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);

    // 3. Conditional Rendering: Show the Loading component while fetching
    if (loading) {
        return <Loading />;
    }

    // 4. (Optional) Show error state
    if (error) {
        return <div className="error-container">Error: {error}</div>;
    }

    return (
        <>
            <AboutBread Name={"About Us"} text={"Your Trusted Partner in Every Step"} />
            <Detail About={about} />
        </>
    );
}

export default Page;