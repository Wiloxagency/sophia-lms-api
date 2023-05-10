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
"Considering the context of the course \"v{courseName}\" and as an expert in the area of content " +
"development, create an extensive content in v{languageName} explaining the subject \"v{text}\", "+ 
"the paragraphs must be relevant and the information must be exclusively from that subject. The table of " + 
"content contains the following items:\n\nv{courseStructure}"