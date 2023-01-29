// Simple content generation foar AI paragraph generation
export const contentGeneration = {
    es: {
        matches: [], 
        age: "\nEl lenguaje utilizado debe ser v{courseLevel} y apropiado para alumnos de edades comprendidas entre los v{fromAge} hasta los v{toAge} años.",
        notInclude: "NO INCLUIR",
        prompt: "Tienes un curso con el siguiente título:\n\nv{context}\n\nEl índice del curso contiene las siguientes secciones:\n\nv{courseStructure}\n\nEn el contexto del curso mencionado, desarrollar sólo el ítem v{numSection}: v{text}.\n\nEl contenido creado deberá cumplir con lo siguientes criterios:\n\nDebe estar dividido en  párrafos de 30 palabras cada uno.\nLos párrafos deben ser relevantes.\nLos párrafos no deben ser redundantes en el contenido.\nNo incluir en un ítem información que perteneazca a cualquiera de los otros ítems  del curso.\nLos párrafos deberán ser los mas extensos posibles pero concisos respecto al ítem v{numSection}.v{age}\nLos párrafos deben analizarse y en caso de existir errores gramaticales o sintácticos se deberan corregir.\nv{notInclude}\n\nDe v{text}, podemos mencionar que"
    }, 
    en: {
        matches: [],
        notInclude: "DO NOT INCLUDE",
        prompt: "There is a course with the following title:\n\nv{context}\n\nThe syllabus of the course is:\n\nv{courseStructure}\n\nIn the context of this course, generate content only for item v{numSection}: v{text}.\n\nThe content created must meet the following criteria:\n\nIt must be divided into paragraphs of 30 words each.\nParagraphs must be relevant.\nParagraphs should not be redundant in content.\nDo not generate information that pertains to any of the other course items.\nThe paragraphs should be as long as possible but concise regarding item {numSection}.\nThe paragraphs must be analyzed and if there are grammatical or syntactic errors, they must be corrected.\nv{notInclude}\n\nOf v{text}, can mention that"
    },
    pt: {
        matches: [], 
        notInclude: "NÃO INCLUIR",
        prompt: "Tem um curso com o seguinte título:\n\nv{context}\n\nO índice do curso contém as seguintes seções:\n\nv{courseStructure}\n\nNo contexto do curso mencionado, desenvolver apenas o item v{numSection}: v{text}.\n\nO conteúdo criado deve atender aos seguintes critérios:\n\nDeve ser dividido em parágrafos de 30 palavras cada.\nOs parágrafos devem ser relevantes.\nOs parágrafos não devem ser redundantes em conteúdo.\nNão incluir em um item informações que pertençam a qualquer um dos outros itens do curso.\nOs parágrafos devem ser tão longos quanto possível, mas concisos em relação ao item v{numSection}.\nOs parágrafos devem ser analisados e se houver erros gramaticais ou sintáticos, devem ser corrigidos.\nv{notInclude}\n\nDo v{text}, podemos dizer que"
    }, 
}

