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
- Include a prompt pack the user can copy into their own AI chatbot or agent.
- If the idea touches regulated industries, call out compliance/legal review needs.
- Output in clean markdown. No tables. Use bullets and section headings.
`,
      prompt: `Create an AI Business Angle Report for this beta user input:\n\n${userContext}\n\nRequired sections:\n1. Quick Diagnosis\n2. Why This Model Might Work\n3. Adjacent Niche Opportunities\n4. AI Automation Map\n5. Low-Touch Offer Variants\n6. Babysitting Risk Score\n7. Best MVP / Validation Sprint\n8. Risks & Reality Checks\n9. Prompt Pack for Further Exploration\n10. Next Best Action`,
    });

    return Response.json({ report: text });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Report generation failed. Please try again." }, { status: 500 });
  }
}
