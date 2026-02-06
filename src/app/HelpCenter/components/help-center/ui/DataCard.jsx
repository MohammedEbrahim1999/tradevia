import Pill from "./Pill";
import { Icon } from "../icons";

export default function DataCard({ icon, label, value, hint, right }) {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                    <Icon name={icon} />
                </div>
                {right ? <div>{right}</div> : <Pill tone="blue">Dataset</Pill>}
            </div>

            <div className="mt-4">
                <div className="text-xs font-semibold text-gray-500">{label}</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
                {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
            </div>
        </div>
    );
}
