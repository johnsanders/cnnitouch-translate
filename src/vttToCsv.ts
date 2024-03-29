import * as handlePairs from './handlePairs.js';
import { Pair } from './types.js';
import VttParser from 'webvtt-parser';
import fs from 'fs';
import normalizeWhitespace from './normalizeWhitespace.js';
import { csv as parseCsvArgs } from './parseArgs.js';
import translateText from './translateText.js';
import writeCsv from './writeCsv.js';

const dividerString = '<span translate="no"></span>';
const type = 'vtt';
const { contentName, languageName, limit } = parseCsvArgs();
const cachePairsRaw = handlePairs.get(contentName, languageName, type);
const cachePairs = handlePairs.removeComments(cachePairsRaw);
const vttPath = './filesIn';
let count = 0;

const handleFile = async (filename: string, outputPairs: Pair[]) => {
	const vtt = fs.readFileSync(`${vttPath}/vtt/${contentName}/${filename}`);
	const parser = new VttParser.WebVTTParser();
	const tree = parser.parse(vtt.toString(), 'metadata');
	const sentences = pagesToSentences(
		tree.cues.map((cue: any) => {
			if (cue.tree.children.length === 1) return cue.tree.children[0].value;
			if (cue.tree.children.length === 0) {
				console.log('Cue is empty');
				return '';
			}
			console.log('Cue tree has unexpected structure');
			handlePairs.save(cachePairs, contentName, languageName, type);
			process.exit();
		}),
	);
	for (const sentence of sentences) {
		count += 1;
		if (count > limit) break;
		console.log(`Item ${count}`);
		const translatedSentence = await translateText(languageName, sentence, cachePairs);
		outputPairs.push([sentence, translatedSentence]);
	}
};

const pagesToSentences = (pages: string[]): string[] => {
	const sentences: string[] = [];
	let sentence = '';
	for (const page of pages) {
		sentence += dividerString;
		const words = page.split(' ');
		for (const word of words) {
			sentence += word + ' ';
			if (word.includes('.') || word.includes('?') || word.includes('!')) {
				sentences.push(sentence);
				sentence = '';
			}
		}
	}
	if (sentence.length > 0) sentences.push(sentence);
	sentences.push(dividerString);
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
	console.log(`Page pairs: ${pagesInput.length} in, ${pagesTranslated.length} out`);
	if (pagesInput.length !== pagesTranslated.length) console.log('🚨🚨🚨 Paage pair mismatch!');
	return pagePairs;
};

const run = async () => {
	const outputPairs: Pair[] = [];
	const vttPattern = /.vtt$/;
	const filenames = fs
		.readdirSync(`${vttPath}/vtt/${contentName}`)
		.filter((file) => file.match(vttPattern));
	for (const filename of filenames) {
		if (count > limit) break;
		const existingFilenameRow = outputPairs.find((pair) => pair[0].includes(filename));
		if (!existingFilenameRow) outputPairs.push([`--!-- ${filename}`, '----']);
		await handleFile(filename, outputPairs);
		handlePairs.save(cachePairs, contentName, languageName, type);
	}
	const pagePairs = sentencePairsToPagePairs(outputPairs);
	await writeCsv(pagePairs, contentName, languageName, type);
};

run();
