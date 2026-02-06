'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const cardVariants = {
    hover: { y: -6 },
};

const SellerCard = ({ seller }) => {
    return (
        <motion.article
            variants={cardVariants}
            whileHover="hover"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg"
        >
            <div className="relative h-48">
                <img
                    src={seller.image}
                    alt={seller.name}
                    fill="true"
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={seller.id === 1}
                />

                {seller.verified === true ? (
                    <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Verified
                    </span>
                ) : (
                    <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Not Verified
                    </span>
                )}
            </div>

            <div className="p-6 mt-12">
                <header className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {seller.name}
                    </h2>
                    <p className="text-sm text-gray-500">{seller.mainCategory}</p>
                </header>

                <dl className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <dt>Location</dt>
                        <dd className="font-medium text-gray-800">{seller.location}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt>Rating</dt>
                        <dd className="font-medium text-gray-800">⭐ {seller.rating}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt>Products</dt>
                        <dd className="font-medium text-gray-800">{seller.products?.length}</dd>
                    </div>
                </dl>

                <Link
                    href={`/Sellers/${seller.id}`}
                    className="mt-6 block w-full text-center rounded-xl border border-gray-900 py-2 text-sm font-medium text-gray-900 transition group-hover:bg-gray-900 group-hover:text-white"
                >
                    Visit Store
                </Link>
            </div>
        </motion.article>
    );
};

const SellersData = ({ sellers }) => {
    return (
        <section className="max-w-7xl mx-auto px-6 py-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sellers.map((seller) => (
                    <SellerCard key={seller.id} seller={seller} />
                ))}
            </div>
        </section>
    );
};

export default SellersData;
