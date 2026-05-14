"use client";

import { SiteHeader } from "../../../../components/SiteHeader";
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
  optionSlug,
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
  modelPreference: "",
  budgetPreference: "",
  automationLevel: "",
  callTolerance: "",
  assets: [],
  avoid: [],
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


type DetailOptions = {
  buyers: string[];
  workflows: string[];
};

const budgetPreferenceOptions = [
  "Not sure",
  "Low-cost report or template ($9–$49)",
  "Monthly subscription ($19–$99/mo)",
  "Setup fee + monthly retainer",
  "Premium B2B subscription ($199+/mo)",
  "Usage-based or per-report pricing",
];

const detailOptionsBySubcategory: Record<string, DetailOptions> = {
  "med-spas": {
    buyers: ["Not sure", "Med spa owners", "Practice managers", "Aesthetic nurse injectors", "Marketing coordinators", "Multi-location clinic operators", "Patient coordinators"],
    workflows: ["Not sure", "Lead follow-up after consultations", "No-show and appointment reminders", "Review requests after visits", "Post-treatment care instructions", "Membership or package reactivation", "Social content from treatment FAQs"],
  },
  dentists: {
    buyers: ["Not sure", "Dental practice owners", "Office managers", "Hygiene coordinators", "Patient care coordinators", "Multi-location dental groups", "Dental marketing teams"],
    workflows: ["Not sure", "Hygiene recall reminders", "New patient intake", "Insurance/document follow-up", "Review generation", "Treatment-plan follow-up", "Missed-call lead capture"],
  },
  "home-services": {
    buyers: ["Not sure", "HVAC company owners", "Plumbing company owners", "Roofing contractors", "Dispatch managers", "Franchise operators", "Office admins"],
    workflows: ["Not sure", "Quote intake and qualification", "Missed-call follow-up", "Dispatch triage", "Seasonal maintenance reminders", "Review requests", "Before/after job summaries"],
  },
  "gyms-and-fitness": {
    buyers: ["Not sure", "Gym owners", "Studio managers", "Personal trainers", "Membership coordinators", "Franchise fitness operators", "Wellness program leads"],
    workflows: ["Not sure", "Trial class follow-up", "Member retention check-ins", "Lead nurturing", "Class reminders", "Review requests", "Workout/content repurposing"],
  },
  restaurants: {
    buyers: ["Not sure", "Restaurant owners", "General managers", "Catering managers", "Marketing coordinators", "Multi-location operators", "Event managers"],
    workflows: ["Not sure", "Catering lead follow-up", "Review monitoring", "Event promotion", "Loyalty messaging", "Menu update announcements", "Private party inquiries"],
  },
  "auto-services": {
    buyers: ["Not sure", "Auto shop owners", "Service managers", "Dealership service departments", "Fleet maintenance coordinators", "Detailing shop owners", "Office admins"],
    workflows: ["Not sure", "Maintenance reminders", "Quote intake", "Recall follow-up", "Review requests", "Fleet service scheduling", "Post-service recommendations"],
  },
  "accounting-and-bookkeeping": {
    buyers: ["Not sure", "Bookkeeping firm owners", "CPA practices", "Fractional CFOs", "Client success managers", "Small business accountants", "Operations admins"],
    workflows: ["Not sure", "Monthly document chasing", "Close checklist reminders", "Owner report summaries", "Transaction categorization review", "Tax prep intake", "Client status updates"],
  },
  "legal-admin": {
    buyers: ["Not sure", "Small law firms", "Paralegal managers", "Intake coordinators", "Solo attorneys", "Legal ops teams", "Practice administrators"],
    workflows: ["Not sure", "Client intake screening", "Document summaries", "Case status updates", "Appointment prep", "FAQ responses", "Deadline/checklist reminders"],
  },
  insurance: {
    buyers: ["Not sure", "Independent insurance agents", "Agency owners", "Renewal managers", "Claims coordinators", "Benefits brokers", "Customer service reps"],
    workflows: ["Not sure", "Policy renewal reminders", "Lead qualification", "Claims prep", "Coverage Q&A", "Cross-sell opportunities", "Client document collection"],
  },
  "real-estate": {
    buyers: ["Not sure", "Real estate agents", "Brokerage owners", "Property managers", "Buyer agents", "Listing coordinators", "Investor-focused agents"],
    workflows: ["Not sure", "Open-house follow-up", "Buyer update emails", "Listing research", "Local market reports", "Lead nurturing", "Property management requests"],
  },
  recruiting: {
    buyers: ["Not sure", "Recruiting agencies", "HR managers", "Talent acquisition leads", "Staffing firms", "Hiring managers", "Recruiting coordinators"],
    workflows: ["Not sure", "Candidate screening", "Interview note summaries", "Role matching", "Status updates", "Job description drafts", "Pipeline prioritization"],
  },
  consultants: {
    buyers: ["Not sure", "Solo consultants", "Boutique agencies", "Fractional operators", "Strategy firms", "Client success leads", "Proposal managers"],
    workflows: ["Not sure", "Client research packets", "Proposal drafts", "Meeting summaries", "Follow-up tasks", "Simple dashboards", "Quarterly review prep"],
  },
  "newsletter-operators": {
    buyers: ["Not sure", "Newsletter creators", "Media operators", "Sponsorship managers", "Niche publishers", "Analyst creators", "Community newsletter teams"],
    workflows: ["Not sure", "Topic research", "Sponsor matching", "Trend summaries", "Content repurposing", "Ad inventory tracking", "Subscriber Q&A mining"],
  },
  "course-creators": {
    buyers: ["Not sure", "Course creators", "Cohort operators", "Education businesses", "Instructional designers", "Membership owners", "Creator agencies"],
    workflows: ["Not sure", "Student support questions", "Lesson update reminders", "Template creation", "Cohort onboarding", "Progress check-ins", "Resource library cleanup"],
  },
  coaches: {
    buyers: ["Not sure", "Business coaches", "Fitness coaches", "Career coaches", "Accountability coaches", "Coaching program operators", "Group coaching teams"],
    workflows: ["Not sure", "Client intake", "Session prep", "Accountability check-ins", "Resource recommendations", "Progress summaries", "Follow-up email drafts"],
  },
  "youtubers-and-podcasters": {
    buyers: ["Not sure", "YouTubers", "Podcasters", "Content teams", "Sponsor managers", "Editors/producers", "Creator agencies"],
    workflows: ["Not sure", "Episode research", "Show notes", "Short-form clip ideas", "Sponsor packages", "Audience Q&A", "Content calendar planning"],
  },
  "community-builders": {
    buyers: ["Not sure", "Discord community owners", "Membership operators", "Online course communities", "Event community managers", "Creator community teams", "Niche forum operators"],
    workflows: ["Not sure", "New member onboarding", "Moderation summaries", "Event follow-up", "Member insight reports", "Question clustering", "Engagement prompts"],
  },
  "template-sellers": {
    buyers: ["Not sure", "Template shop owners", "Notion creators", "Prompt pack sellers", "Swipe file sellers", "Marketplace creators", "Digital product operators"],
    workflows: ["Not sure", "Template update ideas", "Customer onboarding", "Use-case examples", "Product description drafts", "Support FAQs", "Bundle recommendations"],
  },
  "sales-ops": {
    buyers: ["Not sure", "Sales ops managers", "RevOps teams", "B2B founders", "Account executives", "SDR managers", "CRM admins"],
    workflows: ["Not sure", "Lead scoring", "Account research", "CRM cleanup", "Follow-up prompts", "Pipeline summaries", "Sales call prep"],
  },
  "customer-support": {
    buyers: ["Not sure", "Support managers", "Customer success leaders", "SaaS founders", "Help desk teams", "Operations managers", "QA leads"],
    workflows: ["Not sure", "Ticket triage", "Help doc updates", "Escalation summaries", "Support QA audits", "Recurring complaint reports", "Customer onboarding questions"],
  },
  "hr-and-admin": {
    buyers: ["Not sure", "HR managers", "People ops leads", "Office managers", "Recruiting coordinators", "Small business admins", "Employee experience teams"],
    workflows: ["Not sure", "Employee onboarding", "Policy Q&A", "Interview note summaries", "Internal announcements", "Training reminders", "Employee document collection"],
  },
  "compliance-monitoring": {
    buyers: ["Not sure", "Compliance managers", "Operations leaders", "Audit teams", "Vendor risk managers", "Regulated SMBs", "Policy owners"],
    workflows: ["Not sure", "Policy checklist reviews", "Audit prep", "Vendor monitoring", "Exception alerts", "Document change summaries", "Training completion reminders"],
  },
  "internal-reporting": {
    buyers: ["Not sure", "Operations managers", "Department heads", "Founders/CEOs", "Finance leads", "Customer success leaders", "Analytics managers"],
    workflows: ["Not sure", "Weekly KPI summaries", "Anomaly detection", "Executive briefs", "Dashboard narratives", "Team status reports", "Monthly business reviews"],
  },
  "vendor-operations": {
    buyers: ["Not sure", "Procurement teams", "Operations managers", "Vendor managers", "Finance admins", "Agency owners", "IT managers"],
    workflows: ["Not sure", "Renewal tracking", "Contract summaries", "Vendor comparison reports", "Risk flags", "SLA follow-up", "Invoice/request cleanup"],
  },
  "donor-communications": {
    buyers: ["Not sure", "Development directors", "Nonprofit founders", "Donor relations managers", "Church admins", "Fundraising teams", "Mission communications leads"],
    workflows: ["Not sure", "Thank-you notes", "Impact updates", "Donor reactivation", "Giving summaries", "Campaign follow-up", "Major donor prep"],
  },
  "volunteer-coordination": {
    buyers: ["Not sure", "Volunteer coordinators", "Program managers", "Church admins", "Event leaders", "Nonprofit operations teams", "Outreach directors"],
    workflows: ["Not sure", "Volunteer scheduling", "Reminder messages", "Onboarding packets", "Role matching", "Post-event follow-up", "Availability tracking"],
  },
  "grant-and-admin-ops": {
    buyers: ["Not sure", "Grant writers", "Nonprofit directors", "Program managers", "Admin teams", "Foundation relations staff", "Operations directors"],
    workflows: ["Not sure", "Grant research", "Reporting calendars", "Deadline reminders", "Document prep", "Outcome summaries", "Application checklists"],
  },
  "event-follow-up": {
    buyers: ["Not sure", "Event coordinators", "Nonprofit marketers", "Church admins", "Fundraising teams", "Community managers", "Program leads"],
    workflows: ["Not sure", "Attendance capture", "Thank-you sequences", "Next-step messaging", "Event recap drafts", "Sponsor follow-up", "Volunteer follow-up"],
  },
  "content-repurposing": {
    buyers: ["Not sure", "Nonprofit communications teams", "Church media teams", "Mission organizations", "Newsletter managers", "Social media coordinators", "Content directors"],
    workflows: ["Not sure", "Sermon repurposing", "Field report summaries", "Newsletter drafts", "Social post creation", "Donor update drafts", "Testimonial extraction"],
  },
  "pastoral-care-ops": {
    buyers: ["Not sure", "Church admins", "Pastoral care teams", "Small group leaders", "Member care coordinators", "Prayer teams", "Ministry directors"],
    workflows: ["Not sure", "Prayer request tracking", "Care follow-up reminders", "Visit prep", "Member check-ins", "Meal train coordination", "Confidential note summaries"],
  },
  "competitor-tracking": {
    buyers: ["Not sure", "Agency strategists", "SaaS founders", "Product marketers", "Category analysts", "Ecommerce operators", "Sales teams"],
    workflows: ["Not sure", "Pricing change monitoring", "Offer/page tracking", "Ad/content scans", "Launch alerts", "Hiring signal summaries", "Competitor newsletter summaries"],
  },
  "lead-intelligence": {
    buyers: ["Not sure", "Sales teams", "B2B agencies", "Founders", "RevOps teams", "Outbound consultants", "Partnership managers"],
    workflows: ["Not sure", "Trigger event detection", "Lead enrichment", "Priority scoring", "Buyer context briefs", "Personalized opener drafts", "Account list cleanup"],
  },
  "review-monitoring": {
    buyers: ["Not sure", "Local business owners", "Agency owners", "Franchise operators", "Reputation managers", "Customer experience teams", "Multi-location brands"],
    workflows: ["Not sure", "Review sentiment summaries", "Complaint pattern detection", "Competitor gap reports", "Local alert emails", "Response draft creation", "Monthly reputation reports"],
  },
  "market-maps": {
    buyers: ["Not sure", "Investors", "Agency strategists", "Founders", "Consultants", "B2B buyers", "Category researchers"],
    workflows: ["Not sure", "Vendor directory creation", "Category scans", "Buyer guide updates", "Comparison reports", "Market map refreshes", "New entrant alerts"],
  },
  "buyer-intent-alerts": {
    buyers: ["Not sure", "Sales teams", "Recruiting firms", "Agencies", "B2B founders", "Partnership teams", "Niche consultants"],
    workflows: ["Not sure", "Job post monitoring", "Forum/X signal scans", "Funding/news alerts", "Website change detection", "Intent summary emails", "Lead routing"],
  },
  "regulatory-trackers": {
    buyers: ["Not sure", "Compliance teams", "Grant teams", "Policy consultants", "Trade associations", "Regulated SMBs", "Operations leaders"],
    workflows: ["Not sure", "Rule update summaries", "Compliance deadline alerts", "Grant deadline tracking", "Policy change briefs", "Action checklist generation", "Monthly digest reports"],
  },
};

