'use client'
export default function MapContent() {
    return (
        <div className="w-full h-[420px]">
            {/* <Map /> */}
            <iframe
                title="Company Location"
                src="https://www.google.com/maps?q=24.7136,46.6753&z=15&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
            />
        </div>
    );
}