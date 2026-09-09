import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TOOL_BY_ID, buildPrompt, type ToolId } from "./tool-specs";

const InputSchema = z.object({
  toolId: z.enum(["lesson-plan", "parent-message", "summarizer", "task-planner", "research"]),
  values: z.record(z.string(), z.string()),
});

export const generateToolOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const spec = TOOL_BY_ID[data.toolId as ToolId];
    const { system, user } = buildPrompt(spec, data.values);

    const { createResponsesGateway, describeGatewayError, CHAT_MODEL } = await import(
      "./ai-gateway.server"
    );

    try {
      const { provider } = createResponsesGateway();
      const result = streamText({
        model: provider.responses(CHAT_MODEL),
        system,
        prompt: user,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
          },
        },
      });
      const output = await result.text;
      return { ok: true as const, output, prompt: { system, user } };
    } catch (error) {
      console.error("[tool-generation]", error);
      return { ok: false as const, error: describeGatewayError(error), prompt: { system, user } };
    }
  });
