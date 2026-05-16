"use client";

import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { useCallback, useEffect, useState } from "react";

type Status = "loading" | "ready" | "error" | "missing";

const REQUEST_STORAGE_KEY = "nicheforge:pending-report";
const MAX_GENERATION_ATTEMPTS = 2;
const GENERATION_STAGES = [
  "Analyzing niche signal...",
  "Checking market reality...",
  "Mapping automation angles...",
  "Scoring babysitting risk...",
  "Building validation sprint...",
  "Drafting low-touch offer variants...",
  "Assembling your master prompt...",
];

function getFriendlyErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("load failed") || normalized.includes("failed to fetch") || normalized.includes("networkerror")) {
    return "The AI request took too long or the browser connection dropped. Your idea is still okay — retry with this tab open.";
  }
  if (normalized.includes("unexpected end") || normalized.includes("json") || normalized.includes("stream")) {
    return "The report response was interrupted before it finished loading. Please retry with this tab open.";
  }
  return message || "Something went wrong while generating the report.";
}

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
  const [payload, setPayload] = useState("");
  const [attempt, setAttempt] = useState(1);
  const [copied, setCopied] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

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

  const generateReport = useCallback(async function runGeneration(raw: string, attemptNumber = 1) {
    setStatus("loading");
    setReport("");
    setError("");
    setAttempt(attemptNumber);
    setActiveStage(0);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw,
      });
      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        const data = contentType.includes("application/json")
          ? await response.json()
          : { error: await response.text() };
        throw new Error(data.error || "Report generation failed.");
      }

      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (!data.report) throw new Error("The report response was empty. Please try again.");
        setReport(data.report);
        setStatus("ready");
        return;
      }

      if (!response.body) throw new Error("The report stream could not be opened.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setReport(accumulated);
      }

      accumulated += decoder.decode();
      if (!accumulated.trim()) throw new Error("The report response was empty. Please try again.");
      setReport(accumulated);
      setStatus("ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      const retryable = /load failed|failed to fetch|networkerror|unexpected end|json|stream/i.test(message);

      if (attemptNumber < MAX_GENERATION_ATTEMPTS && retryable) {
        window.setTimeout(() => runGeneration(raw, attemptNumber + 1), 1500);
        return;
      }

      setError(getFriendlyErrorMessage(message));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(REQUEST_STORAGE_KEY);
    if (!raw) {
      setStatus("missing");
      return;
    }

    setPayload(raw);
    generateReport(raw);
  }, [generateReport]);

  useEffect(() => {
    if (status !== "loading") return;
    const timer = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % GENERATION_STAGES.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [status]);

  return (
    <main className="shell">
      <SiteHeader links={[{ href: "/forge", label: "New report" }, { href: "/disclaimer", label: "Disclaimer" }]} />

      {status === "loading" && !report && (
        <section className="loading-stage">
          <div className="orb" />
          <div className="eyebrow">Forging report</div>
          <h1>Mapping niches, automation angles, and babysitting traps…</h1>
          <p className="lede">Deep beta reports can take 60–90 seconds. Keep this tab open while NicheForge builds the report.</p>
          <div className="loading-checklist" aria-live="polite">
            {GENERATION_STAGES.slice(0, 4).map((stage, index) => (
              <span className={index === activeStage % 4 ? "active" : ""} key={stage}>{stage}</span>
            ))}
          </div>
          {attempt > 1 && <p className="notice">Connection hiccup detected. Retrying automatically… attempt {attempt} of {MAX_GENERATION_ATTEMPTS}.</p>}
          <div className="progress-bar"><span /></div>
        </section>
      )}

      {status === "loading" && report && (
        <section className="section">
          <div className="report-header streaming-header">
            <div>
              <div className="eyebrow">Report streaming</div>
              <h1>Your report is printing now…</h1>
              <p className="lede">{GENERATION_STAGES[activeStage]} Keep this tab open until the export buttons appear.</p>
            </div>
            <div className="printing-cursor" aria-hidden="true" />
          </div>
          <article className="panel markdown-report printing-report" aria-live="polite">
            <MarkdownLite text={report} />
          </article>
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
          <h1>The report needs another try.</h1>
          <p className="lede">The AI generator may have taken too long or the browser connection may have dropped. Your saved request is still available on this device.</p>
          <p className="notice error">{error}</p>
          <div className="report-actions">
            {payload && <button type="button" onClick={() => generateReport(payload)}>Retry saved report</button>}
            <Link href="/forge" className="button secondary">Start over</Link>
          </div>
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
