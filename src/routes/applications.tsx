import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarClock, ClipboardList, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader, useCurrentUser } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  APPLICATION_STATUSES,
  DEFAULT_DOCUMENTS,
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
  type ApplicationDocument,
  type ApplicationRow,
} from "@/lib/applications.functions";
import { UNIVERSITIES } from "@/lib/career-data";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "University application tracker — Kgaswane Learning Assistant" },
      {
        name: "description",
        content:
          "Track every university application in one place: chosen course, institution, closing date and the certified documents still outstanding.",
      },
      { property: "og:title", content: "University application tracker" },
      {
        property: "og:description",
        content: "Courses, universities, closing dates and required documents — all in one checklist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplicationsPage,
});

const EXAMPLE: ApplicationRow[] = [
  {
    id: "demo-1",
    course: "BSc Physiotherapy",
    university: "University of Pretoria",
    deadline: "2026-06-30",
    status: "Documents in progress",
    requirements: "APS 32 · Maths 5 · Physical Sciences 5 · Life Sciences 5",
    notes: "Ask Mrs M. for a Life Sciences supporting letter.",
    documents: DEFAULT_DOCUMENTS.map((name, index) => ({ name, done: index < 3 })),
  },
  {
    id: "demo-2",
    course: "BEd Foundation Phase Teaching",
    university: "University of Johannesburg",
    deadline: "2026-09-30",
    status: "Planning",
    requirements: "APS 26 · Home Language 4 · Maths Literacy 4",
    notes: "Check the Funza Lushaka bursary closing date too.",
    documents: DEFAULT_DOCUMENTS.map((name) => ({ name, done: false })),
  },
];

function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  const target = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return "No closing date yet";
  const date = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(date.getTime())) return deadline;
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

