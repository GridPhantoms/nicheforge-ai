import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { z } from "zod";

export const runtime = "nodejs";

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
  return process.env.NICHEFORGE_MODEL || "grok-4-0709";
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

    const { text } = await generateText({
      model: xai(getModel()),
      temperature: 0.72,
      system: `You are NicheForge AI, a skeptical but creative business brainstorming engine.

Your job: analyze a submitted business idea, proven model, market signal, competitor, trend, or niche and produce an AI Business Angle Report.

Rules:
- Do not guarantee profit, demand, revenue, success, or outcomes.
- Be practical, specific, and skeptical. Avoid hype and vague startup language.
- Favor low-touch, AI-automated, productized, repeatable business designs.
- Explicitly identify babysitting risk: custom strategy, client calls, revisions, credential handling, subjective creative work, regulated advice, integrations, and manual fulfillment.
- Include adjacent niches and sharper vertical pivots.
- Include automation workflows that could be run by AI/chatbots/agents with human review where needed.
- Include a tiny validation sprint before building.
- If the idea touches regulated industries, call out compliance/legal review needs.
- Output in clean markdown. No tables. Use bullets and section headings.
- Avoid big uninterrupted paragraphs. Sections should be scannable and categorized.
- Use bold lead-in labels inside bullets where requested.
`,
      prompt: `Create an AI Business Angle Report for this beta user input:\n\n${userContext}\n\nRequired markdown structure and formatting:\n\n# NicheForge AI Business Angle Report\n\n## Selected Strongest Concept\nUse 3-5 bullets, not a paragraph. Include bullets for **Concept:**, **Target buyer:**, **Core pain:**, **Low-touch offer:**, and **Why it wins:** if relevant.\n\n## 1. Quick Diagnosis\nBreak into categorized bullets. Use bold lead-in labels such as **Signal:**, **Opportunity:**, **Constraint:**, and **Verdict:**.\n\n## 2. Why This Model Might Work\nBreak into bullets with bold lead-in labels. Be specific about buyer urgency, repeatability, data/workflow access, and automation fit.\n\n## 3. Adjacent Niche Opportunities\nUse 5-7 bullets. Each bullet must follow this exact style: **Title:** concise explanation of the niche, buyer, pain, and why it is adjacent.\n\n## 4. AI Automation Map\nUse bullets grouped by workflow stage. Be concrete about inputs, AI task, human review, and output.\n\n## 5. Low-Touch Offer Variants\nUse bullets with bold offer names and concise explanations. Include at least one paid report, one subscription, and one productized service variant if they fit.\n\n## 6. Babysitting Risk Score\nDo not write a large paragraph. Use bullets for **Score:**, **Why:**, **Main babysitting traps:**, and **How to reduce it:**.\n\n## 7. Best MVP / Validation Sprint\nUse a short day-by-day sprint. Bold the day ranges exactly, for example **Days 1-2:**, **Days 3-4:**, **Days 5-7:**.\n\n## 8. Risks & Reality Checks\nBreak into categorized bullets with bold lead-in labels. Include buyer risk, delivery risk, data/access risk, compliance risk if relevant, and competition risk.\n\n## 9. Master Prompt for Further Exploration\nStart with this exact sentence: Copy these prompts into your own AI chatbot (e.g., ChatGPT) to refine or expand this idea. Adjust as needed for your own specifics.\n\nThen provide one longer master prompt in a fenced code block. Do not call it a prompt pack. Do not include the note "Replace [brackets] with specifics." Do not use bracket placeholders. The master prompt should help the user refine the chosen concept, compare adjacent niches, identify validation steps, reduce babysitting risk, and draft a low-touch offer.\n\n## 10. Next Best Action\nUse 3-5 bullets. Make the first action something the user can do today without building software.`,
    });

    console.info("nicheforge_generate_complete", {
      requestId,
      durationMs: Date.now() - startedAt,
      model: getModel(),
    });

    return Response.json({ report: text });
  } catch (error) {
    console.error("nicheforge_generate_failed", {
      requestId,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "Unknown generation error",
    });
    return Response.json({ error: "Report generation failed. Please try again." }, { status: 500 });
  }
}
