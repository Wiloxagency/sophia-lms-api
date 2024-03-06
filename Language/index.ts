import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
import { isoLangPro } from "./isoLang";
import { template } from "./template";
import fs = require("fs");
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Language {
  [key: string]: string;
}

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const translate = async (text: string, langIso: string) => {
    const language = isoLangPro[langIso];

    const prompt = `###\nTranslate: "${text}" into ${language} using the following JSON format: {"Original": English phrase, "Translation": Translated Phrase} \nTranslate it in a website context and show only one translation option.\n\nExample:\n\n{"Original": "Home", "Translation": "Inicio"\n\n###\nSolution:\n{"Original": "`;

    console.info("Prompt --> ", prompt);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const translation = response.choices[0].message.content;
      console.info("Start translation -->", translation, "End translation");

      //return "{'Original':" + translation + "}" // adicionado o retorno da tradução
      return '{"Original": "' + translation;
    } catch (error) {
      await saveLog(
        `Error creating language pack for: ${language}, error: ${error.message} `,
        "Error",
        "translate()",
        "Language/{lang}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        statusText: "Can't get language",
      };
    }
  };

  const translateObjectValues = async (lang: string) => {
    const outputFile = `languages/${lang}.json`;
    const translatedObj = {};

    for (const [key, value] of Object.entries(template)) {
      const translatedValue = await translate(value, lang);
      translatedObj[key] = JSON.parse(translatedValue).Translation;
    }

    try {
      await fs.writeFile(
        outputFile,
        JSON.stringify(translatedObj, null, 2),
        (err) => {
          if (err) throw err;
          console.log("Values saved to file");
        }
      );
    } catch (err) {
      console.error(err);
    }

    return translatedObj;
  };

  // const translateValues = async (template, lang, outputFile) => {
  //     const translatedTemplate = {};

  //     for (const [key, value] of Object.entries(template)) {
  //         if (typeof value === 'string') {
  //             if (value.includes(':')) {
  //                 const parts = value.split(':');
  //                 if (parts[1]) {
  //                     translatedTemplate[key] = parts[1].trim();
  //                 } else {
  //                     translatedTemplate[key] = '';
  //                 }
  //             } else {
  //                 const translatedValue = await translate(value, lang);
  //                 if (typeof translatedValue === 'string') {
  //                     const rightValue = translatedValue.split(':')[1];
  //                     if (rightValue) {
  //                         const trimmedValue = rightValue.trim();
  //                         translatedTemplate[key] = trimmedValue.endsWith('.') ? trimmedValue.slice(0, -1) : trimmedValue;
  //                     } else {
  //                         translatedTemplate[key] = '';
  //                     }
  //                 }
  //             }
  //         } else {
  //             translatedTemplate[key] = value;
  //         }
  //     }

  //     if (translatedTemplate) {
  //         context.res = {
  //             "status": 200,
  //             "headers": {
  //                 "Content-Type": "application/json"
  //             },
  //             "body": translatedTemplate
  //         }

  //     } else {
  //         context.res = {
  //             "status": 204,
  //             "headers": {
  //                 "Content-Type": "application/json"
  //             }
  //         }
  //     }

  //     try {
  //         await fs.writeFile(outputFile, JSON.stringify(translatedTemplate, null, 2), (err) => {
  //             if (err) throw err;
  //             console.log('Values saved to file');
  //         })
  //     } catch (err) {
  //         console.error(err);
  //     }

  //     return translatedTemplate;
  // }

  // const translatedTemplate = await translateValues(template, req.params.lang, outputFile);
  // console.log(translatedTemplate);

  // const updateLanguages = async (lang: string, newKey: string, newValue: string) => {
  //     const filePath = 'languages/pt.json';
  //     const newValueTranslated = newValue;
  //     const newTranslated = await translate(newValueTranslated, lang);
  //     console.info("newTranslated", newTranslated)
  //     const newTranslatedWord = JSON.parse(newTranslated)["Translation"]
  //     const jsonData = await fs.readFileSync(filePath, 'utf8');
  //     const jsonObj = JSON.parse(jsonData);
  //     const es = jsonObj;

  //     console.info('>>>>>>' + JSON.stringify(es))

  //     es[newKey] = newTranslatedWord;
  //     const esJSON = JSON.stringify(es, null, 2);

  //     console.info('>>>>>>' + esJSON)

  //     try {
  //         await fs.promises.writeFile(filePath, esJSON, 'utf8');
  //         console.log('Alterações salvas com sucesso.');
  //     } catch (err) {
  //         console.error(err);
  //         throw new Error('Erro ao gravar as alterações no arquivo JSON.');
  //     }

  //     return es;
  // };

  const updateAllLanguages = async (newKey: string, newValue: string) => {
    const langFiles = fs.readdirSync("languages");
    for (const file of langFiles) {
      if (file.endsWith(".json")) {
        const lang = file.split(".")[0];
        const filePath = `languages/${file}`;
        const jsonData = await fs.promises.readFile(filePath, "utf8");
        const jsonObj = JSON.parse(jsonData) as Language;
        if (file.includes("en.json")) {
          console.log(`skipping the file ${file}...`);
          continue;
        }
        const newValueTranslated = await translate(newValue, lang);
        const newTranslatedWord = JSON.parse(newValueTranslated)["Translation"];
        jsonObj[newKey] = newTranslatedWord;
        const esJSON = JSON.stringify(jsonObj, null, 2);

        try {
          await fs.promises.writeFile(filePath, esJSON, "utf8");
          console.log(`Changes successfully saved to the file ${file}.`);
        } catch (err) {
          console.error(err);
          throw new Error(`Error writing changes to file ${file}.`);
        }
      }
    }
  };

  const deleteKeyFromAllLanguages = async (keyToDelete: string) => {
    const languageFiles = fs.readdirSync("languages");

    for (const file of languageFiles) {
      if (file === "en.json") continue;

      const filePath = `languages/${file}`;
      const jsonData = await fs.promises.readFile(filePath, "utf8");
      const jsonObj = JSON.parse(jsonData);
      if (!(keyToDelete in jsonObj)) {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: { Message: "Key not found." },
        };
      } else {
        delete jsonObj[keyToDelete.trim()];

        const updatedJsonData = JSON.stringify(jsonObj, null, 2);

        try {
          await fs.promises.writeFile(filePath, updatedJsonData, "utf8");
          console.log(`Key ${keyToDelete} deleted successfully ${file}`);
        } catch (err) {
          console.error(err);
          throw new Error(`Error writing changes to file ${file}.`);
        }
      }
    }
  };

  const getLanguages = async (lang: string) => {
    try {
      const db = await database;
      const Languages = db.collection("i18n");
      const filter = {};
      filter[lang] = { $exists: true };
      const resp = Languages.find(filter);
      const body = await resp.toArray();

      if (body) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body[0][lang],
        };
      } else {
        context.res = {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting language pack for: ${lang}, error: ${error.message} `,
        "Error",
        "getLanguages()",
        "Language/{lang}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        statusText: "Can't get language",
      };
    }
  };

  const buildLanguagePackage = async (text: string, lang: string) => {
    await translate(text, lang);
    return;

    try {
      const db = await database;

      const Languages = db.collection("i18n");

      const resp = Languages.find({});

      const body = await resp.toArray();
      const items = body[0]["en"];

      for (let key in items) {
        //     console.info(key + ': ' + items[key]);
      }

      if (body) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: "Ok",
        };
      } else {
        context.res = {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        statusText: "Can't get language",
      };
    }
  };

  switch (req.method) {
    case "GET":
      await getLanguages(req.params.lang);
      break;
    case "POST":
      await translateObjectValues(req.body.lang);
      break;
    case "PUT":
      await updateAllLanguages(req.body.newKey, req.body.newValue);
      break;
    case "DELETE":
      await deleteKeyFromAllLanguages(req.body.keyToDelete);
      break;
    default:
      break;
  }
};

export default httpTrigger;
