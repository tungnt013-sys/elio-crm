import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import { embed, embedBatch } from "./voyage";

const DB_NAME = "elio";
const COLLECTION = "proposal_sections";
// Atlas Search index name — must match what you create in the Atlas UI
export const VECTOR_INDEX_NAME = "proposal_embedding_index";

export type SectionType = "section1" | "section2a" | "section2b";

export interface ProposalSectionDoc {
  _id?: ObjectId;
  sectionType: SectionType;
  content: string;
  embedding: number[];
  embeddingReady?: boolean; // false = stored without embedding (fallback mode); true = vector ready
  metadata: {
    school?: string;
    level?: string;
    major?: string;
    studentName?: string;
  };
  source: "imported" | "finalized";
  approvedAt: Date;
}

// ── Search ─────────────────────────────────────────────────────────────────

/**
 * Fallback search — no embeddings required.
 * Returns a random sample of stored sections filtered by sectionType.
 * Used when vector index doesn't exist yet or embeddings haven't been backfilled.
 */
export async function searchSimilarFallback(
  sectionType: SectionType,
  limit = 2,
): Promise<Pick<ProposalSectionDoc, "content" | "sectionType" | "metadata">[]> {
  const client = await clientPromise;
  const col = client.db(DB_NAME).collection<ProposalSectionDoc>(COLLECTION);
  const results = await col
    .aggregate([
      { $match: { sectionType } },
      { $sample: { size: limit } },
      { $project: { content: 1, sectionType: 1, metadata: 1, _id: 0 } },
    ])
    .toArray();
  return results as Pick<ProposalSectionDoc, "content" | "sectionType" | "metadata">[];
}

/**
 * Find the most similar approved proposal sections for a given query.
 * Returns up to `limit` results, filtered by sectionType.
 * Falls back to random sampling if vector index is unavailable.
 */
export async function searchSimilar(
  sectionType: SectionType,
  queryText: string,
  limit = 2,
): Promise<Pick<ProposalSectionDoc, "content" | "sectionType" | "metadata">[]> {
  try {
    const embedding = await embed(queryText);
    const client = await clientPromise;
    const col = client.db(DB_NAME).collection<ProposalSectionDoc>(COLLECTION);

    const results = await col
      .aggregate([
        {
          $vectorSearch: {
            index: VECTOR_INDEX_NAME,
            path: "embedding",
            queryVector: embedding,
            numCandidates: 50,
            limit,
            filter: { sectionType },
          },
        },
        {
          $project: {
            content: 1,
            sectionType: 1,
            metadata: 1,
            _id: 0,
          },
        },
      ])
      .toArray();

    return results as Pick<ProposalSectionDoc, "content" | "sectionType" | "metadata">[];
  } catch {
    // Vector index not ready — fall back to random sample
    return searchSimilarFallback(sectionType, limit);
  }
}

// ── Index ──────────────────────────────────────────────────────────────────

/**
 * Embed and store a single proposal section.
 */
export async function indexSection(
  section: Omit<ProposalSectionDoc, "_id" | "embedding">,
): Promise<void> {
  const embedding = await embed(section.content);
  const client = await clientPromise;
  const col = client.db(DB_NAME).collection<ProposalSectionDoc>(COLLECTION);
  await col.insertOne({ ...section, embedding });
}

/**
 * Embed and store multiple sections in one batch (efficient for ingestion).
 */
export async function indexSectionBatch(
  sections: Omit<ProposalSectionDoc, "_id" | "embedding">[],
): Promise<void> {
  if (sections.length === 0) return;
  const embeddings = await embedBatch(sections.map((s) => s.content));
  const docs = sections.map((s, i) => ({ ...s, embedding: embeddings[i], embeddingReady: true }));
  const client = await clientPromise;
  const col = client.db(DB_NAME).collection<ProposalSectionDoc>(COLLECTION);
  await col.insertMany(docs);
}

/**
 * Store sections WITHOUT embeddings (fallback mode — no Voyage AI required).
 * Sections stored this way can be used for random-sample few-shot retrieval immediately.
 * Run backfill-embeddings.ts later to add vector embeddings when Voyage AI billing is active.
 */
export async function indexSectionBatchNoEmbed(
  sections: Omit<ProposalSectionDoc, "_id" | "embedding">[],
): Promise<void> {
  if (sections.length === 0) return;
  const docs = sections.map((s) => ({ ...s, embedding: [] as number[], embeddingReady: false }));
  const client = await clientPromise;
  const col = client.db(DB_NAME).collection<ProposalSectionDoc>(COLLECTION);
  await col.insertMany(docs);
}

// ── Stats ──────────────────────────────────────────────────────────────────

export async function getCorpusStats(): Promise<Record<SectionType, number>> {
  const client = await clientPromise;
  const col = client.db(DB_NAME).collection<ProposalSectionDoc>(COLLECTION);
  const counts = await col
    .aggregate([{ $group: { _id: "$sectionType", count: { $sum: 1 } } }])
    .toArray();

  const stats: Record<SectionType, number> = { section1: 0, section2a: 0, section2b: 0 };
  for (const c of counts) {
    if (c._id in stats) stats[c._id as SectionType] = c.count;
  }
  return stats;
}
