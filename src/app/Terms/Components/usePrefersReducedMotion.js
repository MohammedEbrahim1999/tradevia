"use client";

import { useEffect, useState } from "react";

export default function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!m) return;

        const onChange = () => setReduced(!!m.matches);
        onChange();

        m.addEventListener?.("change", onChange);
        return () => m.removeEventListener?.("change", onChange);
    }, []);

    return reduced;
}
