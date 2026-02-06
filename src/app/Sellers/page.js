'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AboutBread from '../FixedComponent/AboutBread'

const SellersData = dynamic(() => import('./Components/SellersData'), { ssr: false })

const Page = () => {
    const [sellers, setSellers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_sellers = "http://localhost:5000/sellers"
    const API_products = "http://localhost:5000/products"

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sellersRes, productsRes] = await Promise.all([
                    fetch(API_sellers),
                    fetch(API_products)
                ])

                if (!sellersRes.ok || !productsRes.ok) {
                    throw new Error("Failed to fetch data")
                }

                const sellersData = await sellersRes.json()
                const productsData = await productsRes.json()

                // 🔥 Attach products to each seller
                const sellersWithProducts = sellersData.map(seller => {
                    const sellerProducts = productsData.filter(
                        product => product.sellerId === seller.id
                    )

                    return {
                        ...seller,
                        products: sellerProducts,               // array of products
                        productsCount: sellerProducts.length   // optional helper
                    }
                })

                setSellers(sellersWithProducts)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])
    if (loading) return <p className="text-center py-10">Loading...</p>
    if (error) return <p className="text-center py-10 text-red-500">{error}</p>

    return (
        <>
            <AboutBread
                Name="Sellers"
                text="Discover trusted sellers and brands offering high-quality products across multiple categories."
            />
            <SellersData sellers={sellers} />
        </>
    )
}

export default Page
