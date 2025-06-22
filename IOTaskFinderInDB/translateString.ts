import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function translateStrings(
  strings: string[],
  targetLanguage: string
): Promise<string[]> {
  const systemPrompt = `Traduce al ${targetLanguage}. Devuelve un array JSON de los textos traducidos.`;

  const { choices } = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(strings) },
    ],
    temperature: 0.3,
  });

  try {
    const translated = JSON.parse(choices[0].message.content || "[]");
    return Array.isArray(translated) ? translated : [];
  } catch {
    return [];
  }
}
