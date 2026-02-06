export default function MiniNote({ title, children }) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm">
            <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.06),rgba(0,0,0,0.06)_1px,transparent_1px,transparent_22px)]" />
            </div>
            <div className="relative">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{children}</p>
            </div>
        </div>
    );
}