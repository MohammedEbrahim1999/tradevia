"use client";

import ProfileVerticalTabs from "./components/ProfileVerticalTabs";

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-[url(/imgs/11.jpg)] py-10 px-4">
            {/* <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-6 "> */}
                <ProfileVerticalTabs />
            {/* </div> */}
        </div>
    );
}
