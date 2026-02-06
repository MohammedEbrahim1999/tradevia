'use client'
import React,{useState,useEffect} from 'react'
import dynamic from 'next/dynamic'
const ProductsData = dynamic(() => import("./Components/ProductsData"), { ssr: false });
const page = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(res => {
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
        return res.json()
      })
      .then(data => setProducts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])
  return (
    <>
      <ProductsData products={products} />
    </>
  )
}

export default page
