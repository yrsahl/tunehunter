/**
 * Generates a stable, deterministic 16-char hex ID for a song
 * based on its title and primary artist name.
 * Uses two-pass FNV-1a for 64-bit hash space.
 */
export function generateSongId(title: string, primaryArtist: string): string {
  const key = `${title.toLowerCase().trim()}|${primaryArtist.toLowerCase().trim()}`;

  const FNV_PRIME = 0x01000193;
  const FNV_OFFSET = 0x811c9dc5;

  let h1 = FNV_OFFSET;
  for (let i = 0; i < key.length; i++) {
    h1 ^= key.charCodeAt(i);
    h1 = (Math.imul(h1, FNV_PRIME) >>> 0);
  }

  let h2 = FNV_OFFSET;
  for (let i = key.length - 1; i >= 0; i--) {
    h2 ^= key.charCodeAt(i);
    h2 = (Math.imul(h2, FNV_PRIME) >>> 0);
  }

  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}
