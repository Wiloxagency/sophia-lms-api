import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Stripe from "stripe";
import { createConnection } from "../shared/mongo";
const database = createConnection();

const FRONTEND_URL: string = process.env.FRONTEND_URL as string;

const STRIPE_SK = process.env.STRIPE_SK;
const stripe = new Stripe(STRIPE_SK);

type SubscriptionPlan = {
  name: string;
  credits: number;
  prices: {
    USD: number;
    EUR: number;
    CLP: number;
    BRL: number;
  };
  priceCode: string;
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  async function getSubscriptionPlans() {
    const products = await stripe.products.list({
      active: true,
    });

    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.currency_options"],
    });

    // Create a map of product ID to its price information
    const priceMap = new Map<string, any>();

    prices.data.forEach((price) => {
      // Ensure that price.product is a string (product ID) before using it
      if (typeof price.product === "string") {
        const productPrice = {
          USD: price.currency_options?.usd?.unit_amount ?? 0,
          EUR: price.currency_options?.eur?.unit_amount ?? 0,
          CLP: price.currency_options?.clp?.unit_amount ?? 0,
          BRL: price.currency_options?.brl?.unit_amount ?? 0,
        };
        priceMap.set(price.product, productPrice);
      }
    });

    const subscriptionPlans: SubscriptionPlan[] = products.data
      .map((product) => {
        const price = prices.data.find((p) => p.product === product.id);

        return {
          name: product.name,
          credits: parseInt(product.name.replace(/\D/g, ""), 10), // Credits extracted from name
          prices: {
            USD: price?.currency_options?.usd?.unit_amount || 0,
            EUR: price?.currency_options?.eur?.unit_amount || 0,
            CLP: price?.currency_options?.clp?.unit_amount || 0,
            BRL: price?.currency_options?.brl?.unit_amount || 0,
          },
          priceCode: price?.id || "", // Assign the priceCode here
        };
      })
      .sort((a, b) => a.credits - b.credits); // Sort by the least amount of credits

    // console.log(subscriptionPlans);

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
        body: { sessionUrl: session.url },
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
