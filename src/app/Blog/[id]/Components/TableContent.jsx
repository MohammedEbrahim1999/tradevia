import React from "react";

const TableContent = ({ blogContent }) => {
    // Extract all <h2> headings
    const headings =
        blogContent.match(/<h2>(.*?)<\/h2>/g)?.map((h) => h.replace(/<[^>]*>/g, "")) ||
        [];

    return (
        <>
            {headings.length > 0 && (
                <div className="mb-6 hidden md:block">
                    <h3 className="text-lg font-semibold mb-2">Table of Contents</h3>
                    <div className="flex flex-col space-y-1">
                        {headings.map((h, i) => (
                            <a
                                key={i}
                                href={`#${h}`}
                                className="text-blue-600 block no-underline hover:underline"
                            >
                                {h}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default TableContent;
