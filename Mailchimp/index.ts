import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { v4 as uuidv } from "uuid"
import { saveLog } from "../shared/saveLog";
import { createHash } from 'crypto';

const mailchimp = require('@mailchimp/mailchimp_marketing');

mailchimp.setConfig({
    apiKey: "6e02af28f86bb15f870ef955a8fad4e5-us8",
    server: "us8",
})

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const listId = "5db638bb59"

    async function mailchimpPing() {
        const response = await mailchimp.ping.get();
        console.log(response);
    }

    //  CAN'T CREATE ANY AUDICENCES ON THE FREE TIER
    async function createMailList() {
        const groupName = 'Group name ' + uuidv()

        const footerContactInfo = {
            company: "Mailchimp",
            address1: "675 Ponce de Leon Ave NE",
            address2: "Suite 5000",
            city: "Atlanta",
            state: "GA",
            zip: "30308",
            country: "US"
        };

        const campaignDefaults = {
            from_name: "Gettin' Together",
            from_email: "gettintogether@example.com",
            subject: "JS Developers Meetup",
            language: "EN_US"
        };

        try {
            const response = await mailchimp.lists.createList({
                name: groupName,
                contact: footerContactInfo,
                permission_reminder: "permission_reminder",
                email_type_option: true,
                campaign_defaults: campaignDefaults
            });
            console.log(
                `Successfully created an audience. The audience id is ${response.id}.`
            );

        } catch (error) {
            await saveLog(`Error creating audience. ` + error.message, "Error", "createMailList()", "Mailchimp/")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": error.toString()
                }
            }
        }
    }

    async function addUserToList() {
        const subscribingUser = {
            firstName: "Prudence",
            lastName: "McVankab",
            email: "LeoLeto@proton.me"
        }

        try {
            const response = await mailchimp.lists.addListMember(listId, {
                email_address: subscribingUser.email,
                status: "subscribed",
                merge_fields: {
                    FNAME: subscribingUser.firstName,
                    LNAME: subscribingUser.lastName
                }
            });

            console.log(
                `Successfully added contact as an audience member. The contact's id is ${response.id
                }.`
            );

        } catch (error) {
            console.log(error.message)
        }
    }

    async function unsubscribeUser() {
        const email = "LeoLeto@proton.me"

        console.log(hashText(email.toLowerCase()))
        const subscriberHash = hashText(email.toLowerCase())
        const response = await mailchimp.lists.updateListMember(
            listId,
            subscriberHash,
            {
                status: "unsubscribed"
            }
        );

        console.log(`This user is now ${response.status}.`);
    }

    async function sendTestEmail() {
        try {
            const response = await mailchimp.campaigns.sendTestEmail("9b789d8d4a", {
                // test_emails: ["LeoLeto@proton.me"],
                test_emails: ["Lexp2008@gmail.com"],
                send_type: "plaintext",
            });
            console.log(response);
        } catch (error) {
            console.log(error.status)
            console.log(error.message)
        }
    }

    async function createCampaign() {
        try {
            const response = await mailchimp.campaigns.create({
                type: "plaintext",
                recipients: {
                    segment_opts: {
                        saved_segment_id: 5168445
                    },
                    list_id: listId
                },
                settings: {
                    subject_line: 'subject_line',
                    // preview_text: 'previewText',
                    title: "title" + uuidv(),
                    // template_id: tempalteId,
                    from_name: 'fromName',
                    // reply_to: 'replyTo',
                    // to_name: "*|FNAME|*",
                    // auto_footer: true,
                    // inline_css: true,
                }
            })
            // console.log(response)
        } catch (error) {
            console.log(error)
            await saveLog(`Error creating campaign. ` + error.message, "Error", "createCampaign()", "Mailchimp/")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": error.toString()
                }
            }
        }

    }

    async function sendCampaign() {
        console.log('THIS RUNS')
        try {
            const response = await mailchimp.campaigns.send("9b789d8d4a")
            console.log(response)
        } catch (error) {
            await saveLog(`Error sending campaign. ` + error.message, "Error", "sendCampaign()", "Mailchimp/")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": error.toString()
                }
            }
        }
    }

    async function getSegments() {
        const response = await mailchimp.lists.listSegments(listId)
        console.log(response)
    }

    async function createStaticSegment() {
        let emails = ['LeoLeto@proton.me']
        try {
            const response = await mailchimp.lists.createSegment(listId, {
                name: uuidv(),
                static_segment: emails
            })
            console.log(response)
        } catch (error) {
            await saveLog(`Error creating segmen. ` + error.message, "Error", "createStaticSegment()", "Mailchimp/")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": error.toString()
                }
            }
        }
    }

    function hashText(text) {
        const hashFunc = createHash('md5');   // you can also sha256, sha512 etc
        hashFunc.update(text);
        return hashFunc.digest('hex');       // will return hash, formatted to HEX
    }

    switch (req.query.operation) {
        case 'ping':
            mailchimpPing()
            break
        case 'createMailList':
            createMailList()
            break
        case 'addUserToList':
            addUserToList()
            break
        case 'unsubscribeUser':
            unsubscribeUser()
            break
        case 'sendTestEmail':
            sendTestEmail()
            break
        case 'sendCampaign':
            sendCampaign()
            break
        case 'getSegments':
            getSegments()
            break
        case 'createStaticSegment':
            createStaticSegment()
            break
        case 'createCampaign':
            createCampaign()
            break
    }

}

export default httpTrigger