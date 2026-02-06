import React from 'react'
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
const ConnectionData = ({contactData}) => {
    return (
        <>
            {/* Customer Service Info */}
            <div className="space-y-10">
                <div className="bg-white rounded-2xl shadow-md p-8">
                    <h3 className="text-2xl font-semibold text-gray-900">
                        {contactData[0]?.customerSupport || "Customer Support"}
                    </h3>
                    <p className="mt-3 text-sm text-gray-600">{contactData[0]?.subTitle} </p>
                    <ul className="mt-8 space-y-6 text-sm">
                        <li className="flex items-start gap-4">
                            <EmailIcon className="text-gray-800 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">{contactData[0]?.emailName}</p>
                                <p className="text-gray-600">{contactData[0]?.email}</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <PhoneIcon className="text-gray-800 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">{contactData[0]?.phoneName}</p>
                                <p className="text-gray-600">{contactData[0]?.phone}</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <AccessTimeIcon className="text-gray-800 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">{contactData[0]?.workingHoursName}</p>
                                <p className="text-gray-600">
                                    {contactData[0]?.workingHours}
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <LocationOnIcon className="text-gray-800 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">{contactData[0]?.addressName}</p>
                                <p className="text-gray-600">{contactData[0]?.address}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}
export default ConnectionData