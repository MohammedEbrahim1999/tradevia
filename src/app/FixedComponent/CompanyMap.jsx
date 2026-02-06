"use client";

import { Map, Marker } from "@/components/Map";

const CompanyMap = () => {
    return (
        <div className="w-full h-[400px] rounded-xl overflow-hidden border">
            <Map
                center={[24.7136, 46.6753]} // Riyadh coordinates
                zoom={14}
                className="w-full h-full"
            >
                <Marker
                    position={[24.7136, 46.6753]}
                    popup="Our Company Location"
                />
            </Map>
        </div>
    );
};

export default CompanyMap;
