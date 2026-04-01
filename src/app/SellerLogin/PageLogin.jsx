import React from 'react'
import dynamic from "next/dynamic";

const SellerLogin = dynamic(() => import("./Components/SellerLogin"));
const PageLogin = () => {
  return (
    <>
      <SellerLogin />
    </>
  )
}

export default PageLogin
