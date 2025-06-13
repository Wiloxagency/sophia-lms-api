// src/utils/promptUtils.ts
export function preparePrompt(parsedContentTable: string[]) {
  return `
Analyze the following table of contents using the attached course documents.

For each item, determine whether the course materials contain **at least one paragraph** that **specifically discusses the topic**.

Evaluate **all items at once**, not iteratively. Your goal is to produce a comprehensive validation result.

Only if **every item** is adequately supported, return: isValid = true.

If **any items** are not clearly covered by the materials, return: isValid = false, and include **a full list of all such items** in the "reason". Do not withhold any items for future runs.

Also include a field called \`log\` in your response that says how many total items were evaluated, for debugging purposes.

Table of Contents:
${parsedContentTable.join("\n")}
`;
}
