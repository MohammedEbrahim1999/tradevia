'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Loading from '../loading'
const AboutBread = dynamic(() => import('../FixedComponent/AboutBread'), { ssr: false })
const MapContent = dynamic(() => import('./Components/MapContent'), { ssr: false })
const FormAction = dynamic(() => import('./Components/FormAction'), { ssr: false })
const ConnectionData = dynamic(() => import('./Components/ConnectionData'), { ssr: false })
const ContactPage = () => {
    const [contact, setContact] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_contact = "http://localhost:5000/Contact";
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 3000));

                const res = await fetch(API_contact);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setContact(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);
    if (loading) return (
        <>
            <Loading />
        </>
    )
    return (
        <>
            <AboutBread Name={"Contact Us"} text={"We’re here to help. Reach out to our customer service team or send us a message using the form below."} />
            {/* <ContactPage /> */}
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <MapContent />
                <div className="max-w-7xl mx-auto px-6 py-20 grid gap-14 lg:grid-cols-3">
                    <FormAction />
                    <ConnectionData contactData={contact} />
                </div>
            </div>
        </>
    )
}
export default ContactPage