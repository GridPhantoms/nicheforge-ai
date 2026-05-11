"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type FormState = {
  betaCode: string;
  idea: string;
  audience: string;
  modelPreference: string;
  automationLevel: string;
  callTolerance: string;
  assets: string;
  avoid: string;
};

const initialState: FormState = {
  betaCode: "",
  idea: "",
  audience: "",
  modelPreference: "",
  automationLevel: "95% AI-assisted if possible",
  callTolerance: "Minimal calls / low-touch",
  assets: "",
  avoid: "",
};

export default function ForgePage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setReport("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Report generation failed.");
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/" className="logo"><span className="logo-mark">NF</span> NicheForge AI</Link>
        <div className="nav-links"><Link href="/">Home</Link><Link href="/early-access">Early access</Link></div>
      </nav>

      <section className="hero">
        <div className="eyebrow">Private beta forge</div>
        <h1>Generate an AI Business Angle Report.</h1>
        <p className="lede">This early beta is gated by access code and intended for a tiny internal test group. Results appear in-browser in real time.</p>
      </section>

      <section className="section two">
        <form className="panel form-grid" onSubmit={submit}>
          <label>
            Beta access code
            <input value={form.betaCode} onChange={(e) => update("betaCode", e.target.value)} placeholder="Enter private beta code" required />
          </label>
          <label>
            Business idea, model, niche, competitor, X post, or rough concept
            <textarea value={form.idea} onChange={(e) => update("idea", e.target.value)} placeholder="Example: AI receptionist for dentists, automated competitor tracker for med spas, or an X post about a creator selling templates..." required />
          </label>
          <div className="two">
            <label>
              Target audience / buyer
              <input value={form.audience} onChange={(e) => update("audience", e.target.value)} placeholder="Optional" />
            </label>
            <label>
              Preferred model
              <select value={form.modelPreference} onChange={(e) => update("modelPreference", e.target.value)}>
                <option value="">No preference</option>
                <option>Automated report/tool</option>
                <option>Productized service</option>
                <option>Micro-SaaS</option>
                <option>Lead intelligence</option>
                <option>Local business automation</option>
                <option>Content/data business</option>
              </select>
            </label>
          </div>
          <div className="two">
            <label>
              Desired automation level
              <input value={form.automationLevel} onChange={(e) => update("automationLevel", e.target.value)} />
            </label>
            <label>
              Client interaction tolerance
              <input value={form.callTolerance} onChange={(e) => update("callTolerance", e.target.value)} />
            </label>
          </div>
          <label>
            Skills, assets, audience, or advantages
            <textarea value={form.assets} onChange={(e) => update("assets", e.target.value)} placeholder="Optional" />
          </label>
          <label>
            Niches, delivery styles, or risks to avoid
            <textarea value={form.avoid} onChange={(e) => update("avoid", e.target.value)} placeholder="Optional" />
          </label>
          <button type="submit" disabled={loading}>{loading ? "Forging report..." : "Generate NicheForge Report"}</button>
          <p className="notice">Brainstorming only. No guarantees, no financial/legal advice, and every idea needs real-world validation before building.</p>
        </form>

        <aside className="panel">
          <h2>Report output</h2>
          {!report && !error && <p>Your generated report will appear here after the model finishes.</p>}
          {error && <p className="notice error">{error}</p>}
          {report && <div className="report">{report}</div>}
        </aside>
      </section>
    </main>
  );
}
