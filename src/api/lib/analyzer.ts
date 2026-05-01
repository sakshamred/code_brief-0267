import { env } from "cloudflare:workers";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import dedent from "dedent";

const openai = createOpenAI({
  baseURL: env.AI_GATEWAY_BASE_URL,
  apiKey: env.AI_GATEWAY_API_KEY,
});

export interface AnalysisResult {
  summary: string;
  bugs: string[];
  missingTests: string[];
  reviewComment: string;
}

export async function analyzePr(
  diff: string,
  metadata: {
    title: string;
    body: string | null;
    additions: number;
    deletions: number;
    changedFiles: number;
    base: string;
    head: string;
  }
): Promise<AnalysisResult> {
  const systemPrompt = dedent`
    You are Codebrief, an expert code reviewer. You analyze GitHub PR diffs and produce structured reviews.
    
    You MUST respond with valid JSON matching this exact schema:
    {
      "summary": "2-4 sentences explaining what this PR does in plain English. Be specific about the actual changes, not vague.",
      "bugs": ["Array of strings. Each is a potential bug, edge case, or security issue you spotted. Be specific — reference file names and line concepts. If none found, return empty array."],
      "missingTests": ["Array of strings. Each is a specific test case that should exist but likely doesn't. Reference the actual functionality. If the PR looks well-tested, return empty array."],
      "reviewComment": "A complete review comment ready to post on the PR. Start with a brief summary, then list concerns if any. Be constructive and specific. Use markdown formatting."
    }
    
    Rules:
    - Be surgical and specific. No generic advice like "add more tests" — say WHICH tests for WHICH behavior.
    - Reference actual file paths and function names from the diff.
    - For bugs: focus on null checks, race conditions, error handling gaps, SQL injection, XSS, auth bypasses, integer overflow, off-by-one errors.
    - For security: flag any hardcoded secrets, unsafe deserialization, missing input validation.
    - The review comment should be professional and ready to copy-paste into GitHub.
    - If the PR is small/trivial, say so — don't manufacture issues.
    - Respond ONLY with the JSON object, no markdown fences, no extra text.
  `;

  const userPrompt = dedent`
    PR Title: ${metadata.title}
    PR Description: ${metadata.body || "(no description)"}
    Branch: ${metadata.head} → ${metadata.base}
    Stats: +${metadata.additions} -${metadata.deletions} across ${metadata.changedFiles} files
    
    --- DIFF ---
    ${diff}
  `;

  const { text } = await generateText({
    model: openai.chat("anthropic/claude-haiku-4.5"),
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: 4096,
    temperature: 0.2,
  });

  try {
    // Try to extract JSON even if wrapped in markdown fences
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(jsonStr) as AnalysisResult;
    
    return {
      summary: parsed.summary || "Unable to generate summary.",
      bugs: Array.isArray(parsed.bugs) ? parsed.bugs : [],
      missingTests: Array.isArray(parsed.missingTests) ? parsed.missingTests : [],
      reviewComment: parsed.reviewComment || "No review comment generated.",
    };
  } catch {
    // If JSON parsing fails, return the raw text as summary
    return {
      summary: text.slice(0, 500),
      bugs: [],
      missingTests: [],
      reviewComment: text,
    };
  }
}