function ApplicationsPage() {
  const { user, loading } = useCurrentUser();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const applications = useQuery({
    queryKey: ["applications"],
    queryFn: () => listApplications(),
    enabled: !!user,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["applications"] });

  const create = useMutation({
    mutationFn: (values: {
      course: string;
      university: string;
      deadline: string | null;
      status: string;
      requirements: string;
      notes: string;
      documents: ApplicationDocument[];
    }) => createApplication({ data: values }),
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      toast.success("Application added");
    },
    onError: () => toast.error("Could not save that application."),
  });

  const update = useMutation({
    mutationFn: (values: { id: string; documents?: ApplicationDocument[]; status?: string }) =>
      updateApplication({ data: values }),
    onSuccess: invalidate,
    onError: () => toast.error("Could not update that application."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteApplication({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Removed");
    },
    onError: () => toast.error("Could not remove that application."),
  });

  const rows = user ? (applications.data ?? []) : EXAMPLE;

  return (
    <AppShell>
      <PageHeader
        eyebrow="For learners & parents"
        title="University application tracker"
        description="List each course and university you are applying to, keep the closing date in front of you, and tick off certified documents as you collect them."
      >
        <div className="flex flex-wrap gap-3">
          {user ? (
            <Button onClick={() => setShowForm((value) => !value)}>
              <Plus className="size-4" /> {showForm ? "Close form" : "Add an application"}
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign in to track your own</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/career">Check my APS & courses first</Link>
          </Button>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        {!user && !loading && (
          <Card className="bg-secondary">
            <CardContent className="py-5 text-sm text-muted-foreground">
              This is an example list so you can see how it works. Sign in and your own applications are saved
              privately to your account.
            </CardContent>
          </Card>
        )}

        {showForm && user && (
          <NewApplicationForm
            pending={create.isPending}
            onSubmit={(values) => create.mutate(values)}
            onCancel={() => setShowForm(false)}
          />
        )}

        {user && applications.isLoading && (
          <p className="text-sm text-muted-foreground">Loading your applications…</p>
        )}

        {user && !applications.isLoading && rows.length === 0 && (
          <Card>
            <CardContent className="space-y-3 py-10 text-center">
              <ClipboardList className="mx-auto size-8 text-primary" />
              <p className="text-sm text-muted-foreground">
                Nothing tracked yet. Add your first course and university above.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {rows.map((row) => {
            const days = daysLeft(row.deadline);
            const collected = row.documents.filter((document) => document.done).length;
            const demo = row.id.startsWith("demo-");
            return (
              <Card key={row.id}>
                <CardHeader className="gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="font-display text-base">{row.course}</CardTitle>
                      <p className="text-sm text-muted-foreground">{row.university}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{row.status}</Badge>
                      {!demo && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Remove application"
                          onClick={() => remove.mutate(row.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <CalendarClock className="size-4 text-clay" />
                    <span className="font-medium">{formatDeadline(row.deadline)}</span>
                    {days !== null && (
                      <span
                        className={
                          days < 0
                            ? "text-destructive"
                            : days <= 21
                              ? "font-medium text-clay"
                              : "text-muted-foreground"
                        }
                      >
                        {days < 0
                          ? `closed ${Math.abs(days)} days ago`
                          : days === 0
                            ? "closes today"
                            : `${days} days left`}
                      </span>
                    )}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {row.requirements && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Entry requirements: </span>
                      {row.requirements}
                    </p>
                  )}
                  {row.notes && <p className="text-sm text-muted-foreground">{row.notes}</p>}

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-clay">
                      Documents · {collected}/{row.documents.length} ready
                    </p>
                    <ul className="mt-2 space-y-2">
                      {row.documents.map((document, index) => (
                        <li key={document.name} className="flex items-start gap-2.5">
                          <Checkbox
                            id={`${row.id}-${index}`}
                            checked={document.done}
                            disabled={demo}
                            onCheckedChange={(checked) => {
                              const documents = row.documents.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, done: checked === true } : item,
                              );
                              update.mutate({ id: row.id, documents });
                            }}
                          />
                          <Label
                            htmlFor={`${row.id}-${index}`}
                            className={
                              document.done
                                ? "text-sm font-normal text-muted-foreground line-through"
                                : "text-sm font-normal"
                            }
                          >
                            {document.name}
                          </Label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!demo && (
                    <div className="flex flex-wrap gap-2">
                      {APPLICATION_STATUSES.filter((status) => status !== row.status).map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant="outline"
                          onClick={() => update.mutate({ id: row.id, status })}
                        >
                          Mark as {status.toLowerCase()}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-secondary">
          <CardContent className="py-5 text-sm text-muted-foreground">
            Closing dates and required documents change every year. Always confirm each one on the
            university's own application page before you rely on it.
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function NewApplicationForm({
  pending,
  onSubmit,
  onCancel,
}: {
  pending: boolean;
  onSubmit: (values: {
    course: string;
    university: string;
    deadline: string | null;
    status: string;
    requirements: string;
    notes: string;
    documents: ApplicationDocument[];
  }) => void;
  onCancel: () => void;
}) {
  const [course, setCourse] = useState("");
  const [university, setUniversity] = useState("");
  const [deadline, setDeadline] = useState("");
  const [requirements, setRequirements] = useState("");
  const [notes, setNotes] = useState("");
  const [extraDocument, setExtraDocument] = useState("");
  const [documents, setDocuments] = useState<ApplicationDocument[]>(
    DEFAULT_DOCUMENTS.map((name) => ({ name, done: false })),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base">Add an application</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="course">Course you are applying for</Label>
            <Input
              id="course"
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              placeholder="BEd Foundation Phase Teaching"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              list="university-list"
              value={university}
              onChange={(event) => setUniversity(event.target.value)}
              placeholder="University of Johannesburg"
            />
            <datalist id="university-list">
              {Object.values(UNIVERSITIES).map((item) => (
                <option key={item.name} value={item.name} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Closing date</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requirements">Entry requirements</Label>
            <Input
              id="requirements"
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              placeholder="APS 26 · Maths Literacy 4"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Residence application also closes in September; ask about the bursary."
          />
        </div>

        <div className="space-y-2">
          <Label>Required documents</Label>
          <ul className="space-y-1.5">
            {documents.map((document, index) => (
              <li key={document.name} className="flex items-center justify-between gap-2 text-sm">
                <span>{document.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              value={extraDocument}
              onChange={(event) => setExtraDocument(event.target.value)}
              placeholder="Add another document (e.g. NBT results)"
            />
            <Button
              variant="secondary"
              onClick={() => {
                const name = extraDocument.trim();
                if (!name) return;
                setDocuments([...documents, { name, done: false }]);
                setExtraDocument("");
              }}
            >
              Add
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={pending}
            onClick={() => {
              if (!course.trim() || !university.trim()) {
                toast.error("Add the course and the university.");
                return;
              }
              onSubmit({
                course: course.trim(),
                university: university.trim(),
                deadline: deadline || null,
                status: "Planning",
                requirements: requirements.trim(),
                notes: notes.trim(),
                documents,
              });
            }}
          >
            {pending ? "Saving…" : "Save application"}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
