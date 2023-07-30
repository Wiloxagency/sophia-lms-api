import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const config = {
  url: "mongodb+srv://sophiaAdmin:KnglZ12F9sJbO5ep@cluster0.e8lnn.mongodb.net/?retryWrites=true&w=majority",
  dbName: "sophia_qa",
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
