import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TranslationResponse {
  language: string;
  translations: string[];
}

export async function translateStrings(
  strings: string[],
  userTypedJobTitle: string
): Promise<string[]> {
  const systemPrompt = `Identifica el idioma de esta palabra "${userTypedJobTitle}", y devuelve un objeto JSON con las propiedades "language" y "translations" (un array de textos traducidos a ese idioma).`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(strings) },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }, // ✅ this works with the SDK
  });

  const content = completion.choices[0].message.content;

  try {
    const parsed: TranslationResponse = JSON.parse(content || "{}");
    return Array.isArray(parsed.translations) ? parsed.translations : [];
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err);
    return [];
  }
}
