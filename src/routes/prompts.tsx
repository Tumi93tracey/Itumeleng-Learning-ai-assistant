import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TOOL_SPECS, buildPrompt } from "@/lib/tool-specs";

export const Route = createFileRoute("/prompts")({
  head: () => ({
    meta: [
      { title: "Prompt library — Kgaswane Learning Assistant" },
      {
        name: "description",
        content:
          "The prompt engineering behind every tool: role, task, output format and safeguards, plus weak-versus-strong prompt examples for educators.",
      },
      { property: "og:title", content: "Prompt library for educators" },
      {
        property: "og:description",
        content:
          "See how role, audience, tone and output format turn a vague request into a usable teaching resource.",
      },
    ],
  }),
  component: PromptsPage,
});

const TECHNIQUES = [
  {
    title: "Give the AI a role",
    body: "“You are an experienced South African ECD practitioner” produces different vocabulary, examples and assumptions than no role at all. Every tool here opens with a role.",
  },
  {
    title: "Name the audience",
    body: "A message for a parent of a toddler, a guardian, or a principal needs different length, formality and detail. Audience is a field, not an afterthought.",
  },
  {
    title: "Set the output format",
    body: "Ask for the exact sections you want — objectives, activities with timings, differentiation, assessment. Without a format you get an essay you still have to reorganise.",
  },
  {
    title: "State your constraints",
    body: "Time, group size and the resources you actually have. Otherwise you get a beautiful plan that needs a laminator, a smartboard and 20 minutes you don't have.",
  },
  {
    title: "Add the rules",
    body: "No invented facts, no diagnosis, flag policy claims for verification, never blame the family. Rules go in the prompt, not just in the user's head.",
  },
  {
    title: "Then refine",
    body: "Treat the first answer as a draft. “Shorter, warmer, and add an isiZulu sentence at the end” is a normal second step, not a failure.",
  },
];

const COMPARISONS = [
  {
    weak: "Write a lesson plan about the letter s.",
    strong:
      "You are an experienced Grade R teacher in a South African public school. Write a 30-minute phonics lesson on the letter sound /s/ for 32 learners, using only a sand tray, flashcards, crayons and a storybook (no printer). Include objectives as observable behaviours, minute-by-minute activities, one way to simplify for three learners who confuse /s/ and /sh/, one extension, an observation checklist and a one-line home activity. Flag the CAPS link as needing my verification.",
    why: "Role, age, time, group size, real resources, required sections, differentiation and a verification instruction — every one of those removes a round of rewriting.",
  },
  {
    weak: "Write an email to a parent about their child not concentrating.",
    strong:
      "You are an ECD educator writing to the parent of a Grade R learner. Tone: firm but kind. Channel: email, plain simple English. Situation: T. is blending three-letter words well, but often arrives without breakfast and cannot focus before 10am; twice this week she fell asleep at story time. Include a subject line, one clear next step, and a shorter WhatsApp version. Do not blame the family, and list anything I must confirm before sending.",
    why: "Purpose, audience, tone, channel, reading level and a second format — plus an explicit instruction not to blame, which is where these messages usually go wrong.",
  },
  {
    weak: "Summarise my meeting notes.",
    strong:
      "Turn these rough parent-meeting notes into: a 3-sentence summary, key points, decisions, an action table (action / who / by when), the follow-up date, and a parent-friendly recap I can send as-is. List anything ambiguous in my notes as questions to confirm. Use initials only.",
    why: "The output format is the whole value here. Asking for owners, dates and a confirm-list turns notes into follow-through.",
  },
];

function PromptsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Prompt engineering"
        title="Prompt library"
        description="The tools in this app are guided prompts. Here is what they send, why it is structured that way, and how to write your own."
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
        <section>
          <h2 className="font-display text-xl font-semibold">Six techniques used in every tool</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TECHNIQUES.map((technique) => (
              <Card key={technique.title}>
                <CardHeader>
                  <CardTitle className="font-display text-base">{technique.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{technique.body}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Weak prompt vs strong prompt</h2>
          <div className="mt-4 space-y-4">
            {COMPARISONS.map((comparison) => (
              <Card key={comparison.weak}>
                <CardContent className="space-y-4 py-5">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-destructive">
                      <ThumbsDown className="size-3.5" /> Vague
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground italic">“{comparison.weak}”</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                      <ThumbsUp className="size-3.5" /> Engineered
                    </p>
                    <p className="mt-1 text-sm">“{comparison.strong}”</p>
                    <div className="mt-2">
                      <CopyButton text={comparison.strong} />
                    </div>
                  </div>
                  <p className="border-t border-border pt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Why it works: </span>
                    {comparison.why}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">The exact prompts behind the tools</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Each tool builds this system prompt, then appends your form answers as context.
          </p>
          <div className="mt-4 space-y-3">
            {TOOL_SPECS.map((spec) => {
              const { system } = buildPrompt(spec, spec.sample);
              return (
                <Card key={spec.id}>
                  <CardHeader>
                    <CardTitle className="font-display text-base">{spec.name}</CardTitle>
                    <CardDescription>{spec.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <details>
                      <summary className="cursor-pointer text-sm font-medium text-primary">
                        Show the system prompt
                      </summary>
                      <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
                        {system}
                      </pre>
                    </details>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton text={system} label="Copy prompt" />
                      <Button asChild size="sm" variant="secondary">
                        <Link to="/tools/$toolId" params={{ toolId: spec.id }}>
                          Open {spec.name}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function CopyButton({ text, label = "Copy this prompt" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        toast.success("Copied");
        setTimeout(() => setDone(false), 2000);
      }}
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />} {label}
    </Button>
  );
}