// Advance content generation foar AI paragraph generation with Instructional Design
// export const contentGenerationInstructionalDesign = {
//     es: {
//         matches: [], 
//         notInclude: "NO INCLUIR",
//         prompt: "Tienes un curso con el siguiente título:\n\nv{context}\n\nEl índice del curso contiene las siguientes secciones:\n\nv{courseStructure}\n\nEn el contexto del curso mencionado, desarrollar sólo el ítem v{numSection}: v{text}.\n\nEl contenido creado deberá cumplir con lo siguientes criterios:\n\nDebe estar dividido en  párrafos de 30 palabras cada uno.\nLos párrafos deben ser relevantes.\nLos párrafos no deben ser redundantes en el contenido.\nNo incluir en un ítem información que perteneazca a cualquiera de los otros ítems  del curso.\nLos párrafos deberán ser los mas extensos posibles pero concisos respecto al ítem v{numSection}.\nLos párrafos deben analizarse y en caso de existir errores gramaticales o sintácticos se deberan corregir.\nv{notInclude}\n\nDe v{text}, podemos mencionar que"
//     }, 
//     en: {
//         matches: [],
//         notInclude: "DO NOT INCLUDE",
//         prompt: "There is a course with the following title:\n\nv{context}\n\nThe syllabus of the course is:\n\nv{courseStructure}\n\nIn the context of this course, generate content only for item v{numSection}: v{text}.\n\nThe content created must meet the following criteria:\n\nIt must be divided into paragraphs of 30 words each.\nParagraphs must be relevant.\nParagraphs should not be redundant in content.\nDo not generate information that pertains to any of the other course items.\nThe paragraphs should be as long as possible but concise regarding item {numSection}.\nThe paragraphs must be analyzed and if there are grammatical or syntactic errors, they must be corrected.\nv{notInclude}\n\nOf v{text}, can mention that"
//     },
//     pt: {
//         matches: [], 
//         notInclude: "NÃO INCLUIR",
//         prompt: "Tem um curso com o seguinte título:\n\nv{context}\n\nO índice do curso contém as seguintes seções:\n\nv{courseStructure}\n\nNo contexto do curso mencionado, desenvolver apenas o item v{numSection}: v{text}.\n\nO conteúdo criado deve atender aos seguintes critérios:\n\nDeve ser dividido em parágrafos de 30 palavras cada.\nOs parágrafos devem ser relevantes.\nOs parágrafos não devem ser redundantes em conteúdo.\nNão incluir em um item informações que pertençam a qualquer um dos outros itens do curso.\nOs parágrafos devem ser tão longos quanto possível, mas concisos em relação ao item v{numSection}.\nOs parágrafos devem ser analisados e se houver erros gramaticais ou sintáticos, devem ser corrigidos.\nv{notInclude}\n\nDo v{text}, podemos dizer que"
//     }, 
// }

// Course Introducion generation
export const introductionGeneration = {
    es: {
        matches: ["introducción", "introduccion"], 
        prompt: "Crea un amplio contenido de varios párrafos en español, cada párrafo dividido en 30 palabras. El contenido corresponde a la Introducción de un curso llamado: v{context}. Analizar el contenido y en caso de que existan erorres gramaticales o sintácticos, corregirlos.\nIntroducción al curso de v{context}:"
    },
    en: {
        matches: ["introduction"], 
        prompt: "Create a wide content of several paragraphs in English, each paragraph divided into 30 words. The content corresponds to the Introduction of a course called: v{context}. The paragraphs must be analyzed and if there are grammatical or syntactic errors, they must be corrected.\nIntroduction to the course of v{context}:"
    },
    pt: {
        matches: ["introdução"], 
        prompt: "Criar um conteúdo extenso de muitos parágrafos em português, cada parágrafo dividido em 30 palavras. O conteúdo corresponde à Introdução de um curso nomeado: v{context}. Os parágrafos devem ser analisados e se houver erros gramaticais ou sintáticos, devem ser corrigidos\nIntrodução ao curso de v{context}:"
    }
}
 // Course Conclusions generation
export const conclusionsGeneration = {
    es: {
        matches: ["conclusión", "conclusion", "conclusiones"], 
        prompt: "Crea un amplio contenido de varios párrafos en español, cada párrafo dividido en 30 palabras. El contenido corresponde a las Conclusiones de un curso llamado: v{context}. Analizar el contenido y en caso de que existan erorres gramaticales o sintácticos, corregirlos.\nConclusiones del curso de v{context}:"
    },
    en: {
        matches: ["conclusion", "conclusions"], 
        prompt: "Create a wide content of several paragraphs in English, each paragraph divided into 30 words. The content corresponds to the Conclusions of a course called: v{context}. The paragraphs must be analyzed and if there are grammatical or syntactic errors, they must be corrected.\nConclusions of the course of v{context}:"
    },
    pt: {
        matches: ["conclusão", "conclusões"], 
        prompt: "Criar um extenso conteúdo de muitos parágrafos em português, cada parágrafo dividido em 30 palavras. O conteúdo corresponde às Conclusões de um curso nomeado: v{context}. Os parágrafos devem ser analisads e se houver erros gramaticais ou sintáticos, devem ser corrigidos.\nConclusiones del curso de v{context}:"
    }
}

