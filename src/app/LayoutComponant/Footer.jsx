"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Facebook,
    Instagram,
    Twitter,
    LinkedIn,
    LocationOn,
    Phone,
    Email,
} from "@mui/icons-material";

/* ================= FOOTER ================= */

export default function Footer() {
    const API_Footer = "http://localhost:5000/Footer";
    const API_mainHeader = "http://localhost:5000/mainHeader";

    const [footerData, setFooterData] = useState([]);
    const [mainHeaderData, setMainHeaderData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(API_Footer);
            const res1 = await fetch(API_mainHeader);
            setFooterData(await res.json());
            setMainHeaderData(await res1.json());
        };

        fetchData();
    }, []);

    return (
        <footer className="bg-[#0B0F19] text-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">

                {/* ================= Brand ================= */}
                <div className="lg:col-span-4">
                    <h2 className="text-2xl font-semibold text-white">
                        {footerData[0]?.footerBadge}
                        <span className="text-primary ml-1">
                            {footerData[0]?.store}
                        </span>
                    </h2>

                    <p className="mt-4 text-sm max-w-xs">
                        {footerData[0]?.footerDescription}
                    </p>

                    <div className="flex gap-3 mt-6">
                        <SocialIcon href={footerData[0]?.facebook} Icon={Facebook} />
                        <SocialIcon href={footerData[0]?.instagram} Icon={Instagram} />
                        <SocialIcon href={footerData[0]?.twitter} Icon={Twitter} />
                        <SocialIcon href={footerData[0]?.linkedIn} Icon={LinkedIn} />
                    </div>
                </div>

                {/* ================= Desktop (lg+) ================= */}
                <div className="hidden lg:contents">

                    <div className="lg:col-span-2">
                        <FooterTitle>{footerData[0]?.discover}</FooterTitle>
                        {mainHeaderData[0]?.navigate.map((item,index) => (
                            <FooterLink key={index} href={item.link}>
                                {item.name}
                            </FooterLink>
                        ))}
                    </div>

                    <div className="lg:col-span-2">
                        <FooterTitle>{footerData[0]?.shop}</FooterTitle>
                        {footerData[0]?.shopLinks.map((item,index) => (
                            <FooterLink key={index} href={item.link}>
                                {item.name}
                            </FooterLink>
                        ))}
                    </div>

                    <div className="lg:col-span-2">
                        <FooterTitle>{footerData[0]?.support}</FooterTitle>
                        {footerData[0]?.supportLinks.map((item,index) => (
                            <FooterLink key={index} href={item.link}>
                                {item.name}
                            </FooterLink>
                        ))}
                    </div>

                    <div className="lg:col-span-2">
                        <FooterTitle>{footerData[0]?.contactUs}</FooterTitle>
                        <ContactItem Icon={LocationOn} text={footerData[0]?.address} />
                        <ContactItem Icon={Phone} text={footerData[0]?.phone} />
                        <ContactItem Icon={Email} text={footerData[0]?.email} />
                    </div>
                </div>

                {/* ================= Accordion (sm → md) ================= */}
                <div className="lg:hidden sm:col-span-2">

                    <MobileAccordion title={footerData[0]?.discover}>
                        {mainHeaderData[0]?.navigate.map((item) => (
                            <FooterLink key={item.id} href={item.link}>
                                {item.name}
                            </FooterLink>
                        ))}
                    </MobileAccordion>

                    <MobileAccordion title={footerData[0]?.shop}>
                        {footerData[0]?.shopLinks.map((item) => (
                            <FooterLink key={item.id} href={item.link}>
                                {item.name}
                            </FooterLink>
                        ))}
                    </MobileAccordion>

                    <MobileAccordion title={footerData[0]?.support}>
                        {footerData[0]?.supportLinks.map((item) => (
                            <FooterLink key={item.id} href={item.link}>
                                {item.name}
                            </FooterLink>
                        ))}
                    </MobileAccordion>

                    <MobileAccordion title={footerData[0]?.contactUs}>
                        <ContactItem Icon={LocationOn} text={footerData[0]?.address} />
                        <ContactItem Icon={Phone} text={footerData[0]?.phone} />
                        <ContactItem Icon={Email} text={footerData[0]?.email} />
                    </MobileAccordion>

                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Bottom */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <span>
                    © {new Date().getFullYear()} {footerData[0]?.bootomText}
                </span>

                <div className="flex gap-5">
                    {footerData[0]?.bottomLinks.map((item,index) => (
                        <FooterLink key={index} href={item.link}>
                            {item.name}
                        </FooterLink>
                    ))}
                </div>
            </div>
        </footer>
    );
}

/* ================= UI ================= */

function FooterTitle({ children }) {
    return (
        <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-5">
            {children}
        </h3>
    );
}

function FooterLink({ href, children }) {
    return (
        <Link href={href} className="block text-sm mb-3 hover:text-white transition">
            {children}
        </Link>
    );
}

function SocialIcon({ Icon, href }) {
    return (
        <a
            href={href}
            target="_blank"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 hover:border-primary hover:text-white transition"
        >
            <Icon fontSize="small" />
        </a>
    );
}

function ContactItem({ Icon, text }) {
    return (
        <div className="flex items-center gap-3 text-sm mb-3">
            <Icon fontSize="small" />
            <span>{text}</span>
        </div>
    );
}

/* ================= Accordion ================= */

function MobileAccordion({ title, children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-white/10">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center py-4 text-white text-sm font-semibold uppercase"
            >
                {title}
                <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
                    ▼
                </span>
            </button>

            {open && <div className="pb-4">{children}</div>}
        </div>
    );
}
