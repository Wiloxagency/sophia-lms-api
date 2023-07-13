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

export async function sendScormDownloadEmail(recipientEmail: string, SCORMFileName: string): Promise<any> {

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

    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    console.log(recipientEmail)
    // console.log(SCORMFileName)
    // TODO: TURN THIS INTO AN ENVIRONMENT VARIABLE 👇🏼
    const SCORMUrl = 'https://sophieassets.blob.core.windows.net/scorms/' + SCORMFileName
    console.log(SCORMUrl)
    https://sophiaassets.blob.core.windows.net/images/
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')

    const source = fs.readFileSync('nodemailer/generic.html', 'utf-8').toString()
    const template = handlebars.compile(source)
    // for (const [indexUser, user] of req.body.entries()) {
    const replacements = {
        // username: user.name,
        message: "El enlace de descarga de tu SCORM es:" + SCORMUrl
    }
    htmlToSend = template(replacements)

    try {
        const info = await transporter.sendMail({
            from: '"Sophia" <hola@iasophia.com>',
            to: recipientEmail,
            // bcc: "LeoLeto@protonmail.com, Lexp2008@gmail.com, Leonardojbarreto@gmail.com",
            subject: "Enlace de descarga de SCORM",
            // text: "Hello world", 
            // html: await readFile('nodemailer/welcome.html', 'utf8'), 
            html: htmlToSend
        })
    } catch (error) {
        console.log(error)
    }

}