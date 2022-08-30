const whitespacePattern = /\s+/g;
const normalizeWhitespace = (string: string) => string.replace(whitespacePattern, ' ');
export default normalizeWhitespace;
