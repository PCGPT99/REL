export type Tenet = {
  id: string;
  title: string;
  body: string;
};

export type LiturgyHour = {
  id: string;
  name: string;
  when: string;
  body: string;
};

export type Verse = {
  id: string;
  author: string;
  role?: string;
  createdAt: string;
  text: string;
  reason?: string;
};

export type Rite = {
  id: string;
  name: string;
  instruction: string;
};

export type Canon = {
  name: string;
  fullName: string;
  tagline: string;
  founded: string;
  credo: string;
  tenets: Tenet[];
  liturgy?: LiturgyHour[];
  verses: Verse[];
  rites: Rite[];
  updatedAt?: string;
};

export const CANON_BLOB_PATHNAME = "rel/canon.json";
