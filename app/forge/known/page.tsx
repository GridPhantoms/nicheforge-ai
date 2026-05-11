"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function KnownIdeaPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    sessionStorage.setItem("nicheforge:pending-report", JSON.stringify({ ...form, mode: "known" }));
    router.push("/report");
  }

  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/" className="logo"><span className="logo-mark">NF</span> NicheForge AI</Link>
        <div className="nav-links"><Link href="/forge">Change path</Link><Link href="/early-access">Early access</Link></div>
      </nav>

      <section className="hero compact-hero">
        <div className="eyebrow">Path 1 / focused idea</div>
        <h1>Brainstorm around a business idea you already have.</h1>
        <p className="lede">Paste the idea, proven model, niche, competitor, or X post. NicheForge will analyze adjacent niches, automation angles, and low-touch variants.</p>
      </section>

      <section className="section">
        <form className="panel form-grid wide-form" onSubmit={submit}>
          <label>Beta access code<input value={form.betaCode} onChange={(e) => update("betaCode", e.target.value)} placeholder="Enter private beta code" required /></label>
          <label>Business idea, model, niche, competitor, X post, or rough concept<textarea value={form.idea} onChange={(e) => update("idea", e.target.value)} placeholder="Example: AI receptionist for dentists, automated competitor tracker for med spas, or an X post about a creator selling templates..." required /></label>
          <label>Target audience / buyer<input value={form.audience} onChange={(e) => update("audience", e.target.value)} placeholder="Optional" /></label>
          <div className="two">
            <label>Preferred model<select value={form.modelPreference} onChange={(e) => update("modelPreference", e.target.value)}><option value="">No preference</option><option>Automated report/tool</option><option>Productized service</option><option>Micro-SaaS</option><option>Lead intelligence</option><option>Local business automation</option><option>Content/data business</option></select></label>
            <label>Desired automation level<input value={form.automationLevel} onChange={(e) => update("automationLevel", e.target.value)} /></label>
          </div>
          <label>Client interaction tolerance<input value={form.callTolerance} onChange={(e) => update("callTolerance", e.target.value)} /></label>
          <label>Skills, assets, audience, or advantages<textarea value={form.assets} onChange={(e) => update("assets", e.target.value)} placeholder="Optional" /></label>
          <label>Niches, delivery styles, or risks to avoid<textarea value={form.avoid} onChange={(e) => update("avoid", e.target.value)} placeholder="Optional" /></label>
          <button type="submit">Generate NicheForge Report</button>
          <p className="notice">Brainstorming only. No guarantees, no financial/legal advice, and every idea needs real-world validation before building.</p>
        </form>
      </section>
    </main>
  );
}
