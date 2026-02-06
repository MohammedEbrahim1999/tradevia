import React from 'react';

const HeroSection = ({ blogImg, blogTitle, blogTags, blogAuthor, blogData }) => {
    return (
        <div className="relative w-full overflow-hidden h-[300px] md:h-[500px]">
            {/* Background Image */}
            <img
                src={blogImg}
                alt={blogTitle}
                className="w-full h-full object-cover brightness-[55%] transition-transform duration-500 hover:scale-105"
            />

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-end items-center text-center px-2 bg-gradient-to-b from-black/20 to-black/70 pb-16 md:pb-32">
                {/* Tags */}
                <div className="flex flex-row gap-2 mb-2 flex-wrap justify-center">
                    {blogTags.map((tag) => (
                        <span
                            key={tag}
                            className="cursor-pointer text-primary font-bold text-sm px-3 py-1 rounded-full bg-gray-300 transition-all hover:bg-primary hover:text-white"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Blog Title */}
                <h2 className="text-white font-bold mb-2 text-2xl md:text-5xl leading-tight drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
                    {blogTitle}
                </h2>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                        {blogAuthor.charAt(0)}
                    </div>
                    <p className="text-gray-100">
                        {blogAuthor} • {blogData}
                    </p>
                </div>

                {/* Scroll Down */}
                <p className="mt-2 text-gray-100 animate-bounce">⬇ Scroll Down</p>
            </div>
        </div>
    );
};

export default HeroSection;
