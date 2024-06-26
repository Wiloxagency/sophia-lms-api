import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as aws from "@aws-sdk/client-ses";
import path = require("path");
import handlebars = require("handlebars");

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
        SES: { ses, aws },
        sendingRate: 14
    })

    let htmlToSend

    async function sendNotificationEmail() {
        const source = fs.readFileSync('EmailNotification/notification.html', 'utf-8').toString()
        const template = handlebars.compile(source)

        const replacements = {
            username: req.body.username,
            title: req.body.title,
            //startDate: req.headers.startDate,
            message: req.body.message
        }
        htmlToSend = template(replacements)

        try {
            const info = await transporter.sendMail({
                from: '"Sophia" <hola@iasophia.com>',
                to: req.body.email,
                subject: req.body.title,
                html: htmlToSend
            })
            if (info) {
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: info
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    switch (req.query.emailTemplate) {
        case 'notification':
            sendNotificationEmail()
            break
    }

}

export default httpTrigger