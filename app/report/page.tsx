"use client";

import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
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
  let codeLines: string[] = [];
  let inCodeBlock = false;

  function flushList() {
    if (!listItems.length) return;
    blocks.push(<ul key={`ul-${blocks.length}`}>{listItems.map((item, index) => <li key={index}>{renderInline(item)}</li>)}</ul>);
    listItems = [];
  }

  function flushCode() {
    if (!codeLines.length) return;
    blocks.push(<pre key={`pre-${blocks.length}`}><code>{codeLines.join("\n")}</code></pre>);
    codeLines = [];
  }

  lines.forEach((raw, index) => {
    const line = raw.trim();

    if (line.startsWith("```")) {
      flushList();
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCode();
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(raw);
      return;
    }

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
  flushCode();
  return <>{blocks}</>;
}

export default function ReportPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function copyReport() {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadTextReport() {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nicheforge-report.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

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
      <SiteHeader links={[{ href: "/forge", label: "New report" }, { href: "/disclaimer", label: "Disclaimer" }]} />

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
          <section className="panel report-export">
            <div>
              <div className="eyebrow">Export & reuse</div>
              <h2>Take this into your own AI workflow.</h2>
              <p>Copy the report into your own chatbot, download a text file, or use your browser’s print dialog to save a clean PDF.</p>
            </div>
            <div className="report-actions">
              <button type="button" onClick={copyReport}>{copied ? "Copied" : "Copy full report"}</button>
              <button type="button" className="button secondary" onClick={downloadTextReport}>Download .txt</button>
              <button type="button" className="button secondary" onClick={() => window.print()}>Print / save PDF</button>
            </div>
          </section>
        </section>
      )}
    </main>
  );
}
