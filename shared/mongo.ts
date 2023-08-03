import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const config = {
  url: process.env.MONGODB_ATLAS_URI,
  dbName: process.env.MONGODB_ATLAS_DATABASE
};

const options = {
  connectTimeoutMS: 100000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
};

const client = new MongoClient(config.url, options);

async function createConnection() {
  const db = client.db(config.dbName);
  return db;
}

export { createConnection, client };
