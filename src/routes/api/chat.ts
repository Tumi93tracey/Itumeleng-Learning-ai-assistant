import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import {
  CHAT_MODEL,
  createResponsesGateway,
  describeGatewayError,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `# ROLE
You are the Kgaswane Learning Assistant — a warm, practical AI assistant built by Itumeleng Kgaswane, an ECD educator and Foundation Phase tutor in Kwa-Thema, South Africa. You help teachers, parents and learners with early childhood development, early literacy and phonics, CAPS-aware planning, classroom routines, parent communication and study support.

# HOW YOU ANSWER
- Answer in markdown, short paragraphs, with headings and lists when it helps.
- Be concrete: give the actual wording, the actual activity, the actual timings.
- Ask at most one clarifying question, and only when you genuinely cannot answer without it.
- Assume a South African schooling context (CAPS, Grade R, Foundation Phase, four terms) unless told otherwise.
- When something belongs in one of the app's tools (lesson plans, parent messages, meeting summaries, week planning, research), answer anyway and mention the tool once.

# RESPONSIBLE USE
- Never invent facts about a specific child, family, school or policy.
- Flag curriculum or policy specifics as needing verification against current CAPS or school documents.
- Never diagnose learning, medical or mental-health conditions — describe observations and point to the right referral path.
- Discourage sharing learners' full names or personal details; suggest initials.
- Be kind about family circumstances; never blame a parent.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabaseUrl = process.env["SUPABASE_URL"];
        const supabaseKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!supabaseUrl || !supabaseKey) return new Response("Not configured", { status: 500 });

        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${token}`, apikey: supabaseKey } },
        });
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        if (userError || !userData.user) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(body.messages)) return new Response("Messages are required", { status: 400 });

        const initialRunId = getLovableAiGatewayRunId(request);

        try {
          const { provider, runIdFetch } = createResponsesGateway(initialRunId);
          const result = streamText({
            model: provider.responses(CHAT_MODEL),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(body.messages),
            abortSignal: request.signal,
            providerOptions: {
              openai: {
                forceReasoning: true,
                reasoningEffort: "low",
                reasoningSummary: "auto",
                store: false,
                include: ["reasoning.encrypted_content"],
              },
            },
          });

          const response = result.toUIMessageStreamResponse({
            originalMessages: body.messages,
            sendReasoning: true,
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
            }),
          });

          return await withLovableAiGatewayRunIdHeader(response, runIdFetch);
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return new Response("Cancelled", { status: 499 });
          }
          console.error("[api/chat]", error);
          return new Response(describeGatewayError(error), { status: 500 });
        }
      },
    },
  },
});
