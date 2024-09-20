import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Stripe from "stripe";
const STRIPE_SK = process.env.STRIPE_SK;
const stripe = new Stripe(STRIPE_SK);

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  async function createCheckoutSession() {
    let customerId = req.body.customerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: req.body.name,
        email: req.body.email,
      });
      customerId = customer.id;

      // UPDATE USER HERE
    }

    console.log("customer: ", customerId);

    return

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      success_url: "https://example.com/success",
      line_items: [
        {
          // Price for Plan 20.000 Créditos
          //   price: "price_1PvSk6RsASo6ld22PpIYmBEm",
          price: req.body.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
    });
    console.log("session: ");
    context.res = {
      headers: {
        "Content-Type": "application/json",
      },
      body: { sessioUrl: session.url },
    };
  }

  switch (req.method) {
    // case "GET":
    //   await getSubscriptionPlans();
    //   break;
    case "POST":
      await createCheckoutSession();
      break;
    default:
      break;
  }
};

export default httpTrigger;
