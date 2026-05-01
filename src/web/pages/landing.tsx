import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="max-w-[960px] mx-auto px-6 pt-24 pb-20">
        <div className="animate-fade-in-up stagger-1">
          <div className="inline-flex items-center gap-2 border border-border px-3 py-1 mb-8">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span className="text-xs font-mono text-muted-foreground">AI-POWERED CODE REVIEW</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.9] mb-6 animate-fade-in-up stagger-2">
          Stop reading diffs.
          <br />
          <span className="text-primary">Start shipping.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-[520px] mb-10 leading-relaxed animate-fade-in-up stagger-3">
          Paste a GitHub PR URL. Get an instant plain-English summary, bug flags,
          missing test suggestions, and a review comment you can post directly.
        </p>

        <div className="flex items-center gap-4 animate-fade-in-up stagger-4">
          <Link href="/sign-up">
            <Button size="lg" className="font-mono text-sm animate-pulse-glow">
              Get started — free
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="lg" className="font-mono text-sm">
              Sign in
            </Button>
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border mt-24 animate-fade-in-up stagger-5">
          {[
            {
              title: "Plain-English Summary",
              desc: "No more deciphering 500-line diffs. Understand what a PR does in 10 seconds.",
              icon: "→",
            },
            {
              title: "Bug & Security Flags",
              desc: "Catches null checks, race conditions, XSS, auth bypasses, and edge cases humans miss.",
              icon: "!",
            },
            {
              title: "Missing Test Detection",
              desc: "Points out exactly which test cases should exist but don't. No generic advice.",
              icon: "?",
            },
            {
              title: "Copy-Paste Review",
              desc: "Generates a complete review comment formatted for GitHub. One click to post.",
              icon: "#",
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-card p-8 group hover:bg-secondary/50 transition-colors">
              <div className="w-8 h-8 border border-border flex items-center justify-center mb-4 font-mono text-primary text-sm group-hover:border-primary/50 transition-colors">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-24 animate-fade-in-up stagger-6">
          <h2 className="text-xs font-mono text-muted-foreground tracking-wider mb-8 uppercase">How it works</h2>
          <div className="flex flex-col md:flex-row gap-8">
            {[
              { step: "01", text: "Paste any public GitHub PR URL" },
              { step: "02", text: "We fetch the diff and run AI analysis" },
              { step: "03", text: "Get structured review in ~15 seconds" },
            ].map((item) => (
              <div key={item.step} className="flex-1 flex items-start gap-4">
                <span className="font-mono text-primary text-2xl font-bold leading-none">{item.step}</span>
                <p className="text-sm text-muted-foreground leading-relaxed pt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">Codebrief v1.0</span>
          <span className="text-xs text-muted-foreground">
            Powered by Claude Haiku 4.5
          </span>
        </div>
      </div>
    </div>
  );
}
