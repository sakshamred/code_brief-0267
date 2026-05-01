import { Link, useLocation } from "wouter";
import { authClient } from "../lib/auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await authClient.signOut();
    setLocation("/");
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link href={session ? "/dashboard" : "/"}>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-6 h-6 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-mono text-xs font-bold">CB</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">Codebrief</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {isPending ? (
            <div className="w-16 h-8 bg-muted animate-pulse" />
          ) : session ? (
            <>
              <Link href="/dashboard">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Analyze
                </span>
              </Link>
              <Link href="/history">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  History
                </span>
              </Link>
              <div className="w-px h-4 bg-border" />
              <span className="text-xs text-muted-foreground font-mono">
                {session.user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-xs">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="text-xs">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
