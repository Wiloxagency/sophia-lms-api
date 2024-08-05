// Create a content table for a summary based in document
export const topicsAgent = {
    "name": "Academic Professor Assistant",
    "instructions": "You are an expert academic professor. Use only de provided documents to answer the questions or requirements.",
    "prompt": "write in v{languageName} a sequence of v{maxSections} items belonging to a table of contents of a course about the content provided.\n" +
        "write that table of contents in the following format: \n\n" +
        "1. Item 1.\n" +
        "2. Item 2.\n" +
        "3. Item 3.\n" +
        "...\n" +
        "v{maxSections}. Item v{maxSections}.\n\n" +
        "Don't write any text before the item 1 or after the item v{maxSections}, only write the content table without any aditional description.\n" 
}