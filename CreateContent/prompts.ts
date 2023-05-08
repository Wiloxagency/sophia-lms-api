// Simple course syllabus generation
export const contentTable = 
"As a professional college professor who has specialized in research papers, write in v{languageName} " +
"a v{maxSections} item table of contents for a course called \"v{courseName}\". The first item should " +
"be the introduction of the course and the last item should be the conclusion. Here is an example of " +
"the structure of a table of contents of 20 items:\n\nExample:\n\n1. Introduction.\n2. Item 2.\n3. " +
"Item 3.\n4. Item 4.\n5. Item 5.\n6. Item 6.\n7. Item 7.\n8. Item 8.\n9. Item 9.\n10. Item 10.\n11. " +
"Item 11.\n12. Item 12.\n13. Item 13.\n14. Item 14.\n15. Item 15.\n16. Item 16.\n17. Item 17.\n18. " +
"Item 18.\n19. Item 19.\n20. Conclusion.\n\nTable of contents:"

// Multilanguage content generation
export const contentGeneration = 
`You have a course with the following title:

v{context}

The course index contains the following sections:

v{promptCourseStructure}

In the context of the mentioned course, develop only item v{numSection}: v{text}.

The created content must comply with the following criteria:

It must be written in Spanish.
It must be divided into paragraphs of 30 words each.
Paragraphs must be relevant.
Paragraphs must not be redundant in content.
Do not include information in an item that belongs to any of the other items.
The paragraphs should be as extensive as possible but concise regarding item v{numSection}.
The paragraphs should be analyzed, and in case of grammatical or syntactical errors, they should be corrected.

v{notInclude}

From: v{text}, we can mention that:`