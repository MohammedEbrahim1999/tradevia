"use client";
import dynamic from "next/dynamic";
const AnalyticsPage  = dynamic(() => import("./Components/AnalyticsPage"), { ssr: false });
const page = () => {
  return (
    <>
      <AnalyticsPage />
    </>
  )
}

export default page
