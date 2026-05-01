import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { authClient } from "../lib/auth";
import { api, type Review } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "../components/navbar";

export default function History() {
  const { data: session, isPending } = authClient.useSession();
  const [, setLocation] = useLocation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      setLocation("/sign-in");
      return;
    }
    if (session) {
      loadReviews();
    }
  }, [session, isPending]);

  const loadReviews = async () => {
    try {
      const data = await api.getReviews();
      setReviews(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isPending || (!session && !isPending)) {
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
        <div className="flex items-center justify-between mb-8 animate-fade-in-up stagger-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Review History</h1>
            <p className="text-sm text-muted-foreground">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/dashboard">
            <Button size="sm" className="font-mono text-xs">New review</Button>
          </Link>
        </div>

        {error && (
          <div className="border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive font-mono mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border bg-card p-6 animate-pulse">
                <div className="h-4 bg-muted w-1/3 mb-3" />
                <div className="h-3 bg-muted w-2/3" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="border border-dashed border-border p-16 text-center animate-fade-in-up stagger-2">
            <div className="w-12 h-12 border border-border flex items-center justify-center mx-auto mb-4 font-mono text-muted-foreground text-lg">
              0
            </div>
            <p className="text-sm text-muted-foreground mb-3">No reviews yet</p>
            <Link href="/dashboard">
              <Button size="sm" className="font-mono text-xs">Analyze your first PR</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2 animate-fade-in-up stagger-2">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-border bg-card p-5 hover:bg-secondary/30 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-medium text-sm truncate">
                        {review.prTitle || `PR #${review.prNumber}`}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${
                          review.status === "done"
                            ? "border-primary/50 text-primary"
                            : review.status === "error"
                            ? "border-destructive/50 text-destructive"
                            : "border-[#FFB224]/50 text-[#FFB224]"
                        }`}
                      >
                        {review.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                      <a
                        href={review.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {review.repoOwner}/{review.repoName}#{review.prNumber}
                      </a>
                      {review.bugs && review.bugs.length > 0 && (
                        <span className="text-[#FFB224]">{review.bugs.length} issues</span>
                      )}
                      {review.missingTests && review.missingTests.length > 0 && (
                        <span className="text-[#3B82F6]">{review.missingTests.length} tests</span>
                      )}
                    </div>
                    {review.summary && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {review.summary}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(review.id);
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 ml-4 font-mono"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
