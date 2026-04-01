"use client";
import React from 'react'
import dynamic from "next/dynamic";
const DiscountsPage = dynamic(() => import("./Components/DiscountsPage"), { ssr: false });
const DiscountData = () => {
    return (
        <>
            <DiscountsPage />
        </>
    )
}

export default DiscountData
