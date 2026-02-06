'use client'
import React from 'react'
import dynamic from 'next/dynamic'
const Orders = dynamic(() => import("./Components/Orders"), { ssr: false });
const page = () => {
    
    return (
        <>
            <Orders />
        </>
    )
}

export default page
