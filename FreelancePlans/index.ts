import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { userAggregation } from "../User/aggregation";
import bcrypt = require("bcryptjs");
import { saveLog } from "../shared/saveLog";
const database = createConnection()
import { MPcreateSubscriptionPlan, MPcreateSubscription } from "./mercadoPago";
import { ObjectId } from "mongodb";


const payingApis = [
  {
    name: "mercadoPago",
    createSubscription: MPcreateSubscription,
    createSubscriptionPlan: MPcreateSubscriptionPlan
  }

]


const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const db = await database
  const Plans = db.collection('freelancePlans')

  console.log(req.headers)

  const getPlans = async () => {
    try {
      const resp = Plans.find()
      const plans = await resp.toArray()
      context.res = {
        "status": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "plans": plans
        
        }
      }
    } catch (error) {
      console.log(error)
      context.res = {
        "status": 500,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "message": "Error getting plans"
        }
      }
    }
  }

  const createPlan = async (plan: any) => {

    try {
      // store plan in mongoDB
      // Plans.insertOne(plan);

      // create plan in mercadoPago context
      const MPPlan = await MPcreateSubscriptionPlan(plan.price, plan.frequency, plan.frequencyType, plan.context)

      console.log("MPPlan!!!", MPPlan)

      if (!MPPlan) {
        context.res = {
          "status": 500,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            "message": "Error creating plan in MercadoPago"
          }
        }
        return;
      }

      const MPPlanId = MPPlan.id
      plan.paymentMethods.push({ name: "mercadoPago", planId: MPPlanId })

      console.log(plan)
      Plans.insertOne(plan);

    }
    catch (error) {
      console.log(error)
      context.res = {
        "status": 500,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "message": "Error creating plan"
        }
      }
    }


    context.res = {
      "status": 200,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "plan": plan,
        "message": "Plan created"
      
      }
    }
    
  }

  const deletePlan = async (keyToDelete: string) => {
    try {
      console.log("Deleting plan", keyToDelete)
      // const plan = await Plans.updateOne(
      //   { id: keyToDelete }, { $set: { available: false } }
      //   )
      const plan = await Plans.findOneAndUpdate(
        { _id: new ObjectId(keyToDelete) }, { $set: { available: false } }
        )
      console.log("Plan to delete", plan)
      // await Plans.updateOne({ key: keyToDelete }, { $set: plan })
    } catch (error) {
      console.log(error)
      context.res = {
        "status": 500,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "message": "Error deleting plan"
        }
      }
    }
  }




  switch (req.method) {
    case "GET":
      await getPlans();
      break;
    case "POST":
      await createPlan(req.body.plan);
      break;
    // case "PUT":
    //   await updateAllLanguages(req.body.newKey, req.body.newValue);
    //   break;
    case "DELETE":
      console.log(req.body)
      await deletePlan(req.body.keyToDelete);
      break;
    default:
      break;
  }

};

export default httpTrigger