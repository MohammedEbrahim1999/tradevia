"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const SnackItem = dynamic(() => import("../../../FixedComponent/SnackItem"));

export default function AddNew({ loggedUser }) {
    const API_BASE = "http://localhost:5000/products";
    const API_Categories = "http://localhost:5000/categories";
    const [categories, setCategorries] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                const res = await fetch(API_Categories);
                if (!res.ok) throw new Error("Failed to fetch logged customers");
                const data = await res.json();
                setCategorries(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);
    console.log(categories)
    const [snack, setSnack] = useState({
        open: false,
        message: "",
        severity: "error",
    });

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        salePrice: "",
        onSale: false,
        stock: "",
        brand: "",
        type: "",
        category: "",
        image: "",
        sku: "",
        rating: "",
        reviewCount: "",
        images: [],
        specs: {
            screen: "",
            resolution: "",
            storage: "",
            ram: "",
            processor: "",
            gpu: " ",
            battery: "",
            charging: "",
            os: "",
            connectivity: ["", ""],
            ports: [""],
            cameraFront: "",
            cameraBack: "",
            audio: " ",
            sensors: [" ", "", ""],
            weight: "",
            dimensions: "",
            color: "",
            releaseYear: "",
            warranty: "",
        },
        date: "",
        slug: "",
        returnPolicy: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.price || !form.stock) {
            setSnack({
                open: true,
                message: "Please fill required fields.",
                severity: "error",
            });
            return;
        }

        if (form.onSale && !form.salePrice) {
            setSnack({
                open: true,
                message: "Please enter sale price.",
                severity: "error",
            });
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            // 1) Get products
            const resProducts = await fetch(API_BASE);
            const products = await resProducts.json();

            // 2) Generate ID
            let nextId = 1;
            if (products.length > 0) {
                nextId = Number(products[products.length - 1].id) + 1;
            }

            // 3) Create product object
            const newProduct = {
                id: String(nextId),
                sellerId: Number(loggedUser[0]?.sellerId),
                name: form.name,
                description: form.description,
                price: String(form.price),
                stock: Number(form.stock),
                category: form.category,
                image: form.image,
                ...(form.onSale && { salePrice: String(form.salePrice) }),
                type: form.type,
                brand: form.brand,
                sku: form.sku,
                rating: form.rating ? Number(form.rating) : 0,
                reviewCount: form.reviewCount ? Number(form.reviewCount) : 0,
                images: form.images || [],
                specs: form.specs || {},
                date: form.date,
                slug: form.slug,
                returnPolicy: form.returnPolicy
            };

            // 4) POST product
            const res = await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct),
            });

            if (!res.ok) throw new Error("Failed to add product");

            setSnack({
                open: true,
                message: "Product added successfully!",
                severity: "success",
            });

            setForm({
                name: "",
                description: "",
                price: "",
                salePrice: "",
                onSale: false,
                stock: "",
                category: "",
                image: "",
                type: "",
                brand: "",
                sku: "",
                rating: "",
                reviewCount: "",
                images: [],
                specs: {
                    screen: "",
                    resolution: "",
                    storage: "",
                    ram: "",
                    processor: "",
                    gpu: " ",
                    battery: "",
                    charging: "",
                    os: "",
                    connectivity: ["", ""],
                    ports: [""],
                    cameraFront: "",
                    cameraBack: "",
                    audio: " ",
                    sensors: [" ", "", ""],
                    weight: "",
                    dimensions: "",
                    color: "",
                    releaseYear: "",
                    warranty: "",
                },
                date: "",
                slug: "",
                returnPolicy: ""
            });
        } catch (error) {
            alert(error);
            setSnack({
                open: true,
                message: "Error adding product!",
                severity: "error",
            });
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full p-6">

            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    Add New Product
                </h1>
                <p className="text-white dark:text-white mt-1">
                    Fill in the product details below.
                </p>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 w-full"
            >

                {/* NAME */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">
                        Product Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-4 rounded-lg border dark:bg-gray-800"
                        placeholder="Enter product name"
                    />
                </div>

                {/* DESCRIPTION */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows={4}
                        value={form.description}
                        onChange={handleChange}
                        className="w-full p-4 rounded-lg border dark:bg-gray-800"
                        placeholder="Product description"
                    />
                </div>

                {/* PRICE + STOCK */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            placeholder="Product price"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Stock
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={form.stock}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            placeholder="Units available"
                        />
                    </div>
                </div>

                {/* SALE TOGGLE */}
                <div className="mt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="onSale"
                            checked={form.onSale}
                            onChange={handleChange}
                            className="w-5 h-5 accent-blue-600"
                        />
                        <span className="font-semibold">
                            Product on Sale
                        </span>
                    </label>
                </div>

                {/* SALE PRICE */}
                {form.onSale && (
                    <div className="mt-4">
                        <label className="block text-sm font-semibold mb-2">
                            Sale Price
                        </label>
                        <input
                            type="number"
                            name="salePrice"
                            value={form.salePrice}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            placeholder="Discounted price"
                        />
                    </div>
                )}

                {/* CATEGORY */}
                <div className="mt-6 mb-6 flex items-center gap-8 w-full">
                    <div className="flex flex-col w-6/12">
                        <label className="block text-sm font-semibold mb-2">
                            Category
                        </label>
                        {/* <input
                            type="text"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            placeholder="Electronics, Clothing..."
                        /> */}
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border bg-[#101828]"
                        >
                            {categories.map((cat, index) => {
                                return (
                                    <option value={cat.title} key={index}>{cat.title}</option>
                                )
                            })}
                        </select>
                    </div>
                    <div className="flex flex-col w-6/12">
                        <label className="block text-sm font-semibold mb-2">
                            Select Type Of Product
                        </label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border "
                        >
                            <option value="" className="bg-[#101828] text-white" disabled >Select Type</option>
                            <option value="New Arrival" className="bg-[#101828] text-white">New Arrivals</option>
                            <option value="Best Sellers" className="bg-[#101828] text-white">Best Sellers</option>
                            <option value="Special Offers" className="bg-[#101828] text-white">Special Offers</option>
                        </select>
                    </div>
                    <div className="flex flex-col w-6/12">
                        <label className="block text-sm font-semibold mb-2">
                            Enter Brand Of Product
                        </label>
                        <input
                            type="text"
                            name="brand"
                            value={form.brand}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            placeholder="Apple, Samsung..."
                        />
                    </div>

                </div>
                <div className="mt-6 mb-6 flex items-center gap-8 w-full">
                    <div className="flex flex-col w-6/12">
                        <label className="block text-sm font-semibold mb-2">
                            Enter SKU Of Product
                        </label>
                        <input
                            type="text"
                            name="sku"
                            value={form.sku}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            placeholder="Enter SKU (Start with SKU- and end with @storeName)"
                        />
                    </div>
                    <div className="flex flex-col w-6/12">
                        <label className="block text-sm font-semibold mb-2">
                            Enter Rating Of Product
                        </label>
                        <input
                            type="number"
                            name="rating"
                            value={form.rating}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            placeholder="Enter Rating (1-5)"
                        />
                    </div>
                    <div className="flex flex-col w-6/12">
                        <label className="block text-sm font-semibold mb-2">
                            Enter Review Count Of Product
                        </label>
                        <input
                            type="number"
                            name="reviewCount"
                            value={form.reviewCount}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            placeholder="Enter Review Count"
                        />
                    </div>
                </div>
                <div className="mt-6 mb-6 flex items-center gap-8 w-full">
                    <div className="flex flex-col w-6/12">
                        <label className="block text-sm font-semibold mb-2">
                            Enter Links Of Images
                        </label>
                        <textarea
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            value={form.images.join("\n")}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    images: e.target.value
                                        .split("\n")
                                        .map(x => x.trim())
                                        .filter(Boolean),
                                })
                            }
                            rows={5}
                            placeholder="One image URL per line"
                        />
                    </div>
                    <div className="flex flex-col w-6/12">
                        <label className="block text-sm font-semibold mb-2">
                            Enter Specifications Of Product
                        </label>
                        <textarea
                            className="w-full p-1 rounded-lg border dark:bg-gray-800"
                            value={Object.entries(form.specs)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join("\n")}
                            onChange={(e) => {
                                const lines = e.target.value.split("\n");
                                const newSpecs = {};

                                lines.forEach(line => {
                                    const [key, ...rest] = line.split(":");
                                    if (!key) return;
                                    newSpecs[key.trim()] = rest.join(":").trim();
                                });

                                setForm({ ...form, specs: newSpecs });
                            }}
                            rows={6}
                        />

                    </div>
                </div>
                <div className="mt-6 mb-6 flex items-center gap-8 w-full">
                    <div className="flex flex-col w-3/12">
                        <label className="block text-sm font-semibold mb-2">
                            Choose Date Of Creation Of Product
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                        />
                    </div>
                    <div className="flex flex-col w-4/12">
                        <label className="block text-sm font-semibold mb-2">
                            Enter Slug For Product
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            placeholder="Enter Slug For Product"
                        />
                    </div>
                    <div className="flex flex-col w-6/12">
                        <label className="block text-sm font-semibold mb-2">
                            Enter return Policy For Product
                        </label>
                        <input
                            type="text"
                            name="returnPolicy"
                            value={form.returnPolicy}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border dark:bg-gray-800"
                            placeholder="Enter return Policy for Product"
                        />
                    </div>
                </div>
                {/* IMAGE */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold mb-2">
                        Image URL
                    </label>
                    <input
                        type="text"
                        name="image"
                        value={form.image}
                        onChange={handleChange}
                        className="w-full p-4 rounded-lg border dark:bg-gray-800"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                {/* SUBMIT */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg"
                >
                    {loading ? "Adding..." : "Add Product"}
                </button>
            </form>

            <SnackItem
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={() => setSnack({ ...snack, open: false })}
            />
        </div>
    );
}
