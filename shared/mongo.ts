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

async function createConnection() {
  const connection = await MongoClient.connect(config.url, options);
  const db = connection.db(config.dbName);
  return db;
}

export { createConnection };
