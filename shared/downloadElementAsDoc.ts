import {
    BorderStyle,
    Document, HeadingLevel, ImageRun, Paragraph, TextRun
} from "docx";
import * as fs from "fs";

export class DocumentCreator {

    createHeading(text: string): Paragraph {
        return new Paragraph({
            text: text,
            heading: HeadingLevel.HEADING_1,
            thematicBreak: true,
            spacing: {
                before: 200,
            }
        })
    }

    createShortAnswerQuizDoc([quizList]: any): Document {
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

    createMultipleChoiceQuizDoc([quizList]: any): Document {
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

    createTrueOrFalseQuizDoc([quizList]: any): Document {
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

    createCompletionQuizDoc([quizList]: any): Document {
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

    createTextDocument(receivedTextElement: any, imageBuffer: Buffer): Document {
        const document = new Document({
            sections: [
                {
                    children: [
                        this.createHeading(receivedTextElement.title),
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: Buffer.from(imageBuffer),
                                    transformation: {
                                        width: 720,
                                        height: 405,
                                    },
                                })
                            ],
                            spacing: {
                                before: 200,
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: receivedTextElement.content
                                })
                            ],
                            spacing: {
                                before: 200,
                            }
                        })
                    ]
                }]
        })
        return document
    }

}