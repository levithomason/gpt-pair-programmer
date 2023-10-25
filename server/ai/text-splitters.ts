type Splitter = (str: string, maxLength: number) => string[];

// TODO: add overlap option for all splitters
/**
 * Makes a function that splits a string into chunks which are no longer than `maxLength`.
 */
const makeSplitter = (split: (str: string) => string[]): Splitter => {
  return (str: string, maxLength: number, overlap = 100) => {
    const chunks: string[] = [];

    const strings = split(str);
    let chunk = strings.shift();

    for (const string of strings) {
      if (string.length === 0) continue;

      const trimmedChunk = chunk.trim();
      if (trimmedChunk.length + string.length > maxLength) {
        if (trimmedChunk.length > 0) {
          chunks.push(trimmedChunk);
        }
        chunk = chunk.slice(chunk.length - overlap);
      }

      chunk += string;
    }

    const trimmedChunk = chunk.trim();
    if (trimmedChunk.length > 0) chunks.push(trimmedChunk);

    return chunks;
  };
};

/**
 * Splits a string by words. Empty strings are removed.
 */
export const splitWords = makeSplitter((str) => str.split(/(?=\s+)/));

/**
 * Splits a string by one or more newlines. Empty strings are removed.
 */
export const splitLines = makeSplitter((str) => str.split(/(?=\n+)/));

/**
 * Splits a string by paragraphs.
 * Paragraphs are separated by two or more newlines.
 */
export const splitParagraphs = makeSplitter((str) => str.split(/\n{2,}/));
