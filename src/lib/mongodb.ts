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

// LazyClientPromise defers the MongoClient creation to the first await (request time),
// so importing this module during the Next.js build does not crash when MONGODB_URI is absent.
class LazyClientPromise implements PromiseLike<MongoClient> {
  private _inner: Promise<MongoClient> | null = null;

  private get inner(): Promise<MongoClient> {
    if (!this._inner) this._inner = createClientPromise();
    return this._inner;
  }

  then<R1 = MongoClient, R2 = never>(
    onfulfilled?: ((value: MongoClient) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    return this.inner.then(onfulfilled, onrejected);
  }
}

const clientPromise = new LazyClientPromise() as unknown as Promise<MongoClient>;
export default clientPromise;
