'use client';
import React from 'react'
import dynamic from "next/dynamic";
import { useState,useEffect } from 'react';
const AboutBread = dynamic(() => import("../FixedComponent/AboutBread.jsx"));
const Detail = dynamic(() => import("./Component/Detail.jsx"));
const page = () => {
    const [about, setAbout] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_orders = "http://localhost:5000/About";
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_orders);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setAbout(data);
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
            <AboutBread Name={"About Us"} text={"Your Trusted Partner in Every Step"} />
            <Detail About={about} />
        </>
    )
}
export default page