"use client";
import { useState, useEffect } from "react";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";

export default function ProductsData({ products }) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [priceSort, setPriceSort] = useState("");
    const [stockFilter, setStockFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
    });

    const [loggedUser, setLoggedUser] = useState(null);

    const API_PRODUCTS = "http://localhost:5000/products";
    const API_LOGGED = "http://localhost:5000/loggedUsers";

    // ------------------ FETCH LOGGED USER ------------------
    async function fetchLoggedUser() {
        const res = await fetch(API_LOGGED);
        const data = await res.json();
        setLoggedUser(data[0]); // assuming single logged user
    }

    useEffect(() => {
        fetchLoggedUser();
    }, []);

    if (!loggedUser) {
        return (
            <div className="p-4 text-center text-gray-600">
                Loading your products...
            </div>
        );
    }

    // ------------------ FILTERING ------------------
    let filteredProducts = products.filter(
        (p) => p.sellerId  === loggedUser.sellerId  // ONLY show user products
    );
    // Search filter
    filteredProducts = filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    // Category filter
    if (category) {
        filteredProducts = filteredProducts.filter((p) => p.category === category);
    }

    // Stock filter
    if (stockFilter === "in") {
        filteredProducts = filteredProducts.filter((p) => p.stock > 0);
    }
    if (stockFilter === "out") {
        filteredProducts = filteredProducts.filter((p) => p.stock === 0);
    }

    // Price sort
    if (priceSort === "low") {
        filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
    }
    if (priceSort === "high") {
        filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
    }

    const categories = [
        ...new Set(filteredProducts.map((p) => p.category)),
    ];

    // ------------------ UPDATE PRODUCT ------------------
    async function updateProduct() {
        if (!editingProduct) return;

        await fetch(`${API_PRODUCTS}/${editingProduct}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        window.location.reload();
    }

    // ------------------ DELETE PRODUCT ------------------
    async function deleteProduct(id) {
        const confirmDelete = confirm("Are you sure you want to delete this product?");
        if (!confirmDelete) return;

        await fetch(`${API_PRODUCTS}/${id}`, {
            method: "DELETE",
        });

        window.location.reload();
    }

    return (
        <div className="p-4 w-full">

            {/* ------------------ TOP BAR ------------------ */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

                {/* Search */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2  px-3 py-2 rounded-xl shadow border">
                        <SearchIcon className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent outline-none w-full text-sm"
                        />
                    </div>

                    {/* FILTER DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm shadow"
                        >
                            <FilterListIcon fontSize="small" />
                            Filters
                        </button>

                        {showFilters && (
                            <div className="absolute mt-2 w-64 bg-white dark:bg-gray-900 border shadow-xl rounded-xl p-4 z-50">

                                {/* Category */}
                                <div className="mb-3">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border text-sm"
                                    >
                                        <option value="">All</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price */}
                                <div className="mb-3">
                                    <label className="text-sm font-medium">Price</label>
                                    <select
                                        value={priceSort}
                                        onChange={(e) => setPriceSort(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border text-sm"
                                    >
                                        <option value="">None</option>
                                        <option value="low">Low → High</option>
                                        <option value="high">High → Low</option>
                                    </select>
                                </div>

                                {/* Stock */}
                                <div className="mb-3">
                                    <label className="text-sm font-medium">Stock</label>
                                    <select
                                        value={stockFilter}
                                        onChange={(e) => setStockFilter(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border text-sm"
                                    >
                                        <option value="">All</option>
                                        <option value="in">In Stock</option>
                                        <option value="out">Out of Stock</option>
                                    </select>
                                </div>

                                {/* Apply */}
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm mt-2"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Product */}
                <a href="/SellerDashboard/AddNewProduct" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow text-sm">
                    <AddIcon />
                    Add Product
                </a>
            </div>

            {/* ------------------ TABLE ------------------ */}
            <div className="overflow-x-auto rounded-xl border shadow">
                <table className="min-w-full text-sm">
                    <thead className="text-white border-b">
                        <tr>
                            <th className="px-4 py-3 text-center">Image</th>
                            <th className="px-4 py-3 text-center">Name</th>
                            <th className="px-4 py-3 text-center">Category</th>
                            <th className="px-4 py-3 text-center">Price</th>
                            <th className="px-4 py-3 text-center">Sale Price</th>
                            <th className="px-4 py-3 text-center">Type</th>
                            <th className="px-4 py-3 text-center">Brand</th>
                            <th className="px-4 py-3 text-center">Stock</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y dark:divide-gray-700">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => (
                                <tr key={p.id} className="dark:hover:bg-gray-800">
                                    <td className="px-4 py-3 flex justify-center">
                                        <img src={p.image} className="w-16 h-19 rounded-lg border object-cover" />
                                    </td>
                                    <td className="px-4 py-3 text-center font-semibold">{p.name}</td>
                                    <td className="px-4 py-3 text-center">{p.category}</td>
                                    <td className="px-4 py-3 text-center">${p.price}</td>
                                    <td className="px-4 py-3 text-center">${p.salePrice}</td>
                                    <td className="px-4 py-3 text-center">{p.type}</td>
                                    <td className="px-4 py-3 text-center">{p.brand}</td>
                                    <td className="px-4 py-3 text-center">{p.stock}</td>

                                    {/* ACTIONS */}
                                    <td className="px-4 py-3 flex gap-3 justify-center ">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(p.id);
                                                setFormData({
                                                    name: p.name,
                                                    category: p.category,
                                                    price: p.price,
                                                    stock: p.stock,
                                                });
                                            }}
                                            className="text-blue-600 hover:underline text-lg"
                                        >
                                            <EditIcon />
                                        </button>

                                        <button
                                            onClick={() => deleteProduct(p.id)}
                                            className="text-red-600 hover:underline text-lg"
                                        >
                                            <DeleteOutlineIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-gray-500">
                                    No products found...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ------------------ EDIT MODAL ------------------ */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-[420px] shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale">

                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                Edit Product
                            </h2>

                            <button
                                onClick={() => setEditingProduct(null)}
                                className="text-gray-500 hover:text-red-500 transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* FORM */}
                        <div className="flex flex-col gap-4">

                            <label className="flex flex-col text-sm font-medium text-gray-700 dark:text-gray-300">
                                Name
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </label>

                            <label className="flex flex-col text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </label>

                            <label className="flex flex-col text-sm font-medium text-gray-700 dark:text-gray-300">
                                Price
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </label>

                            <label className="flex flex-col text-sm font-medium text-gray-700 dark:text-gray-300">
                                Stock
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) =>
                                        setFormData({ ...formData, stock: e.target.value })
                                    }
                                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </label>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end mt-6 gap-3">
                            <button
                                onClick={() => setEditingProduct(null)}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 
                               dark:bg-gray-700 dark:hover:bg-gray-600 
                               text-gray-800 dark:text-gray-200 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={updateProduct}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 
                               text-white shadow-md transition"
                            >
                                Save
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
