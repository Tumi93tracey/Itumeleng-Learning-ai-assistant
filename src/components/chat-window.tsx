import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { appendChatMessages } from "@/lib/chats.functions";

const SUGGESTIONS = [
  "How do I settle a Grade R class after break in under five minutes?",
  "A parent says their 4-year-old isn't talking much yet. What should I look for?",
  "Give me five phonics games that need no printing.",
  "How do I explain a report comment about poor concentration kindly?",
];

function textOf(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export function ChatWindow({
  chatId,
  initialMessages,
  onTitle,
}: {
  chatId: string;
  initialMessages: UIMessage[];
  onTitle?: (title: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedIds = useRef(new Set(initialMessages.map((message) => message.id)));

  const { messages, sendMessage, status, error } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: async () => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    onFinish: async ({ messages: all }) => {
      const unsaved = all
        .filter((message) => !savedIds.current.has(message.id))
        .map((message) => ({
          role: message.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: textOf(message),
          id: message.id,
        }))
        .filter((message) => message.content.length > 0);
      if (unsaved.length === 0) return;
      const firstUser = all.find((message) => message.role === "user");
      const title = firstUser ? textOf(firstUser).slice(0, 80) : undefined;
      try {
        await appendChatMessages({
          data: {
            chatId,
            ...(title ? { title } : {}),
            messages: unsaved.map(({ role, content }) => ({ role, content })),
          },
        });
        unsaved.forEach((message) => savedIds.current.add(message.id));
        if (title) onTitle?.(title);
      } catch {
        toast.error("The reply is here, but saving this conversation failed.");
      }
    },
    onError: (chatError) => {
      toast.error(chatError.message || "The assistant could not reply. Please try again.");
    },
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, [chatId, status]);

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <div className="py-10 text-center">
              <img src={logo} alt="" width={56} height={56} className="mx-auto size-14" />
              <h2 className="mt-4 font-display text-xl font-semibold">
                What are you working on today?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Ask about lesson ideas, a tricky parent conversation, a child's development, or how to plan
                your week. Please use initials instead of learners' names.
              </p>
              <div className="mx-auto mt-6 grid max-w-xl gap-2 text-left">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => void sendMessage({ text: suggestion })}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <MessageResponse key={index}>{part.text}</MessageResponse>
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer className="px-2 text-sm">Thinking…</Shimmer>}
          {error && (
            <p className="px-2 text-sm text-destructive">
              {error.message || "Something went wrong. Please try again."}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-card p-3 sm:p-4">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput
            onSubmit={(message, event) => {
              event.preventDefault();
              const text = message.text?.trim();
              if (!text || busy) return;
              void sendMessage({ text });
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              placeholder="Ask about lessons, a parent conversation, planning…"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={busy} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI can be wrong. Check curriculum and policy details yourself, and don't share learners' personal
            information.
          </p>
        </div>
      </div>
    </div>
  );
}
