import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { isoLangPro } from "./isoLang";
import { template } from "../template";
const fs = require('fs');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});


const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const translate = async (text: string, langIso: string) => {


        const language = isoLangPro[langIso]

        const prompt = `###\nTranslate: "${text}" into ${language} using the following format: Original:Translation: \nTranslate it in a website context and show only one translation option.\n\nExample:\n\nOriginal: Home.\nTranslation: Inicio.\n\n###\nSolution:\nOriginal:`


        console.info("Prompt --> ", prompt)

        try {
            const openai = new OpenAIApi(configuration);

            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                temperature: 0,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });
            const translation = response.data.choices[0].text
            console.info(translation)


        } catch (error) {
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "statusText": "Can't get language"
            }
        }
    }     

    const translateFile = async (filePath: string, langIso: string, outputFilePath: string) => {
        try {
          
          const translatedData = {};
          for (const key in template) {
            if (Object.prototype.hasOwnProperty.call(template, key)) {
              const originalValue = template[key];
              const translatedValue = await translate(originalValue, langIso);
              translatedData[key] = translatedValue
            }
          }
      
          // Salvar os dados traduzidos em um novo arquivo JSON
          fs.writeFileSync(outputFilePath, JSON.stringify(translatedData, null, 2));
          console.log(`Arquivo traduzido salvo em ${outputFilePath}`);
        } catch (error) {
          console.error(error);
        }
      };
      
      // Exemplo de uso: traduzir para espanhol
      translateFile('template.ts', 'pt', 'example-es.json');
      
     
    const getLanguages = async (lang: string) => {

        try {

            const db = await database

            const Languages = db.collection('i18n')

            const filter = {}

            filter[lang] = { $exists: true }

            const resp = Languages.find(filter)

            const body = await resp.toArray()

            if (body) {
                context.res = {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body[0][lang]
                }

            } else {
                context.res = {
                    "status": 204,
                    "headers": {
                        "Content-Type": "application/json"
                    }
                }
            }

        } catch (error) {
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "statusText": "Can't get language"
            }
        }
    }

      

    const buildLanguagePackage = async (text: string, lang: string) => {

        //await translate(text, lang)
        await translate(text, lang)

        return

        try {

            const db = await database

            const Languages = db.collection('i18n')

            const resp = Languages.find({})

            const body = await resp.toArray()
            const items = body[0]["en"]

            for (let key in items) {
                //     console.info(key + ': ' + items[key]);
            }


            if (body) {
                context.res = {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": 'Ok'
                }

            } else {
                context.res = {
                    "status": 204,
                    "headers": {
                        "Content-Type": "application/json"
                    }
                }
            }

        } catch (error) {
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "statusText": "Can't get language"
            }
        }
    }




    switch (req.method) {
        case "GET":
            await getLanguages(req.params.lang)
            break;
        case "POST":
            await buildLanguagePackage(req.body.text, req.params.lang)
            break;


        default:
            break;
    }

}

export default httpTrigger;