let sampleQuizList = [
    {
        "question": "¿Cuánto cuesta 1 kilo de queso guayanés?"
    },
    {
        "question": "¿Cuánto pesa 1 kilo de queso crineja?"
    }
]

const generateDoc = () => {
    const doc = new docx.Document({
        sections: [
            {
                properties: {},
                children: [
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun("Hello World"),
                            new docx.TextRun({
                                text: "Foo Bar",
                                bold: true
                            }),
                            new docx.TextRun({
                                text: "\tGithub is the best",
                                bold: true
                            })
                        ]
                    })
                ]
            }
        ]
    });

    sampleQuizList.forEach(quiz => {
        doc.addSection({
            children: [
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: `Pregunta`
                        })
                    ]
                }),
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: quiz.question
                        })
                    ]
                })
            ]
        })
    })
    createDocument(doc, docx, `test`);
}

const createDocument = (doc, docx, nameOfdoc) => {

    // docx.Packer.toBlob(doc).then(blob => {
    //     saveAs(blob, `${nameOfdoc}.docx`)
    // })

    docx.Packer.toBlob(doc).then((blob) => {
        console.log(blob);
        saveAs(blob, nameOfdoc + ".docx");
        console.log("Document created successfully");
    });
}