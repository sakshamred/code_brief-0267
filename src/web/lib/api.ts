const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((error as any).error || (error as any).message || "Request failed");
  }

  return res.json() as Promise<T>;
}

export interface Review {
  id: string;
  prUrl: string;
  prTitle: string | null;
  repoOwner: string;
  repoName: string;
  prNumber: number;
  summary: string | null;
  bugs: string[];
  missingTests: string[];
  reviewComment: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string | null;
  metadata?: {
    additions: number;
    deletions: number;
    changedFiles: number;
    base: string;
    head: string;
    user: string;
  };
}

export const api = {
  analyze: (prUrl: string) =>
    request<Review>("/reviews/analyze", {
      method: "POST",
      body: JSON.stringify({ prUrl }),
    }),

  getReviews: () => request<Review[]>("/reviews"),

  getReview: (id: string) => request<Review>(`/reviews/${id}`),

  deleteReview: (id: string) =>
    request<{ success: boolean }>(`/reviews/${id}`, { method: "DELETE" }),
};
