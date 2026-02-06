'use client'
import React from 'react'
import { motion } from "framer-motion";

const AboutBread = ({ Name,text}) => {
    return (
        <section className='py-5' style={{
            backgroundColor: "#EEF5FD"
        }}>
            <div className="container text-center">
                <motion.h2 className="text-4xl font-bold mb-4"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >{Name}</motion.h2>
                <motion.p
                    className="text-[#0587A7] opacity-75 text-md"
                    style={{fontWeight: '900'}}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    {text}
                </motion.p>
            </div>
        </section>
    )
}
export default AboutBread