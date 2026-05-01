/**
 * Parse a GitHub PR URL into its components.
 * Supports: github.com/owner/repo/pull/123
 */
export function parsePrUrl(url: string): { owner: string; repo: string; prNumber: number } | null {
  try {
    const parsed = new URL(url.trim());
    if (!parsed.hostname.includes("github.com")) return null;

    // /owner/repo/pull/123 or /owner/repo/pull/123/files etc.
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 4 || parts[2] !== "pull") return null;

    const prNumber = parseInt(parts[3], 10);
    if (isNaN(prNumber)) return null;

    return {
      owner: parts[0],
      repo: parts[1],
      prNumber,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch PR metadata from GitHub API (public repos, no auth needed).
 */
export async function fetchPrMetadata(owner: string, repo: string, prNumber: number) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Codebrief/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as any;
  return {
    title: data.title as string,
    body: data.body as string | null,
    state: data.state as string,
    additions: data.additions as number,
    deletions: data.deletions as number,
    changedFiles: data.changed_files as number,
    user: data.user?.login as string,
    base: data.base?.ref as string,
    head: data.head?.ref as string,
  };
}

/**
 * Fetch the diff for a PR (public repos).
 */
export async function fetchPrDiff(owner: string, repo: string, prNumber: number): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
      "User-Agent": "Codebrief/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error fetching diff: ${res.status} ${res.statusText}`);
  }

  const diff = await res.text();
  return diff;
}

/**
 * Truncate diff to fit within token limits (~100k chars ≈ ~25k tokens).
 * Keeps the first N chars and adds a truncation notice.
 */
export function truncateDiff(diff: string, maxChars = 100000): string {
  if (diff.length <= maxChars) return diff;
  return diff.slice(0, maxChars) + "\n\n[... diff truncated — too large for analysis ...]";
}
