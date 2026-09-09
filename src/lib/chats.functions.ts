import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listChats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chats")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ title: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("chats")
      .insert({ title: data.title, user_id: context.userId })
      .select("id, title, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getChatMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ chatId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: chat, error: chatError } = await context.supabase
      .from("chats")
      .select("id, title")
      .eq("id", data.chatId)
      .maybeSingle();
    if (chatError) throw new Error(chatError.message);
    if (!chat) return null;

    const { data: messages, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("chat_id", data.chatId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { chat, messages: messages ?? [] };
  });

export const appendChatMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        chatId: z.string().uuid(),
        title: z.string().max(120).optional(),
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
          .min(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chat_messages").insert(
      data.messages.map((message) => ({
        chat_id: data.chatId,
        user_id: context.userId,
        role: message.role,
        content: message.content,
      })),
    );
    if (error) throw new Error(error.message);

    const update: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
    if (data.title) update.title = data.title;
    const { error: chatError } = await context.supabase
      .from("chats")
      .update(update)
      .eq("id", data.chatId);
    if (chatError) throw new Error(chatError.message);
    return { ok: true };
  });

export const deleteChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ chatId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chats").delete().eq("id", data.chatId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- saved items --------------------------------- */

export const listSavedItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_items")
      .select("id, tool, title, inputs, prompt, output, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        tool: z.string().min(1),
        title: z.string().min(1).max(160),
        inputs: z.record(z.string(), z.string()),
        prompt: z.string(),
        output: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("saved_items")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteSavedItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
