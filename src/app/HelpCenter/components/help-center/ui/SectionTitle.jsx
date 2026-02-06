export default function SectionTitle({ title, desc, right }) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                {desc ? <p className="mt-1 text-sm text-gray-600">{desc}</p> : null}
            </div>
            {right ? <div className="sm:pb-0.5">{right}</div> : null}
        </div>
    );
}
