"use client";
import StoreIcon from '@mui/icons-material/Store';
import { useState,useEffect } from 'react';
export default function TopBar() {
    const [data,setData]=useState([]);
    useEffect(()=>{
        fetch('http://localhost:5000/topBar')
        .then(res=>res.json())
        .then(data=>setData(data))
    },[])
    return (
        <div className="bg-[#0587a7] text-white py-2 px-3 lg:px-8">
            <div className="container mx-auto">
                <div className="flex flex-row items-center justify-between gap-3 md:gap-1">
                    <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                        <p className="hidden lg:block mb-0"> {data[0]?.ship} </p>
                        <span
                            className="block lg:hidden mb-0 cursor-pointer"
                            title="Zero Shipping, Easy Returns"
                        >
                            {data[0]?.details}
                        </span>
                        <a href="/Cart" className="text-black font-bold underline">
                            {data[0]?.order}
                        </a>
                    </div>
                    <div className="flex flex-nowrap items-center gap-2 justify-center md:justify-end text-center md:text-right">
                        <a href="/SellerLogin" className="flex items-center gap-1 text-white no-underline">
                            <StoreIcon /> {data[0]?.beSeller}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
