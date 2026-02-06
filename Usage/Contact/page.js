import React from 'react'
import dynamic from "next/dynamic";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
const AboutBread = dynamic(() => import("../FixedComponent/AboutBread.jsx"));
const ContactInfo = dynamic(() => import("./Component/ContactInfo.jsx"));
const FormContact = dynamic(() => import("./Component/FormContact.jsx"));
const contacts = [
    {
        icon: <LocationOnIcon fontSize="medium" color="primary" />,
        title: "Address",
        desc: "Mansoura Eldkahlia, Egypt",
    },
    {
        icon: <PhoneIcon fontSize="medium" color="primary" />,
        title: "Phone",
        desc: "+201021891089",
    },
    {
        icon: <EmailIcon fontSize="medium" color="primary" />,
        title: "Email",
        desc: "Tradevia@gmail.com",
    },
]
const page = () => {
    return (
        <>
            <AboutBread Name="Contact Us" />
                <ContactInfo contacts={contacts} />
                <FormContact />
        </>
    )
}

export default page
