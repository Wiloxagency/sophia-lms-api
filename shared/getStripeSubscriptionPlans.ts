import Stripe from "stripe";
import { SubscriptionPlan } from "../Stripe";

const STRIPE_SK = process.env.STRIPE_SK;
const stripe = new Stripe(STRIPE_SK);

export async function getStripeSubscriptionPlans() {
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

  return subscriptionPlans;
}
