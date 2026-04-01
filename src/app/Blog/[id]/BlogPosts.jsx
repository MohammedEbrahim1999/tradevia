"use client";

import { Box, Container, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
// Dynamic imports for components
const HeroSection = dynamic(() => import("./Components/HeroSection.jsx"));
const TagActions = dynamic(() => import("./Components/TagActions.jsx"));
const TableContent = dynamic(() => import("./Components/TableContent.jsx"));
const ArticleContent = dynamic(() => import("./Components/ArticleContent.jsx"));
const AuthorBio = dynamic(() => import("./Components/AuthorBio.jsx"));
const RelatedPosts = dynamic(() => import("./Components/RelatedPosts.jsx"));
import { useParams } from "next/navigation";

export default function BlogPostPage({ params }) {

  // Find the post by matching IDs as strings
  const { id } = useParams(); // ✅ CORRECT
  const [blog, setBlog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_blog = "http://localhost:5000/blogPosts";
  useEffect(() => {
    const fetchLoggedCustomers = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 10000));

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
  const post = blog.find((p) => String(p.id) === id);

  if (!post) {
    return (
      <div className="p-4 space-y-6 animate-pulse">

        {/* Top bar */}
        <div className="h-6 w-32 mx-auto bg-gray-300 rounded"></div>

        {/* Hero / Banner */}
        <div className="h-32 bg-gray-300 rounded-lg"></div>

        {/* Grid (products / content) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">

              {/* Image */}
              <div className="h-40 bg-gray-300 rounded-lg"></div>

              {/* Title */}
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>

              {/* Price / text */}
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>

      </div>
    );
  }

  return (
    <Box sx={{ bgcolor: "grey.50", position: "relative" }}>
      {/* Hero Section */}
      <HeroSection
        blogImg={post.image}
        blogTitle={post.title}
        blogTags={post.tags}
        blogAuthor={post.author}
        blogData={post.date}
      />

      <Container sx={{ mt: 0, pb: 12 }}>
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 4,
            p: { xs: 3, md: 6 },
            boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
          }}
        >
          {/* Blog actions & content */}
          <TagActions blogTags={post.tags} />
          <TableContent blogContent={post.content} />
          <ArticleContent blogContent={post.content} />
          <AuthorBio blogAuthor={post.author} authorJob={post.job} />
          <RelatedPosts blogPosts={blog} post={post} />
        </Box>
      </Container>

    </Box>

  );
}