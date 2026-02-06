"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, ShowChart, Inventory2, NotificationsActive, } from "@mui/icons-material";

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Bar, BarChart, ResponsiveContainer, } from "recharts";

const salesData = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3200 },
    { month: "Mar", sales: 2900 },
    { month: "Apr", sales: 4500 },
    { month: "May", sales: 5000 },
    { month: "Jun", sales: 6100 },
    { month: "Jul", sales: 7000 },
];

const ordersData = [
    { day: "Sun", orders: 30 },
    { day: "Mon", orders: 45 },
    { day: "Tue", orders: 50 },
    { day: "Wed", orders: 40 },
    { day: "Thu", orders: 65 },
    { day: "Fri", orders: 70 },
    { day: "Sat", orders: 55 },
];

export default function SellerDashboardMain() {
    const processedData = salesData.map((d, i) => {
        if (i === 0) return { ...d, up: d.sales, down: null }; // first point is "up" by default

        const prev = salesData[i - 1].sales;
        return {
            ...d,
            up: d.sales > prev ? d.sales : null,     // green segment
            down: d.sales < prev ? d.sales : null,   // red segment
        };
    });
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([]);
    const [pending, setpending] = useState([]);
    const [loggedUser, setLoggedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");    // 🔍 NEW

    const API_ORDERS = "http://localhost:5000/orders";
    const API_USERS = "http://localhost:5000/loggedUsers";
    const Api_Products = "http://localhost:5000/products";
    useEffect(() => {
        fetchAllData();
    }, []);
    const fetchAllData = async () => {
        try {
            const userRes = await fetch(API_USERS);
            const ordersRes = await fetch(API_ORDERS);
            const productsRes = await fetch(Api_Products);

            if (!userRes.ok || !ordersRes.ok)
                throw new Error("Failed to fetch data");

            const userData = await userRes.json();
            const ordersData = await ordersRes.json();
            const productData = await productsRes.json();

            setLoggedUser(userData);
            setProducts(productData);

            const filteredOrders = ordersData.filter(
                (o) => o.userId === userData[0]?.sellerId
            );
            const filteredProducts = productData.filter(
                (o) => o.sellerId === userData[0]?.sellerId
            );
            const pendingOrders = ordersData.filter(
                (o) =>
                    o.userId === userData[0]?.sellerId && o.status === "Pending"
            );
            setProducts(filteredProducts);
            setOrders(filteredOrders);
            setpending(pendingOrders);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    let total = 0;

    for (const order of orders) {
        total += order?.totalPrice || 0;
    }


    return (
        <div className="min-h-screen p-3">

            {/* TOP CARDS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { icon: <ShowChart className="text-blue-500 text-4xl" />, label: "Total Sales", value: total },
                    { icon: <ShoppingCart className="text-green-500 text-4xl" />, label: "Orders", value: orders.length },
                    { icon: <NotificationsActive className="text-yellow-500 text-4xl" />, label: "Pending", value: pending.length },
                    { icon: <Inventory2 className="text-purple-500 text-4xl" />, label: "Products", value: products.length },
                ].map((item, index) => (
                    <div
                        key={index}
                        className="dark:bg-gray-800 text-white p-4 rounded-xl shadow flex items-center gap-4"
                    >
                        {item.icon}
                        <div>
                            <p className="text-white text-sm">{item.label}</p>
                            <h2 className="text-xl font-bold text-white dark:text-white">{item.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">

                {/* Sales Chart */}
                <div className=" dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h2 className="text-lg font-semibold text-white dark:text-white mb-3">
                        Sales Overview
                    </h2>
                    <div className="w-full h-[250px] sm:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    segment={(points, index) => {
                                        if (!points || !points[0] || !points[1]) return null; // safety check
                                        const x1 = points[0].x;
                                        const y1 = points[0].y;
                                        const x2 = points[1].x;
                                        const y2 = points[1].y;


                                        return <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={3} />;
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                </div>

                {/* Orders Chart */}
                <div className=" dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h2 className="text-lg font-semibold text-white dark:text-black mb-3">
                        Weekly Orders
                    </h2>
                    <div className="w-full h-[250px] sm:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ordersData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="orders" fill="white" activeBar={{ fill: "green" }} radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* RECENT ORDERS */}
            <div className="mt-6 dark:bg-gray-800 p-4 rounded-xl shadow">
                <h2 className="text-lg font-semibold text-white dark:text-white mb-4">
                    Recent Orders
                </h2>

                {/* Scrollable Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[550px] text-sm text-center">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="py-2">Order ID</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => {
                                return (
                                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                                        <td className="py-2">{order.orderId}</td>
                                        <td>{order.customer}</td>
                                        <td className="text-green-500">{order.status}</td>
                                        <td>{order.totalPrice}</td>
                                    </tr>
                                );
                            })}

                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <td className="py-2">#1022</td>
                                <td>Fatimah</td>
                                <td className="text-yellow-400">Pending</td>
                                <td>SAR 145</td>
                            </tr>
                            <tr>
                                <td className="py-2">#1021</td>
                                <td>Mohammed</td>
                                <td className="text-red-500">Cancelled</td>
                                <td>SAR 89</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
