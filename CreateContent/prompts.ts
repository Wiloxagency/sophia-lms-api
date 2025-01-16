// Simple course syllabus generation - GPT-3
export const contentTable_dropme =
    "As a professional college professor who has specialized in research papers, write in v{languageName} " +
    "a v{maxSections} item table of contents for a course called \"v{courseName}\". The first item should " +
    "be the introduction of the course and the last item should be the conclusion. Here is an example of " +
    "the structure of a table of contents of 20 items:\n\nExample:\n\n1. Introduction.\n2. Item 2.\n3. " +
    "Item 3.\n4. Item 4.\n5. Item 5.\n6. Item 6.\n7. Item 7.\n8. Item 8.\n9. Item 9.\n10. Item 10.\n11. " +
    "Item 11.\n12. Item 12.\n13. Item 13.\n14. Item 14.\n15. Item 15.\n16. Item 16.\n17. Item 17.\n18. " +
    "Item 18.\n19. Item 19.\n20. Conclusion.\n\nTable of contents:"

export const contentTable = {
    "role": "You are an expert in the area of content development",
    "prompt": "As a professional college professor who has specialized in research papers, " +
        "write in v{languageName} a sequence of v{maxSections} items belonging to a table of contents of a course " +
        "called: \"v{courseName}\". Consider the course description:\n" +
        "\"v{courseDescription}\".\n" +
        "The first item should be the introduction of the course and the last item should be the conclusion.\n" +
        "write that table of contents in the following format: \n\n" +
        "1. Introduction.\n" +
        "2. Item 2.\n" +
        "3. Item 3.\n" +
        "...\n" +
        "v{maxSections}. Conclusion.\n",
    "resp": "The table of contents is:"
}

// Content generation - ChatGPT-3.5-turbo
export const contentGeneration = {
    "role": "You are an expert in the area of content development",
    // "prompt": "Considering the context of the course \"v{courseName}\", create an extensive content in v{languageName} explaining the subject \"v{text}\", the paragraphs must be relevant and the information must be exclusively from that subject."
    "prompt": "Considering the context of the course \"v{courseName}\", create an extensive content in v{languageName} explaining the subject \"v{text}\", the paragraphs must be relevant and the information must be exclusively from that subject. Don't use any symbols or markup in your response. Don't use asterisks, quotes or hashtags."
}

// Introduction generation - ChatGPT-3.5-turbo
export const introductionGeneration = {
    "role": "You are an expert in the area of content development",
    // "prompt": "Create a general introduction in v{languageName} for a course called \"v{courseName}\".The introduction should be structured into several paragraphs. The course contains the following topics: v{promptCourseStructure}"
    "prompt": "Create a general introduction in v{languageName} for a course called \"v{courseName}\".The introduction should be structured into several paragraphs. The course contains the following topics: v{promptCourseStructure}. Don't use any symbols or markup in your response. Don't use asterisks, quotes or hashtags."
}

// Conclusion generation - ChatGPT-3.5-turbo
export const conclusionGeneration = {
    "role": "You are an expert in the area of content development",
    // "prompt": "Create a general conclusion in v{languageName} for a course called \"v{courseName}\".The conclusion should be structured into several paragraphs. The course contains the following topics: v{promptCourseStructure}"
    "prompt": "Create a general conclusion in v{languageName} for a course called \"v{courseName}\".The conclusion should be structured into several paragraphs. The course contains the following topics: v{promptCourseStructure}. Remove any symbols or markup in your response. Don't use asterisks, quotes or hashtags."
}

// Keyphrases extractor - GPT-3
export const keyphrases = "From the following text, extract key phrases in v{languageName} that represent the main ideas of the paragraph, they must be literal phrases found in the text.\n\nExample:\n\nBrain disorders are conditions that affect the structure or function of the brain. These include Alzheimer's disease, stroke, autism, epilepsy and Parkinson's disease. Brain diseases can be caused by genetic factors, infections, trauma or lifestyle factors such as drug abuse. Treatment for brain disorders depends on the type and severity of the condition but may include medications, therapy and surgery.\n\nKey phrases: Brain disorders are conditions, these include Alzheimer's disease, brain diseases, treatment for brain disorders, therapy and surgery\n\nTEXT: v{text}\n\nKEY PHRASES:"

// Images finder - ChatGPT-3.5-turbo
export const searchImages = "We have a course in v{languageName} called: \"v{courseName}\", the first module of the course is: \"v{sectionTitle}\" and the first paragraph of the module contains the following information: \"v{paragraphContent}\".\n\nConsidering the previous information, write in English a short and accurate title related to that paragraph in the context of the course and module.\n\nThe answer must not exceed 5 words and must be in Json format, following the next structure: {resp: phrase}"

// Images finder - GPT-3
export const searchImagesGpt3 = "We have a course in spanish called: \"v{courseName}\", the first module of the course is: \"v{sectionTitle}\" and the first paragraph of the module contains the following information:\n###\n\"v{paragraphContent}\"\n###\nConsidering the previous information, write in English a short and accurate title related to that paragraph in the context of the course and module.\nThe phrase must not exceed 5 words.\n###\nThe phrase is:"

// Prompt - gpt-4o
// Create a content slide based in sections
export const slideGeneration = {
"role": "You are an expert in the area of content development",
"prompt": `Considering the context of the course \"v{courseName}\", 
create an extensive content in v{languageName} explaining the subject \"v{text}\", 
the paragraphs must be relevant and the information must be exclusively from that subject. 
The generated content will be use in 10 slides of a lesson like a presentation.
Each slide must have a title and a text. Some slides may contain between 0 and 4 sections; 
It is very important that the number of sections varies across the slides. 
Some slides with a large title and a lot of text should not have any sections, 
while others should have only one section, and some should have 2, 3, or 4 sections. 
The distribution should ensure that no specific number of sections predominates. 
The more extensive the subtitles and texts are, the more sections that slide should have.
At least two slides must have no sections, at least two slides must have 1 section, 
at least two must have 2 sections, at least one must have 3 sections, 
and at least one must have 4 sections. All slides must have a title and text.
No slide should have more than 4 sections.
`}

// Agentic} prompt - gpt-4o
// Extract paragraphs for a course based in document
export const contentParagraphsAgent = {
    "name": "Professional Assistant",
    "instructions": "You are an expert academic. Use only de provided documents to answer questions.",
    "prompt": "Write in v{languageName} a relevant answer for this question:\n" +
    "\"v{sectionName}\".\n" +
        "The answer must be based from that subject extracted for the provided documents.\n" +
        "If the answer is not in the provided documents, translate if necessary to v{languageName} this answer: \"The answer is not in the selected document(s).\" \n" +
        "Do not use any markup language neither bold or italic letters, do not use titles, subtitles, etc., write in a simple plane text format.\n"
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
        "If the requested information is not found in the provided document, do not use any external sources to create it, and do not make anything up. In that case, just respond with an exclamation mark, nothing more: ?." +
        "Don't write any text before and after the extracted text, only write the content without any aditional description.\n"
}