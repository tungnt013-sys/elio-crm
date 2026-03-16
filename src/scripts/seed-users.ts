/**
 * Run once to seed initial allowed users in MongoDB.
 * Usage: MONGODB_URI="mongodb+srv://..." npx tsx src/scripts/seed-users.ts
 */
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI environment variable is required.");
  console.error('Usage: MONGODB_URI="mongodb+srv://..." npx tsx src/scripts/seed-users.ts');
  process.exit(1);
}

const INITIAL_USERS = [
  { email: "duc@elio.education",     name: "Đức",    role: "ADMIN" },
  { email: "phuong@elio.education",  name: "Phương", role: "ADMIN" },
  { email: "tung@elio.education",    name: "Tùng",   role: "ADMIN" },
  { email: "hang.nm@elio.education", name: "Hằng",   role: "SALES" },
  { email: "chi.tm@elio.education",  name: "Chi",    role: "SALES_VIEW" },
];

async function main() {
  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  const db = client.db();
  const col = db.collection("allowed_users");

  for (const user of INITIAL_USERS) {
    const existing = await col.findOne({ email: user.email });
    if (existing) {
      console.log(`  skip  ${user.email} (already exists)`);
    } else {
      await col.insertOne(user);
      console.log(`  added ${user.email} as ${user.role}`);
    }
  }

  await client.close();
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
