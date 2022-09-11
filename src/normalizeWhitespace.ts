const whitespacePattern = /\s+/g;
const normalizeWhitespace = (string: string) =>
	string.replace(whitespacePattern, ' ').trimStart().trimEnd();
export default normalizeWhitespace;
