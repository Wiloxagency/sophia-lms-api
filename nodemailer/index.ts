import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as aws from "@aws-sdk/client-ses";
const nodemailer = require("nodemailer")

const ACCESS_KEY = "AKIATQROT3YEBW362I2Q"
const SECRET_ACCESS_KEY = "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"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const ses = new aws.SES({
        apiVersion: "2010-12-01",
        region: "sa-east-1",
        credentials: {
            accessKeyId: ACCESS_KEY,
            secretAccessKey: SECRET_ACCESS_KEY,
        },
    })

    const transporter = nodemailer.createTransport({
        SES: { ses, aws }
    })

    async function sendEmail() {
        try {
            const info = await transporter.sendMail({
                from: '"Sophia" <hola@iasophia.com>', // sender address
                to: "hola@iasophia.com>", // list of receivers
                subject: "Hello ✔", // Subject line
                text: "Hello world?", // plain text body
                // html: "<b>Hello world?</b>", // html body
            })
            if (info) {
                console.log(info)
                return
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: info
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    sendEmail()

}

export default httpTrigger