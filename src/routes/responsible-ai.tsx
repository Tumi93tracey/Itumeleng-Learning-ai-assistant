import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, HeartHandshake, Lock, ScanSearch, Scale, Stethoscope } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI use — Kgaswane Learning Assistant" },
      {
        name: "description",
        content:
          "How this assistant is used responsibly in education: verification, privacy, bias, limitations and when to involve a professional.",
      },
      { property: "og:title", content: "Responsible AI use in the early years classroom" },
      {
        property: "og:description",
        content:
          "Verification, privacy, bias and limitations — the safeguards built into every tool in this assistant.",
      },
    ],
  }),
  component: ResponsibleAI,
});

const PRINCIPLES = [
  {
    icon: Eye,
    title: "AI drafts, the educator decides",
    body: "Nothing here is a finished document. Every output is a first draft to be read, corrected and owned by the adult who knows the child. If a plan does not match the children in front of you, the plan is wrong — not the children.",
  },
  {
    icon: ScanSearch,
    title: "Verify curriculum and policy claims",
    body: "The assistant is told to flag CAPS links, phase expectations and referral routes as needing verification. Check them against your current CAPS documents, your school's assessment policy and your district's procedures. These differ by province and change over time.",
  },
  {
    icon: Lock,
    title: "Protect children's information",
    body: "You never need a learner's full name, ID number, address, medical details or photograph to use these tools. Use initials and describe needs instead. Saved work is private to your account and is not shared with other users.",
  },
  {
    icon: Stethoscope,
    title: "No diagnosis, ever",
    body: "The assistant will not label a child as dyslexic, autistic, ADHD or delayed. It describes what you can observe and points you to the correct referral path — usually your school-based support team, a speech-language therapist or an educational psychologist.",
  },
  {
    icon: Scale,
    title: "Watch for bias",
    body: "Language models are trained mostly on English, Northern-hemisphere material. Suggestions can assume resources, family structures or home languages that do not match a South African classroom. That is why the forms ask what you actually have, and why home-language checks are built into the guidance.",
  },
  {
    icon: HeartHandshake,
    title: "Kindness is a requirement, not a tone setting",
    body: "Parent messages are written to be honest without blaming a family's circumstances. If a draft reads as judgemental, do not send it — regenerate it with a warmer tone or rewrite it yourself.",
  },
];

const LIMITS = [
  "It does not know your children, your class, your school or your term plan — only what you type.",
  "It can state something wrong with complete confidence. Confidence is not accuracy.",
  "Its knowledge has a cut-off date, so it can miss recent curriculum or policy changes.",
  "It cannot see a child, hear speech, or assess hearing, vision or motor skills.",
  "It should never be the only voice in a decision about a child's progression, placement or support.",
];

const PRIVACY_DOS = [
  { do: "“T., Grade R, still confusing s and sh”", dont: "“Thandiwe Nkosi, 5, ID 20190…”" },
  { do: "“One learner needs movement breaks”", dont: "“Sipho is on Ritalin for ADHD”" },
  { do: "“Parent works night shift, grandmother helps”", dont: "Family address, employer, phone number" },
  { do: "Describe behaviour you observed", dont: "Paste a medical or psychological report" },
];

function ResponsibleAI() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Responsible use"
        title="Using AI responsibly with young children"
        description="These safeguards are built into the prompts behind every tool — and they are also a checklist for you before anything leaves this app."
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
        <section className="grid gap-4 md:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <Card key={principle.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5 font-display text-base">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <principle.icon className="size-4.5" />
                  </span>
                  {principle.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{principle.body}</CardContent>
            </Card>
          ))}
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">What this assistant cannot do</h2>
          <ul className="mt-4 space-y-2">
            {LIMITS.map((limit) => (
              <li key={limit} className="flex gap-2.5 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-clay" />
                {limit}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Privacy in practice</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            What you type is sent to an AI service to produce the answer. Write as if the note could be read by
            someone outside the school — because in effect, it is processed outside it.
          </p>
          <Card className="mt-4">
            <CardContent className="overflow-x-auto py-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-2 py-2 font-semibold text-primary">Write this</th>
                    <th className="px-2 py-2 font-semibold text-destructive">Not this</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIVACY_DOS.map((row) => (
                    <tr key={row.do} className="border-b border-border/60 last:border-0">
                      <td className="px-2 py-2 align-top">{row.do}</td>
                      <td className="px-2 py-2 align-top text-muted-foreground">{row.dont}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle className="font-display text-base">A three-question check before you use a draft</CardTitle>
              <CardDescription>
                1. Is anything here a fact I should verify against CAPS or school policy? 2. Would I be
                comfortable if a parent read exactly these words? 3. Does it fit the children I actually teach,
                with the resources I actually have?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link to="/prompts">See how the safeguards are written into the prompts</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
