import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader, useCurrentUser } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createChat, deleteChat, listChats } from "@/lib/chats.functions";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "Ask the assistant — Kgaswane Learning Assistant" },
      {
        name: "description",
        content:
          "Chat with an AI assistant about early childhood development, phonics, lesson ideas and parent conversations. Every conversation is saved separately.",
      },
      { property: "og:title", content: "Ask the assistant — Kgaswane Learning Assistant" },
      {
        property: "og:description",
        content: "An AI assistant for teachers, parents and learners in the early years.",
      },
    ],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const chats = useQuery({
    queryKey: ["chats"],
    queryFn: () => listChats(),
    enabled: !!user,
  });

  const start = useMutation({
    mutationFn: () => createChat({ data: { title: "New conversation" } }),
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      if (chat) navigate({ to: "/chat/$chatId", params: { chatId: chat.id } });
    },
    onError: () => toast.error("Could not start a new conversation."),
  });

  const remove = useMutation({
    mutationFn: (chatId: string) => deleteChat({ data: { chatId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chats"] }),
    onError: () => toast.error("Could not delete that conversation."),
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Assistant"
        title="Ask the assistant"
        description="For the questions that don't fit a form. Each conversation is saved on its own, so you can come back to it later."
      >
        {user && (
          <Button onClick={() => start.mutate()} disabled={start.isPending}>
            <Plus className="size-4" /> New conversation
          </Button>
        )}
      </PageHeader>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {!user && !loading ? (
          <Card>
            <CardContent className="space-y-3 py-8 text-center">
              <MessageCircle className="mx-auto size-8 text-primary" />
              <p className="font-display text-lg font-semibold">Sign in to start chatting</p>
              <p className="text-sm text-muted-foreground">
                Conversations are saved to your private account so you can pick them up again.
              </p>
              <Button asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        ) : chats.data && chats.data.length > 0 ? (
          <ul className="space-y-2">
            {chats.data.map((chat) => (
              <li
                key={chat.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <Link
                  to="/chat/$chatId"
                  params={{ chatId: chat.id }}
                  className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                >
                  {chat.title}
                </Link>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                  {new Date(chat.updated_at).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete conversation"
                  onClick={() => remove.mutate(chat.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : user ? (
          <Card>
            <CardContent className="space-y-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
              <Button onClick={() => start.mutate()} disabled={start.isPending}>
                <Plus className="size-4" /> Start your first conversation
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
