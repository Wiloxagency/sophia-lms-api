import MercadoPago, { PreApprovalPlan } from 'mercadopago';


const mercadoPagoToken: string = process.env.MERCADO_PAGO_TOKEN;
const backendUrl = process.env.BACKEND_URL;

async function MPcreateSubscriptionPlan(amount: number, frequency: number, frequencyType: string, context: string) {
    var preApproval = null;
    try {
        // console.log("token", mercadoPagoToken);

        const client = new MercadoPago(
            {
                accessToken: mercadoPagoToken
            }
        );
        
        const preApprovalPlan = new PreApprovalPlan(client);
        preApproval = await preApprovalPlan.create({ body: {
            back_url: backendUrl,
            reason: context,
            auto_recurring:	{
                currency_id: 'CLP',
                transaction_amount: amount,
                frequency: frequency,
                frequency_type: frequencyType,
            }
        } });
    } catch (error) {
        console.log("Error:", error);
    }

    console.log(preApproval);
    return preApproval;
    
}


async function MPcreateSubscription() {

}

export { MPcreateSubscriptionPlan, MPcreateSubscription }