function selectOptions(options: string[]) {
  return (
    <>
      <option value="">Choose one</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </>
  );
}

export function ExploreDetailsForm({ categorySlug, subcategorySlug }: Props) {
  const router = useRouter();
  const category = categoryFromSlug(categorySlug);
  const subcategory = category ? optionFromSlug(category.subcategories, subcategorySlug) : undefined;
  const [form, setForm] = useState<FormState>(initialState);
  const detailOptions = subcategory ? detailOptionsBySubcategory[optionSlug(subcategory.label)] : undefined;

  if (!category || !subcategory || !detailOptions) {
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
Preferred business model: ${form.modelPreference || "not specified"}
Budget/pricing preference: ${form.budgetPreference || "not specified"}
Desired automation: ${form.automationLevel || "not specified"}
Client interaction tolerance: ${form.callTolerance || "not specified"}
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
      <SiteHeader links={[{ href: `/forge/explore/${category.slug}`, label: "Back" }, { href: "/forge", label: "Change path" }]} />

      <section className="hero compact-hero">
        <div className="eyebrow">Path 2 / Step 3–4 of 4</div>
        <h1>Shape the idea without overthinking it.</h1>
        <p className="lede">You chose <strong>{category.label}</strong> → <strong>{subcategory.label}</strong>. Add only what you know. Most fields are optional so you can give the forge a quick spin.</p>
      </section>

      <section className="section">
        <form className="panel form-grid wide-form" onSubmit={submit}>
          <label><span>Beta access code <em className="required">required</em></span><input value={form.betaCode} onChange={(e) => update("betaCode", e.target.value)} placeholder="Enter private beta code" required /></label>

          <div className="two">
            <label><span>Who might buy this? <em>optional</em></span><select value={form.buyerType} onChange={(e) => update("buyerType", e.target.value)}>{selectOptions(detailOptions.buyers)}</select></label>
            <label><span>What workflow sounds painful? <em>optional</em></span><select value={form.painPoint} onChange={(e) => update("painPoint", e.target.value)}>{selectOptions(detailOptions.workflows)}</select></label>
          </div>

          <div className="two">
            <label><span>Preferred model <em>optional</em></span><select value={form.modelPreference} onChange={(e) => update("modelPreference", e.target.value)}>{selectOptions(businessModels)}</select></label>
            <label><span>Budget / pricing preference <em>optional</em></span><select value={form.budgetPreference} onChange={(e) => update("budgetPreference", e.target.value)}>{selectOptions(budgetPreferenceOptions)}</select></label>
          </div>

          <div className="two">
            <label><span>Desired automation level <em>optional</em></span><select value={form.automationLevel} onChange={(e) => update("automationLevel", e.target.value)}>{selectOptions(automationLevels)}</select></label>
            <label><span>Client interaction tolerance <em>optional</em></span><select value={form.callTolerance} onChange={(e) => update("callTolerance", e.target.value)}>{selectOptions(callToleranceLevels)}</select></label>
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
