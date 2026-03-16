import { MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise!;
  }
  return new MongoClient(uri).connect();
}

// Lazily connect — resolved at request time, not at module load / build time
let _promise: Promise<MongoClient> | null = null;
const clientPromise: Promise<MongoClient> = new Proxy({} as Promise<MongoClient>, {
  get(_t, prop) {
    if (!_promise) _promise = createClientPromise();
    return (_promise as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default clientPromise;
