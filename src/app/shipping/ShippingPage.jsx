'use client';
import React from 'react'
import dynamic from 'next/dynamic'
const ShippingDelivery = dynamic(() => import('./Components/ShippingDelivery'), { ssr: false })
const AboutBread = dynamic(() => import('../FixedComponent/AboutBread'), { ssr: false })
import { useState, useEffect } from "react";

const page = () => {
        const [shippingpage, setShippingPage] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const API_orders = "http://localhost:5000/shippingPage";
        useEffect(() => {
            const fetchLoggedCustomers = async () => {
                try {
                    const res = await fetch(API_orders);
                    if (!res.ok) throw new Error("Failed to fetch logged customers");
                    const data = await res.json();
                    setShippingPage(data);
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
            <AboutBread Name={"Shipping & Delivery"} text={"Learn about our shipping methods, delivery times, and policies to ensure your orders arrive safely."} />
            <ShippingDelivery shippingConditions={shippingpage} />
        </>
    )
}

export default page
