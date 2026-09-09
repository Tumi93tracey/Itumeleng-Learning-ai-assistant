import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { ArrowLeft } from "lucide-react";

import { AppShell, useCurrentUser } from "@/components/app-shell";
import { ChatWindow } from "@/components/chat-window";
import { Button } from "@/components/ui/button";
import { getChatMessages } from "@/lib/chats.functions";

export const Route = createFileRoute("/chat/$chatId")({
  head: () => ({
    meta: [
      { title: "Conversation — Kgaswane Learning Assistant" },
      {
        name: "description",
        content: "A saved conversation with the Kgaswane Learning Assistant.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Conversation — Kgaswane Learning Assistant" },
      { property: "og:description", content: "A saved conversation with the AI assistant." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { chatId } = Route.useParams();
  const { user, loading } = useCurrentUser();

  const chat = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => getChatMessages({ data: { chatId } }),
    enabled: !!user,
  });

  if (!user && !loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="font-display text-lg font-semibold">Please sign in</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Conversations are private to your account.
          </p>
          <Button asChild className="mt-4">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const initialMessages: UIMessage[] = (chat.data?.messages ?? []).map((message) => ({
    id: message.id,
    role: message.role === "assistant" ? "assistant" : "user",
    parts: [{ type: "text", text: message.content }],
  }));

  return (
    <AppShell>
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5 sm:px-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/chat">
            <ArrowLeft className="size-4" /> All conversations
          </Link>
        </Button>
        <p className="min-w-0 truncate text-sm font-medium text-muted-foreground">
          {chat.data?.chat.title ?? ""}
        </p>
      </div>
      {chat.isLoading ? (
        <p className="p-6 text-sm text-muted-foreground">Loading conversation…</p>
      ) : (
        <ChatWindow key={chatId} chatId={chatId} initialMessages={initialMessages} />
      )}
    </AppShell>
  );
}
