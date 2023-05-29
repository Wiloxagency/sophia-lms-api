import {
    BorderStyle,
    Document, HeadingLevel, Paragraph, TextRun
} from "docx";

export class DocumentCreator {
    createShortAnswerDoc([quizList]: any): Document {
        const document = new Document({
            sections: [
                {
                    children: [
                        this.createHeading("Preguntas"),
                        ...quizList
                            .map((quiz: any, indexQuiz: number) => {
                                const arr: Paragraph[] = []
                                arr.push(
                                    this.createHeading(((indexQuiz + 1).toString() + ')')),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Pregunta: ",
                                                bold: true
                                            }),
                                            new TextRun({
                                                text: quiz.question,
                                            })
                                        ],
                                        spacing: {
                                            before: 200,
                                        }
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Fuente: ",
                                                bold: true
                                            }),
                                            new TextRun({
                                                text: quiz.source,
                                            })
                                        ],
                                        spacing: {
                                            before: 200,
                                        }
                                    })
                                )
                                return arr
                            })
                            .reduce((prev: any, curr: any) => prev.concat(curr), []),
                    ]
                }
            ]
        })
        return document
    }

    createMultipleChoiceDoc([quizList]: any): Document {
        const document = new Document({
            sections: [
                {
                    children: [
                        this.createHeading("Preguntas"),
                        ...quizList
                            .map((quiz: any, indexQuiz: number) => {
                                const arr: Paragraph[] = []
                                arr.push(
                                    this.createHeading(((indexQuiz + 1).toString() + ')')),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: quiz[0],
                                                bold: true
                                            })
                                        ],
                                        spacing: {
                                            before: 200,
                                        }
                                    })
                                )
                                quiz.forEach((quizPart: any, indexQuizPart: number) => {
                                    if (indexQuizPart > 0) {
                                        arr.push(
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: quizPart
                                                    })
                                                ],
                                                spacing: {
                                                    before: 100,
                                                }
                                            })
                                        )
                                    }
                                })
                                return arr
                            })
                            .reduce((prev: any, curr: any) => prev.concat(curr), []),
                    ]
                }
            ]
        })
        return document
    }

    createTrueOrFalseDoc([quizList]: any): Document {
        const document = new Document({
            sections: [
                {
                    children: [
                        this.createHeading("Preguntas"),
                        ...quizList
                            .map((quiz: any, indexQuiz: number) => {
                                const arr: Paragraph[] = []
                                arr.push(
                                    this.createHeading(((indexQuiz + 1).toString() + ')')),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Frase verdadera: ",
                                                bold: true
                                            }),
                                            new TextRun({
                                                text: quiz.true.trim()
                                            })
                                        ],
                                        spacing: {
                                            before: 200,
                                        }
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Frase falsa: ",
                                                bold: true
                                            }),
                                            new TextRun({
                                                text: quiz.false.trim()
                                            })
                                        ],
                                        spacing: {
                                            before: 200,
                                        }
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Fuente: ",
                                                bold: true
                                            }),
                                            new TextRun({
                                                text: quiz.source ? quiz.source.trim() : ''
                                            })
                                        ],
                                        spacing: {
                                            before: 200,
                                            after: 200
                                        }
                                    })
                                )
                                return arr
                            })
                            .reduce((prev: any, curr: any) => prev.concat(curr), []),
                    ]
                }]
        })
        return document
    }

    createCompletionDoc([quizList]: any): Document {
        const document = new Document({
            sections: [
                {
                    children: [
                        this.createHeading("Preguntas"),
                        ...quizList
                            .map((quiz: any, indexQuiz: number) => {
                                const arr: Paragraph[] = []
                                arr.push(
                                    this.createHeading(((indexQuiz + 1).toString() + ')')),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: quiz.question
                                            })
                                        ],
                                        spacing: {
                                            before: 200,
                                        }
                                    })
                                )
                                return arr
                            })
                            .reduce((prev: any, curr: any) => prev.concat(curr), []),
                    ]
                }]
        })
        return document
    }

    public createHeading(text: string): Paragraph {
        return new Paragraph({
            text: text,
            heading: HeadingLevel.HEADING_1,
            thematicBreak: true,
            spacing: {
                before: 200,
            }
        })
    }

}