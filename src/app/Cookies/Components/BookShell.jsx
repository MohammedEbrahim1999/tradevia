export default function BookShell({ children }) {
    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10 translate-y-4 rounded-[34px] bg-black/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-gray-200 bg-white shadow-sm">
                <div className="pointer-events-none absolute inset-0 opacity-[0.25]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.05),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.05),rgba(0,0,0,0.05)_1px,transparent_1px,transparent_26px)]" />
                </div>
                <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.08),rgba(0,0,0,0.02),transparent)]" />
                <div className="pointer-events-none absolute left-8 top-0 h-full w-px bg-black/10" />
                <div className="relative p-6 sm:p-8">{children}</div>
            </div>
        </div>
    );
}