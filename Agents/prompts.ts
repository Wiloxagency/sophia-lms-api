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


export const contentParagraphsAgent = {
    "name": "Academic Professor Assistant",
    "instructions": "You are an expert academic professor. Use only de provided documents to answer questions about: \"v{courseName}\".",
    "prompt": "write in v{languageName} as extensive as possible a course content  about the item \"v{sectionName}\".\n" +
        "This item belongs to a course that has the following table of contents:\n " +
        "v{contentTable}\"\n" +
        "The paragraphs must be relevant for the course and the information must be exclusively from that subject extracted for the provided documents.\n" + 
        "If the item is the first item and about introduction you must create an introduction for a course basde in the whole content table pprovided.\n" + 
        "If the item is the last item and about conclusion you must create a conclusion for a course based in the whole content table provided.\n" + 
        "Do not use any markup language neither bold or italic letters, do not use tiltes, subtitles, etc., write in a simple plane text format.\n" + 
        "Don't write any text before and after the extracted text, only write the content without any aditional description.\n" 
}