import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { userAggregation } from "../User/aggregation";
import bcrypt = require("bcryptjs");
import { saveLog } from "../shared/saveLog";
const database = createConnection()
import { MPcreateSubscriptionPlan, MPcreateSubscription } from "./mercadoPago";
import { ObjectId } from "mongodb";
import { getTokenFromReq } from "../FreelanceLogin/jwt";
import { get } from "request-promise";
import { JwtPayload, TokenExpiredError } from "jsonwebtoken";


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
  console.log("--------------------------------")

  var token: JwtPayload | null = null;

  try {
    token = getTokenFromReq(req)
    console.log("Token: ", token)
    
  } catch (error) {
    console.log("Error getting token: ", error.name)
    if (error instanceof TokenExpiredError) {
      context.res = {
        "status": 401,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "message": "Token expired"
        }
      }
    } else {
      context.res = {
        "status": 401,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "message": "Invalid token"
        }
      }
    }
    return;
  }
  const userId = token.user._id
  console.log("userId", userId)
  
  const db = await database
  const Plans = db.collection('freelancePlans')
  const Users = db.collection('freelanceUser')

  const user = await Users.findOne({ _id: new ObjectId(userId) })


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

  const createPayment = async (plan: any) => {

    try {
      const user = await Users.findOne({ _id: new ObjectId(plan.userId) })
      console.log("User", user)

      if (true) {
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

      // plan.paymentMethods.push({ name: "mercadoPago", planId: MPPlanId })

      // console.log(plan)
      // Plans.insertOne(plan);

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
      await createPayment(req.body);
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