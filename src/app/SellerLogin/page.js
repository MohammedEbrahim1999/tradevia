import React from 'react'
import dynamic from "next/dynamic";

const SellerLogin = dynamic(() => import("./Components/SellerLogin"));
const page = () => {
  return (
    <>
      <SellerLogin />
    </>
  )
}

export default page
