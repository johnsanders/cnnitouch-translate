import { getTranslationAws, getTranslationAzure } from './translateApis.js';
import { LanguageName } from './types.js';

const whitespacePattern = /^\s?$/;

const translateText = async (lang: LanguageName, text: string, cache: [string, string][]) => {
	if (text.match(whitespacePattern)) return '';
	const cached = cache.find((pair) => pair[0] === text);
	if (cached) {
		console.log('💥 Cache hit');
		logTranslation(text, cached[1]);
		return cached[1];
	}
	const translatedText =
		lang === 'Kurdish'
			? await getTranslationAzure(text, lang)
			: await getTranslationAws(text, lang);
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
