import StickyNote from "./StickyNote";
export default function Header({ lastUpdated = "—" }) {
    return (
        <header className="mb-12">
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                {/* soft background */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.03),transparent_55%)]" />
                <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-100 blur-3xl opacity-40" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sky-100 blur-3xl opacity-40" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                            Legal
                        </p>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
                            Cookies Policy
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">Last updated: {lastUpdated}</p>
                        <p className="mt-5 max-w-3xl text-gray-600 leading-relaxed">
                            This Cookies Policy explains how{" "}
                            <span className="font-semibold text-gray-900">TIVORA</span> uses cookies and
                            similar technologies to recognize you when you visit our website and how they
                            improve your experience.
                        </p>
                    </div>
                    {/* summary */}
                    <div className="w-full md:w-[340px]">
                        <StickyNote tone="amber" title="Summary">
                            <ul className="mt-3 space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-500" />
                                    We use essential cookies for login & checkout.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-500" />
                                    Analytics cookies help improve site performance.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-500" />
                                    You can manage cookies via your browser settings.
                                </li>
                            </ul>
                        </StickyNote>
                    </div>
                </div>
            </div>
        </header>
    );
}