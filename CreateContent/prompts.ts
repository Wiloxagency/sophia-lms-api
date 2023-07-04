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
    "prompt": "Considering the context of the course \"v{courseName}\", create an extensive content in v{languageName} explaining the subject \"v{text}\", the paragraphs must be relevant and the information must be exclusively from that subject."
}

// Introduction generation - ChatGPT-3.5-turbo
export const introductionGeneration = {
    "role": "You are an expert in the area of content development",
    "prompt": "Create a general introduction in v{languageName} for a course called \"v{courseName}\".The introduction should be structured into several paragraphs. The course contains the following topics: v{promptCourseStructure}"
}

// Conclusion generation - ChatGPT-3.5-turbo
export const conclusionGeneration = {
    "role": "You are an expert in the area of content development",
    "prompt": "Create a general conclusion in v{languageName} for a course called \"v{courseName}\".The conclusion should be structured into several paragraphs. The course contains the following topics: v{promptCourseStructure}"
}

// Keyphrases extractor - GPT-3
export const keyphrases = "From the following text, extract key phrases in v{languageName} that represent the main ideas of the paragraph, they must be literal phrases found in the text.\n\nExample:\n\nBrain disorders are conditions that affect the structure or function of the brain. These include Alzheimer's disease, stroke, autism, epilepsy and Parkinson's disease. Brain diseases can be caused by genetic factors, infections, trauma or lifestyle factors such as drug abuse. Treatment for brain disorders depends on the type and severity of the condition but may include medications, therapy and surgery.\n\nKey phrases: Brain disorders are conditions, these include Alzheimer's disease, brain diseases, treatment for brain disorders, therapy and surgery\n\nTEXT: v{text}\n\nKEY PHRASES:"

// Images finder - ChatGPT-3.5-turbo
export const searchImages = "We have a course in v{languageName} called: \"v{courseName}\", the first module of the course is: \"v{sectionTitle}\" and the first paragraph of the module contains the following information: \"v{paragraphContent}\".\n\nConsidering the previous information, write in English a short and accurate title related to that paragraph in the context of the course and module.\n\nThe answer must not exceed 5 words and must be in Json format, following the next structure: {resp: phrase}"

// Images finder - GPT-3
export const searchImagesGpt3 = "We have a course in spanish called: \"v{courseName}\", the first module of the course is: \"v{sectionTitle}\" and the first paragraph of the module contains the following information:\n###\n\"v{paragraphContent}\"\n###\nConsidering the previous information, write in English a short and accurate title related to that paragraph in the context of the course and module.\nThe phrase must not exceed 5 words.\n###\nThe phrase is:"