import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as aws from "@aws-sdk/client-ses";

const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const nodemailer = require("nodemailer")

const ACCESS_KEY = "AKIATQROT3YEBW362I2Q"
const SECRET_ACCESS_KEY = "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"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const ses = new aws.SES({
        apiVersion: "2010-12-01",
        region: "us-east-2",
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
                from: '"Sophia" <hola@iasophia.com>',
                to: [],
                bcc: "LeoLeto@protonmail.com",
                subject: "Hello from Sophia 🎓",
                // text: "Hello world", 
                html: await readFile('nodemailer/welcome.html', 'utf8'), //
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