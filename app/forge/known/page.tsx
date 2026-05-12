"use client";

import { SiteHeader } from "../../components/SiteHeader";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { assetOptions, automationLevels, avoidOptions, businessModels, callToleranceLevels } from "../explore/options";

type FormState = {
  betaCode: string;
  idea: string;
  audience: string;
  modelPreference: string;
  automationLevel: string;
  callTolerance: string;
  assets: string[];
  customAssets: string;
  avoid: string[];
  customAvoid: string;
};

const initialState: FormState = {
  betaCode: "",
  idea: "",
  audience: "",
  modelPreference: "",
  automationLevel: "",
  callTolerance: "",
  assets: [],
  customAssets: "",
  avoid: [],
  customAvoid: "",
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function ChoiceButtons({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="pill-grid">
      {options.map((option) => (
        <button className={`pill-choice ${selected.includes(option) ? "selected" : ""}`} key={option} onClick={() => onToggle(option)} type="button">
          {option}
        </button>
      ))}
    </div>
  );
}

export default function KnownIdeaPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    sessionStorage.setItem("nicheforge:pending-report", JSON.stringify({
      ...form,
      assets: [...form.assets, form.customAssets].filter(Boolean).join("; "),
      avoid: [...form.avoid, form.customAvoid].filter(Boolean).join("; "),
      mode: "known",
    }));
    router.push("/report");
  }

  return (
    <main className="shell">
      <SiteHeader links={[{ href: "/forge", label: "Change path" }, { href: "/early-access", label: "Early access" }]} />

      <section className="hero compact-hero">
        <div className="eyebrow">Path 1 / focused idea</div>
        <h1>Brainstorm around a business idea you already have.</h1>
        <p className="lede">Paste the idea, proven model, niche, competitor, or X post. NicheForge will analyze adjacent niches, automation angles, and low-touch variants.</p>
      </section>

      <section className="section">
        <form className="panel form-grid wide-form" onSubmit={submit}>
          <label><span>Beta access code <em className="required">required</em></span><input value={form.betaCode} onChange={(e) => update("betaCode", e.target.value)} placeholder="Enter private beta code" required /></label>
          <label><span>Business idea, model, niche, competitor, X post, or rough concept <em className="required">required</em></span><textarea value={form.idea} onChange={(e) => update("idea", e.target.value)} placeholder="Example: AI receptionist for dentists, automated competitor tracker for med spas, or an X post about a creator selling templates..." required /></label>
          <label><span>Target audience / buyer <em>optional</em></span><input value={form.audience} onChange={(e) => update("audience", e.target.value)} /></label>
          <div className="two">
            <label><span>Preferred model <em>optional</em></span><select value={form.modelPreference} onChange={(e) => update("modelPreference", e.target.value)}><option value="">Choose one</option>{businessModels.map((model) => <option key={model}>{model}</option>)}</select></label>
            <label><span>Desired automation level <em>optional</em></span><select value={form.automationLevel} onChange={(e) => update("automationLevel", e.target.value)}><option value="">Choose one</option>{automationLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
          </div>
          <label><span>Client interaction tolerance <em>optional</em></span><select value={form.callTolerance} onChange={(e) => update("callTolerance", e.target.value)}><option value="">Choose one</option>{callToleranceLevels.map((level) => <option key={level}>{level}</option>)}</select></label>

          <div className="field-block">
            <div className="field-label"><span>What advantages can you bring? <em>optional</em></span></div>
            <p className="microcopy">Skills, assets, audience, or advantages means anything the report should consider: niche knowledge, writing ability, access to buyers, sales ability, no-code skills, or an existing audience.</p>
            <ChoiceButtons options={assetOptions} selected={form.assets} onToggle={(value) => update("assets", toggle(form.assets, value))} />
            <label><span>Add your own:</span><textarea value={form.customAssets} onChange={(e) => update("customAssets", e.target.value)} placeholder="Optional example: I know nonprofit ops, can write strong emails, have a local owner network, or can build Zapier automations." /></label>
          </div>

          <div className="field-block">
            <div className="field-label"><span>Anything you want to avoid? <em>optional</em></span></div>
            <p className="microcopy">Interview-style preference check: what should NicheForge steer away from?</p>
            <ChoiceButtons options={avoidOptions} selected={form.avoid} onToggle={(value) => update("avoid", toggle(form.avoid, value))} />
            <label><span>Add your own:</span><textarea value={form.customAvoid} onChange={(e) => update("customAvoid", e.target.value)} placeholder="Optional example: avoid cold calls, avoid regulated niches, avoid heavy custom dashboards, or avoid ad-spend-dependent ideas." /></label>
          </div>
          <button type="submit">Generate NicheForge Report</button>
          <p className="notice">Brainstorming only. No guarantees, no financial/legal advice, and every idea needs real-world validation before building.</p>
        </form>
      </section>
    </main>
  );
}
