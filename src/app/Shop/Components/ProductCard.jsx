"use client";

import Link from "next/link";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function ProductCard({
    product,
    favorites,
    toggleFavorite,
    handleAddToCart,
    loggedCustomers,
}) {
    const isOnSale =
        product.salePrice && product.salePrice > 0 && product.salePrice < product.price;

    const discount = isOnSale
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : null;
    
    return (
        <div className="relative flex h-full flex-col rounded-2xl border border-blue-100 bg-white p-[6px] transition hover:shadow-lg">
            {/* Favorite */}
            <div className="absolute right-4 top-4 z-40">
                <button
                    aria-label="Add to favorites"
                    onClick={() => toggleFavorite?.(product.id, product, loggedCustomers)}
                    className={`p-1 rounded-md transition text-white
                        ${favorites[product.id]
                            ? "bg-red-500"
                            : "bg-[#0587A7] hover:bg-[#05868e]"}
                    `}
                >
                    {favorites[product.id] ? (
                        <FavoriteIcon fontSize="small" />
                    ) : (
                        <FavoriteBorderIcon fontSize="small" />
                    )}
                </button>
            </div>

            {/* Image */}
            <Link href={`/Shop/${product.id}`}>
                <div className="relative flex h-[240px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#E5E7EB] p-4">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                    />

                    {discount && (
                        <span className="absolute left-2 top-2 rounded-md bg-[#0587A7] px-2 py-1 text-sm font-semibold text-white">
                            Sale -{discount}%
                        </span>
                    )}

                    {product.type && (
                        <span className="absolute right-2 bottom-2 rounded-md bg-[#bcc2c3] px-2 py-1 text-sm font-semibold text-black">
                            {product.type}
                        </span>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="flex flex-grow flex-col p-2 pt-0">
                <h3 className="mb-3 mt-5 line-clamp-1 text-md font-bold text-black">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg font-medium text-[#0587A7]">
                        {isOnSale ? product.salePrice : product.price} SAR
                    </span>
                    {product.salePrice > 0 && (
                        <span className="font-medium text-[#C9C9C9] line-through">
                            {product.price} SAR
                        </span>
                    )}
                </div>

                {/* Stock */}
                {product.stock > 0 ? (
                    <span className="mb-2 text-gray-500">
                        Available In Stock
                    </span>
                ) : (
                    <span className="mb-2 text-red-800">
                        Out of Stock
                    </span>
                )}

                {/* Prime */}
                <div className="mb-4 w-fit rounded-2xl bg-[#0587A7] px-3 py-1 text-xs font-semibold text-white">
                    ✔ Prime FREE Delivery
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-[10px]">
                    <Link
                        href={`/product/${product.id}`}
                        className="rounded-md bg-[#E5E7EB] p-2 text-black hover:bg-[#e1e2e6]"
                        aria-label={`View ${product.name}`}
                    >
                        <OpenInNewIcon fontSize="small" />
                    </Link>

                    <button
                        disabled={product.stock === 0}
                         onClick={() => handleAddToCart?.(product)}
                        className="w-full rounded-md bg-[#0587A7] py-[6px] font-medium text-white transition hover:bg-[#05868e] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Add to cart
                    </button>
                </div>
            </div>
        </div>
    );
}
