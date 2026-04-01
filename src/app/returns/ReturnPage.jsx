'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
const ReturnsExchanges = dynamic(
    () => import('./Components/ReturnsExchanges .jsx'),
    { ssr: false }
);
const AboutBread = dynamic(
    () => import('../FixedComponent/AboutBread.jsx'),
    { ssr: false }
);

export default function Page() {
    const [returnData, setReturnData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_return = "http://localhost:5000/returnPolicies";
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_return);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setReturnData(data);
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
            <AboutBread Name={"Returns & Exchanges Policy"} text={"Your satisfaction is important to us. Please review theinformation below regarding our return and exchangeprocedures."} />
            <ReturnsExchanges returnData={returnData} />
        </>
    );
}
