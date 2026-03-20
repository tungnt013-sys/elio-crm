#!/usr/bin/env tsx
/**
 * Backfill embeddings for sections stored without vectors (--no-embed mode).
 *
 * Usage:
 *   npx tsx src/scripts/backfill-embeddings.ts
 *
 * Finds all documents where embeddingReady is false or missing,
 * embeds them with Voyage AI in batches, and updates in place.
 *
 * Run this once Voyage AI billing is active. After it completes,
 * create the Atlas Vector Search index in the Atlas UI to enable
 * semantic search.
 */

import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

import clientPromise from "../lib/mongodb";
import { embedBatch } from "../lib/voyage";
import { VECTOR_INDEX_NAME, type ProposalSectionDoc } from "../lib/proposal-rag";
import { ObjectId } from "mongodb";

const DB_NAME = "elio";
const COLLECTION = "proposal_sections";
const BATCH_SIZE = 5;
const DELAY_MS = 22_000; // 22s between batches — Voyage AI free tier: 3 RPM

async function main() {
  const client = await clientPromise;
  const col = client.db(DB_NAME).collection<ProposalSectionDoc & { _id: ObjectId }>(COLLECTION);

  // Find all docs without embeddings
  const pending = await col
    .find({ $or: [{ embeddingReady: false }, { embeddingReady: { $exists: false } }, { embedding: [] }] })
    .project<{ _id: ObjectId; content: string }>({ _id: 1, content: 1 })
    .toArray();

  if (pending.length === 0) {
    console.log("Nothing to backfill — all sections already have embeddings.");
    process.exit(0);
  }

  console.log(`Found ${pending.length} section(s) to backfill.\n`);

  let done = 0;
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);

    if (i > 0) {
      process.stdout.write(`  Waiting ${DELAY_MS / 1000}s (rate limit)...`);
      await new Promise((r) => setTimeout(r, DELAY_MS));
      process.stdout.write(" done\n");
    }

    const embeddings = await embedBatch(batch.map((d) => d.content));

    // Update each doc individually (bulk write would be cleaner but this is a one-time script)
    await Promise.all(
      batch.map((doc, idx) =>
        col.updateOne(
          { _id: doc._id },
          { $set: { embedding: embeddings[idx], embeddingReady: true } },
        ),
      ),
    );

    done += batch.length;
    console.log(`  Updated ${done}/${pending.length}`);
  }

  console.log(`\nDone. ${pending.length} sections now have embeddings.`);
  console.log(`Next step: create the Atlas Vector Search index "${VECTOR_INDEX_NAME}" in the Atlas UI.`);
  console.log(`After the index builds, semantic search activates automatically.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
