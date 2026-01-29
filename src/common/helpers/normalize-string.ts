/**
 * Normalizes a string by removing accents, converting to lowercase,
 * and removing spaces, hyphens, underscores, and other separators.
 *
 * @param str - The string to normalize
 * @returns The normalized string
 */
export function normalizeString(str: string): string {
  const decodedUrl = decodeUrl(str);

  return decodedUrl
    .normalize('NFD') // Decompose characters with accents
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9]+/g, '') // Remove non-alphanumeric characters
    .trim();
}

export function decodeUrl(url: string): string {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

/**
 * Checks if a normalized string contains another normalized string.
 * Both strings are normalized by removing accents, spaces, hyphens, and underscores.
 *
 * @param haystack - The string to search in
 * @param needle - The string to search for
 * @returns True if the normalized needle is found in the normalized haystack
 */
export function normalizedComparation(str1: string, str2: string): boolean {
  const normalizedStr1 = normalizeString(str1);
  const normalizedStr2 = normalizeString(str2);

  return normalizedStr1.includes(normalizedStr2) || normalizedStr2.includes(normalizedStr1);
}

/*  
TRUE CASES:
normalizedComparation("éxample-user", "example+user")                  // true
normalizedComparation("Example User", "example-user")                  // true
normalizedComparation("example_user", "EXAMPLE.USER")                  // true
normalizedComparation("example user", "example%20user")                // true
normalizedComparation("https://onlyfans.com/example-user", "example") // true
normalizedComparation("example✨user", "example-user")                 // true
normalizedComparation("example_user_123", "exampleUser123")           // true
normalizedComparation("example-user", "user")                         // true
normalizedComparation("https://onlyfans.com/example-user", "user")    // true
normalizedComparation("https://onlyfans.com/example-user", "example-user") // true


FALSE: CASES

normalizedComparation("𝒆𝒙𝒂𝒎𝒑𝒍𝒆𝒖𝒔𝒆𝒓", "example user")        // false — letras decorativas Unicode no se normalizan
normalizedComparation("еxample-user", "example user")         // false — la "е" es cirílica, no latina
normalizedComparation("user example", "example user")         // false — el orden está invertido
normalizedComparation("https://onlyfans.com/otherperson", "example") // false — no hay coincidencia real


ISSUES:
normalizedComparation("example", "examples") // true. por hacer comparacion en ambos sentidos.
*/
