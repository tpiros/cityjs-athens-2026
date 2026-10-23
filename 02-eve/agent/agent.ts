import { google } from "@ai-sdk/google";
import { defineAgent } from "eve";

export default defineAgent({
  model: google("gemini-3.8-flash"),

  // Only the tools in agent/tools/ are on. Every advertised tool costs input tokens on every call.
  defaultTools: false,

  limits: {
    maxInputTokensPerSession: 500_000,
    maxOutputTokensPerSession: 50_000,
  },
});
