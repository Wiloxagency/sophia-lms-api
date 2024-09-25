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

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
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

  let htmlToSend;

  // const testUsers = [
  //     {
  //         "name": "Leo Leto",
  //         "email": "LeoLeto@proton.me"
  //     },
  //     // {
  //     //     "name": "Leonardo José",
  //     //     "email": "Leonardojbarreto@gmail.com"
  //     // },
  //     {
  //         "name": "Leonardo Daniel",
  //         "email": "Lexp2008@gmail.com"
  //     }
  // ]

  // const testGenericEmailPayload = {
  //     "subject": "Course starting soon 🚀",
  //     "message": "The course you enrolled in is about to begin.",
  //     "recipients": [
  //         {
  //             "name": "Leo Leto",
  //             "email": "LeoLeto@proton.me"
  //         }, {
  //             "name": "Leonardo Daniel",
  //             "email": "Lexp2008@gmail.com"
  //         }
  //     ]
  // }

  async function sendWelcomeEmail() {
    const source = fs
      .readFileSync("nodemailer/templates/index-welcome-v3.html", "utf-8")
      .toString();
    const template = handlebars.compile(source);
    for (const [indexUser, user] of req.body.recipients.entries()) {
      // for (const [indexUser, user] of req.body.entries()) {
      const replacements = {
        username: user.name,
        courseName: req.body.data.courseName,
        startDate: req.body.data.startDate,
        endDate: req.body.data.endDate,
      };
      htmlToSend = template(replacements);

      try {
        const info = await transporter.sendMail({
          from: '"Sophia" <hola@iasophia.com>',
          to: user.email,
          // bcc: "LeoLeto@protonmail.com, Lexp2008@gmail.com, Leonardojbarreto@gmail.com",
          subject: "¡Tu curso está por comenzar! 🎓",
          // text: "Hello world",
          // html: await readFile('nodemailer/welcome.html', 'utf8'),
          html: htmlToSend,
        });
        if (info) {
          context.res = {
            // status: 200, /* Defaults to 200 */
            body: info,
          };
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function sendGenericEmail() {
    const source = fs
      .readFileSync("nodemailer/templates/generic.html", "utf-8")
      .toString();
    const template = handlebars.compile(source);
    for (const [indexUser, user] of req.body.recipients.entries()) {
      // for (const [indexUser, user] of req.body.entries()) {
      const replacements = {
        username: user.name,
        message: req.body.message,
      };
      htmlToSend = template(replacements);

      try {
        const info = await transporter.sendMail({
          from: '"Sophia" <hola@iasophia.com>',
          to: user.email,
          // bcc: "LeoLeto@protonmail.com, Lexp2008@gmail.com, Leonardojbarreto@gmail.com",
          subject: req.body.subject,
          // text: "Hello world",
          // html: await readFile('nodemailer/welcome.html', 'utf8'),
          html: htmlToSend,
        });
        if (info) {
          context.res = {
            // status: 200, /* Defaults to 200 */
            body: info,
          };
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  switch (req.query.emailTemplate) {
    case "welcome":
      sendWelcomeEmail();
      break;

    case "generic":
      sendGenericEmail();
      break;
  }
};

export default httpTrigger;
