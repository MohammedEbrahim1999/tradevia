"use client";

import { useEffect, useState } from "react";

export default function useUserData({ API_TOTALPRICE, API_LOGGED }) {
    const [totalPrice, setTotalPrice] = useState([]);
    const [loggedCustomers, setLoggedCustomers] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [resTotal, resLogged] = await Promise.all([
                    fetch(API_TOTALPRICE, { cache: "no-store" }),
                    fetch(API_LOGGED, { cache: "no-store" }),
                ]);
                if (!resTotal.ok || !resLogged.ok) throw new Error("Failed to fetch user data");

                const totalPriceData = await resTotal.json();
                const loggedCustomersData = await resLogged.json();

                setLoggedCustomers(loggedCustomersData);

                if (Array.isArray(loggedCustomersData) && loggedCustomersData.length > 0) {
                    const userToken = loggedCustomersData[0].userTokens;
                    const filteredTotal = (Array.isArray(totalPriceData) ? totalPriceData : []).filter(
                        (order) => order.userTokens === userToken
                    );
                    setTotalPrice(filteredTotal);
                } else {
                    setTotalPrice([]);
                }
            } catch {
                // keep page alive
            }
        };

        fetchUserData();
    }, [API_TOTALPRICE, API_LOGGED]);

    return { loggedCustomers, totalPrice };
}
