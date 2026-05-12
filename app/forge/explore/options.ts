export type Option = {
  label: string;
  description: string;
};

export type ExploreCategory = Option & {
  slug: string;
  subcategories: Option[];
};

export const exploreCategories: ExploreCategory[] = [
  {
    slug: "local-services",
    label: "Local services",
    description: "Businesses with missed calls, follow-up gaps, reviews, scheduling, and customer questions.",
    subcategories: [
      { label: "Med spas", description: "Lead follow-up, consultation prep, reviews, post-visit nurture." },
      { label: "Dentists", description: "Appointment reminders, patient FAQs, hygiene reactivation, reviews." },
      { label: "Home services", description: "Quote intake, dispatch triage, seasonal reminders, review requests." },
      { label: "Gyms & fitness", description: "Trial follow-up, member retention, content, check-ins." },
      { label: "Restaurants", description: "Catering leads, reviews, event promotion, loyalty messaging." },
      { label: "Auto services", description: "Maintenance reminders, quote intake, recalls, review follow-up." },
    ],
  },
  {
    slug: "professional-services",
    label: "Professional services",
    description: "Knowledge businesses that need better intake, admin, document prep, and client communication.",
    subcategories: [
      { label: "Accounting & bookkeeping", description: "Monthly close reminders, document chasing, owner reports." },
      { label: "Legal admin", description: "Intake, document summaries, status updates, client prep." },
      { label: "Insurance", description: "Renewal alerts, lead qualification, policy Q&A, claim prep." },
      { label: "Real estate", description: "Listing intel, buyer updates, open-house follow-up, local reports." },
      { label: "Recruiting", description: "Candidate screening, interview prep, role matching, status updates." },
      { label: "Consultants", description: "Research packets, client dashboards, proposal drafts, follow-up." },
    ],
  },
  {
    slug: "creators-educators",
    label: "Creators & educators",
    description: "People with content, audiences, curriculum, communities, or repeatable expertise.",
    subcategories: [
      { label: "Newsletter operators", description: "Research, sponsor matching, trend reports, repurposing." },
      { label: "Course creators", description: "Student support, lesson updates, templates, cohort ops." },
      { label: "Coaches", description: "Intake, session prep, accountability check-ins, resource libraries." },
      { label: "YouTubers & podcasters", description: "Research, clips, show notes, sponsor packages, audience Q&A." },
      { label: "Community builders", description: "Onboarding, moderation summaries, event follow-up, member intel." },
      { label: "Template sellers", description: "Prompt packs, swipe files, onboarding, update subscriptions." },
    ],
  },
  {
    slug: "b2b-operations",
    label: "B2B operations",
    description: "Internal workflows where companies already pay to save time, reduce errors, or see risk sooner.",
    subcategories: [
      { label: "Sales ops", description: "Lead scoring, account research, CRM hygiene, follow-up prompts." },
      { label: "Customer support", description: "Ticket triage, help docs, escalation summaries, QA audits." },
      { label: "HR & admin", description: "Onboarding, policy Q&A, interview notes, employee comms." },
      { label: "Compliance monitoring", description: "Policy checks, audit prep, vendor monitoring, exception alerts." },
      { label: "Internal reporting", description: "Weekly dashboards, KPI narratives, anomaly detection, exec briefs." },
      { label: "Vendor operations", description: "Renewal tracking, contract summaries, risk flags, comparison reports." },
    ],
  },
  {
    slug: "nonprofits-churches",
    label: "Nonprofit sector",
    description: "Mission-driven teams with donors, volunteers, events, care needs, content, and limited admin bandwidth.",
    subcategories: [
      { label: "Donor communications", description: "Thank-yous, impact updates, reactivation, giving summaries." },
      { label: "Volunteer coordination", description: "Scheduling, reminders, onboarding, follow-up, role matching." },
      { label: "Grant & admin ops", description: "Grant research, reporting calendars, document prep, deadlines." },
      { label: "Event follow-up", description: "Attendance capture, thank-yous, next-step sequences, recaps." },
      { label: "Content repurposing", description: "Sermons, newsletters, field reports, social posts, donor updates." },
      { label: "Pastoral care ops", description: "Prayer requests, care follow-up, visit prep, member check-ins." },
    ],
  },
  {
    slug: "data-report-businesses",
    label: "Data/report businesses",
    description: "Recurring intelligence products where AI watches a niche and turns changes into useful alerts.",
    subcategories: [
      { label: "Competitor tracking", description: "Pricing, offers, content, ads, launches, hiring changes." },
      { label: "Lead intelligence", description: "Trigger events, enrichment, prioritization, buyer context." },
      { label: "Review monitoring", description: "Sentiment, recurring complaints, competitor gaps, local alerts." },
      { label: "Market maps", description: "Directories, vendor comparisons, category scans, buyer guides." },
      { label: "Buyer-intent alerts", description: "Signals from job posts, forums, X, reviews, funding, site changes." },
      { label: "Regulatory trackers", description: "Policy updates, compliance changes, grant deadlines, rule summaries." },
    ],
  },
];

export const automationLevels = [
  "60% automated / human-led delivery",
  "75% automated / light human review",
  "85% automated / mostly systemized",
  "95% automated / low-touch if possible",
  "No preference — optimize for best opportunity",
];

export const callToleranceLevels = [
  "No calls preferred / async only",
  "One onboarding call is okay",
  "Occasional check-ins are okay",
  "High-touch is okay if margins justify it",
  "No preference",
];

export const businessModels = [
  "No preference",
  "Automated report/tool",
  "Productized service",
  "Micro-SaaS",
  "Lead intelligence",
  "Local business automation",
  "Content/data business",
];

export const assetOptions = [
  "I can write or edit well",
  "I understand a specific niche",
  "I have an audience or community",
  "I can sell / do outreach",
  "I can build no-code automations",
  "I have design/content skills",
  "I have operations/admin experience",
  "Not sure yet",
];

export const avoidOptions = [
  "Avoid lots of sales calls",
  "Avoid heavy custom client work",
  "Avoid regulated/legal/medical risk",
  "Avoid anything requiring paid ads",
  "Avoid complex software builds",
  "Avoid managing large teams",
  "I'm okay with whatever has the strongest potential",
];

export function categoryFromSlug(slug: string) {
  return exploreCategories.find((category) => category.slug === slug);
}

export function optionSlug(label: string) {
  return label.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function optionFromSlug(options: Option[], slug: string) {
  return options.find((option) => optionSlug(option.label) === slug);
}
