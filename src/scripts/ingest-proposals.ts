#!/usr/bin/env tsx
/**
 * One-time ingestion script — import existing .docx proposal files into the RAG corpus.
 *
 * Usage:
 *   npx tsx src/scripts/ingest-proposals.ts <directory>
 *
 * Scans the directory recursively for .docx files (handles undergrad/grad/phd subfolders).
 * Extracts text with mammoth, splits into sections, embeds with Voyage AI, stores in MongoDB.
 */

import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

// Load env before importing lib modules
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth");
import { indexSectionBatch, indexSectionBatchNoEmbed, type SectionType } from "../lib/proposal-rag";

// ── Collect .docx files recursively ───────────────────────────────────────

interface DocxFile {
  filePath: string;
  filename: string;
  programType: string; // folder name: undergrad / grad / phd / unknown
}

function collectDocxFiles(dir: string): DocxFile[] {
  const results: DocxFile[] = [];

  function walk(currentDir: string, parentFolder: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, entry.name.toLowerCase());
      } else if (entry.name.toLowerCase().endsWith(".docx") && !entry.name.startsWith("~")) {
        results.push({
          filePath: fullPath,
          filename: entry.name,
          programType: parentFolder,
        });
      }
    }
  }

  walk(dir, "unknown");
  return results;
}

// ── Section parsing ────────────────────────────────────────────────────────

interface ParsedSection {
  sectionType: SectionType;
  content: string;
}

function parseSections(text: string, filename: string): ParsedSection[] {
  const s2bPattern = /LỚP\s*12|GRADE\s*12|NĂM\s*12|TWELFTH/i;
  const s2aPattern = /LỚP\s*11|GRADE\s*11|NĂM\s*11|ELEVENTH/i;

  const lines = text.split("\n");
  let s2aStart = -1;
  let s2bStart = -1;

  for (let i = 0; i < lines.length; i++) {
    if (s2aStart === -1 && s2aPattern.test(lines[i])) s2aStart = i;
    if (s2bStart === -1 && s2bPattern.test(lines[i])) s2bStart = i;
  }

  const sections: ParsedSection[] = [];

  if (s2aStart === -1 && s2bStart === -1) {
    console.log(`  → No grade headers found — using full text as section1 (strategy)`);
    const trimmed = text.trim();
    if (trimmed.length > 50) sections.push({ sectionType: "section1", content: trimmed });
    return sections;
  }

  const s1End = Math.min(
    s2aStart === -1 ? Infinity : s2aStart,
    s2bStart === -1 ? Infinity : s2bStart,
  );

  if (s1End > 0) {
    const s1 = lines.slice(0, s1End).join("\n").trim();
    if (s1.length > 100) sections.push({ sectionType: "section1", content: s1 });
  }

  if (s2aStart !== -1) {
    const s2aEnd = s2bStart !== -1 && s2bStart > s2aStart ? s2bStart : lines.length;
    const s2a = lines.slice(s2aStart, s2aEnd).join("\n").trim();
    if (s2a.length > 100) sections.push({ sectionType: "section2a", content: s2a });
  }

  if (s2bStart !== -1) {
    const s2b = lines.slice(s2bStart).join("\n").trim();
    if (s2b.length > 100) sections.push({ sectionType: "section2b", content: s2b });
  }

  return sections;
}

// ── Extract text from .docx with mammoth ──────────────────────────────────

async function extractText(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.trim();
  } catch (err) {
    console.error(`  Failed to extract:`, err);
    return "";
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith("--"));
  const noEmbed = args.includes("--no-embed") || !process.env.VOYAGE_API_KEY;

  if (!dir) {
    console.error("Usage: npx tsx src/scripts/ingest-proposals.ts <directory> [--no-embed]");
    console.error("  --no-embed  Skip Voyage AI embeddings. Store text only; run backfill-embeddings.ts later.");
    process.exit(1);
  }

  if (noEmbed) {
    console.log("Mode: --no-embed (storing text without vector embeddings)\n");
  }

  const absDir = path.resolve(dir);
  if (!fs.existsSync(absDir)) {
    console.error(`Directory not found: ${absDir}`);
    process.exit(1);
  }

  const files = collectDocxFiles(absDir);

  if (files.length === 0) {
    console.error(`No .docx files found in ${absDir}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} .docx file(s)\n`);

  const allSections: Parameters<typeof indexSectionBatch>[0] = [];

  for (const { filePath, filename, programType } of files) {
    console.log(`Processing: ${filename} [${programType}]`);

    const text = await extractText(filePath);
    if (!text) {
      console.log(`  Skipped (empty)\n`);
      continue;
    }

    const parsed = parseSections(text, filename);
    if (parsed.length === 0) {
      console.log(`  Skipped (text too short)\n`);
      continue;
    }

    console.log(`  Sections: ${parsed.map((s) => s.sectionType).join(", ")}`);

    for (const s of parsed) {
      allSections.push({
        sectionType: s.sectionType,
        content: s.content,
        metadata: {
          studentName: filename.replace(/\.docx$/i, ""),
          level: programType,
        },
        source: "imported",
        approvedAt: new Date(),
      });
    }
    console.log();
  }

  if (allSections.length === 0) {
    console.log("Nothing to index.");
    process.exit(0);
  }

  if (noEmbed) {
    // Fast path — no Voyage AI, store directly
    console.log(`Storing ${allSections.length} section(s) without embeddings...`);
    await indexSectionBatchNoEmbed(allSections);
    console.log(`\nDone. ${allSections.length} sections stored (embeddingReady: false).`);
    console.log(`Run "npx tsx src/scripts/backfill-embeddings.ts" later to add vector embeddings.`);
  } else {
    // Full path — embed with Voyage AI
    console.log(`Embedding and storing ${allSections.length} section(s)...`);

    // Free tier: 3 RPM, 10K TPM — process in small batches with delays
    const BATCH_SIZE = 5;
    const DELAY_MS = 22_000; // 22s between batches → ~2.7 req/min, safely under 3 RPM
    let stored = 0;
    for (let i = 0; i < allSections.length; i += BATCH_SIZE) {
      const batch = allSections.slice(i, i + BATCH_SIZE);
      if (i > 0) {
        process.stdout.write(`  Waiting ${DELAY_MS / 1000}s (rate limit)...`);
        await new Promise((r) => setTimeout(r, DELAY_MS));
        process.stdout.write(" done\n");
      }
      await indexSectionBatch(batch);
      stored += batch.length;
      console.log(`  Stored ${stored}/${allSections.length}`);
    }
    console.log(`\nDone. ${allSections.length} sections added to MongoDB proposal_sections collection.`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
