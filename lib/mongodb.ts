import { MongoClient } from "mongodb";

let mongoClient: MongoClient | null = null;
let database: any = null;

export async function getMongoDb() {
  const uri = process.env.MONGODB_URI || (typeof window !== "undefined" ? localStorage.getItem("vC_mongo_uri") : null);
  
  if (!uri) {
    return null;
  }
  
  if (database) {
    return database;
  }

  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(uri);
      await mongoClient.connect();
    }
    database = mongoClient.db();
    return database;
  } catch (err) {
    console.error("MongoDB Atlas connection failure:", err);
    return null;
  }
}
