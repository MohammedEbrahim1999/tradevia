"use client";
import React from 'react'
import dynamic from "next/dynamic";
const PhoneLogin = dynamic(() => import("./Components/PhoneLogin"));
const page = () => {
  return (
    <>
        <PhoneLogin />
    </>
  )
}

export default page
