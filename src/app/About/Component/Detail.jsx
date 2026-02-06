import React from "react";
const Detail = ({ About }) => {
    return (
        <section className="w-full bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16">
                {/* Image */}
                <div className="mb-16">
                    <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg">
                        <img
                            src={About[0]?.image}
                            alt="Corporate Overview"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
                {/* Content */}
                <div className="mx-auto max-w-3xl text-gray-700">
                    <h2 className="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">
                        {About[0]?.companyOverview}
                    </h2>
                    <p className="mb-6 leading-relaxed">
                        {About[0]?.paraOne}
                    </p>
                    <p className="mb-8 leading-relaxed">
                        {About[0]?.paraTwo}
                    </p>
                    {/* Blockquote */}
                    <blockquote className="mb-12 border-l-4 border-gray-900 pl-6 text-gray-900">
                        <p className="italic">
                            {About[0]?.ourObjective}
                        </p>
                    </blockquote>
                    {/* Mission, Vision, Values */}
                    <div className="mb-14 grid gap-8 sm:grid-cols-12">
                        <div className="flex sm:col-span-12 gap-6">
                            {About[0]?.aboutItems.map((item, index) => (
                                <div key={index} className="flex-1">
                                    <h4 className="mb-3 text-lg font-semibold text-gray-900">
                                        {item.title}
                                    </h4>
                                    <p className="text-sm leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Stats / Credibility */}
                    <div className="mb-12 grid gap-8 border-y border-gray-200 py-10 sm:grid-cols-3 text-center">
                        {About[0]?.aboutValues.map((stat, index) => (
                            <div key={index}>
                                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                                <p className="mt-2 text-sm text-gray-600">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mb-6 leading-relaxed">
                        {About[0]?.paraThree}
                    </p>
                    <p className="leading-relaxed">
                        {About[0]?.paraFour}
                    </p>
                </div>
            </div>
        </section>
    );
};
export default Detail;