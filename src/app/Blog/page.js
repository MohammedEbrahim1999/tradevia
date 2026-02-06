'use client';
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CardBlog = dynamic(() => import("./Components/CardBlog.jsx"));
const AboutBread = dynamic(() => import("../FixedComponent/AboutBread.jsx"));

export default function BlogPage() {
    const [blog, setBlog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_blog = "http://localhost:5000/blogPosts";
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_blog);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
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
    return (
        <>
            <AboutBread Name={" Marketplace Blog"} />
            <CardBlog blogPosts={blog} />
        </>
    );
}
