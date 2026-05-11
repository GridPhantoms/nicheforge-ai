"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Status = "loading" | "ready" | "error" | "missing";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (!listItems.length) return;
    blocks.push(<ul key={`ul-${blocks.length}`}>{listItems.map((item, index) => <li key={index}>{renderInline(item)}</li>)}</ul>);
    listItems = [];
  }

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) {
      flushList();
      return;
    }
    if (line.startsWith("### ")) {
      flushList();
      blocks.push(<h3 key={index}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push(<h2 key={index}>{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      flushList();
      blocks.push(<h1 key={index}>{renderInline(line.slice(2))}</h1>);
    } else if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      listItems.push(line.replace(/^\d+\.\s/, ""));
    } else {
      flushList();
      blocks.push(<p key={index}>{renderInline(line)}</p>);
    }
  });
  flushList();
  return <>{blocks}</>;
}

export default function ReportPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function generate() {
      const raw = sessionStorage.getItem("nicheforge:pending-report");
      if (!raw) {
        setStatus("missing");
        return;
      }

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: raw,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Report generation failed.");
        setReport(data.report);
        setStatus("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setStatus("error");
      }
    }

    generate();
  }, []);

  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/" className="logo"><span className="logo-mark">NF</span> NicheForge AI</Link>
        <div className="nav-links"><Link href="/forge">New report</Link><Link href="/disclaimer">Disclaimer</Link></div>
      </nav>

      {status === "loading" && (
        <section className="loading-stage">
          <div className="orb" />
          <div className="eyebrow">Forging report</div>
          <h1>Mapping niches, automation angles, and babysitting traps…</h1>
          <p className="lede">This usually takes 30–60 seconds in the private beta. Keep this page open while NicheForge builds the report.</p>
          <div className="progress-bar"><span /></div>
        </section>
      )}

      {status === "missing" && (
        <section className="hero panel">
          <h1>No report request found.</h1>
          <p className="lede">Start from the forge page so NicheForge knows what to analyze.</p>
          <Link href="/forge" className="button">Open the forge</Link>
        </section>
      )}

      {status === "error" && (
        <section className="hero panel">
          <h1>The report failed to generate.</h1>
          <p className="notice error">{error}</p>
          <Link href="/forge" className="button">Try again</Link>
        </section>
      )}

      {status === "ready" && (
        <section className="section">
          <div className="report-header">
            <div>
              <div className="eyebrow">Report ready</div>
              <h1>Your NicheForge Report</h1>
            </div>
            <Link href="/forge" className="button secondary">Generate another</Link>
          </div>
          <article className="panel markdown-report">
            <MarkdownLite text={report} />
          </article>
        </section>
      )}
    </main>
  );
}
