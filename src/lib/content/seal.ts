import type { Revelation } from "./types";

/**
 * Casual-spoiler guard, NOT security. The game is a static site, so the answer
 * must reach the browser; sealing just keeps answers, scene titles and epilogues
 * out of plain view-source / devtools search. Anyone determined can decode it.
 */
function keyBytes(scenarioId: string): Uint8Array {
  const k = new TextEncoder().encode(`when-am-i:${scenarioId}`);
  return k.length ? k : new Uint8Array([42]);
}

function xor(bytes: Uint8Array, key: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ key[(i * 7 + 3) % key.length] ^ (i & 0xff);
  return out;
}

function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromBase64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export function seal(scenarioId: string, revelation: Revelation): string {
  return toBase64(xor(new TextEncoder().encode(JSON.stringify(revelation)), keyBytes(scenarioId)));
}

export function unseal(scenarioId: string, sealed: string): Revelation {
  return JSON.parse(new TextDecoder().decode(xor(fromBase64(sealed), keyBytes(scenarioId))));
}
