import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ── Better Auth tables (will be generated) ──
export { user, session, account, verification } from "./auth-schema";

// ── Reviews table ──
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  prUrl: text("pr_url").notNull(),
  repoOwner: text("repo_owner").notNull(),
  repoName: text("repo_name").notNull(),
  prNumber: integer("pr_number").notNull(),
  prTitle: text("pr_title"),
  summary: text("summary"),
  bugs: text("bugs"), // JSON string
  missingTests: text("missing_tests"), // JSON string
  reviewComment: text("review_comment"),
  status: text("status").notNull().default("pending"), // pending | analyzing | done | error
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
