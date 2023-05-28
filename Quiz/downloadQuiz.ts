import {
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
                            .map((quiz: any) => {
                                const arr: Paragraph[] = []
                                arr.push(
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: quiz.question,

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
                            .map((quiz: any) => {
                                const arr: Paragraph[] = []
                                arr.push(
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