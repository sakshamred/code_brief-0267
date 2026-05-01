import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { database } from "../database";
import { reviews } from "../database/schema";
import { authMiddleware, authenticatedOnly } from "../middleware/authentication";
import { parsePrUrl, fetchPrMetadata, fetchPrDiff, truncateDiff } from "../lib/github";
import { analyzePr } from "../lib/analyzer";

export const reviewRoutes = new Hono();

reviewRoutes.use("*", authMiddleware);
reviewRoutes.use("*", authenticatedOnly);

// POST /reviews/analyze — kick off a PR analysis
reviewRoutes.post("/analyze", async (c) => {
  const body = await c.req.json();
  const { prUrl } = body as { prUrl: string };

  if (!prUrl) {
    return c.json({ error: "prUrl is required" }, 400);
  }

  const parsed = parsePrUrl(prUrl);
  if (!parsed) {
    return c.json({ error: "Invalid GitHub PR URL. Expected: github.com/owner/repo/pull/123" }, 400);
  }

  const user = c.get("user") as any;
  const { owner, repo, prNumber } = parsed;

  // Create the review record as pending
  const reviewId = crypto.randomUUID();
  await database.insert(reviews).values({
    id: reviewId,
    userId: user.id,
    prUrl,
    repoOwner: owner,
    repoName: repo,
    prNumber,
    status: "analyzing",
  });

  try {
    // Fetch PR data from GitHub
    const [metadata, rawDiff] = await Promise.all([
      fetchPrMetadata(owner, repo, prNumber),
      fetchPrDiff(owner, repo, prNumber),
    ]);

    const diff = truncateDiff(rawDiff);

    // Run AI analysis
    const analysis = await analyzePr(diff, metadata);

    // Update the review record
    await database
      .update(reviews)
      .set({
        prTitle: metadata.title,
        summary: analysis.summary,
        bugs: JSON.stringify(analysis.bugs),
        missingTests: JSON.stringify(analysis.missingTests),
        reviewComment: analysis.reviewComment,
        status: "done",
      })
      .where(eq(reviews.id, reviewId));

    return c.json({
      id: reviewId,
      prUrl,
      prTitle: metadata.title,
      repoOwner: owner,
      repoName: repo,
      prNumber,
      summary: analysis.summary,
      bugs: analysis.bugs,
      missingTests: analysis.missingTests,
      reviewComment: analysis.reviewComment,
      status: "done",
      metadata: {
        additions: metadata.additions,
        deletions: metadata.deletions,
        changedFiles: metadata.changedFiles,
        base: metadata.base,
        head: metadata.head,
        user: metadata.user,
      },
    });
  } catch (err: any) {
    await database
      .update(reviews)
      .set({
        status: "error",
        errorMessage: err.message || "Unknown error",
      })
      .where(eq(reviews.id, reviewId));

    return c.json({ error: err.message || "Failed to analyze PR" }, 500);
  }
});

// GET /reviews — list user's past reviews
reviewRoutes.get("/", async (c) => {
  const user = c.get("user") as any;

  const userReviews = await database
    .select()
    .from(reviews)
    .where(eq(reviews.userId, user.id))
    .orderBy(desc(reviews.createdAt))
    .limit(50);

  return c.json(
    userReviews.map((r) => ({
      ...r,
      bugs: r.bugs ? JSON.parse(r.bugs) : [],
      missingTests: r.missingTests ? JSON.parse(r.missingTests) : [],
    }))
  );
});

// GET /reviews/:id — get a single review
reviewRoutes.get("/:id", async (c) => {
  const user = c.get("user") as any;
  const id = c.req.param("id");

  const [review] = await database
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!review || review.userId !== user.id) {
    return c.json({ error: "Review not found" }, 404);
  }

  return c.json({
    ...review,
    bugs: review.bugs ? JSON.parse(review.bugs) : [],
    missingTests: review.missingTests ? JSON.parse(review.missingTests) : [],
  });
});

// DELETE /reviews/:id — delete a review
reviewRoutes.delete("/:id", async (c) => {
  const user = c.get("user") as any;
  const id = c.req.param("id");

  const [review] = await database
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!review || review.userId !== user.id) {
    return c.json({ error: "Review not found" }, 404);
  }

  await database.delete(reviews).where(eq(reviews.id, id));
  return c.json({ success: true });
});
