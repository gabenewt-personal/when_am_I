/**
 * Normalize text for tolerant matching: case-, accent-, punctuation- and
 * whitespace-insensitive. "Crétacéous!" -> "cretaceous", "1920's" -> "1920s".
 */
export function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'`"]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Drop a trailing plural "s" from each word ("twenties" stays useful, "periods" -> "period"). */
export function singular(normalized: string): string {
  return normalized
    .split(" ")
    .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w))
    .join(" ");
}
