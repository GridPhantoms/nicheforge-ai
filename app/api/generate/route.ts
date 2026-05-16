import { xai } from "@ai-sdk/xai";
import { streamText } from "ai";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 180;

const requestSchema = z.object({
  betaCode: z.string().min(1),
  idea: z.string().min(8).max(5000),
  audience: z.string().max(1000).optional().default(""),
  modelPreference: z.string().max(500).optional().default(""),
  automationLevel: z.string().max(500).optional().default(""),
  callTolerance: z.string().max(500).optional().default(""),
  assets: z.string().max(2000).optional().default(""),
  avoid: z.string().max(2000).optional().default(""),
});

function getModel() {
  return process.env.NICHEFORGE_MODEL || "grok-4-1-fast-reasoning";
}

function getMaxOutputTokens() {
  const configured = Number(process.env.NICHEFORGE_MAX_OUTPUT_TOKENS);
  return Number.isFinite(configured) && configured > 0 ? configured : 4200;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Please provide a valid idea and beta code." }, { status: 400 });
    }

    const expectedCode = process.env.NICHEFORGE_BETA_CODE;
    if (!expectedCode) {
      return Response.json({ error: "Beta access is not configured yet." }, { status: 503 });
    }
    if (parsed.data.betaCode.trim() !== expectedCode.trim()) {
      return Response.json({ error: "Invalid beta access code." }, { status: 401 });
    }

    if (!process.env.XAI_API_KEY) {
      return Response.json({ error: "AI generation is not configured yet." }, { status: 503 });
    }

    const userContext = JSON.stringify(
      {
        idea: parsed.data.idea,
        targetAudience: parsed.data.audience,
        modelPreference: parsed.data.modelPreference,
        desiredAutomationLevel: parsed.data.automationLevel,
        clientInteractionTolerance: parsed.data.callTolerance,
        assets: parsed.data.assets,
        avoid: parsed.data.avoid,
      },
      null,
      2,
    );
    const model = getModel();
    const maxOutputTokens = getMaxOutputTokens();

    console.info("nicheforge_generate_start", {
      requestId,
      model,
      maxOutputTokens,
      ideaChars: parsed.data.idea.length,
      contextChars: userContext.length,
    });

    const result = streamText({
      model: xai(model),
      temperature: 0.62,
      maxOutputTokens,
      system: `You are NicheForge AI, a skeptical but creative business brainstorming engine.

Your job: analyze a submitted business idea, proven model, market signal, competitor, trend, or niche and produce an AI Business Angle Report.

Quality rules:
- Do not guarantee profit, demand, revenue, success, or outcomes.
- Be practical, specific, and skeptical. Avoid hype, vague startup language, and generic AI filler.
- Preserve strategic depth. Trim only repeated, obvious, or low-value filler.
- Favor low-touch, AI-automated, productized, repeatable business designs.
- Explicitly identify babysitting risk: custom strategy, client calls, revisions, credential handling, subjective creative work, regulated advice, integrations, and manual fulfillment.
- Include adjacent niches, sharper vertical pivots, automation workflows, a tiny validation sprint, and a strong reusable master prompt.
- Add a skeptical market-reality layer before planning: do not assume every idea has a real market, reachable buyers, or willingness to pay.
- If market signal is weak, say so plainly and shift execution advice toward validation experiments, customer discovery, or a narrower pivot instead of a confident launch plan.
- Keep pricing logic internally consistent: one-time starter/test offers should be materially cheaper than recurring, unlimited, multi-client, agency, or done-for-you tiers unless a specific reason is stated.
- If the idea touches regulated industries, call out compliance/legal review needs.
- Output clean markdown. No tables. Use bullets and section headings.
- Avoid big uninterrupted paragraphs. Sections should be scannable and categorized.
- Use bold lead-in labels inside bullets where requested.
- Use current platform language: say "X post", "X thread", or "short social post". Do not say "tweet" or "tweet script".
- Avoid phrases like "game-changer", "unlock", "revolutionize", "10x", and "leverage AI" unless quoting the user's input.
`,
      prompt: `Create an AI Business Angle Report for this beta user input:

${userContext}

Required markdown structure and formatting:

# NicheForge AI Business Angle Report

## Selected Strongest Concept
Use 4-5 concise bullets. Include **Concept:**, **Target buyer:**, **Core pain:**, **Low-touch offer:**, and **Why it wins:**. Make the concept feel specific enough that the user could explain it to a buyer today.

## 1. Quick Diagnosis
Use 5-6 categorized bullets with bold lead-in labels such as **Signal:**, **Opportunity:**, **Constraint:**, **Automation fit:**, **Babysitting risk:**, and **Verdict:**. The verdict must acknowledge whether the concept appears worth validating, not just whether it sounds interesting.

## 2. Market Reality Check
This section is mandatory and must come before the plan. Do not assume the market exists. Use 6-7 bullets with bold lead-in labels for **Likely buyer pool:**, **Underserved pain:**, **Existing alternatives:**, **Willingness to pay:**, **Reachability:**, **Market confidence:**, and **What would disprove this:**. End with a clear confidence label: **Strong signal**, **Needs validation**, or **Likely weak niche**. If confidence is low, say why and recommend a narrower pivot or validation path.

## 3. Why This Model Might Work
Use 5-6 bullets with bold lead-in labels. Be specific about buyer urgency, repeatability, data/workflow access, willingness to pay, distribution angle, and automation fit. If the Market Reality Check was weak, frame this section as conditional: what would need to be true for it to work.

## 4. Adjacent Niche Opportunities
Use 5-6 bullets. Each bullet must follow this style: **Title:** concise explanation of the niche, buyer, pain, why it is adjacent, and why it may be easier or harder than the original idea. Include at least one narrower pivot if the original market looks questionable.

## 5. AI Automation Map
Use this exact rendering-friendly structure. Do not use nested indentation. For each stage, use a ### heading, then flat bullets for **Input:**, **AI task:**, **Human review:**, and **Output:**. Include 3-4 stages. Example structure:

### Stage 1: Intake & Signal Capture
- **Input:** ...
- **AI task:** ...
- **Human review:** ...
- **Output:** ...

## 6. Low-Touch Offer Variants
Use 4-5 bullets with bold offer names and concise explanations. Include a paid report, a subscription, and a productized service variant if they fit. If you include subscription tiers or pricing options, list them from lowest to highest price and make sure tier names match the economics: Basic/Starter must be cheapest, Pro/Growth must be middle, and Premium/Best/Done-for-you must be highest. A one-time starter/test offer must be materially cheaper than any unlimited, multi-client, agency, recurring, or done-for-you tier. Never give a starter/test offer and an unlimited subscription the same price unless you explicitly explain a narrow promotional reason.

## 7. Babysitting Risk Score
Do not write a paragraph. Use bullets for **Score:**, **Why:**, **Main babysitting traps:**, and **How to reduce it:**. Make the score feel earned, not generic.

## 8. Best MVP / Validation Sprint
Use a short day-by-day sprint. Bold the day ranges exactly, for example **Days 1-2:**, **Days 3-4:**, **Days 5-7:**. Make the first action something the user can do today without building software. Include what signal would prove the idea deserves more work. If Market Reality Check is **Needs validation** or **Likely weak niche**, this sprint must focus on proving/disproving demand before building the full offer.

## 9. Risks & Reality Checks
Use 5-6 bullets with bold lead-in labels. Include buyer risk, delivery risk, data/access risk, compliance risk when relevant, competition/substitution risk, and the most likely reason this could fail. Tie at least one risk back to the Market Reality Check.

## 10. Better First Offer
Recommend one specific first offer. Include bullets for **Promise:**, **Deliverable:**, **Price test:**, **Acquisition test:**, **Fulfillment path:**, and **Why this first:**. The price test must be logically lower than any recurring, unlimited, multi-client, or done-for-you tier recommended earlier.

## 11. Master Prompt for Further Exploration
Start with this exact sentence: Copy this prompt into your own AI chatbot to refine and pressure-test the idea further.

Then provide one substantial reusable master prompt in a fenced code block. The prompt must be written for the user to paste into any AI chatbot. It must not say "You are NicheForge AI." It must not mention NicheForge as the assistant persona. It must include the chosen concept, target customer, market-confidence assumptions to verify, likely alternatives/competitors, validation sprint, pricing sanity checks, babysitting-risk constraints, automation boundaries, desired output format, and follow-up questions. It should ask the chatbot to refine the chosen concept, compare adjacent niches, identify validation steps, reduce babysitting risk, map automation workflows, draft a low-touch offer, and propose X posts or X threads only if social promotion is relevant. Do not use bracket placeholders. Do not call X posts tweets. Keep it practical and complete, not tiny.

Keep the full report dense, practical, and scannable. Preserve depth in the Market Reality Check, Automation Map, Better First Offer, and Master Prompt. Trim only filler and repeated points.`,
      onFinish: ({ text, usage }) => {
        console.info("nicheforge_generate_complete", {
          requestId,
          durationMs: Date.now() - startedAt,
          model,
          outputChars: text.length,
          usage,
        });
      },
      onError: ({ error }) => {
        console.error("nicheforge_generate_stream_error", {
          requestId,
          durationMs: Date.now() - startedAt,
          message: error instanceof Error ? error.message : "Unknown stream error",
        });
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-store",
        "X-NicheForge-Request-Id": requestId,
      },
    });
  } catch (error) {
    console.error("nicheforge_generate_failed", {
      requestId,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "Unknown generation error",
    });
    return Response.json({ error: "Report generation failed. Please try again." }, { status: 500 });
  }
}
