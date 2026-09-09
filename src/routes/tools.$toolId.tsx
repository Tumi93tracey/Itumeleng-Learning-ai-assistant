import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Copy, Eye, Loader2, Save, Sparkle, Wand2 } from "lucide-react";

import { AppShell, PageHeader, useCurrentUser } from "@/components/app-shell";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TOOL_BY_ID, TOOL_SPECS, buildPrompt, type ToolId, type ToolSpec } from "@/lib/tool-specs";
import { generateToolOutput } from "@/lib/tools.functions";
import { saveItem } from "@/lib/chats.functions";

export const Route = createFileRoute("/tools/$toolId")({
  loader: ({ params }) => {
    const spec = TOOL_BY_ID[params.toolId as ToolId];
    if (!spec) throw notFound();
    return { toolId: spec.id };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Tool not found" }, { name: "robots", content: "noindex" }] };
    }
    const spec = TOOL_BY_ID[loaderData.toolId];
    const title = `${spec.name} — Kgaswane Learning Assistant`;
    return {
      meta: [
        { title },
        { name: "description", content: spec.tagline },
        { property: "og:title", content: title },
        { property: "og:description", content: spec.tagline },
      ],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { toolId } = Route.useLoaderData();
  const spec = TOOL_BY_ID[toolId];
  const { user } = useCurrentUser();

  const [values, setValues] = useState<Record<string, string>>(() => defaults(spec));
  const [output, setOutput] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [saved, setSaved] = useState(false);

  const prompt = buildPrompt(spec, values);
  const missing = spec.fields.filter((field) => field.required && !values[field.id]?.trim());

  async function onGenerate() {
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((field) => field.label).join(", ")}`);
      return;
    }
    setBusy(true);
    setOutput(null);
    setSaved(false);
    try {
      const result = await generateToolOutput({ data: { toolId: spec.id, values } });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOutput(result.output);
      setShowSample(false);
    } catch (error) {
      toast.error(
        error instanceof Error && /unauthor/i.test(error.message)
          ? "Please sign in to generate."
          : "The request failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    if (!output) return;
    try {
      await saveItem({
        data: {
          tool: spec.name,
          title: titleFor(spec, values),
          inputs: values,
          prompt: `${prompt.system}\n\n${prompt.user}`,
          output,
        },
      });
      setSaved(true);
      toast.success("Saved to your library");
    } catch {
      toast.error("Could not save. Please try again.");
    }
  }

  const shown = output ?? (showSample ? spec.sampleOutput : null);

  return (
    <AppShell>
      <PageHeader eyebrow={`Tool · saves ${spec.saves}`} title={spec.name} description={spec.tagline}>
        <div className="flex flex-wrap gap-2">
          {TOOL_SPECS.filter((other) => other.id !== spec.id).map((other) => (
            <Button key={other.id} asChild size="sm" variant="outline">
              <Link to="/tools/$toolId" params={{ toolId: other.id }}>
                {other.name}
              </Link>
            </Button>
          ))}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Alert className="mb-6 border-clay/40 bg-accent/60">
          <AlertTriangle className="size-4" />
          <AlertTitle className="font-display">The problem this solves</AlertTitle>
          <AlertDescription>{spec.problem}</AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="font-display text-base">Tell the assistant about your context</CardTitle>
              <CardDescription>
                These answers become a structured prompt. The more specific you are, the more usable the
                result — but never enter a child's full name or personal details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {spec.fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="ml-1 text-clay">*</span>}
                  </Label>
                  {field.type === "select" ? (
                    <Select
                      value={values[field.id] ?? ""}
                      onValueChange={(value) => setValues((prev) => ({ ...prev, [field.id]: value }))}
                    >
                      <SelectTrigger id={field.id}>
                        <SelectValue placeholder="Choose one" />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.id}
                      rows={field.rows ?? 3}
                      placeholder={field.placeholder}
                      value={values[field.id] ?? ""}
                      onChange={(event) =>
                        setValues((prev) => ({ ...prev, [field.id]: event.target.value }))
                      }
                    />
                  ) : (
                    <Input
                      id={field.id}
                      placeholder={field.placeholder}
                      value={values[field.id] ?? ""}
                      onChange={(event) =>
                        setValues((prev) => ({ ...prev, [field.id]: event.target.value }))
                      }
                    />
                  )}
                  {field.help && (
                    <p className="text-xs text-muted-foreground">
                      {field.privacy && <span className="font-medium text-clay">Privacy: </span>}
                      {field.help}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button onClick={onGenerate} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                  {busy ? "Writing…" : "Generate"}
                </Button>
                <Button variant="outline" onClick={() => setValues(spec.sample)}>
                  Fill with demo details
                </Button>
                <Button variant="ghost" onClick={() => setValues(defaults(spec))}>
                  Clear
                </Button>
              </div>
              {!user && (
                <p className="text-xs text-muted-foreground">
                  You can explore the form and the worked example freely.{" "}
                  <Link to="/auth" className="font-medium text-primary underline">
                    Sign in
                  </Link>{" "}
                  to generate and save your own.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Output */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-base">
                    {output ? "Your draft" : showSample ? "Worked example" : "Result"}
                  </CardTitle>
                  <CardDescription>
                    {output
                      ? "Read it, change what doesn't fit your children, then use it."
                      : "Generate a draft, or read the worked example to see what comes out."}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!output && (
                    <Button variant="outline" size="sm" onClick={() => setShowSample((value) => !value)}>
                      <Eye className="size-4" /> {showSample ? "Hide" : "Example"}
                    </Button>
                  )}
                  {shown && <CopyButton text={shown} />}
                </div>
              </CardHeader>
              <CardContent>
                {busy ? (
                  <p className="animate-pulse text-sm text-muted-foreground">
                    Thinking about your {spec.name.toLowerCase()}…
                  </p>
                ) : shown ? (
                  <>
                    {!output && (
                      <Badge variant="secondary" className="mb-3">
                        Demo output — generated earlier as an example
                      </Badge>
                    )}
                    <Markdown>{shown}</Markdown>
                    <div className="mt-6 space-y-3 border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-clay">Check before you use it:</span> AI drafts can
                        be confidently wrong. Verify any curriculum, policy or referral detail against your
                        current CAPS documents and school procedures, and make sure it matches the children you
                        actually teach.
                      </p>
                      {output && (
                        <Button size="sm" variant="secondary" onClick={onSave} disabled={saved}>
                          {saved ? <Check className="size-4" /> : <Save className="size-4" />}
                          {saved ? "Saved" : "Save to my library"}
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing yet. Fill in the form and press Generate — or press “Fill with demo details” to see
                    it work end to end.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Prompt transparency */}
            <Card className="bg-secondary">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 font-display text-base">
                    <Sparkle className="size-4 text-primary" /> See the prompt
                  </CardTitle>
                  <CardDescription>
                    Exactly what your answers become before they reach the AI: a role, a task, a required
                    output format and safeguard rules.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPrompt((value) => !value)}>
                  {showPrompt ? "Hide" : "Show"}
                </Button>
              </CardHeader>
              {showPrompt && (
                <CardContent className="space-y-3">
                  <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-card p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {prompt.system}
                    {"\n\n"}
                    {prompt.user}
                  </pre>
                  <CopyButton text={`${prompt.system}\n\n${prompt.user}`} label="Copy prompt" />
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function defaults(spec: ToolSpec) {
  const values: Record<string, string> = {};
  for (const field of spec.fields) {
    values[field.id] = field.type === "select" ? (field.options?.[0] ?? "") : "";
  }
  return values;
}

function titleFor(spec: ToolSpec, values: Record<string, string>) {
  const first = spec.fields.find((field) => field.type !== "select" && values[field.id]?.trim());
  const raw = first ? values[first.id]!.trim() : Object.values(values).find(Boolean) ?? spec.name;
  return `${spec.name}: ${raw.slice(0, 90)}`;
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
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
