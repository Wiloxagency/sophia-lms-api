export const contentTableAgent = {
    "name": "Academic Professor Assistant",
    "instructions": "You are an expert academic professor. Use only de provided documents to answer questions about \"v{courseName}\".",
    "prompt": "write in v{languageName} a sequence of v{maxSections} items belonging to a table of contents of a course " +
        "called: \"v{courseName}\". Consider the course description:\n" +
        "\"v{courseDescription}\".\n" +
        "The first item should be the introduction of the course and the last item should be the conclusion.\n" +
        "write that table of contents in the following format: \n\n" +
        "1. Introduction.\n" +
        "2. Item 2.\n" +
        "3. Item 3.\n" +
        "...\n" +
        "v{maxSections}. Conclusion.\n\n" +
        "Don't write any text before the introduction (item 1) and after the Conclusion (item v{maxSections}) only write the content table without any aditional description.\n" 
}