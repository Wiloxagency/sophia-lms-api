import { AzureFunction, Context } from "@azure/functions"
import { AsyncPromptCycle } from "../CreateContent/asyncCreateDallePrompt";
import { AsyncTextToSpeechCycle } from "../CreateContent/asyncCreateAudios";
import { AsyncDalleImgCycle } from "../CreateContent/asyncCreateDalleImage";
import { AsyncTitleCycle } from "../CreateContent/asyncCreateTitles";
import { AsyncVecteezyCycle } from "../CreateContent/asyncVecteezy";
import { AsyncPexelsCycle } from "../CreateContent/asyncPexels";

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('Timer function is running late!');
    }
    context.log('Timer trigger function ran!', timeStamp);   

    AsyncPromptCycle()
    AsyncTextToSpeechCycle()
    AsyncTitleCycle()
    
    setTimeout(() => {
        AsyncDalleImgCycle()
        AsyncVecteezyCycle()
        AsyncPexelsCycle()
    }, 15000);
};

export default timerTrigger;
