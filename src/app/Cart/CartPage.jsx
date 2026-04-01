"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import AboutBread from "../FixedComponent/AboutBread";
const LeftSide = dynamic(() => import("./Components/leftSide"), { ssr: false });
const RightSide = dynamic(() => import("./Components/rightSide"), { ssr: false });
const BottomSide = dynamic(() => import("./Components/bottomSide"), { ssr: false });
const API_Cart = "http://localhost:5000/cart";
const API_loggedUser = "http://localhost:5000/loggedCustomers";
const API_Shipping = "http://localhost:5000/shipping";
const API_totalPrice = "http://localhost:5000/totalPrice";

export default function Page() {
    const [cartItems, setCartItems] = useState([]);
    const [shipping, setShipping] = useState([]);
    const [loggedCustomers, setLoggedCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userToken = loggedCustomers?.[0]?.userTokens;

    /* ================= FETCH DATA ================= */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cartRes, userRes, shipRes] = await Promise.all([
                    fetch(API_Cart),
                    fetch(API_loggedUser),
                    fetch(API_Shipping),
                ]);

                if (!cartRes.ok || !userRes.ok || !shipRes.ok) {
                    throw new Error("Failed to fetch data");
                }

                const cartData = await cartRes.json();
                const userData = await userRes.json();
                const shippingData = await shipRes.json();

                const token = userData[0]?.userTokens;
                const userCart = cartData.filter(
                    item => item.userTokens === token
                );

                setCartItems(userCart);
                setLoggedCustomers(userData);
                setShipping(shippingData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /* ================= HELPERS ================= */
    const getItemPrice = (item) =>
        item.salePrice > 0 ? Number(item.salePrice) : Number(item.price);
    /* ================= UPDATE TOTAL PRICE ================= */
    const updateTotalPrice = async (updatedCart) => {
        const newTotal = updatedCart.reduce(
            (sum, item) => sum + getItemPrice(item) * item.quantity,
            0
        );
        const res = await fetch(API_totalPrice);
        const totalData = await res.json();
        const userTotal = totalData.find(t => t.userTokens === userToken);
        if (userTotal) {
            await fetch(`${API_totalPrice}/${userTotal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ totalPrice: newTotal }),
            });
        }
    };
    /* ================= CHANGE QUANTITY ================= */
    const changeQuantity = async (item, type) => {
        const newQty =
            type === "inc"
                ? item.quantity + 1
                : Math.max(1, item.quantity - 1);
        await fetch(`${API_Cart}/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: newQty }),
        });
        const updatedCart = cartItems.map(ci =>
            ci.id === item.id ? { ...ci, quantity: newQty } : ci
        );
        setCartItems(updatedCart);
        updateTotalPrice(updatedCart);
    };
    /* ================= REMOVE FROM CART ================= */
    const removeFromCart = async (item) => {
        await fetch(`${API_Cart}/${item.id}`, { method: "DELETE" });

        const updatedCart = cartItems.filter(ci => ci.id !== item.id);

        setCartItems(updatedCart);
        updateTotalPrice(updatedCart);
    };
    /* ================= UI TOTAL ================= */
    const totalPrice = useMemo(() => {
        return cartItems.reduce(
            (sum, item) => sum + getItemPrice(item) * item.quantity,
            0
        );
    }, [cartItems]);
    if (loading) return <p className="text-center py-10">Loading...</p>;
    if (error) return <p className="text-center py-10 text-red-500">{error}</p>;
    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <AboutBread Name={"Shopping Cart"} text={"Where Every Cart Feels Like Home"} />
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
                <div className="flex-1 bg-white rounded-xl p-5 shadow-sm h-fit">
                    <LeftSide
                        cartItems={cartItems}
                        onQtyChange={changeQuantity}
                        onRemove={removeFromCart}
                    />
                </div>
                <div className="w-full lg:w-[420px] bg-white rounded-xl p-5 shadow-sm">
                    <RightSide total={totalPrice} shipping={shipping} cartItems={cartItems} />
                </div>
            </div>
            <div className="max-w-6xl mx-auto mt-8">
                <BottomSide />
            </div>
        </div>
    );
}