import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Mail,
  MessageCircle,
  NotebookPen,
  Search,
  ShieldCheck,
  Sparkle,
} from "lucide-react";

import { AppShell, useCurrentUser } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TOOL_SPECS, type ToolId } from "@/lib/tool-specs";
import { EDUCATOR } from "@/lib/profile-data";
import { listSavedItems } from "@/lib/chats.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Kgaswane Learning Assistant" },
      {
        name: "description",
        content:
          "An AI workspace for teachers, parents and learners: CAPS-aware lesson plans, parent messages, meeting summaries, week planning and research help for the early years.",
      },
      { property: "og:title", content: "Kgaswane Learning Assistant — AI for the early years" },
      {
        property: "og:description",
        content:
          "Lesson plans, parent messages, meeting summaries and week planning for ECD and Foundation Phase educators.",
      },
    ],
  }),
  component: Dashboard,
});

const ICONS: Record<ToolId, React.ComponentType<{ className?: string }>> = {
  "lesson-plan": BookOpen,
  "parent-message": Mail,
  summarizer: NotebookPen,
  "task-planner": Calendar,
  research: Search,
};

const USE_CASES: {
  who: string;
  problem: string;
  solution: string;
  tool: ToolId | null;
}[] = [
  {
    who: "Grade R teacher, 34 learners",
    problem: "Three learners still can't hear beginning sounds and there's no time to plan something separate.",
    solution:
      "Lesson plan generator with the support needs described — it returns one lesson with a simplify and an extend column, so the whole class runs together.",
    tool: "lesson-plan",
  },
  {
    who: "Playgroup practitioner",
    problem: "A parent needs to hear that their child bites other children — without feeling attacked.",
    solution:
      "Parent message generator with purpose 'raise a concern gently', firm-but-kind tone, plus a short WhatsApp version.",
    tool: "parent-message",
  },
  {
    who: "Foundation Phase HOD",
    problem: "Nothing agreed in parent meetings gets followed up; notes stay in a book.",
    solution:
      "Meeting summarizer turns scribbles into decisions, an action table with owners and dates, and a recap to send the parent.",
    tool: "summarizer",
  },
  {
    who: "Parent at home",
    problem: "The teacher mentioned 'phonological awareness' and reading practice feels like a fight every night.",
    solution:
      "Research helper explains it in plain language for parents and gives five-minute activities to try this week.",
    tool: "research",
  },
  {
    who: "Private tutor",
    problem: "Six learners, six timetables, and admin eating into every evening.",
    solution: "Week planner turns the whole list into time blocks around contact time, and says what to drop.",
    tool: "task-planner",
  },
  {
    who: "Anyone, any question",
    problem: "It's 21:00 and the question doesn't fit a form.",
    solution: "Ask the assistant — a saved conversation you can come back to, with the same safeguards.",
    tool: null,
  },
];

function Dashboard() {
  const { user } = useCurrentUser();
  const saved = useQuery({
    queryKey: ["saved-items"],
    queryFn: () => listSavedItems(),
    enabled: !!user,
  });

  return (
    <AppShell>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <Badge className="bg-accent text-accent-foreground hover:bg-accent">
            ECD · Foundation Phase · CAPS-aware
          </Badge>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            The planning, writing and admin of teaching — done in minutes, not evenings.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Built by {EDUCATOR.name}, an ECD educator and tutor in {EDUCATOR.location}. Guided forms turn what you
            know about your children into a careful AI prompt — so you get a usable lesson, message or plan the
            first time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/tools/$toolId" params={{ toolId: "lesson-plan" }}>
                Start a lesson plan <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/chat">
                <MessageCircle className="size-4" /> Ask the assistant
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Every tool has a worked example you can read before signing in. Sign in only when you want to
            generate and save your own.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
        {/* Tools */}
        <section>
          <SectionTitle
            title="Your five tools"
            description="Each one is a guided form: role, audience, tone and output format are set for you, and you can read the exact prompt before it is sent."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {TOOL_SPECS.map((spec) => {
              const Icon = ICONS[spec.id];
              return (
                <Card key={spec.id} className="flex flex-col transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <CardTitle className="font-display text-base">{spec.name}</CardTitle>
                        <CardDescription>{spec.tagline}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-clay">
                      <Clock className="size-3.5" /> Saves {spec.saves}
                    </span>
                    <Button asChild size="sm" variant="secondary">
                      <Link to="/tools/$toolId" params={{ toolId: spec.id }}>
                        Open
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            <Card className="flex flex-col border-primary/30 bg-secondary">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <MessageCircle className="size-5" />
                  </span>
                  <div>
                    <CardTitle className="font-display text-base">Ask the assistant</CardTitle>
                    <CardDescription>
                      For everything that doesn't fit a form. Each conversation is saved separately.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild size="sm">
                  <Link to="/chat">Open chat</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="flex flex-col border-clay/40">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-clay/20 text-clay">
                    <GraduationCap className="size-5" />
                  </span>
                  <div>
                    <CardTitle className="font-display text-base">
                      Subject choice, APS & university matcher
                    </CardTitle>
                    <CardDescription>
                      For learners and parents: choose Grade 10 subjects, count your APS score, and see the
                      courses and universities you qualify for.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild size="sm">
                  <Link to="/career">Start the self-assessment</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent work */}
        <section>
          <SectionTitle
            title="Recent saved work"
            description="Anything you generate can be saved to your private library."
          />
          <div className="mt-5">
            {!user ? (
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
                  <p className="text-sm text-muted-foreground">
                    Sign in to keep your lesson plans, messages and summaries in one private place.
                  </p>
                  <Button asChild size="sm">
                    <Link to="/auth">Sign in</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : saved.data && saved.data.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {saved.data.slice(0, 4).map((item) => (
                  <Card key={item.id}>
                    <CardContent className="py-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-clay">{item.tool}</p>
                      <p className="mt-1 truncate text-sm font-medium">{item.title}</p>
                      <Button asChild variant="link" size="sm" className="mt-1 h-auto px-0">
                        <Link to="/library">Open in library</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Nothing saved yet. Generate something in any tool and press “Save to my library”.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Use cases */}
        <section>
          <SectionTitle
            title="Real classroom problems, and what to open"
            description="Six situations from ECD and Foundation Phase teaching, and the tool that handles each one."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {USE_CASES.map((useCase) => (
              <Card key={useCase.who}>
                <CardContent className="space-y-2 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-clay">{useCase.who}</p>
                  <p className="text-sm font-medium">{useCase.problem}</p>
                  <p className="text-sm text-muted-foreground">{useCase.solution}</p>
                  <Button asChild variant="link" size="sm" className="h-auto px-0">
                    {useCase.tool ? (
                      <Link to="/tools/$toolId" params={{ toolId: useCase.tool }}>
                        Open the tool <ArrowRight className="size-3.5" />
                      </Link>
                    ) : (
                      <Link to="/chat">
                        Open the assistant <ArrowRight className="size-3.5" />
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Safeguards + prompts */}
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <ShieldCheck className="size-5 text-primary" /> Used responsibly
              </CardTitle>
              <CardDescription>
                AI drafts; the educator decides. Every output carries a verification reminder, no learner names
                are needed, and nothing here diagnoses a child.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to="/responsible-ai">Read the safeguards</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <Sparkle className="size-5 text-primary" /> See the prompt engineering
              </CardTitle>
              <CardDescription>
                Role, task, output format and rules — the full prompt behind every tool, with weak-vs-strong
                examples you can learn from.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to="/prompts">Open the prompt library</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
