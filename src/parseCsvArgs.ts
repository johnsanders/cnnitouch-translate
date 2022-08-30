import { LanguageName } from './translateText';
import { parseArgs } from 'node:util';

const parseToCsvArgs = () => {
	const { values: args } = parseArgs({
		options: { input: { type: 'string' }, lang: { type: 'string' }, limit: { type: 'string' } },
	});
	if (!args.lang || !args.input) process.exit(1);
	const languageName = args.lang as LanguageName;
	const contentName = args.input;
	const limit = args.limit || Infinity;
	return { contentName, languageName, limit };
};

export default parseToCsvArgs;