// Content table (Syllabus) generation
export const contentTable = { 
    es: {
        introduction: "Introducción",
        prompt: "Sophie es una profesora universitaria especializada en tesis de v{text}, ha escrito varios libros, tesis, monografías y cursos relacionados con v{text}.\nLeo: Muéstrame un programa de estudios de unos v{maxSections} items para un curso de: v{text}, el programa de estudios debe incluir un item llamado conclusiones al final. Te doy a continuación un ejemplo de de la estructura de un programa de estudios de 20 items:\n\nEjemplo:\n1. Introducción.\n2. Item 2.\n3. Item 3.\n4. Item 4.\n5. Item 5.\n6. Item 6.\n7. Item 7.\n8. Item 8.\n9. Item 9.\n10. Item 10.\n11.  Item 11.\n12. Item 12.\n13. Item 13.\n14. Item 14.\n15. Item 15.\n16. Item 16.\n17. Item 17.\n18. Item 18.\n19. Item 19.\n20. Conclusiones.\n\nSophie: Una tabla de contenidos como la solicitada, de unos v{maxSections} items para un curso de: v{text} sería:\n1. Introducción.\n2."
    },
    en: {
        introduction: "Introduction",
        prompt: "Sophie is a university professor who specializes in theses about v{text}. She has written several books, theses, monographs and courses related to v{text}.\nLeo: Show me a syllabus of around v{maxSections} items of a course about v{text}. The syllabus must include an item called conclusions at the end. Here is an example of the structure of a 20-item syllabus:\n\nExample:\n1. Introduction.\n2. Item 2.\n3. Item 3.\n4. Item 4.\n5. Item 5.\n6. Item 6.\n7. Item 7.\n8. Item 8.\n9. Item 9.\n10. Item 10.\n11. Item 11.\n12. Item 12.\n13. Item 13.\n14. Item 14.\n15. Item 15.\n16. Item 16.\n17. Item 17.\n18. Item 18.\n19. Item 19.\n20. Conclusions.\n\nSophie: A table of contents like the one requested, of around v{maxSections} items, of a course about v{text} would be:\n1. Introduction.\n2."
    },
    pt: {
        introduction: "Introdução",
        prompt: "Sophie é uma professora universitária especializada em teses sobre v{text}. Ela escreveu vários livros, teses, monografias e cursos relacionados a v{text}.\nLeo: Mostre-me um programa de estudos de aproximadamente v{maxSections} itens de um curso sobre v{text}. O programa de estudos deve incluir um item chamado conclusões no final. Aqui está um exemplo da estrutura de um programa de 20 itens:\n\nExemplo:\n1. Introdução.\n2. Item 2.\n3. Item 3.\n4. Item 4.\n5. Item 5.\n6. Item 6.\n7. Item 7.\n8. Item 8.\n9. Item 9.\n10. Item 10.\n11. Item 11.\n12. Item 12.\n13. Item 13.\n14. Item 14.\n15. Item 15.\n16. Item 16.\n17. Item 17.\n18. Item 18.\n19. Item 19.\n20. Conclusões.\n\nSophie: Um índice como o solicitado, de aproximadamente v{maxSections} itens, de um curso sobre v{text} seria:\n1. Introdução.\n2."
    }
}

