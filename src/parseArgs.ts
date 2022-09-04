import { LanguageName } from './types';
import { parseArgs } from 'node:util';

export const vimeo = () => {
	const { values: args } = parseArgs({
		options: {
			deleteInactive: { type: 'boolean' },
			lang: { type: 'string' },
			mode: { type: 'string' },
		},
	});
	if (!args.mode || (args.mode === 'caption' && !args.lang)) {
		console.log('--mode=video|caption --lang=languageToDownload --deleteInactive');
		process.exit(1);
	}
	const languageName = args.lang as LanguageName;
	const deleteInactive = args.deleteInactive;
	const mode = args.mode;
	return { deleteInactive, languageName, mode };
};

export const csv = () => {
	const { values: args } = parseArgs({
		options: { input: { type: 'string' }, lang: { type: 'string' }, limit: { type: 'string' } },
	});
	if (!args.lang || !args.input) {
		console.log('--input=contentName --lang=language --type=vtt|xlif --limit=number');
		process.exit(1);
	}
	const languageName = args.lang as LanguageName;
	const contentName = args.input;
	const limit = args.limit || Infinity;
	return { contentName, languageName, limit };
};
