import { LanguageName } from './types';
import { parseArgs } from 'node:util';

export const vimeo = () => {
	const { values: args } = parseArgs({
		options: {
			deleteInactive: { type: 'boolean' },
			input: { type: 'string' },
			lang: { type: 'string' },
			mode: { type: 'string' },
		},
	});
	if (!args.mode || (args.mode.includes('captions') && (!args.lang || !args.input))) {
		console.log('--mode=videos|captionsDown|captionsUp --lang=languageToDownload --deleteInactive');
		process.exit(1);
	}
	const languageName = args.lang as LanguageName;
	const deleteInactive = args.deleteInactive;
	const contentName = args.input as string;
	const mode = args.mode as 'videos' | 'captionsDown' | 'captionsUp';
	return { contentName, deleteInactive, languageName, mode };
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