// Content table (Syllabus) generation with Instructional Design
export const contentTableInstructionalDesign = { 
    es: {
        introduction: "Introducción",
        conclusion: "\n- El último item de la tabla de contenidos deberá ser las Conclusiones.", 
        prompt1Obj: "Crear una TABLA DE CONTENIDOS  de v{numberOfItems} items para un curso de: v{text}, el curso tiene las siguientes características:\n\nCARACTERÍSTICAS DEL CURSO:\n- Será diseñado para alumnos entre v{fromAge} y v{toAge} años de edad.\n- El nivel del curso es: v{courseLevel}.\n- El Objetivo del curso es v{knowledgeLevel1}: v{objective1}\n- El curso deberá incluir temas relacionados con: v{keywords}.v{conclusion}\n\nUna TABLA DE CONTENIDOS para el curso descrito sería:\n1. Introducción \n2.",
        prompt2Obj: "Crear una TABLA DE CONTENIDOS  de v{numberOfItems} items para un curso de: v{text}, el curso tiene las siguientes características:\n\nCARACTERÍSTICAS DEL CURSO:\n- Será diseñado para alumnos entre v{fromAge} y v{toAge} años de edad.\n- El nivel del curso es: v{courseLevel}.\n- El Objetivo 1 del curso es v{knowledgeLevel1}: v{objective1}\n- El Objetivo 2 del curso es  v{knowledgeLevel2}: v{objective2}\n- El curso deberá incluir temas relacionados con: v{keywords}.v{conclusion}\n\nUna TABLA DE CONTENIDOS para el curso descrito sería:\n1. Introducción \n2."
    },
    en: {
        introduction: "Introduction",
        prompt: "Sophie is a university professor who specializes in theses about v{text}. She has written several books, theses, monographs and courses related to v{text}.\nLeo: Show me a syllabus of around v{maxSections} items of a course about v{text}. The syllabus must include an item called conclusions at the end. Here is an example of the structure of a 20-item syllabus:\n\nExample:\n1. Introduction.\n2. Item 2.\n3. Item 3.\n4. Item 4.\n5. Item 5.\n6. Item 6.\n7. Item 7.\n8. Item 8.\n9. Item 9.\n10. Item 10.\n11. Item 11.\n12. Item 12.\n13. Item 13.\n14. Item 14.\n15. Item 15.\n16. Item 16.\n17. Item 17.\n18. Item 18.\n19. Item 19.\n20. Conclusions.\n\nSophie: A table of contents like the one requested, of around v{maxSections} items, of a course about v{text} would be:\n1. Introduction.\n2."
    },
    pt: {
        introduction: "Introdução",
        prompt: "Sophie é uma professora universitária especializada em teses sobre v{text}. Ela escreveu vários livros, teses, monografias e cursos relacionados a v{text}.\nLeo: Mostre-me um programa de estudos de aproximadamente v{maxSections} itens de um curso sobre v{text}. O programa de estudos deve incluir um item chamado conclusões no final. Aqui está um exemplo da estrutura de um programa de 20 itens:\n\nExemplo:\n1. Introdução.\n2. Item 2.\n3. Item 3.\n4. Item 4.\n5. Item 5.\n6. Item 6.\n7. Item 7.\n8. Item 8.\n9. Item 9.\n10. Item 10.\n11. Item 11.\n12. Item 12.\n13. Item 13.\n14. Item 14.\n15. Item 15.\n16. Item 16.\n17. Item 17.\n18. Item 18.\n19. Item 19.\n20. Conclusões.\n\nSophie: Um índice como o solicitado, de aproximadamente v{maxSections} itens, de um curso sobre v{text} seria:\n1. Introdução.\n2."
    }
}

// Phrase key extration
export const phraseKeywords = {
    es : {
        prompt: "Extraer frases claves que representen ideas principales del siguiente texto:\n\n###\n\nv{text}\n\n###\n\n"
    },
    en : {
        prompt: "Extract key phrases that represent main ideas from the following text:\n\n###\n\nv{text}\n\n###\n\n"
    },
    pt : {
        prompt: "Extraer frases-chave que representam ideias principais do texto:\n\n###\n\nv{text}\n\n###\n\n"
    },
}

// Phrase key extration
export const titleExtraction = {
    es : {
        prompt: "Extrae un único título en español con un máximo de 5 palabras basado en la idea principal de un texto.\nTEXTO:\nv{text}\nTÍTULO:"
    },
    en : {
        prompt: "Extract a single title in English with a maximum of 5 words based on the main idea of a text.\nTEXT:\nv{text}\nTITLE:"
    },
    pt : {
        prompt: "Extraer um único título em espanhol com no máximo 5 palavras com base na ideia principal de um texto.\nTEXTO:\nv{text}\nTÍTULO:"
    },
}

// ISO language code
export const isoLanguage = {
    es: "es-MX",
    en: "en-US",
    pt: "pt-BR"
}