import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Stripe from "stripe";
import { createConnection } from "../shared/mongo";
import { getStripeSubscriptionPlans } from "../shared/getStripeSubscriptionPlans";
const database = createConnection();

const FRONTEND_URL: string = process.env.FRONTEND_URL as string;

const STRIPE_SK = process.env.STRIPE_SK;
const stripe = new Stripe(STRIPE_SK);

export type SubscriptionPlan = {
  name: string;
  credits: number;
  prices: {
    USD: number;
    EUR: number;
    CLP: number;
    BRL: number;
  };
  priceCode: string;
  type: "one_time" | "recurring";
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  async function getSubscriptionPlans() {
    const subscriptionPlans = await getStripeSubscriptionPlans();

    context.res = {
      headers: {
        "Content-Type": "application/json",
      },
      body: subscriptionPlans,
    };
  }

  async function createCheckoutSession() {
    try {
      let stripeCustomerId = req.body.stripeCustomerId;
      console.log("stripeCustomerId: ", stripeCustomerId);

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
        currency: req.body.currency,
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
        body: { sessionUrl: session.url, stripeCustomerId: stripeCustomerId },
      };
    } catch (error) {
      console.error(error);
    }
  }

  switch (req.method) {
    case "GET":
      await getSubscriptionPlans();
      break;
    case "POST":
      await createCheckoutSession();
      break;

    default:
      break;
  }
};

export default httpTrigger;
