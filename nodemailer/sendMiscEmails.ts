import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as aws from "@aws-sdk/client-ses";
import path = require("path");
import handlebars = require("handlebars");

const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const nodemailer = require("nodemailer");

const AWS_SES_ACCESS_KEY = process.env.AWS_SES_ACCESS_KEY;
const AWS_SES_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY;
let htmlToSend;

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: "us-east-2",
  credentials: {
    accessKeyId: AWS_SES_ACCESS_KEY,
    secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
  },
});

const transporter = nodemailer.createTransport({
  SES: { ses, aws },
  sendingRate: 14,
});

export async function sendScormUnderConstructionEmail(
  recipientEmail: string,
  recipientName: string,
  courseName: string
): Promise<any> {
  // TODO: TURN THIS INTO AN ENVIRONMENT VARIABLE 👇🏼
  // const SCORMUrl = 'https://sophieassets.blob.core.windows.net/scorms/' + SCORMFileName

  const source = fs
    .readFileSync("nodemailer/templates/index-creating-scorm-v3.html", "utf-8")
    .toString();
  const template = handlebars.compile(source);
  // for (const [indexUser, user] of req.body.entries()) {
  const replacements = {
    username: recipientName,
    courseName: courseName,
  };
  htmlToSend = template(replacements);

  try {
    const info = await transporter.sendMail({
      from: '"Sophia" <hola@iasophia.com>',
      to: recipientEmail,
      // bcc: "LeoLeto@protonmail.com, Lexp2008@gmail.com, Leonardojbarreto@gmail.com",
      subject: "Tu SCORM está siendo creado ⚙️",
      // text: "Hello world",
      // html: await readFile('nodemailer/welcome.html', 'utf8'),
      html: htmlToSend,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function sendFailedSCORMCreationEmail(
  recipientEmail: string
): Promise<any> {
  // console.log('ERROR CREATING SCORM. EMAIL WILL BE SEND TO: ' + recipientEmail)
  const source = fs
    .readFileSync("nodemailer/templates/generic.html", "utf-8")
    .toString();
  const template = handlebars.compile(source);
  // for (const [indexUser, user] of req.body.entries()) {
  const replacements = {
    // username: user.name,
    message:
      "Hubo un error al generar el SCORM. Por favor intenta de nuevo. Si el problema persiste, comunícate con tu administrador.",
  };
  htmlToSend = template(replacements);

  try {
    const info = await transporter.sendMail({
      from: '"Sophia" <hola@iasophia.com>',
      to: recipientEmail,
      // bcc: "LeoLeto@protonmail.com, Lexp2008@gmail.com, Leonardojbarreto@gmail.com",
      subject: "Error al generar SCORM",
      // text: "Hello world",
      // html: await readFile('nodemailer/welcome.html', 'utf8'),
      html: htmlToSend,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function sendSCORMDownloadLinkEmail(
  recipientEmail: string,
  recipientName: string,
  courseName: string,
  SCORMFileName: string
) {
  const source = fs
    .readFileSync("nodemailer/templates/generic.html", "utf-8")
    .toString();
  const template = handlebars.compile(source);
  const replacements = {
    username: recipientName,
    message:
      "El enlace de descarga de tu SCORM para el curso " +
      courseName +
      " es: " +
      "https://sophieassets.blob.core.windows.net/scorms/" +
      SCORMFileName,
  };
  htmlToSend = template(replacements);

  try {
    const info = await transporter.sendMail({
      from: '"Sophia" <hola@iasophia.com>',
      to: recipientEmail,
      // bcc: "LeoLeto@protonmail.com, Lexp2008@gmail.com, Leonardojbarreto@gmail.com",
      subject: "Tu SCORM está listo 💡",
      // text: "Hello world",
      // html: await readFile('nodemailer/welcome.html', 'utf8'),
      html: htmlToSend,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function sendValidationEmail(
  recipientEmail: string,
  recipientName: string,
  receivedEmailVerificationLink: string
): Promise<any> {
  const source = fs
    .readFileSync("nodemailer/templates/emailVerification.html", "utf-8")
    .toString();
  const template = handlebars.compile(source);
  // for (const [indexUser, user] of req.body.entries()) {
  const replacements = {
    username: recipientName,
    emailVerificationLink: receivedEmailVerificationLink,
  };
  htmlToSend = template(replacements);

  try {
    const sendEmailResponse = await transporter.sendMail({
      from: '"Sophia" <hola@iasophia.com>',
      to: recipientEmail,
      // bcc: "LeoLeto@protonmail.com, Lexp2008@gmail.com, Leonardojbarreto@gmail.com",
      subject: "Verify your email 🚀",
      // text: "Hello world",
      // html: await readFile('nodemailer/welcome.html', 'utf8'),
      html: htmlToSend,
    });
    // console.log("Message sent: %s", sendEmailResponse.messageId);
  } catch (error) {
    console.log(error);
  }
}
