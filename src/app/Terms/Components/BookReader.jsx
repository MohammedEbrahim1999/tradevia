"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion";
import PaperPage from "./PaperPage";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function BookReader({ sections, lastUpdated }) {
  const reducedMotion = usePrefersReducedMotion();

  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0); // page-by-page
  const [turnTick, setTurnTick] = useState(0);

  // ✅ TOC progressive reveal (accordion style)
  const TOC_PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(TOC_PAGE_SIZE);

  const turnDirRef = useRef(1); // 1 next, -1 prev

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((s) => {
      const t = (s.title || "").toLowerCase();
      const b = (s.body || "").toLowerCase();
      return t.includes(q) || b.includes(q);
    });
  }, [sections, query]);

  const maxIndex = Math.max(0, filtered.length - 1);

  // keep index valid when search changes
  useEffect(() => {
    setPageIndex((p) => clamp(p, 0, maxIndex));
  }, [maxIndex]);

  // ✅ reset toc reveal when search changes
  useEffect(() => {
    setVisibleCount(TOC_PAGE_SIZE);
  }, [query]);

  // left page = current, right page = next
  const left = filtered[pageIndex] ?? null;
  const right = filtered[pageIndex + 1] ?? null;

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < maxIndex;

  const spreadNo = Math.floor(pageIndex / 2) + 1;
  const spreadTotal = Math.max(1, Math.ceil(filtered.length / 2));

  function animateTurn(dir) {
    if (reducedMotion) return;
    turnDirRef.current = dir;
    setTurnTick((x) => x + 1);
  }

  function goPrev() {
    if (!canPrev) return;
    animateTurn(-1);
    setPageIndex((p) => clamp(p - 1, 0, maxIndex));
  }

  function goNext() {
    if (!canNext) return;
    animateTurn(1);
    setPageIndex((p) => clamp(p + 1, 0, maxIndex));
  }

  function jumpTo(index) {
    const dir = index > pageIndex ? 1 : -1;
    animateTurn(dir);
    setPageIndex(clamp(index, 0, maxIndex));
  }

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPrev, canNext, reducedMotion, maxIndex]);

  // ✅ TOC visible items (accordion style)
  const visibleToc = filtered.slice(0, visibleCount);

  function goSeeMore() {
    if (filtered.length === 0) return;
    setVisibleCount((c) => Math.min(filtered.length, c + 1));
  }

  // ✅ If active page is outside visible TOC, auto-expand so it becomes visible
  useEffect(() => {
    if (pageIndex + 1 > visibleCount) {
      setVisibleCount((c) => Math.min(filtered.length, pageIndex + 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, filtered.length]);

  return (
    <div className="wrap">
      <aside className="side">
        <div className="card">
          <div className="cardHead">
            <div>
              <div className="hTitle">Table of Contents</div>
              <div className="hSub">
                Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} items • See more to continue
              </div>
            </div>
            <div className="pill">
              Spread <span className="mono">{spreadNo}</span>/<span className="mono">{spreadTotal}</span>
            </div>
          </div>

          <div className="searchRow">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms..."
            />
            <div className="hint">Tip: use ← / → keys</div>
          </div>

          <div className="toc">
            {filtered.length === 0 ? (
              <div className="empty">No results for “{query}”.</div>
            ) : (
              <>
                {visibleToc.map((s, idx) => {
                  // idx here matches filtered order because visibleToc is slice(0, ...)
                  const isActive = idx === pageIndex;

                  return (
                    <button
                      key={s.id}
                      className={`tocItem ${isActive ? "active" : ""}`}
                      onClick={() => jumpTo(idx)}
                      type="button"
                    >
                      <span className="tocNum">{String(idx + 1).padStart(2, "0")}</span>
                      <span className="tocText">{s.title}</span>
                      <span className="tocArrow">→</span>
                    </button>
                  );
                })}

                {visibleCount < filtered.length && (
                  <button className="seeMore" type="button" onClick={goSeeMore}>
                    See more
                    <span className="seeMeta">
                      ({Math.min(visibleCount, filtered.length)}/{filtered.length})
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="card help">
          <div className="helpTop">
            <div className="q">?</div>
            <div>
              <div className="hTitle">Need help?</div>
              <div className="hSub">Email us for clarification</div>
            </div>
          </div>
          <a className="btn primary" href="mailto:support@tivora.com">
            support@tivora.com
          </a>
          <div className="hint center">Typical response within 24–48 hours.</div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="kicker">LEGAL • Terms </div>
            <div className="title">Terms of Service</div>
            <div className="subtitle">Now moving page-by-page. (Works without Tailwind)</div>
          </div>

          <div className="actions">
            <button
              type="button"
              className={`btn ${canPrev ? "" : "disabled"}`}
              onClick={goPrev}
              disabled={!canPrev}
            >
              ← Prev
            </button>
            <button
              type="button"
              className={`btn ${canNext ? "" : "disabled"}`}
              onClick={goNext}
              disabled={!canNext}
            >
              Next →
            </button>
          </div>
        </div>

        <div className="book">
          <div className="paperNoise" />
          <div className="spine" />
          <div className="spineGlow" />

          {!reducedMotion && (
            <div
              key={turnTick}
              className={`turnOverlay ${turnDirRef.current === 1 ? "next" : "prev"}`}
            />
          )}

          <div className="bookTop">
            <div className="badge">TIVORA • Legal</div>
            <div className="badge">
              Last updated: <span className="mono">{lastUpdated}</span>
            </div>
          </div>

          <div className="spread">
            <PaperPage side="left" section={left} pageNo={pageIndex + 1} />
            <PaperPage
              side="right"
              section={right}
              pageNo={pageIndex + 2}
              isEnd={right == null}
            />
          </div>

          <div className="bookBottom">
            <div className="foot">
              Page <span className="mono">{pageIndex + 1}</span> of{" "}
              <span className="mono">{filtered.length || 1}</span> • Use ← / → keys
            </div>

            <div className="footActions">
              <a className="btn" href="mailto:support@tivora.com">
                Contact support
              </a>
              <a className="btn dark" href="/">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .wrap {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 1024px) {
          .wrap {
            grid-template-columns: 380px 1fr;
            gap: 26px;
            align-items: start;
          }
          .side {
            position: sticky;
            top: 18px;
            align-self: start;
          }
        }

        .card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.12);
          border-radius: 18px;
          box-shadow: 0 14px 35px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }
        .cardHead {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          padding: 16px 16px 12px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }
        .hTitle {
          font-weight: 800;
          color: #0f172a;
          font-size: 14px;
        }
        .hSub {
          margin-top: 4px;
          color: rgba(15, 23, 42, 0.65);
          font-size: 12px;
          line-height: 1.35;
        }
        .pill {
          background: rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(15, 23, 42, 0.08);
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          color: rgba(15, 23, 42, 0.8);
          white-space: nowrap;
        }
        .mono {
          font-variant-numeric: tabular-nums;
          font-weight: 800;
          color: #0f172a;
        }

        .searchRow {
          padding: 14px 16px 10px;
        }
        input {
          width: 100%;
          border: 1px solid rgba(15, 23, 42, 0.14);
          border-radius: 14px;
          padding: 10px 12px;
          outline: none;
          font-size: 13px;
          color: #0f172a;
          background: #fff;
        }
        input:focus {
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.08);
          border-color: rgba(15, 23, 42, 0.22);
        }
        .hint {
          margin-top: 8px;
          font-size: 11px;
          color: rgba(15, 23, 42, 0.6);
        }
        .hint.center {
          text-align: center;
        }

        .toc {
          padding: 10px;
          display: grid;
          gap: 8px;
        }
        .tocItem {
          width: 100%;
          text-align: left;
          display: grid;
          grid-template-columns: 44px 1fr 20px;
          align-items: center;
          gap: 10px;
          padding: 10px 10px;
          border-radius: 14px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(15, 23, 42, 0.03);
          cursor: pointer;
          transition: 180ms ease;
        }
        .tocItem:hover {
          background: rgba(15, 23, 42, 0.06);
        }
        .tocItem.active {
          background: #0f172a;
          border-color: #0f172a;
          color: #fff;
        }
        .tocNum {
          display: inline-flex;
          width: 40px;
          height: 30px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #fff;
          font-size: 12px;
          color: rgba(15, 23, 42, 0.7);
          font-variant-numeric: tabular-nums;
          font-weight: 800;
        }
        .tocItem.active .tocNum {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          color: #fff;
        }
        .tocText {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tocItem.active .tocText {
          color: #fff;
        }
        .tocArrow {
          color: rgba(15, 23, 42, 0.35);
          font-weight: 900;
        }
        .tocItem.active .tocArrow {
          color: rgba(255, 255, 255, 0.75);
        }
        .empty {
          padding: 18px 14px;
          font-size: 13px;
          color: rgba(15, 23, 42, 0.65);
        }

        .seeMore {
          margin-top: 4px;
          width: 100%;
          border-radius: 14px;
          border: 1px dashed rgba(15, 23, 42, 0.22);
          background: rgba(15, 23, 42, 0.03);
          padding: 10px 12px;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: 180ms ease;
          color: #0f172a;
        }
        .seeMore:hover {
          background: rgba(15, 23, 42, 0.06);
        }
        .seeMeta {
          font-size: 12px;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.6);
        }

        .help {
          padding: 16px;
          margin-top: 14px;
        }
        .helpTop {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .q {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          color: #fff;
          font-weight: 900;
        }

        .main {
          min-width: 0;
        }

        .topbar {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.12);
          border-radius: 18px;
          box-shadow: 0 14px 35px rgba(15, 23, 42, 0.08);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .topbar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 18px;
          }
        }
        .kicker {
          font-size: 11px;
          letter-spacing: 0.16em;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.55);
        }
        .title {
          margin-top: 6px;
          font-size: 28px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.1;
        }
        .subtitle {
          margin-top: 8px;
          font-size: 13px;
          color: rgba(15, 23, 42, 0.65);
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 14px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fff;
          color: #0f172a;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          transition: 180ms ease;
          text-decoration: none;
          user-select: none;
        }
        .btn:hover {
          background: rgba(15, 23, 42, 0.04);
        }
        .btn.dark {
          background: #0f172a;
          border-color: #0f172a;
          color: #fff;
        }
        .btn.dark:hover {
          background: #111c33;
        }
        .btn.primary {
          background: #0f172a;
          border-color: #0f172a;
          color: #fff;
          width: 100%;
          margin-top: 12px;
        }
        .btn.primary:hover {
          background: #111c33;
        }
        .btn.disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .book {
          margin-top: 14px;
          position: relative;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          overflow: hidden;
          background: linear-gradient(90deg, #f5efe3, #ffffff 45%, #ffffff 55%, #f5efe3);
          box-shadow: 0 20px 55px rgba(15, 23, 42, 0.12);
        }

        .paperNoise {
          position: absolute;
          inset: 0;
          opacity: 0.14;
          background-image: radial-gradient(rgba(15, 23, 42, 0.35) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none;
        }

        .spine {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          transform: translateX(-50%);
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(15, 23, 42, 0.25),
            transparent
          );
          pointer-events: none;
        }
        .spineGlow {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 44px;
          transform: translateX(-50%);
          background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.06), transparent);
          pointer-events: none;
        }

        .bookTop {
          padding: 14px 16px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: rgba(255, 255, 255, 0.65);
          color: rgba(15, 23, 42, 0.82);
        }

        .spread {
          padding: 14px 16px 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 768px) {
          .spread {
            grid-template-columns: 1fr 1fr;
            gap: 0;
          }
        }

        .turnOverlay {
          position: absolute;
          top: 80px;
          bottom: 90px;
          width: 50%;
          pointer-events: none;
          animation: turn 420ms ease-out;
          transform-style: preserve-3d;
          z-index: 5;
        }
        .turnOverlay.next {
          right: 0;
          transform-origin: left center;
        }
        .turnOverlay.prev {
          left: 0;
          transform-origin: right center;
        }
        @keyframes turn {
          0% {
            opacity: 0;
            transform: perspective(900px) rotateY(0deg);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: perspective(900px) rotateY(-55deg);
          }
        }
        .turnOverlay.prev {
          animation-name: turnPrev;
        }
        @keyframes turnPrev {
          0% {
            opacity: 0;
            transform: perspective(900px) rotateY(0deg);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: perspective(900px) rotateY(55deg);
          }
        }

        .bookBottom {
          border-top: 1px solid rgba(15, 23, 42, 0.1);
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.55);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        @media (min-width: 640px) {
          .bookBottom {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        .foot {
          color: rgba(15, 23, 42, 0.65);
          font-size: 12px;
          font-weight: 700;
        }
        .footActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
