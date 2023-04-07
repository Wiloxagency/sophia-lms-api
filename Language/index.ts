import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {


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
    
    
    switch (req.method) {
        case "GET":
            await getLanguages(req.params.lang)
            break;
      
        default:
            break;
    }

}

export default httpTrigger;