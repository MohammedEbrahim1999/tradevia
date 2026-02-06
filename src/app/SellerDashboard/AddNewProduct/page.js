'use client'
import React,{useState,useEffect} from 'react'
import dynamic from 'next/dynamic';
const AddNew = dynamic(() => import("./Components/AddNew"), { ssr: false });

const page = () => {
    const [loggedUser, setLoggedUser] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    useEffect(() => {
        fetch('http://localhost:5000/loggedUsers')
            .then(res => {
                if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
                return res.json()
            })
            .then(data => setLoggedUser(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])
    return (
        <>
            <AddNew loggedUser={loggedUser}/>
        </>
    )
}

export default page
