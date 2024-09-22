import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Stripe from "stripe";
import { createConnection } from "../shared/mongo";
const database = createConnection();

const FRONTEND_URL: string = process.env.FRONTEND_URL as string;

const STRIPE_SK = process.env.STRIPE_SK;
const stripe = new Stripe(STRIPE_SK);
const endpointSecret =
  "whsec_26a0718cb39c8e990e9f48fcd9150af234265e99cbfee948e6adadb977012a01";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  async function createCheckoutSession() {
    try {
      let stripeCustomerId = req.body.stripeCustomerId;

      // IF USER DOESN'T ALREADY HAVE A STRIPE CUSTOMER OBJECT
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          name: req.body.name,
          email: req.body.email,
        });
        stripeCustomerId = customer.id;

        const db = await database;
        const users = db.collection("user");
        const user = users.updateOne(
          { email: req.body.email },
          { $set: { stripeCustomerId: stripeCustomerId } }
        );
      }

      const successUrl =
        (FRONTEND_URL === "localhost:4200" ? "http://" : "https://") +
        FRONTEND_URL +
        "/profile";

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        success_url: successUrl,
        line_items: [
          {
            price: req.body.priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
      });
      context.res = {
        headers: {
          "Content-Type": "application/json",
        },
        body: { sessionUrl: session.url },
      };
    } catch (error) {
      console.error(error);
    }
  }

  async function webhook() {
    const payload = req.rawBody;
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      fulfillCheckout(event.data.object.id);
    }
  }

  async function fulfillCheckout(sessionId: string) {
    console.log("sessionId: ", sessionId);
    // const sessionId = req.body.sessionId;
    const stripe = require("stripe")(STRIPE_SK);
    // TODO: Make this function safe to run multiple times,
    // even concurrently, with the same session ID

    // TODO: Make sure fulfillment hasn't already been
    // peformed for this Checkout Session

    // Retrieve the Checkout Session from the API with line_items expanded
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    // console.log("checkoutSession: ", checkoutSession.line_items.data.price.id)
    console.log("checkoutSession: ", checkoutSession);

    const userEmail = checkoutSession.customer_details.email;
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setMonth(currentDate.getMonth() + 1);
    const db = await database;
    const users = db.collection("user");
    const user = users.updateOne(
      { email: userEmail },
      { $set: { subscriptionExpiryDate: futureDate, credits: 20000 } }
    );

    // Check the Checkout Session's payment_status property
    // to determine if fulfillment should be peformed
    if (checkoutSession.payment_status !== "unpaid") {
      // TODO: Perform fulfillment of the line items
      // TODO: Record/save fulfillment status for this
      // Checkout Session
    }
  }

  switch (req.method) {
    // case "GET":
    //   await getSubscriptionPlans();
    //   break;
    case "POST":
      if (req.query.checkoutSessionCompletedWebhook) {
        await webhook();
      } else {
        await createCheckoutSession();
        break;
      }
    default:
      break;
  }
};

export default httpTrigger;
