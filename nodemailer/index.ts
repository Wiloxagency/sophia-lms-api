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

    const testUsers = [
        {
            "name": "Leo Leto",
            "email": "LeoLeto@proton.me"
        }, {
            "name": "Leonardo José",
            "email": "Leonardojbarreto@gmail.com"
        }, {
            "name": "Leonardo Daniel",
            "email": "Lexp2008@gmail.com"
        }
    ]

    async function sendEmail() {
        let htmlToSend

        if (req.query.emailTemplate == 'welcome') {
            const source = fs.readFileSync('nodemailer/welcome.html', 'utf-8').toString()
            const template = handlebars.compile(source)
            for (const [indexUser, user] of testUsers.entries()) {
            // for (const [indexUser, user] of req.body.entries()) {
                const replacements = {
                    username: user.name
                }
                htmlToSend = template(replacements)

                try {
                    const info = await transporter.sendMail({
                        from: '"Sophia" <hola@iasophia.com>',
                        to: user.email,
                        // bcc: "LeoLeto@protonmail.com, Lexp2008@gmail.com, Leonardojbarreto@gmail.com",
                        subject: "Hello from Sophia 🎓",
                        // text: "Hello world", 
                        // html: await readFile('nodemailer/welcome.html', 'utf8'), 
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

        }

    }

    sendEmail()

}

export default httpTrigger