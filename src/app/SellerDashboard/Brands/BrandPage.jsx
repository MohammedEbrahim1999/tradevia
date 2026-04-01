"use client";

import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/Brands";

export default function BrandPage() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setCategories(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newCategory.trim() }),
        });
        setNewCategory("");
        fetchCategories();
    };

    const handleUpdateCategory = async () => {
        if (!editCategoryName.trim()) return;
        await fetch(`${API_URL}/${editCategoryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editCategoryName.trim() }),
        });
        setEditCategoryId(null);
        fetchCategories();
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm("Delete this category?")) return;
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        fetchCategories();
    };

    return (
        <div className="min-h-screen bg-[#101828] p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold text-gray-100 mb-6">
                    Brand Management
                </h1>

                {/* Add category */}
                <div className="bg-[#1D2939] border border-[#344054] rounded-xl p-4 mb-6 flex gap-3">
                    <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter category name"
                        className="flex-1 bg-[#101828] text-gray-100 border border-[#344054] rounded-lg px-4 py-2
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={handleAddCategory}
                        className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
                    >
                        Add
                    </button>
                </div>

                {/* List */}
                {loading ? (
                    <p className="text-gray-400 text-center py-10">Loading...</p>
                ) : categories.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">
                        No Brand found
                    </p>
                ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="bg-[#1D2939] border border-[#344054] rounded-xl p-4 flex items-center justify-between hover:border-indigo-500 transition"
                            >
                                {editCategoryId === cat.id ? (
                                    <input
                                        value={editCategoryName}
                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                        className="bg-[#101828] border border-[#344054] text-gray-100 rounded-lg px-3 py-2 w-full mr-4
                                        focus:ring-2 focus:ring-indigo-500"
                                    />
                                ) : (
                                    <span className="text-gray-200 font-medium">
                                        {cat.name}
                                    </span>
                                )}

                                <div className="flex gap-2 ml-4">
                                    {editCategoryId === cat.id ? (
                                        <>
                                            <button
                                                onClick={handleUpdateCategory}
                                                className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditCategoryId(null)}
                                                className="px-3 py-1.5 text-sm rounded-lg bg-gray-600 hover:bg-gray-500 text-white"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditCategoryId(cat.id);
                                                    setEditCategoryName(cat.name);
                                                }}
                                                className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="px-3 py-1.5 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
