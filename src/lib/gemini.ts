import { GoogleGenAI } from "@google/genai";
import { DomainTemplate, ResearchPaper } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function runAlembixStage(
  stage: number,
  domain: DomainTemplate,
  topic: string,
  papers: ResearchPaper[],
  previousContext: string,
  customDomain?: string
) {
  console.log(`Running Alembix Stage ${stage} for topic: ${topic}`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing in the environment");
    throw new Error("Gemini API key is not configured. Please add it to your secrets.");
  }

  const model = "gemini-3.1-pro-preview";
  const domainText = domain === 'Other' ? customDomain : domain;
  
  const papersContext = papers.map((p, i) => `PAPER ${i + 1} [${p.name}]:\n${p.text.slice(0, 10000)}`).join('\n\n');

  const prompts = [
    // Stage 0
    `PROMPT 0 — SYSTEM PRIMER
You are an expert research analyst with PhD-level command of ${topic}.
Domain context: ${domainText}

I am uploading ${papers.length} papers on ${topic}. Across this session, your task is to
build a complete, critical intellectual map of this literature.

Calibrate your analysis to the domain above:
- Materials Science / Polymer Chemistry → focus on synthesis conditions,
  mechanical/thermal characterization, structure-property relationships
- Biomedical → focus on sample size, controls, clinical relevance
- Environmental → focus on scalability, real-world conditions, regulatory context

Be rigorous, not diplomatic. Flag weak work. Surface hidden assumptions.
Prioritize insight over description.
Do not begin analysis until I give the first instruction.`,

    // Stage 1
    `PROMPT 1 — LANDSCAPE MAPPING
Before I ask anything else, do exactly this:
1. List every paper: Author(s) + Year + Core claim (one sentence, max 20 words)
2. Group papers into clusters by shared theoretical assumptions or
   methodological approach — name each cluster
3. Flag every paper that directly contradicts another — one line per conflict

Output only this. No commentary. No summaries. Be exhaustive.`,

    // Stage 2
    `PROMPT 2 — CONTRADICTION ANALYSIS
Across all uploaded papers, extract every point where two or more authors
directly contradict each other.

For each contradiction, produce a table with these columns:
- Contradiction (one sentence)
- Position A (Author, Year, exact claim)
- Position B (Author, Year, exact claim)
- Root Cause (methodology / dataset / era / definitional mismatch)
- Confidence Score (High / Medium / Low)
- Significance (High / Medium / Low)

Rank rows by Significance first, then Confidence Score. Stick to what
the papers explicitly say — no inference.`,

    // Stage 3
    `PROMPT 3 — INTELLECTUAL LINEAGE + FIELD TIMELINE
PART A — INTELLECTUAL LINEAGE
Identify the 3 most foundational concepts running through the majority
of these papers.

For each concept:
- Origin: Who introduced it? (earliest paper + year)
- Challenge: Who disputed it and how?
- Refinement: Who extended or corrected it and how?
- Current Status: Strong consensus / Weak consensus /
  Actively disputed / Unresolved

Present as a hierarchical outline, not prose.
Label every entry: Origin / Challenge / Refinement / Status.

PART B — FIELD EVOLUTION TIMELINE
Using only these papers, reconstruct the chronological progression
of knowledge in this field.

Format as a linear sequence:
[YEAR] → [What was established / challenged / overturned] — (Author, Paper)

Rules:
- One line per significant shift only — not every paper
- Mark turning points with ***
- End with a one-line statement: "As of [most recent paper year],
  the field's current position is: ___"`,

    // Stage 4
    `PROMPT 4 — RESEARCH GAPS
Based solely on what these papers collectively reveal, identify the 5
most significant unanswered research questions.

For each gap:
- The question (one precise sentence)
- Root cause: Why does this gap exist?
- Closest paper: Which came nearest to answering it,
  and where did it fall short?
- Path to closure: What specific study design or methodology
  would resolve it?

Number them 1–5, ordered by research impact (highest first).`,

    // Stage 5
    `PROMPT 5 — METHODOLOGY AUDIT + VARIABLES MAP
PART A — METHODOLOGY AUDIT
Map the methodologies across all papers.

Step 1 — Table: Paper | Author | Year | Method Type | Key Limitation

Step 2 — Answer these directly:
- Which methodology dominates this field and why?
- Which methodology is underused relative to the questions being asked?
- Which paper has the weakest methodology — and what specifically
  makes it weak?
- Are there any replication risks or dataset dependency issues
  across papers?

PART B — VARIABLES MAP
For each experimental paper, extract:

Paper | Independent Variables | Dependent Variables |
Controlled Variables | Notable Omissions`,

    // Stage 6
    `PROMPT 6 — FIELD SYNTHESIS
You now have a complete picture of this literature.
Write a synthesis — not a summary.

Structure it exactly as:
1. What the field collectively believes
2. What remains actively contested
3. What has been proven beyond reasonable doubt
4. The single most important unanswered question

Hard limit: 350 words. No hedging phrases. No filler.`,

    // Stage 7
    `PROMPT 7 — HIDDEN ASSUMPTIONS
List every assumption the majority of these papers share but never
explicitly test or justify.

For each assumption:
- State it as a falsifiable claim
- Name 1–2 papers most dependent on it
- Consequence: What breaks in the literature if this assumption is false?
- Vulnerability: Is there any evidence challenging it?

Order by how damaging it would be if proven wrong.`,

    // Stage 8
    `PROMPT 8 — KNOWLEDGE MAP
Build a structured knowledge map of this literature using this exact format:

CORE CLAIM:
[The one claim the field orbits — 1 sentence]

PILLARS (3–5):
[Sub-claim | Confidence: High / Medium / Low | Key supporting paper]

CONTESTED ZONES (2–3):
[Debate | Who holds each position | What evidence would settle it]

FRONTIER QUESTIONS (1–2):
[Question | Why it remains unsolved]

ENTRY POINT PAPERS (3):
[Paper | Why a newcomer must read this first]`,

    // Stage 9
    `PROMPT 9 — DOMAIN GLOSSARY
From all uploaded papers, extract every domain-specific term, acronym,
or concept that a new researcher in this topic would need to understand.

For each term:
- Term / Acronym
- Plain-English definition (max 2 sentences)
- First introduced by (Author, Year)
- Critical context: Consistent / Slight variation / Significant variation

Sort alphabetically.`,

    // Stage 10
    `PROMPT 10 — HYPOTHESIS SEEDER
Using the gaps, contradictions, and hidden
assumptions, generate 5 original, testable hypotheses
that a researcher could pursue next.

For each hypothesis:
- Hypothesis: State it as a falsifiable claim
- Derived from: Which gap / contradiction / assumption is it addressing?
- Suggested method: What experiment or study design would test it?
- Risk: What is the most likely reason this hypothesis fails?
- Novelty: Has any paper come close to testing this?`,

    // Stage 11
    `PROMPT 11 — NON-EXPERT PITCH
Explain this entire body of research to a smart non-expert
in under 5 minutes.

Deliver exactly:
1. The field's proven finding — one sentence, zero jargon
2. The field's honest admission — one sentence, what it still
   cannot explain
3. The single real-world implication that matters most — one sentence`
  ];

  const currentPrompt = prompts[stage];
  const fullPrompt = `CONTEXT FROM PREVIOUS STAGES:\n${previousContext}\n\nRESEARCH PAPERS:\n${papersContext}\n\nCURRENT TASK:\n${currentPrompt}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    });
    return response.text || "No output generated.";
  } catch (error) {
    console.error(`Error in stage ${stage}:`, error);
    throw error;
  }
}
