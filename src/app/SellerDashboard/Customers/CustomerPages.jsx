'use client'
import React from 'react'
import dynamic from 'next/dynamic';
const CustomerPage = dynamic(() => import("./Components/CustomerPage"), { ssr: false });
const CustomerPages = () => {
  return (
    <>
      <CustomerPage />
    </>
  )
}

export default CustomerPages
