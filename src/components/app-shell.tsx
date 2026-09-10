import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  Library,
  Mail,
  Menu,
  MessageCircle,
  NotebookPen,
  Search,
  ShieldCheck,
  Sparkle,
  UserRound,
  X,
} from "lucide-react";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type NavEntry = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  toolId?: string;
};

const NAV: NavEntry[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/chat", label: "Ask the assistant", icon: MessageCircle },
  { path: "/tools/lesson-plan", toolId: "lesson-plan", label: "Lesson plans", icon: BookOpen },
  { path: "/tools/parent-message", toolId: "parent-message", label: "Parent messages", icon: Mail },
  { path: "/tools/summarizer", toolId: "summarizer", label: "Meeting notes", icon: NotebookPen },
  { path: "/tools/task-planner", toolId: "task-planner", label: "Week planner", icon: Calendar },
  { path: "/tools/research", toolId: "research", label: "Research helper", icon: Search },
  { path: "/career", label: "Subjects, APS & varsity", icon: GraduationCap },
];

const SECONDARY: NavEntry[] = [
  { path: "/library", label: "My saved work", icon: Library },
  { path: "/prompts", label: "Prompt library", icon: Sparkle },
  { path: "/responsible-ai", label: "Responsible AI", icon: ShieldCheck },
  { path: "/about", label: "About Itumeleng", icon: UserRound },
];

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useCurrentUser();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const nav = (
    <nav className="flex flex-col gap-6 p-4">
      <div className="space-y-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        {NAV.map((item) => (
          <NavItem key={item.path} item={item} active={pathname === item.path} />
        ))}
      </div>
      <div className="space-y-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          More
        </p>
        {SECONDARY.map((item) => (
          <NavItem key={item.path} item={item} active={pathname === item.path} />
        ))}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="" width={36} height={36} className="size-9" />
            <span className="font-display text-base font-semibold leading-tight text-foreground sm:text-lg">
              Kgaswane <span className="text-primary">Learning Assistant</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden max-w-[16rem] truncate text-sm text-muted-foreground sm:inline">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await supabase.auth.signOut();
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">{nav}</div>
        </aside>
        {open && (
          <div className="fixed inset-0 top-16 z-30 bg-background/95 backdrop-blur lg:hidden">
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">{nav}</div>
          </div>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ item, active }: { item: NavEntry; active: boolean }) {
  const Icon = item.icon;
  const className = cn(
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );
  const inner = (
    <>
      <Icon className="size-4 shrink-0" />
      {item.label}
    </>
  );

  if (item.toolId) {
    return (
      <Link to="/tools/$toolId" params={{ toolId: item.toolId }} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <Link to={item.path as "/"} className={className}>
      {inner}
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
