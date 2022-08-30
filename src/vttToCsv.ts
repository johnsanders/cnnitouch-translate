import * as handlePairs from './handlePairs.js';
import VttParser from 'webvtt-parser';
import fs from 'fs';
import normalizeWhitespace from './normalizeWhitespace.js';
import parseToCsvArgs from './parseCsvArgs.js';
import translateText from './translateText.js';
import writeCsv from './writeCsv.js';

const dividerString = '<span translate="no"></span>';
const type = 'vtt';
const { contentName, languageName, limit } = parseToCsvArgs();
const pairsRaw = handlePairs.get(contentName, languageName, type);
const pairs = handlePairs.removeComments(pairsRaw);
const vttPath = './filesIn';
let count = 0;

const handleFile = async (filename: string) => {
	const vtt = fs.readFileSync(`${vttPath}/vtt-${contentName}/${filename}`);
	const parser = new VttParser.WebVTTParser();
	const tree = parser.parse(vtt.toString(), 'metadata');
	const sentences = pagesToSentences(tree.cues.map((cue: any) => cue.tree.children[0].value));
	for (const sentence of sentences) {
		count += 1;
		if (count > limit) break;
		console.log(`Item ${count}`);
		await translateText(languageName, sentence, pairs);
	}
};

const pagesToSentences = (pages: string[]) => {
	const sentences: string[] = [];
	let sentence = '';
	for (const page of pages) {
		sentence += dividerString;
		const words = page.split(' ');
		for (const word of words) {
			sentence += word + ' ';
			if (word.includes('.')) {
				sentences.push(sentence);
				sentence = '';
			}
		}
	}
	if (sentence.length > 0) sentences.push(sentence);
	return sentences;
};
const sentencePairsToPagePairs = (sentencePairs: [string, string][]): [string, string][] => {
	const allSentencesInput = sentencePairs.map((pair) => pair[0]).join(' ');
	const allSentencesTranslated = sentencePairs.map((pair) => pair[1]).join(' ');
	const pagesInput = allSentencesInput.split(dividerString);
	const pagesTranslated = allSentencesTranslated.split(dividerString);
	const pagePairs = pagesInput.map((page, i): [string, string] => [
		normalizeWhitespace(page).trimEnd(),
		pagesTranslated[i],
	]);
	return pagePairs;
};

const run = async () => {
	const vttPattern = /.vtt$/;
	const filenames = fs
		.readdirSync(`${vttPath}/vtt-${contentName}`)
		.filter((file) => file.match(vttPattern));
	for (const filename of filenames) {
		if (count > limit) break;
		const filenameRow = pairs.find((pair) => pair[0].includes(filename));
		if (!filenameRow) pairs.push([`--!-- ${filename}`, '']);
		await handleFile(filename);
	}
	handlePairs.save(pairs, contentName, languageName, type);
	const pairsUncommented = handlePairs.removeComments(pairs);
	const pagePairs = sentencePairsToPagePairs(pairsUncommented);
	await writeCsv(pagePairs, contentName, languageName, type);
};

run();
