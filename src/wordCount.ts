import * as handlePairs from './handlePairs.js';
import { LanguageName } from './types.js';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
	options: {
		input: { type: 'string' },
		lang: { type: 'string' },
		type: { type: 'string' },
	},
});
if (!args.lang || !args.input) process.exit(1);

const languageName = args.lang as LanguageName;
const contentName = args.input;
const type = args.type as 'xlif' | 'vtt';

const pairsRaw = handlePairs.get(contentName, languageName, type);
const pairs = handlePairs.removeComments(pairsRaw);
const wordCount = pairs.reduce(
	(acc, [inputText]) =>
		acc +
		inputText.replace('<span translate="no"></span>', '').trimStart().trimEnd().split(' ').length,
	0,
);
console.log(wordCount);
