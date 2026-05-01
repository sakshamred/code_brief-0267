import { useState } from "react";
import { useLocation } from "wouter";
import { authClient } from "../lib/auth";
import { api, type Review } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "../components/navbar";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors border border-border px-2 py-1 hover:border-primary/50"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ReviewResult({ review }: { review: Review }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="border border-border bg-card p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-semibold text-base mb-1">{review.prTitle || "PR Analysis"}</h2>
            <a
              href={review.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-primary hover:underline"
            >
              {review.repoOwner}/{review.repoName}#{review.prNumber}
            </a>
          </div>
          {review.metadata && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[#00E5A0]">+{review.metadata.additions}</span>
              <span className="text-[#FF4D4D]">-{review.metadata.deletions}</span>
              <span className="text-muted-foreground">{review.metadata.changedFiles} files</span>
            </div>
          )}
        </div>
        {review.metadata && (
          <div className="text-xs text-muted-foreground font-mono">
            {review.metadata.head} → {review.metadata.base} · by {review.metadata.user}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="border border-border bg-card p-6">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Summary</h3>
        <p className="text-sm leading-relaxed">{review.summary}</p>
      </div>

      {/* Bugs */}
      {review.bugs.length > 0 && (
        <div className="border border-[#FFB224]/30 bg-[#FFB224]/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xs font-mono text-[#FFB224] uppercase tracking-wider">
              Potential Issues
            </h3>
            <Badge variant="outline" className="text-[10px] border-[#FFB224]/50 text-[#FFB224]">
              {review.bugs.length}
            </Badge>
          </div>
          <ul className="space-y-3">
            {review.bugs.map((bug, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-[#FFB224] font-mono text-xs mt-0.5 shrink-0">!</span>
                <span className="leading-relaxed">{bug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Tests */}
      {review.missingTests.length > 0 && (
        <div className="border border-[#3B82F6]/30 bg-[#3B82F6]/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xs font-mono text-[#3B82F6] uppercase tracking-wider">
              Suggested Tests
            </h3>
            <Badge variant="outline" className="text-[10px] border-[#3B82F6]/50 text-[#3B82F6]">
              {review.missingTests.length}
            </Badge>
          </div>
          <ul className="space-y-3">
            {review.missingTests.map((test, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-[#3B82F6] font-mono text-xs mt-0.5 shrink-0">?</span>
                <span className="leading-relaxed">{test}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Review Comment */}
      {review.reviewComment && (
        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Review Comment
            </h3>
            <CopyButton text={review.reviewComment} />
          </div>
          <div className="bg-background border border-border p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {review.reviewComment}
          </div>
        </div>
      )}

      {/* Clean result badge */}
      {review.bugs.length === 0 && review.missingTests.length === 0 && (
        <div className="border border-primary/30 bg-primary/5 p-6 text-center">
          <span className="text-sm text-primary font-mono">
            Clean PR — no issues detected
          </span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const [, setLocation] = useLocation();
  const [prUrl, setPrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Review | null>(null);

  // Redirect if not authenticated
  if (!isPending && !session) {
    setLocation("/sign-in");
    return null;
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prUrl.trim()) return;

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const review = await api.analyze(prUrl.trim());
      setResult(review);
    } catch (err: any) {
      setError(err.message || "Failed to analyze PR");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <>
        <Navbar />
        <div className="max-w-[960px] mx-auto px-6 py-20 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-[960px] mx-auto px-6 py-12">
        {/* Input section */}
        <div className="mb-12 animate-fade-in-up stagger-1">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Analyze a PR</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Paste a public GitHub PR URL to get an AI-powered code review.
          </p>

          <form onSubmit={handleAnalyze} className="flex gap-3">
            <Input
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123"
              className="font-mono text-sm bg-card border-border flex-1"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !prUrl.trim()}
              className="font-mono text-sm px-6 shrink-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                "Analyze"
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive font-mono">
              {error}
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="border border-border bg-card p-12 text-center animate-fade-in-up">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-mono">Fetching diff & running analysis...</p>
            <p className="text-xs text-muted-foreground/50 mt-2">This usually takes 10-20 seconds</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && <ReviewResult review={result} />}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="border border-dashed border-border p-16 text-center animate-fade-in-up stagger-2">
            <div className="w-12 h-12 border border-border flex items-center justify-center mx-auto mb-4 font-mono text-primary text-lg">
              →
            </div>
            <p className="text-sm text-muted-foreground mb-1">Paste a PR URL above to get started</p>
            <p className="text-xs text-muted-foreground/50 font-mono">Works with any public GitHub repository</p>
          </div>
        )}
      </div>
    </>
  );
}
