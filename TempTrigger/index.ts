import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTranscriptionJob } from "../shared/azureSpeechToText";

export interface transcriptionInterface {
    display: string
    displayWords: {
        displayText: string
        offsetInTicks: number
        durationInTicks: number
    }[]
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    createTranscriptionJob(
        '65962c5b-58b1-4fee-a3d2-e0f1eecd8c92',
        0,
        0,
        0,
        'https://audio-lingua.ac-versailles.fr/IMG/mp3/frixuelos.mp3',
        'es-ES'
    )

    return

    const transcriptionResult = {
        "source": "https://audio-lingua.ac-versailles.fr/IMG/mp3/frixuelos.mp3",
        "timestamp": "2024-01-25T00:33:32Z",
        "durationInTicks": 291400000,
        "duration": "PT29.14S",
        "combinedRecognizedPhrases": [
            {
                "channel": 0,
                "lexical": "ingredientes para hacer frisuelos receta típica de carnaval cuatro huevos dos cucharadas de azúcar doscientos gramos de harina medio litro de leche la ralladura de la cáscara de medio limón una cucharada pequeña de levadura una pizca de sal",
                "itn": "ingredientes para hacer frisuelos receta típica de carnaval cuatro huevos dos cucharadas de azúcar 200 g de harina medio litro de leche la ralladura de la cáscara de medio limón una cucharada pequeña de levadura una pizca de sal",
                "maskedITN": "ingredientes para hacer frisuelos receta típica de carnaval cuatro huevos dos cucharadas de azúcar 200 g de harina medio litro de leche la ralladura de la cáscara de medio limón una cucharada pequeña de levadura una pizca de sal",
                "display": "Ingredientes para hacer frisuelos receta típica de carnaval. Cuatro huevos, dos cucharadas de azúcar 200 g de harina. Medio litro de leche. La ralladura de la cáscara de medio limón. Una cucharada pequeña de levadura, una pizca de sal."
            }
        ],
        "recognizedPhrases": [
            {
                "recognitionStatus": "Success",
                "channel": 0,
                "offset": "PT0.55S",
                "duration": "PT6.52S",
                "offsetInTicks": 5500000.0,
                "durationInTicks": 65200000.0,
                "nBest": [
                    {
                        "confidence": 0.9029247,
                        "lexical": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "itn": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "maskedITN": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "display": "Ingredientes para hacer frisuelos receta típica de carnaval.",
                        "words": [
                            {
                                "word": "ingredientes",
                                "offset": "PT0.55S",
                                "duration": "PT1.16S",
                                "offsetInTicks": 5500000.0,
                                "durationInTicks": 11600000.0,
                                "confidence": 0.9474241
                            },
                            {
                                "word": "para",
                                "offset": "PT1.71S",
                                "duration": "PT0.28S",
                                "offsetInTicks": 17100000.0,
                                "durationInTicks": 2800000.0,
                                "confidence": 0.9429185
                            },
                            {
                                "word": "hacer",
                                "offset": "PT1.99S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 19900000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.8864638
                            },
                            {
                                "word": "frisuelos",
                                "offset": "PT2.47S",
                                "duration": "PT1.08S",
                                "offsetInTicks": 24700000.0,
                                "durationInTicks": 10800000.0,
                                "confidence": 0.67156506
                            },
                            {
                                "word": "receta",
                                "offset": "PT4.11S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 41100000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.95747006
                            },
                            {
                                "word": "típica",
                                "offset": "PT4.87S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 48700000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.974434
                            },
                            {
                                "word": "de",
                                "offset": "PT5.95S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 59500000.0,
                                "durationInTicks": 2400000.0,
                                "confidence": 0.89863425
                            },
                            {
                                "word": "carnaval",
                                "offset": "PT6.19S",
                                "duration": "PT0.88S",
                                "offsetInTicks": 61900000.0,
                                "durationInTicks": 8800000.0,
                                "confidence": 0.9444882
                            }
                        ],
                        "displayWords": [
                            {
                                "displayText": "Ingredientes",
                                "offset": "PT0.55S",
                                "duration": "PT1.16S",
                                "offsetInTicks": 5500000.0,
                                "durationInTicks": 11600000.0
                            },
                            {
                                "displayText": "para",
                                "offset": "PT1.71S",
                                "duration": "PT0.28S",
                                "offsetInTicks": 17100000.0,
                                "durationInTicks": 2800000.0
                            },
                            {
                                "displayText": "hacer",
                                "offset": "PT1.99S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 19900000.0,
                                "durationInTicks": 4800000.0
                            },
                            {
                                "displayText": "frisuelos",
                                "offset": "PT2.47S",
                                "duration": "PT1.08S",
                                "offsetInTicks": 24700000.0,
                                "durationInTicks": 10800000.0
                            },
                            {
                                "displayText": "receta",
                                "offset": "PT4.11S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 41100000.0,
                                "durationInTicks": 7600000.0
                            },
                            {
                                "displayText": "típica",
                                "offset": "PT4.87S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 48700000.0,
                                "durationInTicks": 8400000.0
                            },
                            {
                                "displayText": "de",
                                "offset": "PT5.95S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 59500000.0,
                                "durationInTicks": 2400000.0
                            },
                            {
                                "displayText": "carnaval.",
                                "offset": "PT6.19S",
                                "duration": "PT0.88S",
                                "offsetInTicks": 61900000.0,
                                "durationInTicks": 8800000.0
                            }
                        ]
                    },
                    {
                        "confidence": 0.9029248,
                        "lexical": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "itn": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "maskedITN": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "display": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "words": [
                            {
                                "word": "ingredientes",
                                "offset": "PT0.55S",
                                "duration": "PT1.16S",
                                "offsetInTicks": 5500000.0,
                                "durationInTicks": 11600000.0,
                                "confidence": 0.9474241
                            },
                            {
                                "word": "para",
                                "offset": "PT1.71S",
                                "duration": "PT0.28S",
                                "offsetInTicks": 17100000.0,
                                "durationInTicks": 2800000.0,
                                "confidence": 0.94291866
                            },
                            {
                                "word": "hacer",
                                "offset": "PT1.99S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 19900000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.8864638
                            },
                            {
                                "word": "frisuelos",
                                "offset": "PT2.47S",
                                "duration": "PT1.08S",
                                "offsetInTicks": 24700000.0,
                                "durationInTicks": 10800000.0,
                                "confidence": 0.67156523
                            },
                            {
                                "word": "receta",
                                "offset": "PT4.11S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 41100000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.9574702
                            },
                            {
                                "word": "típica",
                                "offset": "PT4.87S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 48700000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.974434
                            },
                            {
                                "word": "de",
                                "offset": "PT5.95S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 59500000.0,
                                "durationInTicks": 2400000.0,
                                "confidence": 0.89863425
                            },
                            {
                                "word": "carnaval",
                                "offset": "PT6.19S",
                                "duration": "PT0.88S",
                                "offsetInTicks": 61900000.0,
                                "durationInTicks": 8800000.0,
                                "confidence": 0.9444883
                            }
                        ]
                    },
                    {
                        "confidence": 0.9029248,
                        "lexical": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "itn": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "maskedITN": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "display": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "words": [
                            {
                                "word": "ingredientes",
                                "offset": "PT0.55S",
                                "duration": "PT1.16S",
                                "offsetInTicks": 5500000.0,
                                "durationInTicks": 11600000.0,
                                "confidence": 0.9474241
                            },
                            {
                                "word": "para",
                                "offset": "PT1.71S",
                                "duration": "PT0.28S",
                                "offsetInTicks": 17100000.0,
                                "durationInTicks": 2800000.0,
                                "confidence": 0.94291866
                            },
                            {
                                "word": "hacer",
                                "offset": "PT1.99S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 19900000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.8864638
                            },
                            {
                                "word": "frisuelos",
                                "offset": "PT2.47S",
                                "duration": "PT1.08S",
                                "offsetInTicks": 24700000.0,
                                "durationInTicks": 10800000.0,
                                "confidence": 0.67156523
                            },
                            {
                                "word": "receta",
                                "offset": "PT4.11S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 41100000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.9574702
                            },
                            {
                                "word": "típica",
                                "offset": "PT4.87S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 48700000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.974434
                            },
                            {
                                "word": "de",
                                "offset": "PT5.95S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 59500000.0,
                                "durationInTicks": 2400000.0,
                                "confidence": 0.89863425
                            },
                            {
                                "word": "carnaval",
                                "offset": "PT6.19S",
                                "duration": "PT0.88S",
                                "offsetInTicks": 61900000.0,
                                "durationInTicks": 8800000.0,
                                "confidence": 0.9444883
                            }
                        ]
                    },
                    {
                        "confidence": 0.9029248,
                        "lexical": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "itn": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "maskedITN": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "display": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "words": [
                            {
                                "word": "ingredientes",
                                "offset": "PT0.55S",
                                "duration": "PT1.16S",
                                "offsetInTicks": 5500000.0,
                                "durationInTicks": 11600000.0,
                                "confidence": 0.9474241
                            },
                            {
                                "word": "para",
                                "offset": "PT1.71S",
                                "duration": "PT0.28S",
                                "offsetInTicks": 17100000.0,
                                "durationInTicks": 2800000.0,
                                "confidence": 0.94291866
                            },
                            {
                                "word": "hacer",
                                "offset": "PT1.99S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 19900000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.8864638
                            },
                            {
                                "word": "frisuelos",
                                "offset": "PT2.47S",
                                "duration": "PT1.08S",
                                "offsetInTicks": 24700000.0,
                                "durationInTicks": 10800000.0,
                                "confidence": 0.67156523
                            },
                            {
                                "word": "receta",
                                "offset": "PT4.11S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 41100000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.9574702
                            },
                            {
                                "word": "típica",
                                "offset": "PT4.87S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 48700000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.974434
                            },
                            {
                                "word": "de",
                                "offset": "PT5.95S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 59500000.0,
                                "durationInTicks": 2400000.0,
                                "confidence": 0.89863425
                            },
                            {
                                "word": "carnaval",
                                "offset": "PT6.19S",
                                "duration": "PT0.88S",
                                "offsetInTicks": 61900000.0,
                                "durationInTicks": 8800000.0,
                                "confidence": 0.9444883
                            }
                        ]
                    },
                    {
                        "confidence": 0.9029248,
                        "lexical": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "itn": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "maskedITN": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "display": "ingredientes para hacer frisuelos receta típica de carnaval",
                        "words": [
                            {
                                "word": "ingredientes",
                                "offset": "PT0.55S",
                                "duration": "PT1.16S",
                                "offsetInTicks": 5500000.0,
                                "durationInTicks": 11600000.0,
                                "confidence": 0.9474241
                            },
                            {
                                "word": "para",
                                "offset": "PT1.71S",
                                "duration": "PT0.28S",
                                "offsetInTicks": 17100000.0,
                                "durationInTicks": 2800000.0,
                                "confidence": 0.94291866
                            },
                            {
                                "word": "hacer",
                                "offset": "PT1.99S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 19900000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.8864638
                            },
                            {
                                "word": "frisuelos",
                                "offset": "PT2.47S",
                                "duration": "PT1.08S",
                                "offsetInTicks": 24700000.0,
                                "durationInTicks": 10800000.0,
                                "confidence": 0.67156523
                            },
                            {
                                "word": "receta",
                                "offset": "PT4.11S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 41100000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.9574702
                            },
                            {
                                "word": "típica",
                                "offset": "PT4.87S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 48700000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.974434
                            },
                            {
                                "word": "de",
                                "offset": "PT5.95S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 59500000.0,
                                "durationInTicks": 2400000.0,
                                "confidence": 0.89863425
                            },
                            {
                                "word": "carnaval",
                                "offset": "PT6.19S",
                                "duration": "PT0.88S",
                                "offsetInTicks": 61900000.0,
                                "durationInTicks": 8800000.0,
                                "confidence": 0.9444883
                            }
                        ]
                    }
                ]
            },
            {
                "recognitionStatus": "Success",
                "channel": 0,
                "offset": "PT9.15S",
                "duration": "PT6.88S",
                "offsetInTicks": 91500000.0,
                "durationInTicks": 68800000.0,
                "nBest": [
                    {
                        "confidence": 0.9180871,
                        "lexical": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "itn": "cuatro huevos dos cucharadas de azúcar 200 g de harina",
                        "maskedITN": "cuatro huevos dos cucharadas de azúcar 200 g de harina",
                        "display": "Cuatro huevos, dos cucharadas de azúcar 200 g de harina.",
                        "words": [
                            {
                                "word": "cuatro",
                                "offset": "PT9.15S",
                                "duration": "PT0.64S",
                                "offsetInTicks": 91500000.0,
                                "durationInTicks": 6400000.0,
                                "confidence": 0.9402716
                            },
                            {
                                "word": "huevos",
                                "offset": "PT9.79S",
                                "duration": "PT0.72S",
                                "offsetInTicks": 97900000.0,
                                "durationInTicks": 7200000.0,
                                "confidence": 0.7901812
                            },
                            {
                                "word": "dos",
                                "offset": "PT11.19S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 111900000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.85530627
                            },
                            {
                                "word": "cucharadas",
                                "offset": "PT11.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 115500000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.96733844
                            },
                            {
                                "word": "de",
                                "offset": "PT12.39S",
                                "duration": "PT0.08S",
                                "offsetInTicks": 123900000.0,
                                "durationInTicks": 800000.0,
                                "confidence": 0.9769009
                            },
                            {
                                "word": "azúcar",
                                "offset": "PT12.47S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 124700000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.9812191
                            },
                            {
                                "word": "doscientos",
                                "offset": "PT13.87S",
                                "duration": "PT0.96S",
                                "offsetInTicks": 138700000.0,
                                "durationInTicks": 9600000.0,
                                "confidence": 0.9038449
                            },
                            {
                                "word": "gramos",
                                "offset": "PT14.83S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 148300000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.9127126
                            },
                            {
                                "word": "de",
                                "offset": "PT15.31S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 153100000.0,
                                "durationInTicks": 1200000.0,
                                "confidence": 0.9632608
                            },
                            {
                                "word": "harina",
                                "offset": "PT15.43S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 154300000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.8898352
                            }
                        ],
                        "displayWords": [
                            {
                                "displayText": "Cuatro",
                                "offset": "PT9.15S",
                                "duration": "PT0.64S",
                                "offsetInTicks": 91500000.0,
                                "durationInTicks": 6400000.0
                            },
                            {
                                "displayText": "huevos,",
                                "offset": "PT9.79S",
                                "duration": "PT0.72S",
                                "offsetInTicks": 97900000.0,
                                "durationInTicks": 7200000.0
                            },
                            {
                                "displayText": "dos",
                                "offset": "PT11.19S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 111900000.0,
                                "durationInTicks": 3600000.0
                            },
                            {
                                "displayText": "cucharadas",
                                "offset": "PT11.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 115500000.0,
                                "durationInTicks": 8400000.0
                            },
                            {
                                "displayText": "de",
                                "offset": "PT12.39S",
                                "duration": "PT0.08S",
                                "offsetInTicks": 123900000.0,
                                "durationInTicks": 800000.0
                            },
                            {
                                "displayText": "azúcar",
                                "offset": "PT12.47S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 124700000.0,
                                "durationInTicks": 7600000.0
                            },
                            {
                                "displayText": "200",
                                "offset": "PT13.87S",
                                "duration": "PT0.96S",
                                "offsetInTicks": 138700000.0,
                                "durationInTicks": 9600000.0
                            },
                            {
                                "displayText": "g",
                                "offset": "PT14.83S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 148300000.0,
                                "durationInTicks": 4800000.0
                            },
                            {
                                "displayText": "de",
                                "offset": "PT15.31S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 153100000.0,
                                "durationInTicks": 1200000.0
                            },
                            {
                                "displayText": "harina.",
                                "offset": "PT15.43S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 154300000.0,
                                "durationInTicks": 6000000.0
                            }
                        ]
                    },
                    {
                        "confidence": 0.9226613,
                        "lexical": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "itn": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "maskedITN": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "display": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "words": [
                            {
                                "word": "cuatro",
                                "offset": "PT9.15S",
                                "duration": "PT0.64S",
                                "offsetInTicks": 91500000.0,
                                "durationInTicks": 6400000.0,
                                "confidence": 0.9402716
                            },
                            {
                                "word": "huevos",
                                "offset": "PT9.79S",
                                "duration": "PT0.72S",
                                "offsetInTicks": 97900000.0,
                                "durationInTicks": 7200000.0,
                                "confidence": 0.7901812
                            },
                            {
                                "word": "dos",
                                "offset": "PT11.19S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 111900000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.85530627
                            },
                            {
                                "word": "cucharadas",
                                "offset": "PT11.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 115500000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.96733844
                            },
                            {
                                "word": "de",
                                "offset": "PT12.39S",
                                "duration": "PT0.08S",
                                "offsetInTicks": 123900000.0,
                                "durationInTicks": 800000.0,
                                "confidence": 0.9769009
                            },
                            {
                                "word": "azúcar",
                                "offset": "PT12.47S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 124700000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.9812191
                            },
                            {
                                "word": "doscientos",
                                "offset": "PT13.87S",
                                "duration": "PT0.96S",
                                "offsetInTicks": 138700000.0,
                                "durationInTicks": 9600000.0,
                                "confidence": 0.9185764
                            },
                            {
                                "word": "gramos",
                                "offset": "PT14.83S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 148300000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.92206883
                            },
                            {
                                "word": "de",
                                "offset": "PT15.31S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 153100000.0,
                                "durationInTicks": 1200000.0,
                                "confidence": 0.9709208
                            },
                            {
                                "word": "harina",
                                "offset": "PT15.43S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 154300000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.90382904
                            }
                        ]
                    },
                    {
                        "confidence": 0.90893716,
                        "lexical": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "itn": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "maskedITN": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "display": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "words": [
                            {
                                "word": "cuatro",
                                "offset": "PT9.15S",
                                "duration": "PT0.64S",
                                "offsetInTicks": 91500000.0,
                                "durationInTicks": 6400000.0,
                                "confidence": 0.9402716
                            },
                            {
                                "word": "huevos",
                                "offset": "PT9.79S",
                                "duration": "PT0.72S",
                                "offsetInTicks": 97900000.0,
                                "durationInTicks": 7200000.0,
                                "confidence": 0.7901812
                            },
                            {
                                "word": "dos",
                                "offset": "PT11.19S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 111900000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.8315106
                            },
                            {
                                "word": "cucharadas",
                                "offset": "PT11.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 115500000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.9444511
                            },
                            {
                                "word": "de",
                                "offset": "PT12.39S",
                                "duration": "PT0.08S",
                                "offsetInTicks": 123900000.0,
                                "durationInTicks": 800000.0,
                                "confidence": 0.96064657
                            },
                            {
                                "word": "azúcar",
                                "offset": "PT12.47S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 124700000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.9689248
                            },
                            {
                                "word": "doscientos",
                                "offset": "PT13.87S",
                                "duration": "PT0.96S",
                                "offsetInTicks": 138700000.0,
                                "durationInTicks": 9600000.0,
                                "confidence": 0.8986464
                            },
                            {
                                "word": "gramos",
                                "offset": "PT14.83S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 148300000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.90944666
                            },
                            {
                                "word": "de",
                                "offset": "PT15.31S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 153100000.0,
                                "durationInTicks": 1200000.0,
                                "confidence": 0.9603237
                            },
                            {
                                "word": "harina",
                                "offset": "PT15.43S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 154300000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.88496846
                            }
                        ]
                    },
                    {
                        "confidence": 0.9180871,
                        "lexical": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "itn": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "maskedITN": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "display": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "words": [
                            {
                                "word": "cuatro",
                                "offset": "PT9.15S",
                                "duration": "PT0.64S",
                                "offsetInTicks": 91500000.0,
                                "durationInTicks": 6400000.0,
                                "confidence": 0.9402716
                            },
                            {
                                "word": "huevos",
                                "offset": "PT9.79S",
                                "duration": "PT0.72S",
                                "offsetInTicks": 97900000.0,
                                "durationInTicks": 7200000.0,
                                "confidence": 0.7901812
                            },
                            {
                                "word": "dos",
                                "offset": "PT11.19S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 111900000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.85530627
                            },
                            {
                                "word": "cucharadas",
                                "offset": "PT11.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 115500000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.96733844
                            },
                            {
                                "word": "de",
                                "offset": "PT12.39S",
                                "duration": "PT0.08S",
                                "offsetInTicks": 123900000.0,
                                "durationInTicks": 800000.0,
                                "confidence": 0.9769009
                            },
                            {
                                "word": "azúcar",
                                "offset": "PT12.47S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 124700000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.9812191
                            },
                            {
                                "word": "doscientos",
                                "offset": "PT13.87S",
                                "duration": "PT0.96S",
                                "offsetInTicks": 138700000.0,
                                "durationInTicks": 9600000.0,
                                "confidence": 0.9038449
                            },
                            {
                                "word": "gramos",
                                "offset": "PT14.83S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 148300000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.9127126
                            },
                            {
                                "word": "de",
                                "offset": "PT15.31S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 153100000.0,
                                "durationInTicks": 1200000.0,
                                "confidence": 0.9632608
                            },
                            {
                                "word": "harina",
                                "offset": "PT15.43S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 154300000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.8898352
                            }
                        ]
                    },
                    {
                        "confidence": 0.9226613,
                        "lexical": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "itn": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "maskedITN": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "display": "cuatro huevos dos cucharadas de azúcar doscientos gramos de harina",
                        "words": [
                            {
                                "word": "cuatro",
                                "offset": "PT9.15S",
                                "duration": "PT0.64S",
                                "offsetInTicks": 91500000.0,
                                "durationInTicks": 6400000.0,
                                "confidence": 0.9402716
                            },
                            {
                                "word": "huevos",
                                "offset": "PT9.79S",
                                "duration": "PT0.72S",
                                "offsetInTicks": 97900000.0,
                                "durationInTicks": 7200000.0,
                                "confidence": 0.7901812
                            },
                            {
                                "word": "dos",
                                "offset": "PT11.19S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 111900000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.85530627
                            },
                            {
                                "word": "cucharadas",
                                "offset": "PT11.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 115500000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.96733844
                            },
                            {
                                "word": "de",
                                "offset": "PT12.39S",
                                "duration": "PT0.08S",
                                "offsetInTicks": 123900000.0,
                                "durationInTicks": 800000.0,
                                "confidence": 0.9769009
                            },
                            {
                                "word": "azúcar",
                                "offset": "PT12.47S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 124700000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.9812191
                            },
                            {
                                "word": "doscientos",
                                "offset": "PT13.87S",
                                "duration": "PT0.96S",
                                "offsetInTicks": 138700000.0,
                                "durationInTicks": 9600000.0,
                                "confidence": 0.9185764
                            },
                            {
                                "word": "gramos",
                                "offset": "PT14.83S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 148300000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.92206883
                            },
                            {
                                "word": "de",
                                "offset": "PT15.31S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 153100000.0,
                                "durationInTicks": 1200000.0,
                                "confidence": 0.9709208
                            },
                            {
                                "word": "harina",
                                "offset": "PT15.43S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 154300000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.90382904
                            }
                        ]
                    }
                ]
            },
            {
                "recognitionStatus": "Success",
                "channel": 0,
                "offset": "PT16.91S",
                "duration": "PT1.68S",
                "offsetInTicks": 169100000.0,
                "durationInTicks": 16800000.0,
                "nBest": [
                    {
                        "confidence": 0.9429209,
                        "lexical": "medio litro de leche",
                        "itn": "medio litro de leche",
                        "maskedITN": "medio litro de leche",
                        "display": "Medio litro de leche.",
                        "words": [
                            {
                                "word": "medio",
                                "offset": "PT16.91S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 169100000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.8971163
                            },
                            {
                                "word": "litro",
                                "offset": "PT17.39S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 173900000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.9276589
                            },
                            {
                                "word": "de",
                                "offset": "PT17.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 178300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.9819865
                            },
                            {
                                "word": "leche",
                                "offset": "PT17.99S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 179900000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.96492183
                            }
                        ],
                        "displayWords": [
                            {
                                "displayText": "Medio",
                                "offset": "PT16.91S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 169100000.0,
                                "durationInTicks": 4800000.0
                            },
                            {
                                "displayText": "litro",
                                "offset": "PT17.39S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 173900000.0,
                                "durationInTicks": 4400000.0
                            },
                            {
                                "displayText": "de",
                                "offset": "PT17.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 178300000.0,
                                "durationInTicks": 1600000.0
                            },
                            {
                                "displayText": "leche.",
                                "offset": "PT17.99S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 179900000.0,
                                "durationInTicks": 6000000.0
                            }
                        ]
                    },
                    {
                        "confidence": 0.9429209,
                        "lexical": "medio litro de leche",
                        "itn": "medio litro de leche",
                        "maskedITN": "medio litro de leche",
                        "display": "medio litro de leche",
                        "words": [
                            {
                                "word": "medio",
                                "offset": "PT16.91S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 169100000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.8971163
                            },
                            {
                                "word": "litro",
                                "offset": "PT17.39S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 173900000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.9276589
                            },
                            {
                                "word": "de",
                                "offset": "PT17.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 178300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.9819865
                            },
                            {
                                "word": "leche",
                                "offset": "PT17.99S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 179900000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.96492183
                            }
                        ]
                    },
                    {
                        "confidence": 0.9429209,
                        "lexical": "medio litro de leche",
                        "itn": "medio litro de leche",
                        "maskedITN": "medio litro de leche",
                        "display": "medio litro de leche",
                        "words": [
                            {
                                "word": "medio",
                                "offset": "PT16.91S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 169100000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.8971163
                            },
                            {
                                "word": "litro",
                                "offset": "PT17.39S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 173900000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.9276589
                            },
                            {
                                "word": "de",
                                "offset": "PT17.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 178300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.9819865
                            },
                            {
                                "word": "leche",
                                "offset": "PT17.99S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 179900000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.96492183
                            }
                        ]
                    },
                    {
                        "confidence": 0.7695756,
                        "lexical": "medio litro de leche leche",
                        "itn": "medio litro de leche leche",
                        "maskedITN": "medio litro de leche leche",
                        "display": "medio litro de leche leche",
                        "words": [
                            {
                                "word": "medio",
                                "offset": "PT16.91S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 169100000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.8971163
                            },
                            {
                                "word": "litro",
                                "offset": "PT17.39S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 173900000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.9276589
                            },
                            {
                                "word": "de",
                                "offset": "PT17.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 178300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.9819865
                            },
                            {
                                "word": "leche",
                                "offset": "PT17.99S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 179900000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.050754406
                            },
                            {
                                "word": "leche",
                                "offset": "PT18.43S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 184300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.99036145
                            }
                        ]
                    },
                    {
                        "confidence": 0.62410325,
                        "lexical": "medio litros de leche",
                        "itn": "medio litros de leche",
                        "maskedITN": "medio litros de leche",
                        "display": "medio litros de leche",
                        "words": [
                            {
                                "word": "medio",
                                "offset": "PT16.91S",
                                "duration": "PT0.48S",
                                "offsetInTicks": 169100000.0,
                                "durationInTicks": 4800000.0,
                                "confidence": 0.8971163
                            },
                            {
                                "word": "litros",
                                "offset": "PT17.39S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 173900000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.001682931
                            },
                            {
                                "word": "de",
                                "offset": "PT17.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 178300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.8063367
                            },
                            {
                                "word": "leche",
                                "offset": "PT17.99S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 179900000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.791277
                            }
                        ]
                    }
                ]
            },
            {
                "recognitionStatus": "Success",
                "channel": 0,
                "offset": "PT19.47S",
                "duration": "PT3.2S",
                "offsetInTicks": 194700000.0,
                "durationInTicks": 32000000.0,
                "nBest": [
                    {
                        "confidence": 0.9001302,
                        "lexical": "la ralladura de la cáscara de medio limón",
                        "itn": "la ralladura de la cáscara de medio limón",
                        "maskedITN": "la ralladura de la cáscara de medio limón",
                        "display": "La ralladura de la cáscara de medio limón.",
                        "words": [
                            {
                                "word": "la",
                                "offset": "PT19.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 194700000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.872014
                            },
                            {
                                "word": "ralladura",
                                "offset": "PT19.63S",
                                "duration": "PT0.8S",
                                "offsetInTicks": 196300000.0,
                                "durationInTicks": 8000000.0,
                                "confidence": 0.84464824
                            },
                            {
                                "word": "de",
                                "offset": "PT20.43S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 204300000.0,
                                "durationInTicks": 1200000.0,
                                "confidence": 0.89409953
                            },
                            {
                                "word": "la",
                                "offset": "PT20.55S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 205500000.0,
                                "durationInTicks": 2400000.0,
                                "confidence": 0.9155355
                            },
                            {
                                "word": "cáscara",
                                "offset": "PT20.79S",
                                "duration": "PT0.68S",
                                "offsetInTicks": 207900000.0,
                                "durationInTicks": 6800000.0,
                                "confidence": 0.86479044
                            },
                            {
                                "word": "de",
                                "offset": "PT21.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 214700000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.93893695
                            },
                            {
                                "word": "medio",
                                "offset": "PT21.63S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 216300000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.9417889
                            },
                            {
                                "word": "limón",
                                "offset": "PT22.07S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 220700000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.9292284
                            }
                        ],
                        "displayWords": [
                            {
                                "displayText": "La",
                                "offset": "PT19.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 194700000.0,
                                "durationInTicks": 1600000.0
                            },
                            {
                                "displayText": "ralladura",
                                "offset": "PT19.63S",
                                "duration": "PT0.8S",
                                "offsetInTicks": 196300000.0,
                                "durationInTicks": 8000000.0
                            },
                            {
                                "displayText": "de",
                                "offset": "PT20.43S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 204300000.0,
                                "durationInTicks": 1200000.0
                            },
                            {
                                "displayText": "la",
                                "offset": "PT20.55S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 205500000.0,
                                "durationInTicks": 2400000.0
                            },
                            {
                                "displayText": "cáscara",
                                "offset": "PT20.79S",
                                "duration": "PT0.68S",
                                "offsetInTicks": 207900000.0,
                                "durationInTicks": 6800000.0
                            },
                            {
                                "displayText": "de",
                                "offset": "PT21.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 214700000.0,
                                "durationInTicks": 1600000.0
                            },
                            {
                                "displayText": "medio",
                                "offset": "PT21.63S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 216300000.0,
                                "durationInTicks": 4400000.0
                            },
                            {
                                "displayText": "limón.",
                                "offset": "PT22.07S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 220700000.0,
                                "durationInTicks": 6000000.0
                            }
                        ]
                    },
                    {
                        "confidence": 0.9001302,
                        "lexical": "la ralladura de la cáscara de medio limón",
                        "itn": "la ralladura de la cáscara de medio limón",
                        "maskedITN": "la ralladura de la cáscara de medio limón",
                        "display": "la ralladura de la cáscara de medio limón",
                        "words": [
                            {
                                "word": "la",
                                "offset": "PT19.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 194700000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.872014
                            },
                            {
                                "word": "ralladura",
                                "offset": "PT19.63S",
                                "duration": "PT0.8S",
                                "offsetInTicks": 196300000.0,
                                "durationInTicks": 8000000.0,
                                "confidence": 0.84464824
                            },
                            {
                                "word": "de",
                                "offset": "PT20.43S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 204300000.0,
                                "durationInTicks": 1200000.0,
                                "confidence": 0.89409953
                            },
                            {
                                "word": "la",
                                "offset": "PT20.55S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 205500000.0,
                                "durationInTicks": 2400000.0,
                                "confidence": 0.9155355
                            },
                            {
                                "word": "cáscara",
                                "offset": "PT20.79S",
                                "duration": "PT0.68S",
                                "offsetInTicks": 207900000.0,
                                "durationInTicks": 6800000.0,
                                "confidence": 0.86479044
                            },
                            {
                                "word": "de",
                                "offset": "PT21.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 214700000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.93893695
                            },
                            {
                                "word": "medio",
                                "offset": "PT21.63S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 216300000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.9417889
                            },
                            {
                                "word": "limón",
                                "offset": "PT22.07S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 220700000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.9292284
                            }
                        ]
                    },
                    {
                        "confidence": 0.9001302,
                        "lexical": "la ralladura de la cáscara de medio limón",
                        "itn": "la ralladura de la cáscara de medio limón",
                        "maskedITN": "la ralladura de la cáscara de medio limón",
                        "display": "la ralladura de la cáscara de medio limón",
                        "words": [
                            {
                                "word": "la",
                                "offset": "PT19.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 194700000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.872014
                            },
                            {
                                "word": "ralladura",
                                "offset": "PT19.63S",
                                "duration": "PT0.8S",
                                "offsetInTicks": 196300000.0,
                                "durationInTicks": 8000000.0,
                                "confidence": 0.84464824
                            },
                            {
                                "word": "de",
                                "offset": "PT20.43S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 204300000.0,
                                "durationInTicks": 1200000.0,
                                "confidence": 0.89409953
                            },
                            {
                                "word": "la",
                                "offset": "PT20.55S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 205500000.0,
                                "durationInTicks": 2400000.0,
                                "confidence": 0.9155355
                            },
                            {
                                "word": "cáscara",
                                "offset": "PT20.79S",
                                "duration": "PT0.68S",
                                "offsetInTicks": 207900000.0,
                                "durationInTicks": 6800000.0,
                                "confidence": 0.86479044
                            },
                            {
                                "word": "de",
                                "offset": "PT21.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 214700000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.93893695
                            },
                            {
                                "word": "medio",
                                "offset": "PT21.63S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 216300000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.9417889
                            },
                            {
                                "word": "limón",
                                "offset": "PT22.07S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 220700000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.9292284
                            }
                        ]
                    },
                    {
                        "confidence": 0.9001301,
                        "lexical": "la ralladura de la cáscara de medio limón",
                        "itn": "la ralladura de la cáscara de medio limón",
                        "maskedITN": "la ralladura de la cáscara de medio limón",
                        "display": "la ralladura de la cáscara de medio limón",
                        "words": [
                            {
                                "word": "la",
                                "offset": "PT19.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 194700000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.87201387
                            },
                            {
                                "word": "ralladura",
                                "offset": "PT19.63S",
                                "duration": "PT0.8S",
                                "offsetInTicks": 196300000.0,
                                "durationInTicks": 8000000.0,
                                "confidence": 0.8446482
                            },
                            {
                                "word": "de",
                                "offset": "PT20.43S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 204300000.0,
                                "durationInTicks": 1200000.0,
                                "confidence": 0.8940994
                            },
                            {
                                "word": "la",
                                "offset": "PT20.55S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 205500000.0,
                                "durationInTicks": 2400000.0,
                                "confidence": 0.9155355
                            },
                            {
                                "word": "cáscara",
                                "offset": "PT20.79S",
                                "duration": "PT0.68S",
                                "offsetInTicks": 207900000.0,
                                "durationInTicks": 6800000.0,
                                "confidence": 0.86479026
                            },
                            {
                                "word": "de",
                                "offset": "PT21.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 214700000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.93893695
                            },
                            {
                                "word": "medio",
                                "offset": "PT21.63S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 216300000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.9417888
                            },
                            {
                                "word": "limón",
                                "offset": "PT22.07S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 220700000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.92922825
                            }
                        ]
                    },
                    {
                        "confidence": 0.9001302,
                        "lexical": "la ralladura de la cáscara de medio limón",
                        "itn": "la ralladura de la cáscara de medio limón",
                        "maskedITN": "la ralladura de la cáscara de medio limón",
                        "display": "la ralladura de la cáscara de medio limón",
                        "words": [
                            {
                                "word": "la",
                                "offset": "PT19.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 194700000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.872014
                            },
                            {
                                "word": "ralladura",
                                "offset": "PT19.63S",
                                "duration": "PT0.8S",
                                "offsetInTicks": 196300000.0,
                                "durationInTicks": 8000000.0,
                                "confidence": 0.84464824
                            },
                            {
                                "word": "de",
                                "offset": "PT20.43S",
                                "duration": "PT0.12S",
                                "offsetInTicks": 204300000.0,
                                "durationInTicks": 1200000.0,
                                "confidence": 0.89409953
                            },
                            {
                                "word": "la",
                                "offset": "PT20.55S",
                                "duration": "PT0.24S",
                                "offsetInTicks": 205500000.0,
                                "durationInTicks": 2400000.0,
                                "confidence": 0.9155355
                            },
                            {
                                "word": "cáscara",
                                "offset": "PT20.79S",
                                "duration": "PT0.68S",
                                "offsetInTicks": 207900000.0,
                                "durationInTicks": 6800000.0,
                                "confidence": 0.86479044
                            },
                            {
                                "word": "de",
                                "offset": "PT21.47S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 214700000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.93893695
                            },
                            {
                                "word": "medio",
                                "offset": "PT21.63S",
                                "duration": "PT0.44S",
                                "offsetInTicks": 216300000.0,
                                "durationInTicks": 4400000.0,
                                "confidence": 0.9417889
                            },
                            {
                                "word": "limón",
                                "offset": "PT22.07S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 220700000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.9292284
                            }
                        ]
                    }
                ]
            },
            {
                "recognitionStatus": "Success",
                "channel": 0,
                "offset": "PT23.67S",
                "duration": "PT4.84S",
                "offsetInTicks": 236700000.0,
                "durationInTicks": 48400000.0,
                "nBest": [
                    {
                        "confidence": 0.90971243,
                        "lexical": "una cucharada pequeña de levadura una pizca de sal",
                        "itn": "una cucharada pequeña de levadura una pizca de sal",
                        "maskedITN": "una cucharada pequeña de levadura una pizca de sal",
                        "display": "Una cucharada pequeña de levadura, una pizca de sal.",
                        "words": [
                            {
                                "word": "una",
                                "offset": "PT23.67S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 236700000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.84140116
                            },
                            {
                                "word": "cucharada",
                                "offset": "PT24.03S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 240300000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.93594474
                            },
                            {
                                "word": "pequeña",
                                "offset": "PT24.79S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 247900000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.9157196
                            },
                            {
                                "word": "de",
                                "offset": "PT25.39S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 253900000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.9139503
                            },
                            {
                                "word": "levadura",
                                "offset": "PT25.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 255500000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.96868914
                            },
                            {
                                "word": "una",
                                "offset": "PT26.95S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 269500000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.9016928
                            },
                            {
                                "word": "pizca",
                                "offset": "PT27.31S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 273100000.0,
                                "durationInTicks": 5200000.0,
                                "confidence": 0.8857159
                            },
                            {
                                "word": "de",
                                "offset": "PT27.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 278300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.93119276
                            },
                            {
                                "word": "sal",
                                "offset": "PT27.99S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 279900000.0,
                                "durationInTicks": 5200000.0,
                                "confidence": 0.8931061
                            }
                        ],
                        "displayWords": [
                            {
                                "displayText": "Una",
                                "offset": "PT23.67S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 236700000.0,
                                "durationInTicks": 3600000.0
                            },
                            {
                                "displayText": "cucharada",
                                "offset": "PT24.03S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 240300000.0,
                                "durationInTicks": 7600000.0
                            },
                            {
                                "displayText": "pequeña",
                                "offset": "PT24.79S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 247900000.0,
                                "durationInTicks": 6000000.0
                            },
                            {
                                "displayText": "de",
                                "offset": "PT25.39S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 253900000.0,
                                "durationInTicks": 1600000.0
                            },
                            {
                                "displayText": "levadura,",
                                "offset": "PT25.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 255500000.0,
                                "durationInTicks": 8400000.0
                            },
                            {
                                "displayText": "una",
                                "offset": "PT26.95S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 269500000.0,
                                "durationInTicks": 3600000.0
                            },
                            {
                                "displayText": "pizca",
                                "offset": "PT27.31S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 273100000.0,
                                "durationInTicks": 5200000.0
                            },
                            {
                                "displayText": "de",
                                "offset": "PT27.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 278300000.0,
                                "durationInTicks": 1600000.0
                            },
                            {
                                "displayText": "sal.",
                                "offset": "PT27.99S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 279900000.0,
                                "durationInTicks": 5200000.0
                            }
                        ]
                    },
                    {
                        "confidence": 0.90971243,
                        "lexical": "una cucharada pequeña de levadura una pizca de sal",
                        "itn": "una cucharada pequeña de levadura una pizca de sal",
                        "maskedITN": "una cucharada pequeña de levadura una pizca de sal",
                        "display": "una cucharada pequeña de levadura una pizca de sal",
                        "words": [
                            {
                                "word": "una",
                                "offset": "PT23.67S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 236700000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.84140116
                            },
                            {
                                "word": "cucharada",
                                "offset": "PT24.03S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 240300000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.93594474
                            },
                            {
                                "word": "pequeña",
                                "offset": "PT24.79S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 247900000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.9157196
                            },
                            {
                                "word": "de",
                                "offset": "PT25.39S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 253900000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.9139503
                            },
                            {
                                "word": "levadura",
                                "offset": "PT25.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 255500000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.96868914
                            },
                            {
                                "word": "una",
                                "offset": "PT26.95S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 269500000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.9016928
                            },
                            {
                                "word": "pizca",
                                "offset": "PT27.31S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 273100000.0,
                                "durationInTicks": 5200000.0,
                                "confidence": 0.8857159
                            },
                            {
                                "word": "de",
                                "offset": "PT27.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 278300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.93119276
                            },
                            {
                                "word": "sal",
                                "offset": "PT27.99S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 279900000.0,
                                "durationInTicks": 5200000.0,
                                "confidence": 0.8931061
                            }
                        ]
                    },
                    {
                        "confidence": 0.90971243,
                        "lexical": "una cucharada pequeña de levadura una pizca de sal",
                        "itn": "una cucharada pequeña de levadura una pizca de sal",
                        "maskedITN": "una cucharada pequeña de levadura una pizca de sal",
                        "display": "una cucharada pequeña de levadura una pizca de sal",
                        "words": [
                            {
                                "word": "una",
                                "offset": "PT23.67S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 236700000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.84140116
                            },
                            {
                                "word": "cucharada",
                                "offset": "PT24.03S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 240300000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.93594474
                            },
                            {
                                "word": "pequeña",
                                "offset": "PT24.79S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 247900000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.9157196
                            },
                            {
                                "word": "de",
                                "offset": "PT25.39S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 253900000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.9139503
                            },
                            {
                                "word": "levadura",
                                "offset": "PT25.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 255500000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.96868914
                            },
                            {
                                "word": "una",
                                "offset": "PT26.95S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 269500000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.9016928
                            },
                            {
                                "word": "pizca",
                                "offset": "PT27.31S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 273100000.0,
                                "durationInTicks": 5200000.0,
                                "confidence": 0.8857159
                            },
                            {
                                "word": "de",
                                "offset": "PT27.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 278300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.93119276
                            },
                            {
                                "word": "sal",
                                "offset": "PT27.99S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 279900000.0,
                                "durationInTicks": 5200000.0,
                                "confidence": 0.8931061
                            }
                        ]
                    },
                    {
                        "confidence": 0.90971243,
                        "lexical": "una cucharada pequeña de levadura una pizca de sal",
                        "itn": "una cucharada pequeña de levadura una pizca de sal",
                        "maskedITN": "una cucharada pequeña de levadura una pizca de sal",
                        "display": "una cucharada pequeña de levadura una pizca de sal",
                        "words": [
                            {
                                "word": "una",
                                "offset": "PT23.67S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 236700000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.84140116
                            },
                            {
                                "word": "cucharada",
                                "offset": "PT24.03S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 240300000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.93594474
                            },
                            {
                                "word": "pequeña",
                                "offset": "PT24.79S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 247900000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.9157196
                            },
                            {
                                "word": "de",
                                "offset": "PT25.39S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 253900000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.9139503
                            },
                            {
                                "word": "levadura",
                                "offset": "PT25.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 255500000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.96868914
                            },
                            {
                                "word": "una",
                                "offset": "PT26.95S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 269500000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.9016928
                            },
                            {
                                "word": "pizca",
                                "offset": "PT27.31S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 273100000.0,
                                "durationInTicks": 5200000.0,
                                "confidence": 0.8857159
                            },
                            {
                                "word": "de",
                                "offset": "PT27.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 278300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.93119276
                            },
                            {
                                "word": "sal",
                                "offset": "PT27.99S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 279900000.0,
                                "durationInTicks": 5200000.0,
                                "confidence": 0.8931061
                            }
                        ]
                    },
                    {
                        "confidence": 0.90971243,
                        "lexical": "una cucharada pequeña de levadura una pizca de sal",
                        "itn": "una cucharada pequeña de levadura una pizca de sal",
                        "maskedITN": "una cucharada pequeña de levadura una pizca de sal",
                        "display": "una cucharada pequeña de levadura una pizca de sal",
                        "words": [
                            {
                                "word": "una",
                                "offset": "PT23.67S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 236700000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.84140116
                            },
                            {
                                "word": "cucharada",
                                "offset": "PT24.03S",
                                "duration": "PT0.76S",
                                "offsetInTicks": 240300000.0,
                                "durationInTicks": 7600000.0,
                                "confidence": 0.93594474
                            },
                            {
                                "word": "pequeña",
                                "offset": "PT24.79S",
                                "duration": "PT0.6S",
                                "offsetInTicks": 247900000.0,
                                "durationInTicks": 6000000.0,
                                "confidence": 0.9157196
                            },
                            {
                                "word": "de",
                                "offset": "PT25.39S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 253900000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.9139503
                            },
                            {
                                "word": "levadura",
                                "offset": "PT25.55S",
                                "duration": "PT0.84S",
                                "offsetInTicks": 255500000.0,
                                "durationInTicks": 8400000.0,
                                "confidence": 0.96868914
                            },
                            {
                                "word": "una",
                                "offset": "PT26.95S",
                                "duration": "PT0.36S",
                                "offsetInTicks": 269500000.0,
                                "durationInTicks": 3600000.0,
                                "confidence": 0.9016928
                            },
                            {
                                "word": "pizca",
                                "offset": "PT27.31S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 273100000.0,
                                "durationInTicks": 5200000.0,
                                "confidence": 0.8857159
                            },
                            {
                                "word": "de",
                                "offset": "PT27.83S",
                                "duration": "PT0.16S",
                                "offsetInTicks": 278300000.0,
                                "durationInTicks": 1600000.0,
                                "confidence": 0.93119276
                            },
                            {
                                "word": "sal",
                                "offset": "PT27.99S",
                                "duration": "PT0.52S",
                                "offsetInTicks": 279900000.0,
                                "durationInTicks": 5200000.0,
                                "confidence": 0.8931061
                            }
                        ]
                    }
                ]
            }
        ]
    }

    let parsedTranscriptionResult: transcriptionInterface = { display: '', displayWords: [] }

    for (const phrase of transcriptionResult.recognizedPhrases) {
        parsedTranscriptionResult.display =
            parsedTranscriptionResult.display
            + ' '
            + phrase.nBest[0].display

        for (const word of phrase.nBest[0].displayWords) {
            parsedTranscriptionResult.displayWords.push(
                {
                    displayText: word.displayText,
                    offsetInTicks: word.offsetInTicks,
                    durationInTicks: word.durationInTicks
                }

            )
        }

    }

    console.log(parsedTranscriptionResult)

}

export default httpTrigger