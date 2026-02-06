import React from 'react';
import { motion } from 'framer-motion';

const RelatedPosts = ({ blogPosts, post }) => {
    // Filter out the current post
    const filteredPosts = blogPosts.filter((p) => p.id !== post.id);

    // Shuffle the filtered posts
    const shuffledPosts = filteredPosts.sort(() => 0.5 - Math.random());

    // Pick the first 3 random posts
    const randomPosts = shuffledPosts.slice(0, 4);

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {randomPosts.map((p) => (
                    <div key={p.id}>
                        <a
                            href={`/Blog/${p.id}`}
                            className="block relative rounded-xl overflow-hidden max-w-[255px] hover:cursor-pointer"
                        >
                            <motion.img
                                src={p.image}
                                alt={p.title}
                                className="w-full h-52 object-cover"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white text-center px-2">
                                {p.excerpt}
                            </div>
                        </a>
                        <h3 className="mt-2 font-semibold">{p.title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedPosts;
