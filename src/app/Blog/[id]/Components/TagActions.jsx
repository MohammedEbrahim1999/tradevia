import React from "react";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
const TagActions = ({ blogTags }) => {
    return (
        <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {blogTags.map((tag) => (
                    <span
                        key={tag}
                        className="cursor-pointer font-bold text-sm px-3 py-1 rounded-full bg-gray-300 hover:bg-blue-500 hover:text-white transition-colors duration-300"
                    >
                        {tag}
                    </span>
                ))}
            </div>
            {/* Actions */}
            <div className="flex gap-2">
                <button className="bg-gray-100 p-2 rounded-full hover:bg-blue-200 hover:text-white transition-colors duration-300">
                    <ShareIcon className="w-5 h-5" />
                </button>
                <button className="bg-gray-100 p-2 rounded-full hover:bg-blue-200 hover:text-white transition-colors duration-300">
                    <BookmarkBorderIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
export default TagActions;