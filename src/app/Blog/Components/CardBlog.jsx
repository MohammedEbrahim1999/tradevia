import React from "react";

const CardBlog = ({ blogPosts }) => {
    return (
        <section className="py-12 bg-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
                <h2 className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-10">
                    Stay updated with the latest trends, guides, and seller success stories from our marketplace.
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                        <div
                            key={post.id}
                            className="flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                        >
                            {/* Image */}
                            <div className="relative h-56">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                                <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-3 left-4 text-white">
                                    <p className="text-xs opacity-80">{post.date} | {post.author}</p>
                                    <h3 className="text-lg font-bold">{post.title}</h3>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col flex-grow p-4">
                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                    {post.excerpt}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full hover:bg-blue-700 transition-colors"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <a
                                        href={`/Blog/${post.id}`}
                                        className="inline-block px-4 py-2 text-sm border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                                    >
                                        Read More
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CardBlog;
