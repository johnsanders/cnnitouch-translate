import { LanguageName } from './types.js';
import { getTranslationAws } from './translateApis.js';

const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const whitespacePattern = /^\s?$/;

const translateText = async (lang: LanguageName, text: string, cache: [string, string][]) => {
	if (lang === 'Kurdish') return '';
	if (text.match(whitespacePattern)) return '';
	const cached = cache.find((pair) => pair[0] === text);
	if (cached) {
		console.log('💥 Cache hit');
		logTranslation(text, cached[1]);
		return cached[1];
	}
	await waitFor(50);
	const translatedText = await getTranslationAws(text, lang);
	cache.push([text, translatedText]);
	logTranslation(text, translatedText);
	return translatedText;
};
export default translateText;

const logTranslation = (input: string, output: string) => {
	console.log(input);
	console.log(output);
	console.log('----------------------');
};
