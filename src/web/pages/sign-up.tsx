import { useState } from "react";
import { Link, useLocation } from "wouter";
import { authClient } from "../lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Sign up failed");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 animate-fade-in-up stagger-1">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer mb-8">
              <div className="w-6 h-6 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-mono text-xs font-bold">CB</span>
              </div>
              <span className="font-semibold text-sm tracking-tight">Codebrief</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start reviewing PRs in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up stagger-2">
          {error && (
            <div className="border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Saksham"
              required
              className="text-sm bg-card border-border"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="font-mono text-sm bg-card border-border"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
              className="text-sm bg-card border-border"
            />
          </div>

          <Button type="submit" className="w-full font-mono text-sm" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center animate-fade-in-up stagger-3">
          Already have an account?{" "}
          <Link href="/sign-in">
            <span className="text-primary hover:underline cursor-pointer">Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
