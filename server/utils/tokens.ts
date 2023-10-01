/**
 * Trims a string to a certain number of estimated tokens.
 * If the string is less than the number of tokens, the string is returned as-is.
 * If truncation is required, an "..." will be inserted in the middle of the string.
 * @param {string} str
 * @param {number} tokens
 */
export const trimStringToTokens = (str: string, tokens: number) => {
  const maxCharacters = tokens * 4;

  if (str.length > maxCharacters) {
    const divider = "\n\n[TRUNCATED]\n\n";
    const start = str.slice(0, maxCharacters / 2 - divider.length);
    const end = str.slice(-maxCharacters / 2 + divider.length);

    return start + divider + end;
  }

  return str;
};
