import React from "react";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

const AuthorBio = ({ blogAuthor, authorJob }) => {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl mt-8 bg-gray-100 shadow-md">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
                {blogAuthor.charAt(0)}
            </div>

            {/* Author Info */}
            <div>
                <h3 className="font-bold text-lg">{blogAuthor}</h3>
                <p className="text-gray-500 text-sm">{authorJob}</p>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                    <a
                        href="#"
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <ShareIcon className="text-gray-600 text-sm" />
                    </a>
                    <a
                        href="#"
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <BookmarkBorderIcon className="text-gray-600 text-sm" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AuthorBio;
