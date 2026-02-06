'use client'
import React from 'react'
import dynamic from 'next/dynamic'
const SellerDashboardMain = dynamic(() => import("./Navigate/SellerDashboardMain"), { ssr: false }); 
const page = () => {
    
    return (
        <>
            <SellerDashboardMain />
        </>
    )
}

export default page
