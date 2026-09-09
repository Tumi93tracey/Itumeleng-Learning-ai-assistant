import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Library as LibraryIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader, useCurrentUser } from "@/components/app-shell";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { deleteSavedItem, listSavedItems } from "@/lib/chats.functions";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "My saved work — Kgaswane Learning Assistant" },
      {
        name: "description",
        content: "Your saved lesson plans, parent messages, meeting summaries and plans, private to you.",
      },
      { property: "og:title", content: "My saved work — Kgaswane Learning Assistant" },
      { property: "og:description", content: "Everything you generated, kept in one private place." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { user, loading } = useCurrentUser();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useQuery({
    queryKey: ["saved-items"],
    queryFn: () => listSavedItems(),
    enabled: !!user,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteSavedItem({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-items"] });
      toast.success("Deleted");
    },
    onError: () => toast.error("Could not delete that item."),
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Library"
        title="My saved work"
        description="Everything you saved from the tools, newest first. Only you can see this."
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {!user && !loading ? (
          <Card>
            <CardContent className="space-y-3 py-8 text-center">
              <LibraryIcon className="mx-auto size-8 text-primary" />
              <p className="font-display text-lg font-semibold">Sign in to see your library</p>
              <Button asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        ) : items.data && items.data.length > 0 ? (
          <ul className="space-y-3">
            {items.data.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-card">
                <div className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <Badge variant="secondary">{item.tool}</Badge>
                    <p className="mt-2 truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenId(openId === item.id ? null : item.id)}
                    >
                      {openId === item.id ? "Hide" : "Open"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete"
                      onClick={() => remove.mutate(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                {openId === item.id && (
                  <div className="border-t border-border p-4">
                    <Markdown>{item.output}</Markdown>
                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs font-medium text-primary">
                        Show the prompt used
                      </summary>
                      <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
                        {item.prompt}
                      </pre>
                    </details>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : user ? (
          <Card>
            <CardContent className="space-y-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
              <Button asChild>
                <Link to="/tools/$toolId" params={{ toolId: "lesson-plan" }}>
                  Create a lesson plan
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
