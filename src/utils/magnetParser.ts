// Magnet link parsing and validation utilities

/**
 * Represents parsed magnet link data.
 */
export interface MagnetData {
  /** Info hash */
  infoHash: string;
  /** Display name */
  name?: string;
  /** List of tracker URLs */
  trackers: string[];
}

/**
 * Parses a magnet URI and extracts info hash, name, and trackers.
 * @param magnetURI Magnet URI string
 * @returns MagnetData or throws on invalid input
 */
export function parseMagnetURI(magnetURI: string): MagnetData {
  if (!magnetURI.startsWith('magnet:?')) {
    throw new Error('Invalid magnet URI: must start with "magnet:?"');
  }
  const params = new URLSearchParams(magnetURI.substring(8));
  const infoHash = params.get('xt')?.split(':').pop();
  if (!infoHash) throw new Error('Invalid magnet URI: missing info hash');
  const name = params.get('dn') || undefined;
  const trackers = params.getAll('tr');
  return { infoHash, name, trackers };
}

/**
 * Validates if a string is a valid magnet URI.
 * @param uri String to validate
 */
export function isValidMagnetURI(uri: string): boolean {
  try {
    parseMagnetURI(uri);
    return true;
  } catch {
    return false;
  }
} 