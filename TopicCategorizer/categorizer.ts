import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const topicCategories = [
  "1. Technology",
  "2. Nature",
  "3. Travel",
  "4. Food",
  "5. Health",
  "6. Education",
  "7. People",
  "8. Lifestyle",
  "9. Architecture",
  "10. Animals",
  "11. Art and Culture",
  "12. Sports and Outdoor Activities",
  "13. Fashion",
  "14. Abstract Concepts",
  "15. Backgrounds/Textures",
];

export async function getTopicCategories(
  topic: string,
  conversationContext: string
) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: `We have the following topic, '${topic},' based in the context of '${conversationContext}'. Classify it within the most suitable categories considering the following options: ${topicCategories}. If it cannot be classified within any specific category, use category number 15.
                      The output format must be JSON with the following structure:
                      {'categories': numbers[]}`,
      },
    ],
  });

  const responseMessage = response.choices?.[0]?.message?.content || "";
  const categoriesRegex = /\d+/g;
  const extractedCategories = responseMessage.match(categoriesRegex);
  const categories =
    extractedCategories?.map((category) => parseInt(category, 10)) || [];

  return { categories: categories, usage: response.usage };
}

export async function getTopicCategoryNamesFromNumbers(
  categoryNumbers: number[]
): Promise<string[]> {
  let categoryNames: string[] = [];
  for (const categoryNumber of categoryNumbers) {
    const isCategoryFound = topicCategories.find((element) =>
      element.includes(categoryNumber + ".")
    );
    if (isCategoryFound) {
      categoryNames.push(isCategoryFound.split(".")[1].trim().toLowerCase());
    }
  }

  let isArtIncluded = categoryNames.indexOf("art and culture");
  let isSportsIncluded = categoryNames.indexOf("sports and outdoor activities");
  let isAbstractIncluded = categoryNames.indexOf("abstract concepts");
  let isBackgroundsIncluded = categoryNames.indexOf("backgrounds/textures");

  if (isArtIncluded != -1) {
    categoryNames[isArtIncluded] = "art";
  }

  if (isSportsIncluded != -1) {
    categoryNames[isSportsIncluded] = "sports";
  }

  if (isAbstractIncluded != -1) {
    categoryNames[isAbstractIncluded] = "abstract";
  }

  if (isBackgroundsIncluded != -1) {
    categoryNames[isBackgroundsIncluded] = "backgrounds";
  }

  return categoryNames;
}
