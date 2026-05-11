"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  betaCode: string;
  category: string;
  subcategory: string;
  buyerType: string;
  painPoint: string;
  modelPreference: string;
  budgetPreference: string;
  automationLevel: string;
  callTolerance: string;
  assets: string;
  avoid: string;
};

const categories: Record<string, string[]> = {
  "Local services": ["Med spas", "Dentists", "Home services", "Gyms/fitness", "Restaurants", "Auto services"],
  "Professional services": ["Accounting/bookkeeping", "Legal admin", "Insurance", "Real estate", "Recruiting", "Consultants"],
  "Creators & educators": ["Newsletter operators", "Course creators", "Coaches", "YouTubers/podcasters", "Community builders"],
  "B2B operations": ["Sales ops", "Customer support", "HR/admin", "Compliance monitoring", "Internal reporting"],
  "Nonprofits & churches": ["Donor communications", "Volunteer coordination", "Grant/admin ops", "Event follow-up", "Content repurposing"],
  "Data/report businesses": ["Competitor tracking", "Lead intelligence", "Review monitoring", "Market maps", "Buyer-intent alerts"],
};

const initialState: FormState = {
  betaCode: "",
  category: "",
  subcategory: "",
  buyerType: "",
  painPoint: "",
  modelPreference: "",
  budgetPreference: "Recurring subscription or low-touch paid report",
  automationLevel: "95% AI-assisted if possible",
  callTolerance: "Minimal calls / low-touch",
  assets: "",
  avoid: "",
};

export default function ExplorePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const subcategories = useMemo(() => (form.category ? categories[form.category] ?? [] : []), [form.category]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value, ...(key === "category" ? { subcategory: "" } : {}) }));
  }

  function buildIdea() {
    return `The user is open to any good AI-aided business concept and wants help discovering ideas through a decision tree.

Selected broad category: ${form.category}
Selected sub-category: ${form.subcategory}
Buyer/customer type: ${form.buyerType}
Pain point or workflow to improve: ${form.painPoint}
Preferred business model: ${form.modelPreference || "no preference"}
Budget/pricing preference: ${form.budgetPreference}
Desired automation: ${form.automationLevel}
Client interaction tolerance: ${form.callTolerance}
Assets/advantages: ${form.assets || "not specified"}
Avoid: ${form.avoid || "not specified"}

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
      assets: form.assets,
      avoid: form.avoid,
      mode: "explore",
    }));
    router.push("/report");
  }

  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/" className="logo"><span className="logo-mark">NF</span> NicheForge AI</Link>
        <div className="nav-links"><Link href="/forge">Change path</Link><Link href="/early-access">Early access</Link></div>
      </nav>

      <section className="hero compact-hero">
        <div className="eyebrow">Path 2 / discover ideas</div>
        <h1>Explore AI-aided business concepts by category.</h1>
        <p className="lede">Choose a broad area, drill into a subcategory, then answer a few prompts so NicheForge can synthesize a strong concept and report.</p>
      </section>

      <section className="section">
        <form className="panel form-grid wide-form" onSubmit={submit}>
          <label>Beta access code<input value={form.betaCode} onChange={(e) => update("betaCode", e.target.value)} placeholder="Enter private beta code" required /></label>
          <div className="two">
            <label>Broad business category<select value={form.category} onChange={(e) => update("category", e.target.value)} required><option value="">Choose a category</option>{Object.keys(categories).map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Sub-category<select value={form.subcategory} onChange={(e) => update("subcategory", e.target.value)} required disabled={!form.category}><option value="">Choose a sub-category</option>{subcategories.map((subcategory) => <option key={subcategory}>{subcategory}</option>)}</select></label>
          </div>
          <div className="two">
            <label>Who would you most like to help?<input value={form.buyerType} onChange={(e) => update("buyerType", e.target.value)} placeholder="Example: solo operators, local owners, agency teams" required /></label>
            <label>What pain/workflow sounds interesting?<input value={form.painPoint} onChange={(e) => update("painPoint", e.target.value)} placeholder="Example: missed leads, reporting, follow-up, monitoring" required /></label>
          </div>
          <div className="two">
            <label>Preferred model<select value={form.modelPreference} onChange={(e) => update("modelPreference", e.target.value)}><option value="">No preference</option><option>Automated report/tool</option><option>Productized service</option><option>Micro-SaaS</option><option>Lead intelligence</option><option>Local business automation</option><option>Content/data business</option></select></label>
            <label>Budget / pricing preference<input value={form.budgetPreference} onChange={(e) => update("budgetPreference", e.target.value)} /></label>
          </div>
          <div className="two">
            <label>Desired automation level<input value={form.automationLevel} onChange={(e) => update("automationLevel", e.target.value)} /></label>
            <label>Client interaction tolerance<input value={form.callTolerance} onChange={(e) => update("callTolerance", e.target.value)} /></label>
          </div>
          <label>Skills, assets, audience, or advantages<textarea value={form.assets} onChange={(e) => update("assets", e.target.value)} placeholder="Optional" /></label>
          <label>Niches, delivery styles, or risks to avoid<textarea value={form.avoid} onChange={(e) => update("avoid", e.target.value)} placeholder="Optional" /></label>
          <button type="submit">Generate NicheForge Report</button>
          <p className="notice">Brainstorming only. No guarantees, no financial/legal advice, and every idea needs real-world validation before building.</p>
        </form>
      </section>
    </main>
  );
}
