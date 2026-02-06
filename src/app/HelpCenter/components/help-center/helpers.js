export function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

export function safeText(v, fallback = "") {
    if (v === null || v === undefined) return fallback;
    if (Array.isArray(v)) return v.filter(Boolean).join(" ");
    if (typeof v === "object") return fallback;
    return String(v);
}

export function formatLastUpdated(v) {
    if (typeof v === "string") return v.trim() || "—";
    if (Array.isArray(v)) return safeText(v, "—").trim() || "—";
    if (v && typeof v === "object") {
        const s = safeText(v.lastUpdated, "");
        return s.trim() || "—";
    }
    const s = safeText(v, "—").trim();
    return s || "—";
}

export function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

export function uniqBy(arr, keyFn) {
    const map = new Map();
    arr.forEach((x) => {
        const k = keyFn(x);
        if (!map.has(k)) map.set(k, x);
    });
    return Array.from(map.values());
}

export function scoreFaq(f, query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return 0;

    const qq = (f?.q || "").toLowerCase();
    const aa = (f?.a || "").toLowerCase();
    const tags = (Array.isArray(f?.tags) ? f.tags : []).map((t) => String(t).toLowerCase());

    let s = 0;
    if (qq.includes(q)) s += 6;
    if (tags.some((t) => t.includes(q))) s += 3;
    if (aa.includes(q)) s += 1;
    if (qq.startsWith(q)) s += 2;

    return s;
}

export function pickEnvBase() {
    return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
}

export function buildShareUrl({ tab, faqId }) {
    try {
        const u = new URL(window.location.href);
        if (tab) u.searchParams.set("tab", tab);
        if (faqId) u.searchParams.set("faq", faqId);
        else u.searchParams.delete("faq");
        return u.toString();
    } catch {
        return "";
    }
}

export function highlight(text, query) {
    const t = String(text || "");
    const q = String(query || "").trim();
    if (!q) return t;

    const idx = t.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return t;

    const a = t.slice(0, idx);
    const b = t.slice(idx, idx + q.length);
    const c = t.slice(idx + q.length);

    return (
        <>
            {a}
            <mark className="rounded bg-amber-100 px-1 py-0.5 text-gray-900">{b}</mark>
            {c}
        </>
    );
}
