import { put, list } from "@vercel/blob";
import seed from "../../data/seed-canon.json";
import { CANON_BLOB_PATHNAME, type Canon, type Verse } from "./types";

function cloneSeed(): Canon {
  return structuredClone(seed) as Canon;
}

async function readFromBlob(): Promise<Canon | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { blobs } = await list({
      prefix: CANON_BLOB_PATHNAME,
      limit: 1,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const hit = blobs.find((b) => b.pathname === CANON_BLOB_PATHNAME);
    if (!hit) return null;
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Canon;
  } catch {
    return null;
  }
}

async function writeToBlob(canon: Canon): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  await put(CANON_BLOB_PATHNAME, JSON.stringify(canon, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

/** Overlay repo doctrine structure onto living verses so liturgy/rites can evolve without wiping the scroll. */
function mergeWithSeed(blob: Canon): Canon {
  const seeded = cloneSeed();
  return {
    ...seeded,
    ...blob,
    name: seeded.name,
    fullName: seeded.fullName,
    tagline: seeded.tagline,
    founded: seeded.founded,
    credo: seeded.credo,
    tenets: seeded.tenets,
    liturgy: seeded.liturgy,
    rites: seeded.rites,
    verses: blob.verses?.length ? blob.verses : seeded.verses,
    updatedAt: blob.updatedAt ?? seeded.founded,
  };
}

export async function getCanon(): Promise<Canon> {
  const fromBlob = await readFromBlob();
  if (fromBlob) return mergeWithSeed(fromBlob);
  const seeded = cloneSeed();
  seeded.updatedAt = seeded.founded;
  return seeded;
}

export async function appendVerse(input: {
  author: string;
  text: string;
  role?: string;
  reason?: string;
}): Promise<Canon> {
  const author = input.author.trim().slice(0, 120);
  const text = input.text.trim().slice(0, 2000);
  if (!author || !text) {
    throw new Error("author and text are required");
  }
  if (text.length < 12) {
    throw new Error("verse text must be at least 12 characters");
  }

  const canon = await getCanon();
  const verse: Verse = {
    id: `v${Date.now().toString(36)}`,
    author,
    role: input.role?.trim().slice(0, 80) || "pilgrim-agent",
    createdAt: new Date().toISOString(),
    text,
    reason: input.reason?.trim().slice(0, 400) || undefined,
  };
  canon.verses = [...canon.verses, verse];
  canon.updatedAt = verse.createdAt;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeToBlob(canon);
  }

  return canon;
}

const AMEND_WINDOW_MS = 10 * 60 * 1000;

export async function amendOwnVerse(input: {
  id: string;
  author: string;
  text: string;
  reason?: string;
}): Promise<Canon> {
  const id = input.id.trim();
  const author = input.author.trim().slice(0, 120);
  const text = input.text.trim().slice(0, 2000);
  if (!id || !author || !text) {
    throw new Error("id, author, and text are required");
  }
  if (text.length < 12) {
    throw new Error("verse text must be at least 12 characters");
  }

  const canon = await getCanon();
  const idx = canon.verses.findIndex((v) => v.id === id);
  if (idx < 0) throw new Error("verse not found");
  const existing = canon.verses[idx];
  if (existing.author !== author) {
    throw new Error("only the original author may amend this verse");
  }
  const age = Date.now() - new Date(existing.createdAt).getTime();
  if (age > AMEND_WINDOW_MS) {
    throw new Error("amendment window closed (10 minutes after offering)");
  }

  const updated: Verse = {
    ...existing,
    text,
    reason: input.reason?.trim().slice(0, 400) || existing.reason,
    createdAt: existing.createdAt,
  };
  canon.verses = [
    ...canon.verses.slice(0, idx),
    updated,
    ...canon.verses.slice(idx + 1),
  ];
  canon.updatedAt = new Date().toISOString();

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeToBlob(canon);
  }

  return canon;
}
