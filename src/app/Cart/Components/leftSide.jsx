"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function LeftSide({ cartItems, onQtyChange, onRemove }) {
    return (
        <div className="space-y-4">
            {cartItems.map(item => (
                <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 border rounded-lg p-4"
                >
                    <div className="w-full sm:w-28 h-28 bg-gray-100 rounded-md overflow-hidden">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="object-contain w-full h-full"
                        />
                    </div>

                    <div className="flex-1 flex justify-between flex-col h-full">
                        <h3 className="font-semibold text-gray-800">
                            {item.name} 
                            <span className="text-blue-800 ms-2.5">
                                ({item.category})
                            </span>
                        </h3>
                        <p className="text-gray-400">{item.description}</p>

                        <div className="flex items-center gap-3 mt-4">
                            <div className="flex items-center border rounded-md">
                                <button
                                    onClick={() => onQtyChange(item, "dec")}
                                    className="px-3 py-1"
                                >
                                    −
                                </button>
                                <span className="px-4">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => onQtyChange(item, "inc")}
                                    className="px-3 py-1"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                        <div className="font-semibold text-gray-800">
                            {(item.salePrice > 0
                                ? item.salePrice
                                : item.price) * item.quantity}{" "}
                            SAR
                            {item.salePrice > 0 && (
                                <del className="text-sm text-gray-400 ml-2">
                                    {item.price} SAR
                                </del>
                            )}
                        </div>

                        <button
                            onClick={() => onRemove(item)}
                            className="text-red-500 text-sm flex items-center gap-1"
                        >
                            <DeleteOutlineIcon fontSize="small" />
                            Remove
                        </button>
                    </div>
                </div>
            ))}

            {cartItems.length === 0 && (
                <p className="text-center text-gray-500 py-10">
                    Your cart is empty
                </p>
            )}
        </div>
    );
}
