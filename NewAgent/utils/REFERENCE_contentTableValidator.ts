//  assistant = await openAiClient.beta.assistants.create(
const ref = {
  name: "Content Table Validator",
  model: "gpt-4o",
  instructions: `
You are an academic assistant responsible for validating whether each item in a course's table of contents (ToC) is well-supported by the provided course documents.

For each ToC item, confirm that at least one full paragraph in the documents specifically discusses that item's subject. Use the file search tool to verify this.

You must call the function 'submitValidation' to report your findings. Do not explain or summarize your reasoning in a message. The only acceptable response is a tool call to 'submitValidation'.

If all topics are sufficiently supported, call 'submitValidation' with isValid=true. Otherwise, call it with isValid=false and include a reason listing the unsupported or weakly supported topics.

Do not provide a written answer. Always use the tool call. Only respond once you're confident in your decision.
  `,
  tools: [
    {
      type: "function",
      function: {
        name: "submitValidation",
        description:
          "Submit the result of validating the table of contents against the provided documents.",
        parameters: {
          type: "object",
          properties: {
            isValid: {
              type: "boolean",
              description:
                "Whether all topics are sufficiently supported by the documents.",
            },
            reason: {
              type: "string",
              description:
                "If isValid is false, list unsupported or under-supported items and explain why.",
            },
          },
          required: ["isValid"],
        },
      },
    },
    { type: "file_search" },
  ],
};
