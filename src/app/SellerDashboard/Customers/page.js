'use client'
import React from 'react'
import dynamic from 'next/dynamic';
const CustomerPage = dynamic(() => import("./Components/CustomerPage"), { ssr: false });
const page = () => {
  return (
    <>
      <CustomerPage />
    </>
  )
}

export default page
