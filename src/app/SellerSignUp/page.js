import React from 'react'
import dynamic from "next/dynamic";
const SellerSignup = dynamic(() => import("./Components/SellerSignup"));
const page = () => {
    return (
        <>
            <SellerSignup />
        </>
    )
}

export default page
