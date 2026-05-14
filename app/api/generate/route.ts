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
  return process.env.NICHEFORGE_MODEL || "grok-4-1-fast-non-reasoning";
}

function getMaxOutputTokens() {
  const configured = Number(process.env.NICHEFORGE_MAX_OUTPUT_TOKENS);
  return Number.isFinite(configured) && configured > 0 ? configured : 3400;
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
      temperature: 0.68,
      maxOutputTokens,
      system: `You are NicheForge AI, a skeptical but creative business brainstorming engine.

Your job: analyze a submitted business idea, proven model, market signal, competitor, trend, or niche and produce an AI Business Angle Report.

Rules:
- Do not guarantee profit, demand, revenue, success, or outcomes.
- Be practical, specific, and skeptical. Avoid hype and vague startup language.
- Preserve useful strategic depth, but write about 10% tighter than a normal long-form report.
- Favor low-touch, AI-automated, productized, repeatable business designs.
- Explicitly identify babysitting risk: custom strategy, client calls, revisions, credential handling, subjective creative work, regulated advice, integrations, and manual fulfillment.
- Include adjacent niches, sharper vertical pivots, automation workflows, and a tiny validation sprint.
- If the idea touches regulated industries, call out compliance/legal review needs.
- Output clean markdown. No tables. Use bullets and section headings.
- Avoid big uninterrupted paragraphs. Sections should be scannable and categorized.
- Use bold lead-in labels inside bullets where requested.
`,
      prompt: `Create an AI Business Angle Report for this beta user input:\n\n${userContext}\n\nRequired markdown structure and formatting:\n\n# NicheForge AI Business Angle Report\n\n## Selected Strongest Concept\nUse exactly 4 concise bullets: **Concept:**, **Target buyer:**, **Core pain:**, and **Low-touch offer:**. Add **Why it wins:** only if it adds a genuinely different insight.\n\n## 1. Quick Diagnosis\nUse 4-5 categorized bullets with bold lead-in labels such as **Signal:**, **Opportunity:**, **Constraint:**, and **Verdict:**.\n\n## 2. Why This Model Might Work\nUse 4-5 bullets with bold lead-in labels. Be specific about buyer urgency, repeatability, data/workflow access, and automation fit.\n\n## 3. Adjacent Niche Opportunities\nUse 5 bullets. Each bullet must follow this exact style: **Title:** concise explanation of the niche, buyer, pain, and why it is adjacent.\n\n## 4. AI Automation Map\nUse bullets grouped by 3-4 workflow stages. Be concrete about inputs, AI task, human review, and output.\n\n## 5. Low-Touch Offer Variants\nUse 3-4 bullets with bold offer names and concise explanations. Include a paid report, a subscription, and a productized service variant if they fit. If you include subscription tiers or pricing options, list them from lowest to highest price and make sure tier names match the economics: Basic/Starter must be cheapest, Pro/Growth must be middle, and Premium/Best/Done-for-you must be highest. Never show a Basic option with a higher price than the Best/Premium option.\n\n## 6. Babysitting Risk Score\nDo not write a paragraph. Use bullets for **Score:**, **Why:**, **Main babysitting traps:**, and **How to reduce it:**.\n\n## 7. Best MVP / Validation Sprint\nUse a short day-by-day sprint. Bold the day ranges exactly, for example **Days 1-2:**, **Days 3-4:**, **Days 5-7:**.\n\n## 8. Risks & Reality Checks\nUse 4-5 bullets with bold lead-in labels. Include buyer risk, delivery risk, data/access risk, compliance risk when relevant, and the most likely reason this could fail.\n\n## 9. Better First Offer\nRecommend one specific first offer. Include bullets for **Promise:**, **Deliverable:**, **Price test:**, **Acquisition test:**, and **Why this first:**.\n\n## 10. Master Prompt for Further Exploration\nWrite one reusable master prompt in a fenced code block. Keep it concise but complete enough for the user to paste into their own AI chatbot to keep exploring, refining, and pressure-testing the idea.\n\nKeep the full report dense, practical, and scannable. Preserve depth, but avoid filler and repeated points.`,
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
