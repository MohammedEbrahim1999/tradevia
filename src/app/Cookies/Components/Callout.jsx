export default function Callout({ children }) {
    return (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">{children}</p>
        </div>
    );
}