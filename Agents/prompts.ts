// Create a summary for a course based in document
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

// Extract paragraphs for a course based in document
export const contentParagraphsAgentOld = {
    "name": "Academic Professor Assistant",
    "instructions": "You are an expert academic professor. Use only the provided document to extract the requested content.",
    "prompt":
        "Extract from the provided document all information found about the item \"v{sectionName}\".\n If the extracted content is in a language other than v{languageName}, then translate it into v{languageName}.\n" +
        "This item belongs to a course that has the following table of contents:\n " +
        "v{contentTable}\"\n" +
        "The extracted content must be relevant for the course and the information must be exclusively from the provided documents.\n" +
        "If the item is the first item and about introduction you must create an introduction for a course based in the whole content table pprovided.\n" +
        "If the item is the last item and about conclusion you must create a conclusion for a course based in the whole content table provided.\n" +
        "Do not use any markup language neither bold or italic letters, do not use titles, subtitles, etc., write in a simple plane text format.\n" +
        "If the extracted content is very brief, do not complete it with any external sources. Stick exclusively to the information contained in the provided document." +
        "If the requested information is not found in the provided document, do not use any external sources to create it, and do not make anything up. In that case, simply ignore the item and write nothing." +
        "Don't write any text before and after the extracted text, only write the content without any aditional description.\n"
}

export const chatWithDocsAgent = {
    "name": "Professional Assistant",
    "instructions": "You are an expert academic. Use only de provided documents to answer questions.",
    "prompt": "Write in v{languageName} a relevant answer for this question: \"v{question}\".\n" +
        "The answer must be based from that subject extracted for the provided documents.\n" +
        "If the answer is not in the provided documents, translate if necessary to v{languageName} this answer: \"The answer is not in the selected document(s).\" \n" +
        "Do not use any markup language neither bold or italic letters, do not use titles, subtitles, etc., write in a simple plane text format.\n"
}