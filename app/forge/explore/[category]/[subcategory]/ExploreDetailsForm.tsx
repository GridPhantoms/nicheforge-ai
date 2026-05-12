"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  assetOptions,
  automationLevels,
  businessModels,
  callToleranceLevels,
  categoryFromSlug,
  avoidOptions,
  optionFromSlug,
} from "../../options";

type Props = {
  categorySlug: string;
  subcategorySlug: string;
};

type FormState = {
  betaCode: string;
  buyerType: string;
  painPoint: string;
  modelPreference: string;
  budgetPreference: string;
  automationLevel: string;
  callTolerance: string;
  assets: string[];
  avoid: string[];
};

const initialState: FormState = {
  betaCode: "",
  buyerType: "",
  painPoint: "",
  modelPreference: "No preference",
  budgetPreference: "Recurring subscription or low-touch paid report",
  automationLevel: "85% automated / mostly systemized",
  callTolerance: "One onboarding call is okay",
  assets: [],
  avoid: ["Avoid heavy custom client work"],
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function ChoiceButtons({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="pill-grid">
      {options.map((option) => (
        <button
          className={`pill-choice ${selected.includes(option) ? "selected" : ""}`}
          key={option}
          onClick={() => onToggle(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function ExploreDetailsForm({ categorySlug, subcategorySlug }: Props) {
  const router = useRouter();
  const category = categoryFromSlug(categorySlug);
  const subcategory = category ? optionFromSlug(category.subcategories, subcategorySlug) : undefined;
  const [form, setForm] = useState<FormState>(initialState);

  if (!category || !subcategory) {
    return null;
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildIdea() {
    return `The user is open to any good AI-aided business concept and wants help discovering ideas through a guided decision pathway.

Selected broad category: ${category?.label}
Selected sub-category: ${subcategory?.label}
Buyer/customer type: ${form.buyerType || "not specified"}
Pain point or workflow to improve: ${form.painPoint || "not specified"}
Preferred business model: ${form.modelPreference}
Budget/pricing preference: ${form.budgetPreference || "not specified"}
Desired automation: ${form.automationLevel}
Client interaction tolerance: ${form.callTolerance}
Skills/assets/audience/advantages: ${form.assets.filter(Boolean).join("; ") || "not specified"}
Avoid/preferences: ${form.avoid.filter(Boolean).join("; ") || "not specified"}

Generate several possible business concepts first, then select the strongest one and produce the full NicheForge report.`;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    sessionStorage.setItem("nicheforge:pending-report", JSON.stringify({
      betaCode: form.betaCode,
      idea: buildIdea(),
      audience: form.buyerType,
      modelPreference: form.modelPreference,
      automationLevel: form.automationLevel,
      callTolerance: form.callTolerance,
      assets: form.assets.filter(Boolean).join("; "),
      avoid: form.avoid.filter(Boolean).join("; "),
      mode: "explore",
    }));
    router.push("/report");
  }

  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/" className="logo"><span className="logo-mark">NF</span> NicheForge AI</Link>
        <div className="nav-links"><Link href={`/forge/explore/${category.slug}`}>Back</Link><Link href="/forge">Change path</Link></div>
      </nav>

      <section className="hero compact-hero">
        <div className="eyebrow">Path 2 / Step 3–4 of 4</div>
        <h1>Shape the idea without overthinking it.</h1>
        <p className="lede">You chose <strong>{category.label}</strong> → <strong>{subcategory.label}</strong>. Add only what you know. Most fields are optional so you can give the forge a quick spin.</p>
      </section>

      <section className="section">
        <form className="panel form-grid wide-form" onSubmit={submit}>
          <label><span>Beta access code <em className="required">required</em></span><input value={form.betaCode} onChange={(e) => update("betaCode", e.target.value)} placeholder="Enter private beta code" required /></label>

          <div className="two">
            <label><span>Who might buy this? <em>optional</em></span><input value={form.buyerType} onChange={(e) => update("buyerType", e.target.value)} placeholder="Examples below" /></label>
            <label><span>What workflow sounds painful? <em>optional</em></span><input value={form.painPoint} onChange={(e) => update("painPoint", e.target.value)} placeholder="Examples below" /></label>
          </div>
          <div className="example-row"><span>Buyer examples: executive pastor, volunteer coordinator, ops manager, local owner, solo consultant.</span><span>Workflow examples: donor follow-up, missed leads, weekly reporting, review monitoring, event recaps.</span></div>

          <div className="two">
            <label><span>Preferred model <em>optional</em></span><select value={form.modelPreference} onChange={(e) => update("modelPreference", e.target.value)}>{businessModels.map((model) => <option key={model}>{model}</option>)}</select></label>
            <label><span>Budget / pricing preference <em>optional</em></span><input value={form.budgetPreference} onChange={(e) => update("budgetPreference", e.target.value)} placeholder="Example: monthly subscription, setup fee + retainer, low-cost paid report" /></label>
          </div>

          <div className="two">
            <label><span>Desired automation level <em>optional</em></span><select value={form.automationLevel} onChange={(e) => update("automationLevel", e.target.value)}>{automationLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
            <label><span>Client interaction tolerance <em>optional</em></span><select value={form.callTolerance} onChange={(e) => update("callTolerance", e.target.value)}>{callToleranceLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
          </div>

          <div className="field-block">
            <div className="field-label"><span>What advantages can you bring? <em>optional</em></span></div>
            <p className="microcopy">Pick anything true. This means skills, access, audience, niche knowledge, or unfair advantages NicheForge should consider.</p>
            <ChoiceButtons options={assetOptions} selected={form.assets} onToggle={(value) => update("assets", toggle(form.assets, value))} />
          </div>

          <div className="field-block">
            <div className="field-label"><span>Anything you want to avoid? <em>optional</em></span></div>
            <p className="microcopy">What would make the business annoying, risky, or unrealistic for you?</p>
            <ChoiceButtons options={avoidOptions} selected={form.avoid} onToggle={(value) => update("avoid", toggle(form.avoid, value))} />
          </div>

          <button type="submit">Generate NicheForge Report</button>
          <p className="notice">Brainstorming only. No guarantees, no financial/legal advice, and every idea needs real-world validation before building.</p>
        </form>
      </section>
    </main>
  );
}
