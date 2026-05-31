import { Db, MongoClient } from 'mongodb';

export interface User {
  _id?: string;
  email: string;
  password?: string;
  name?: string;
  googleId?: string;
  githubId?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserCollection(db: Db) {
  const collection = db.collection<User>('users');
  
  // Ensure indexes exist
  await collection.createIndex({ email: 1 }, { unique: true });
  await collection.createIndex({ googleId: 1 }, { sparse: true });
  await collection.createIndex({ githubId: 1 }, { sparse: true });
  
  return collection;
}

export async function findUserByEmail(db: Db, email: string) {
  const collection = await getUserCollection(db);
  return collection.findOne({ email: email.toLowerCase() });
}

export async function findUserByGoogleId(db: Db, googleId: string) {
  const collection = await getUserCollection(db);
  return collection.findOne({ googleId });
}

export async function findUserByGithubId(db: Db, githubId: string) {
  const collection = await getUserCollection(db);
  return collection.findOne({ githubId });
}

export async function createUser(db: Db, user: Partial<User>) {
  const collection = await getUserCollection(db);
  const now = new Date();
  
  const result = await collection.insertOne({
    ...user,
    email: user.email?.toLowerCase(),
    createdAt: now,
    updatedAt: now,
  } as User);
  
  return result.insertedId.toString();
}

export async function updateUser(db: Db, email: string, updates: Partial<User>) {
  const collection = await getUserCollection(db);
  
  const result = await collection.updateOne(
    { email: email.toLowerCase() },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );
  
  return result.modifiedCount > 0;
}
