"use client";

export default function PaperPage({ side, section, pageNo, isEnd }) {
    const isLeft = side === "left";

    return (
        <article className={`page ${isLeft ? "left" : "right"}`}>
            <div className="sheet">
                <div className="pageHead">
                    <div className="small">{isLeft ? "CHAPTER" : "CONTINUED"}</div>
                    <div className="pageNum">{pageNo}</div>
                </div>

                <div className="pageTitle">{section?.title ?? (isEnd ? "End of Terms" : "—")}</div>
                <div className="hr" />

                {section ? (
                    <>
                        <p className="body">{section.body}</p>

                        <div className="note">
                            <div className="noteT">Quick note</div>
                            <div className="noteB">If anything is unclear, contact support for clarification.</div>
                        </div>
                    </>
                ) : (
                    <div className="note">
                        <div className="noteT">{isEnd ? "Final page" : "No content"}</div>
                        <div className="noteB">
                            {isEnd
                                ? "Use the Table of Contents to jump to another chapter, or go back."
                                : "Try a different search."}
                        </div>
                    </div>
                )}

                <div className="pageFoot">
                    <span className="dot" /> <span>TIVORA Legal</span>
                </div>
            </div>

            <style jsx>{`
        .page {
          position: relative;
          min-height: 520px;
        }
        .page.left {
          padding-right: 0;
        }
        .page.right {
          padding-left: 0;
        }
        @media (min-width: 768px) {
          .page.left {
            padding-right: 18px;
          }
          .page.right {
            padding-left: 18px;
          }
        }

        .sheet {
          height: 100%;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(15, 23, 42, 0.14);
          border-radius: 18px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
          padding: 18px;
          position: relative;
          overflow: hidden;
        }
        .sheet:before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.03), transparent 22%);
        }

        .pageHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .small {
          font-size: 11px;
          letter-spacing: 0.18em;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.55);
        }
        .pageNum {
          font-size: 12px;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: rgba(255, 255, 255, 0.7);
          border-radius: 999px;
          padding: 6px 10px;
          font-variant-numeric: tabular-nums;
        }

        .pageTitle {
          margin-top: 12px;
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.15;
        }
        .hr {
          margin-top: 12px;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(15, 23, 42, 0.18),
            transparent
          );
        }

        .body {
          margin-top: 14px;
          color: rgba(15, 23, 42, 0.85);
          font-size: 14px;
          line-height: 1.9;
          font-weight: 600;
        }

        .note {
          margin-top: 16px;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: rgba(15, 23, 42, 0.04);
          padding: 14px;
        }
        .noteT {
          font-size: 12px;
          font-weight: 900;
          color: #0f172a;
        }
        .noteB {
          margin-top: 6px;
          font-size: 12px;
          font-weight: 700;
          color: rgba(15, 23, 42, 0.68);
          line-height: 1.6;
        }

        .pageFoot {
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(15, 23, 42, 0.55);
          font-size: 12px;
          font-weight: 800;
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 99px;
          background: rgba(15, 23, 42, 0.25);
          display: inline-block;
        }
      `}</style>
        </article>
    );
}
