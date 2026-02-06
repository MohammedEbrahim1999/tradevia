import React from 'react'
const ContactInfo = ({ contacts }) => {
    return (
        <div className='container mt-4'>
            <p className='fw-bold text-secondary text-center'> Have questions? Get in touch with us through the form, or reach us at our office. We’d love to hear from you! </p>
            <div className="flex gap-2 my-4 justify-center flex-wrap flex-lg-wrap">
                {contacts.map((item, idx) => {
                    return (
                        <a  key={idx} className='shadow-sm p-2 rounded flex flex-row justify-center items-center text-decoration-none' style={{
                            backgroundColor: "#0587a719",
                            border: "2px solid #45465758"
                        }}>

                            <div className='mb-0 flex flex-row gap-2 items-center p-2 pb-0' style={{borderRight: "1px solid #77777789"}}>
                                <h6> {item.icon} </h6>
                                <h6 >
                                    {item.title}
                                </h6>
                            </div>
                            <p className='p-2 mb-0'>
                                {item.desc}
                            </p>
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
export default ContactInfo