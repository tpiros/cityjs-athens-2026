import { google } from "@ai-sdk/google";

// The only file that knows which provider we use. Swap it here and nothing else changes.
// export const model = google(process.env.MODEL ?? "gemini-3.8-flash");
export const model = google(process.env.MODEL ?? "gemini-2.5-flash");
