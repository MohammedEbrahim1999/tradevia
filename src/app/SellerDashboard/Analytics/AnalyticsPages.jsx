"use client";
import dynamic from "next/dynamic";
const AnalyticsPage  = dynamic(() => import("./Components/AnalyticsPage"), { ssr: false });
const AnalyticsPages = () => {
  return (
    <>
      <AnalyticsPage />
    </>
  )
}

export default AnalyticsPages
