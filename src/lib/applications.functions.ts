import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const APPLICATION_STATUSES = [
  "Planning",
  "Documents in progress",
  "Submitted",
  "Offer received",
  "Not accepted",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type ApplicationDocument = { name: string; done: boolean };

export type ApplicationRow = {
  id: string;
  course: string;
  university: string;
  deadline: string | null;
  status: string;
  requirements: string;
  notes: string;
  documents: ApplicationDocument[];
};

/** Documents a South African university application usually needs. */
export const DEFAULT_DOCUMENTS = [
  "Certified copy of ID (or birth certificate)",
  "Certified latest school results",
  "Proof of residence",
  "Parent/guardian proof of income",
  "Application fee payment proof",
  "Passport photo",
];

const DocumentSchema = z.object({ name: z.string().min(1).max(120), done: z.boolean() });

const BaseSchema = z.object({
  course: z.string().min(1).max(160),
  university: z.string().min(1).max(160),
  deadline: z.string().max(20).nullable(),
  status: z.string().min(1).max(60),
  requirements: z.string().max(600),
  notes: z.string().max(1000),
  documents: z.array(DocumentSchema).max(30),
});

function normalise(row: Record<string, unknown>): ApplicationRow {
  const documents = Array.isArray(row['documents']) ? (row['documents'] as ApplicationDocument[]) : [];
  return {
    id: String(row['id']),
    course: String(row['course'] ?? ""),
    university: String(row['university'] ?? ""),
    deadline: (row['deadline'] as string | null) ?? null,
    status: String(row['status'] ?? "Planning"),
    requirements: String(row['requirements'] ?? ""),
    notes: String(row['notes'] ?? ""),
    documents,
  };
}

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("applications")
      .select("id, course, university, deadline, status, requirements, notes, documents")
      .order("deadline", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => normalise(row as Record<string, unknown>));
  });

export const createApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BaseSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("applications")
      .insert({ ...data, user_id: context.userId })
      .select("id, course, university, deadline, status, requirements, notes, documents")
      .single();
    if (error) throw new Error(error.message);
    return normalise(row as Record<string, unknown>);
  });

export const updateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    BaseSchema.partial().extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase
      .from("applications")
      .update(patch as Record<string, never>)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("applications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
