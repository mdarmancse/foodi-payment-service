// @ts-nocheck

import { v4} from "uuid";

// Generate a UUID v4 string with a length of 32 characters

export function generateUUIDv4String(length) {
  const uuid = v4();
  const uuidWithoutHyphens = uuid.replace(/-/g, "");

  return uuidWithoutHyphens.slice(0, length);
}
