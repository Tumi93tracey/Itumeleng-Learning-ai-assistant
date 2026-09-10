import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  Info,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";

import { AppShell, PageHeader, useCurrentUser } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { saveItem } from "@/lib/chats.functions";
import {
  CAREER_DISCLAIMER,
  INTERESTS,
  NSC_SCALE,
  SUBJECTS,
  SUBJECT_BY_KEY,
  UNIVERSITIES,
  calculateAps,
  matchProgrammes,
  percentToLevel,
  recommendPackages,
  type InterestKey,
  type SubjectKey,
} from "@/lib/career-data";

export const Route = createFileRoute("/career")({
  head: () => {
    const title = "Subject choice, APS & university matcher — Kgaswane Learning Assistant";
    const description =
      "A guided South African tool: choose Grade 10 subjects, calculate your APS score, and see the courses and universities you qualify for.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CareerPage,
});

const ELECTIVES: SubjectKey[] = SUBJECTS.filter(
  (subject) => !subject.compulsory && subject.key !== "maths" && subject.key !== "maths-lit",
).map((subject) => subject.key);

type Path = "grade9" | "grade1012" | null;

const DEMO_MARKS: Record<string, string> = {
  "home-language": "72",
  fal: "65",
  "life-orientation": "78",
  maths: "63",
  "physical-sciences": "58",
  "life-sciences": "67",
  geography: "61",
};

function CareerPage() {
  const { user } = useCurrentUser();
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<Path>(null);

  // Grade 9 path
  const [interests, setInterests] = useState<InterestKey[]>([]);
  const [mathsComfort, setMathsComfort] = useState<"yes" | "no">("yes");

  // Grade 10–12 path
  const [mathsChoice, setMathsChoice] = useState<"maths" | "maths-lit">("maths");
  const [electives, setElectives] = useState<SubjectKey[]>([
    "physical-sciences",
    "life-sciences",
    "geography",
  ]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const markedSubjects: SubjectKey[] = useMemo(
    () => ["home-language", "fal", "life-orientation", mathsChoice, ...electives],
    [mathsChoice, electives],
  );

  const aps = useMemo(
    () =>
      calculateAps(
        markedSubjects
          .map((key) => ({ key, percent: Number(marks[key]) }))
          .filter((entry) => Number.isFinite(entry.percent) && entry.percent > 0),
      ),
    [markedSubjects, marks],
  );

  const matches = useMemo(() => matchProgrammes(aps.aps, aps.levels), [aps]);
  const packages = useMemo(() => recommendPackages(interests, mathsComfort === "yes"), [interests, mathsComfort]);

  const filledMarks = markedSubjects.filter((key) => Number(marks[key]) > 0).length;

  function reset() {
    setStep(0);
    setPath(null);
    setInterests([]);
    setMarks({});
    setSaved(false);
  }

  async function onSave() {
    const lines =
      path === "grade9"
        ? packages.map((entry) => `- **${entry.pkg.name}** — ${entry.pkg.summary}`)
        : [
            `**APS (best six, excluding Life Orientation): ${aps.aps}**`,
            "",
            ...aps.counted.map((entry) => `- ${entry.name}: ${entry.percent}% (level ${entry.level})`),
            "",
            "**You currently qualify for:**",
            ...matches
              .filter((match) => match.status === "qualify")
              .map((match) => `- ${match.programme.name} (APS ${match.programme.minAps}+)`),
          ];
    try {
      await saveItem({
        data: {
          tool: "Subject & university planner",
          title:
            path === "grade9"
              ? "Grade 10 subject-choice plan"
              : `APS ${aps.aps} — courses I qualify for`,
          inputs: path === "grade9" ? { interests: interests.join(", ") } : marks,
          prompt: "Calculated from built-in South African NSC and university entry data.",
          output: lines.join("\n"),
        },
      });
      setSaved(true);
      toast.success("Saved to your library");
    } catch {
      toast.error("Could not save. Please sign in and try again.");
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Tool · learners & parents"
        title="Subject choice, APS score & university matcher"
        description="Three steps: work out which Grade 10 subjects fit you, turn your marks into an APS score, then see the courses and universities you qualify for right now."
      >
        <div className="flex flex-wrap items-center gap-2">
          {["Where you are", path === "grade9" ? "Your interests" : "Your marks", "Your options"].map(
            (label, index) => (
              <Badge key={label} variant={index === step ? "default" : "secondary"}>
                {index + 1}. {label}
              </Badge>
            ),
          )}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {/* Step 0 */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Where are you right now?</CardTitle>
              <CardDescription>
                This decides whether we start with subject choices or with your marks.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setPath("grade9");
                  setStep(1);
                }}
                className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent/50"
              >
                <GraduationCap className="mb-2 size-5 text-primary" />
                <p className="font-display font-semibold">I'm choosing Grade 10 subjects</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  In Grade 9 and deciding on a stream. No marks needed — we start with what you enjoy and
                  show which doors each subject package keeps open.
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPath("grade1012");
                  setStep(1);
                }}
                className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent/50"
              >
                <Building2 className="mb-2 size-5 text-primary" />
                <p className="font-display font-semibold">I'm in Grade 10, 11 or 12</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your latest percentages. We calculate your APS on the NSC 7-point scale and match
                  you to degrees, diplomas and universities.
                </p>
              </button>
            </CardContent>
          </Card>
        )}

        {/* Step 1 — Grade 9 interests */}
        {step === 1 && path === "grade9" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">What do you actually enjoy?</CardTitle>
              <CardDescription>Pick two or three. Be honest — not what sounds impressive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {INTERESTS.map((interest) => {
                  const active = interests.includes(interest.key);
                  return (
                    <button
                      key={interest.key}
                      type="button"
                      onClick={() =>
                        setInterests((prev) =>
                          prev.includes(interest.key)
                            ? prev.filter((key) => key !== interest.key)
                            : [...prev, interest.key],
                        )
                      }
                      className={cn(
                        "flex items-start gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                        active
                          ? "border-primary bg-accent"
                          : "border-border bg-card hover:border-primary/50",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                          active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {active && <Check className="size-3" />}
                      </span>
                      <span>
                        <span className="font-medium">{interest.label}</span>
                        <span className="block text-xs text-muted-foreground">{interest.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="max-w-sm space-y-1.5">
                <Label htmlFor="maths-comfort">
                  Are you willing to take Mathematics (not Mathematical Literacy)?
                </Label>
                <Select value={mathsComfort} onValueChange={(value) => setMathsComfort(value as "yes" | "no")}>
                  <SelectTrigger id="maths-comfort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes — I'll put in the work</SelectItem>
                    <SelectItem value="no">No — I'd rather take Mathematical Literacy</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This is the single biggest decision in Grade 9. Mathematical Literacy closes most science,
                  engineering, health and accounting degrees.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setStep(2)} disabled={interests.length === 0}>
                  See my subject options <ArrowRight className="size-4" />
                </Button>
                <Button variant="ghost" onClick={() => setStep(0)}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1 — marks */}
        {step === 1 && path === "grade1012" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Your seven subjects and latest marks</CardTitle>
              <CardDescription>
                Use your most recent report percentages. Only use your own marks — never enter another
                learner's results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="maths-choice">Maths subject</Label>
                  <Select
                    value={mathsChoice}
                    onValueChange={(value) => setMathsChoice(value as "maths" | "maths-lit")}
                  >
                    <SelectTrigger id="maths-choice">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maths">Mathematics</SelectItem>
                      <SelectItem value="maths-lit">Mathematical Literacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Your three elective subjects</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {ELECTIVES.map((key) => {
                      const active = electives.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setElectives((prev) =>
                              prev.includes(key)
                                ? prev.filter((item) => item !== key)
                                : prev.length >= 3
                                  ? prev
                                  : [...prev, key],
                            )
                          }
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs transition-colors",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary/50",
                          )}
                        >
                          {SUBJECT_BY_KEY[key].name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {electives.length}/3 chosen. Tap one again to remove it.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {markedSubjects.map((key) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={`mark-${key}`}>{SUBJECT_BY_KEY[key].name} (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`mark-${key}`}
                        type="number"
                        min={0}
                        max={100}
                        inputMode="numeric"
                        placeholder="e.g. 64"
                        value={marks[key] ?? ""}
                        onChange={(event) =>
                          setMarks((prev) => ({ ...prev, [key]: event.target.value }))
                        }
                      />
                      {Number(marks[key]) > 0 && (
                        <Badge variant="secondary">L{percentToLevel(Number(marks[key]))}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setStep(2)} disabled={filledMarks < 6}>
                  Calculate my APS <ArrowRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMathsChoice("maths");
                    setElectives(["physical-sciences", "life-sciences", "geography"]);
                    setMarks(DEMO_MARKS);
                  }}
                >
                  Fill with demo marks
                </Button>
                <Button variant="ghost" onClick={() => setStep(0)}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
              </div>
              {filledMarks < 6 && (
                <p className="text-xs text-muted-foreground">
                  Enter at least six subject marks for an APS score.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2 — results */}
        {step === 2 && path === "grade9" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Subject packages that fit you</CardTitle>
                <CardDescription>
                  Ordered by how well they match what you enjoy. Every package keeps different careers open.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {packages.map(({ pkg }, index) => (
                  <div key={pkg.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-semibold">{pkg.name}</h3>
                      {index === 0 && <Badge>Best match</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{pkg.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {pkg.subjects.map((key) => (
                        <Badge key={key} variant="secondary">
                          {SUBJECT_BY_KEY[key].name}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-3 text-sm">
                      <span className="font-medium">Keeps open: </span>
                      {pkg.keepsOpen.join(" · ")}
                    </p>
                    {pkg.warning && (
                      <p className="mt-2 text-sm text-clay">
                        <span className="font-semibold">Think carefully: </span>
                        {pkg.warning}
                      </p>
                    )}
                  </div>
                ))}
                {packages.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Pick at least one interest to see matching packages.
                  </p>
                )}
              </CardContent>
            </Card>
            <Actions
              onBack={() => setStep(1)}
              onReset={reset}
              onSave={onSave}
              saved={saved}
              signedIn={Boolean(user)}
              extra={
                <Button variant="outline" onClick={() => setPath("grade1012")}>
                  Switch to the APS calculator
                </Button>
              }
            />
            <Disclaimer />
          </div>
        )}

        {step === 2 && path === "grade1012" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Your APS score</CardTitle>
                <CardDescription>
                  Calculated on the NSC 7-point scale from your best six subjects, with Life Orientation left
                  out — the most common university method.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end gap-6">
                  <div>
                    <p className="font-display text-5xl font-semibold text-primary">{aps.aps}</p>
                    <p className="text-xs text-muted-foreground">APS (best six, no Life Orientation)</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold">{aps.apsWithLo}</p>
                    <p className="text-xs text-muted-foreground">
                      With Life Orientation, where a university counts it
                    </p>
                  </div>
                  <Badge variant={aps.bachelorPass ? "default" : "secondary"}>
                    {aps.bachelorPass ? "On track for a bachelor pass" : "Bachelor pass not met yet"}
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2">Subject</th>
                        <th className="py-2">Mark</th>
                        <th className="py-2">Level</th>
                        <th className="py-2">Counted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...aps.counted, ...aps.excluded].map((entry) => (
                        <tr key={entry.key} className="border-b border-border/60">
                          <td className="py-2">{entry.name}</td>
                          <td className="py-2">{entry.percent}%</td>
                          <td className="py-2">{entry.level}</td>
                          <td className="py-2 text-muted-foreground">
                            {aps.counted.some((counted) => counted.key === entry.key) ? "Yes" : "No"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {aps.bachelorNotes.length > 0 && (
                  <Alert>
                    <Info className="size-4" />
                    <AlertTitle className="font-display">About a bachelor pass</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc space-y-1 pl-4">
                        {aps.bachelorNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Courses and universities</CardTitle>
                <CardDescription>
                  Matched on your APS and your subject levels. Green means you meet the published minimum
                  today; “almost there” shows exactly what to lift.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.programme.id}
                    className={cn(
                      "rounded-xl border p-4",
                      match.status === "qualify"
                        ? "border-primary/60 bg-accent/40"
                        : match.status === "close"
                          ? "border-clay/60"
                          : "border-border opacity-80",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-semibold">{match.programme.name}</h3>
                      <Badge
                        variant={
                          match.status === "qualify"
                            ? "default"
                            : match.status === "close"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {match.status === "qualify"
                          ? "You qualify"
                          : match.status === "close"
                            ? "Almost there"
                            : "Not yet"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {match.programme.field} · minimum APS {match.programme.minAps}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{match.programme.careers}</p>

                    {(match.apsGap > 0 || match.unmet.length > 0) && (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-clay">
                        {match.apsGap > 0 && <li>Lift your APS by {match.apsGap} point(s).</li>}
                        {match.unmet.map((entry) => (
                          <li key={entry.name}>
                            {entry.name}: need level {entry.needLevel}
                            {entry.haveLevel === null
                              ? " — you're not taking this subject"
                              : `, you have level ${entry.haveLevel}`}
                            .
                          </li>
                        ))}
                      </ul>
                    )}

                    {match.programme.recommended && (
                      <p className="mt-2 text-sm">{match.programme.recommended}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {match.programme.universities.map((id) => {
                        const uni = UNIVERSITIES[id];
                        if (!uni) return null;
                        return (
                          <a
                            key={id}
                            href={`https://${uni.site}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="rounded-full border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary"
                          >
                            {uni.name} · {uni.city}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-secondary">
              <CardHeader>
                <CardTitle className="font-display text-base">How the APS scale works</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-1 text-sm sm:grid-cols-2">
                  {NSC_SCALE.map((band) => (
                    <li key={band.level}>
                      <span className="font-medium">Level {band.level}</span> — {band.min}–{band.max}% ·{" "}
                      {band.label}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Actions
              onBack={() => setStep(1)}
              onReset={reset}
              onSave={onSave}
              saved={saved}
              signedIn={Boolean(user)}
            />
            <Disclaimer />
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Actions({
  onBack,
  onReset,
  onSave,
  saved,
  signedIn,
  extra,
}: {
  onBack: () => void;
  onReset: () => void;
  onSave: () => void;
  saved: boolean;
  signedIn: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="size-4" /> Change my answers
      </Button>
      {signedIn ? (
        <Button variant="secondary" onClick={onSave} disabled={saved}>
          {saved ? <Check className="size-4" /> : <Save className="size-4" />}
          {saved ? "Saved" : "Save to my library"}
        </Button>
      ) : (
        <Button asChild variant="secondary">
          <Link to="/auth">Sign in to save this plan</Link>
        </Button>
      )}
      {extra}
      <Button variant="outline" onClick={onReset}>
        <RotateCcw className="size-4" /> Start over
      </Button>
    </div>
  );
}

function Disclaimer() {
  return (
    <Alert className="border-clay/40 bg-accent/50">
      <ShieldCheck className="size-4" />
      <AlertTitle className="font-display">Check before you apply</AlertTitle>
      <AlertDescription>{CAREER_DISCLAIMER}</AlertDescription>
    </Alert>
  );
}
