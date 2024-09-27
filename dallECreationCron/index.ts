import { AzureFunction, Context } from "@azure/functions"
import { aiImageCreation } from "./dallECreationCycle";

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('Timer function is running late!');
    }
    context.log('Timer trigger function ran!', timeStamp);   

    aiImageCreation()
};

export default timerTrigger;
