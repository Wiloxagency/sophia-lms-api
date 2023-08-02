import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as aws from "@aws-sdk/client-ses";
import path = require("path");
import handlebars = require("handlebars");

const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const nodemailer = require("nodemailer")

// TODO: TURN THIS INTO ENVIRONMENT VARIABLES 👇🏼
const ACCESS_KEY = "AKIATQROT3YEBW362I2Q"
const SECRET_ACCESS_KEY = "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"
let htmlToSend

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

export async function sendScormDownloadEmail(recipientEmail: string, SCORMFileName: string): Promise<any> {
    console.log(SCORMFileName)
    // TODO: TURN THIS INTO AN ENVIRONMENT VARIABLE 👇🏼
    const SCORMUrl = 'https://sophieassets.blob.core.windows.net/scorms/' + SCORMFileName

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

export async function sendFailedSCORMCreationEmail(recipientEmail: string): Promise<any> {
    const source = fs.readFileSync('nodemailer/generic.html', 'utf-8').toString()
    const template = handlebars.compile(source)
    // for (const [indexUser, user] of req.body.entries()) {
    const replacements = {
        // username: user.name,
        message: "Hubo un error al generar el SCORM. Por favor intenta de nuevo. Si el problema persiste, comunícate con tu administrador."
    }
    htmlToSend = template(replacements)

    try {
        const info = await transporter.sendMail({
            from: '"Sophia" <hola@iasophia.com>',
            to: recipientEmail,
            // bcc: "LeoLeto@protonmail.com, Lexp2008@gmail.com, Leonardojbarreto@gmail.com",
            subject: "Error al generar SCORM",
            // text: "Hello world", 
            // html: await readFile('nodemailer/welcome.html', 'utf8'), 
            html: htmlToSend
        })
    } catch (error) {
        console.log(error)
    }

}