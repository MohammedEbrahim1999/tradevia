import React from 'react'
import { Box } from "@mui/material";
const ArticleContent = ({blogContent}) => {
    return (
        <Box component="article" dangerouslySetInnerHTML={{ __html: blogContent }} className='text-black text-2xl leading-loose' sx={{
                fontFamily: "Georgia, serif",
                // fontSize: "1.25rem",
                // lineHeight: 2,
                // color: "text.primary",
                "& p:first-of-type::first-letter": {
                    fontSize: "3rem",
                    fontWeight: 700,
                    float: "left",
                    mr: 1,
                    lineHeight: 1,
                },
                "& h2": { fontSize: "2.2rem", fontWeight: 700, mt: 5, mb: 3 },
                "& h3": { fontSize: "1.6rem", fontWeight: 600, mt: 4, mb: 2 },
                "& p": { mb: 3 },
                "& a": {
                    color: "primary.main",
                    textDecoration: "underline",
                    "&:hover": { color: "primary.dark" },
                },
                "& img": {
                    maxWidth: "100%",
                    borderRadius: 4,
                    my: 4,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                },
                "& blockquote": {
                    borderLeft: "5px solid",
                    borderColor: "primary.main",
                    pl: 4,
                    ml: 0,
                    fontStyle: "italic",
                    color: "text.secondary",
                    mb: 5,
                    bgcolor: "grey.100",
                    borderRadius: 2,
                    py: 2,
                    px: 3,
                },
                "& code": {
                    bgcolor: "grey.200",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.95rem",
                },
            }}
        />
    )
}
export default ArticleContent