const SPACE_LIKE = /[\s-]/g

/**
 * Lowercase, strip Unicode diacritics, collapse space-like chars to a single space.
 * Used by the default scorer so that `cafe` matches `café` (#386) and
 * `foo-bar` matches `foo bar`.
 */
export const normalize = (input: string): string =>
  input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(SPACE_LIKE, " ")
