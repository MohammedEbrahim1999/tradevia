"use client";
import { useEffect, useState } from "react";
import BookReader from "./BookReader";

export default function TermsClient() {
  const API_SECTIONS = "http://localhost:5000/SECTIONS";
  const API_Last = "http://localhost:5000/LastUpdated";
  const [SECTIONS, setSECTIONS] = useState([]);
  const [LASTUPDATED, setLASTUPDATED] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchLoggedCustomers = async () => {
      try {
        const res = await fetch(API_SECTIONS);
        const res2 = await fetch(API_Last);
        if (!res.ok || !res2.ok) throw new Error("Failed to fetch logged customers");
        const data = await res.json();
        const lastUpdatedData = await res2.json();
        setSECTIONS(data);
        setLASTUPDATED(lastUpdatedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedCustomers();
  }, []);
  return (
    <section className="pageRoot">
      <div className="bg" />

      <div className="container">
        <header className="hero">
          <div className="heroTop">
            <div className="tag">Legal & Policies</div>
            <div className="tag">
              Last updated : <span className="mono">{LASTUPDATED[0]?.date}</span>
            </div>
          </div>

          <h1 className="h1">Terms of Service</h1>
          <p className="p">
            Read the terms like a book — flip pages, jump from the table of contents,
            or search inside the document.
          </p>
        </header>

        <BookReader sections={SECTIONS} lastUpdated={LASTUPDATED[0]?.date}  />
      </div>

      <style jsx>{`
        .pageRoot {
          position: relative;
          overflow: hidden;
          background: #ffffff;
          padding: 28px 0 56px;
        }
        .bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(1100px 520px at 50% -10%, rgba(15, 23, 42, 0.08), transparent 60%),
            radial-gradient(900px 520px at 10% 10%, rgba(2, 132, 199, 0.08), transparent 62%),
            radial-gradient(900px 520px at 90% 20%, rgba(99, 102, 241, 0.08), transparent 62%);
        }
        .container {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 18px;
        }

        .hero {
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.12);
          border-radius: 22px;
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.1);
          overflow: hidden;
          margin-bottom: 16px;
          padding: 18px;
        }
        @media (min-width: 640px) {
          .hero {
            padding: 22px;
          }
        }

        .heroTop {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 900;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: rgba(255, 255, 255, 0.75);
          color: rgba(15, 23, 42, 0.82);
        }
        .mono {
          font-variant-numeric: tabular-nums;
          font-weight: 900;
          color: #0f172a;
        }

        .h1 {
          margin-top: 14px;
          font-size: 40px;
          line-height: 1.05;
          font-weight: 950;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .p {
          margin-top: 10px;
          max-width: 739px;
          font-size: 15px;
          color: rgba(15, 23, 42, 0.68);
          line-height: 1.7;
          font-weight: 700;
        }
      `}</style>
    </section>
  );
}
