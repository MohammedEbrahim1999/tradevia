'use client';
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Loading from "../loading.js";

const CardBlog = dynamic(() => import("./Components/CardBlog.jsx"));
const AboutBread = dynamic(() => import("../FixedComponent/AboutBread.jsx"));

export default function BlogComponent() {
    const [blog, setBlog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_blog = "http://localhost:5000/blogPosts";

    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            setLoading(true); // Start loading state

            try {
                // 1. The "Sleep" Promise: This forces a 5-second wait
                await new Promise((resolve) => setTimeout(resolve, 3000));

                // 2. The Fetch Request
                const res = await fetch(API_blog);

                if (!res.ok) {
                    throw new Error(`Error: ${res.status} - Failed to fetch blog posts`);
                }

                const data = await res.json();
                setBlog(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);

    // --- Conditional Rendering for better UX ---

    return (
        <>
            {
                loading && (
                    < >
                        <Loading />
                    </>
                )
            }
            <AboutBread Name={" Marketplace Blog"} />



            {error && (
                <div className="text-red-500 text-center p-10">
                    <p>Oops! {error}</p>
                </div>
            )}

            {!loading && !error && (
                <CardBlog blogPosts={blog} />
            )}
        </>
    );
}