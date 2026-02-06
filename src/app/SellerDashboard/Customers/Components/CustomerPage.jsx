"use client";

import { useEffect, useState, useMemo } from "react";

// MUI ICONS
import PeopleIcon from "@mui/icons-material/People";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function CustomerPage() {
    const [orders, setOrders] = useState([]);
    const [loggedUser, setLoggedUser] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const API_ORDERS = "http://localhost:5000/orders";
    const API_LOGGED = "http://localhost:5000/loggedUsers"; // 👈 غيره حسب API عندك

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch(API_LOGGED);
                const userData = await userRes.json();
                setLoggedUser(userData[0]);

                const orderRes = await fetch(API_ORDERS);
                const orderData = await orderRes.json();
                setOrders(orderData);

                setLoading(false);
            } catch (error) {
                alert("Error loading data:", error);
            }
        };

        fetchData();
    }, []);

    // ================================
    // FILTER ORDERS BASED ON loggedUser
    // ================================
    const sellerOrders = useMemo(() => {
        if (!loggedUser) return [];
        return orders.filter(o => o.userId === loggedUser.sellerId);
    }, [orders, loggedUser]);

    // =====================================
    // GROUP CUSTOMERS ONLY FROM sellerOrders
    // =====================================
    const customers = useMemo(() => {
        const map = {};

        sellerOrders.forEach((o) => {
            if (!map[o.customer]) {
                map[o.customer] = {
                    name: o.customer,
                    orders: 0,
                    spent: 0,
                    status: o.status,
                };
            }
            map[o.customer].orders++;
            map[o.customer].spent += o.totalPrice;
            map[o.customer].status = o.status;
        });

        return Object.values(map);
    }, [sellerOrders]);

    // FILTER BY SEARCH
    const filtered = customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <div className="p-8 space-y-8">
            {/* HEADER */}
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                    title="Total Customers"
                    value={customers.length}
                    icon={<PeopleIcon className="text-blue-600 !text-5xl" />}
                />
                <KpiCard
                    title="Total Orders"
                    value={sellerOrders.length}
                    icon={<ShoppingBagIcon className="text-green-600 !text-5xl" />}
                />
                <KpiCard
                    title="Total Revenue"
                    value={`SAR ${sellerOrders
                        .reduce((a, b) => a + b.totalPrice, 0)
                        .toFixed(2)}`}
                    icon={<AccountBalanceWalletIcon className="text-purple-600 !text-5xl" />}
                />
            </div>

            {/* SEARCH */}
            <div className="relative">
                <SearchIcon className="absolute left-3 top-3 text-gray-400" />
                <input
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700  dark:bg-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* CUSTOMERS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((customer, index) => (
                    <div
                        key={index}
                        className="group dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                    >
                        <h3 className="text-lg font-semibold">{customer.name}</h3>

                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                            Orders: <span className="font-medium">{customer.orders}</span>
                        </p>

                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Spent:{" "}
                            <span className="font-medium">
                                SAR {customer.spent.toFixed(2)}
                            </span>
                        </p>

                        <span
                            className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold 
                            ${customer.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                        >
                            {customer.status}
                        </span>

                        <a href="/SellerDashboard/Orders" className="flex items-center justify-end mt-4 text-blue-600 font-medium">
                            View Details
                            <ChevronRightIcon className="ml-1 group-hover:translate-x-1 transition-all" />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* KPI CARD COMPONENT */
function KpiCard({ title, value, icon }) {
    return (
        <div className=" dark:bg-gray-900/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <h2 className="text-2xl font-bold mt-1">{value}</h2>
            </div>
            {icon}
        </div>
    );
}
