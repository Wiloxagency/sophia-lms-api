import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Stripe from "stripe";
import { createConnection } from "../shared/mongo";
const database = createConnection();

const STRIPE_SK = process.env.STRIPE_SK;
const stripe = new Stripe(STRIPE_SK);

const stripeWebhookEndpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;

const stripeProducts = [
  {
    name: "Plan 3.000 Créditos",
    credits: 3000,
    courses: 6,
    usd: 100,
    priceId: "price_1Q2egpRsASo6ld227KhxelX7",
  },
  {
    name: "Plan 7.000 Créditos",
    courses: 14,
    credits: 7000,
    usd: 200,
    priceId: "price_1Q2ehfRsASo6ld22ftutxYlq",
  },
  {
    name: "Plan 20.000 Créditos",
    courses: 30,
    credits: 20000,
    usd: 500,
    priceId: "price_1Q2ei3RsASo6ld22yGulImWn",
  },
];

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const payload = req.rawBody;
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      stripeWebhookEndpointSecret
    );
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    fulfillCheckout(event.data.object.id);
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
    console.log("checkoutSession: ", checkoutSession);

    console.log(
      "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
    );
    console.log("checkoutSession.line_items: ", checkoutSession.line_items);
    console.log(
      "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
    );
    console.log(
      "checkoutSession.line_items.price: ",
      checkoutSession.line_items.price
    );

    const productPurchasedPriceId = checkoutSession.line_items.data.price.id;

    const productPurchased = stripeProducts.find(
      (item) => item.priceId === productPurchasedPriceId
    );
    const creditsToAdd = productPurchased?.credits;

    const userEmail = checkoutSession.customer_details.email;
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setMonth(currentDate.getMonth() + 1);
    const db = await database;
    const users = db.collection("user");
    const user = users.updateOne(
      { email: userEmail },
      { $set: { subscriptionExpiryDate: futureDate, credits: creditsToAdd } }
    );

    // Check the Checkout Session's payment_status property
    // to determine if fulfillment should be peformed
    if (checkoutSession.payment_status !== "unpaid") {
      // TODO: Perform fulfillment of the line items
      // TODO: Record/save fulfillment status for this
      // Checkout Session
    }
  }
};

export default httpTrigger;
