import { LanguageName, Pair } from './types.js';
import { jsToXliff12, xliff12ToJs } from 'xliff';
import { cloneDeep } from 'lodash-es';
import fs from 'fs';
import { parseArgs } from 'node:util';
import readCsv from './readCsv.js';
import writeCsv from './writeCsv.js';
import xlifHack from './xlifHack.js';

const { values: args } = parseArgs({
	options: { input: { type: 'string' }, lang: { type: 'string' } },
});
if (!args.lang || !args.input) process.exit(1);

const type = 'xlif';
const languageName = args.lang as LanguageName;
const contentName = args.input;
const whitespacePattern = /^\s+$/;
const xml = fs.readFileSync(`./filesIn/xlif/${contentName}-${languageName.toLowerCase()}.xlf`);
const xlif = await xliff12ToJs(xml.toString());
const pairs = (await readCsv(
	`filesIn/csv/${contentName}-${languageName.toLowerCase()}-${type}.csv`,
)) as Pair[];
const revisionPairs: [string, string, string][] = [];
const trim = (string: string) => string.replace(/^\s+|\s+$/g, '');

type ItemArray = (string | GenericSpan | ItemArray)[];
interface GenericSpan {
	GenericSpan: {
		contents: string | GenericSpan;
		ctype: string;
		id: string;
	};
}

let count = 0;
let wordCount = 0;
const getTranslation = (input: string) => {
	if (input.match(whitespacePattern) || input.length === 0) return '';
	const inputTrimmed = trim(input);
	const translated = pairs.find((pair) => trim(pair[0]) === trim(input));
	if (!translated) {
		console.log(`Could not translate: "${inputTrimmed}"`);
		if (!revisionPairs.find((pair) => pair[0] === input)) {
			count += 1;
			wordCount += input.split(' ').length;
			revisionPairs.push([input, '', 'NO']);
		}
		return `((TODO ${input} TODO))`;
	}
	revisionPairs.push([input, translated[1], 'COMPLETE']);
	return translated[1];
};

const handleItem = async (item: GenericSpan | ItemArray) => {
	if (Array.isArray(item)) {
		for (let i = 0; i < item.length; i += 1) {
			const nestedItem = item[i];
			if (typeof nestedItem === 'string') {
				const translated = getTranslation(nestedItem);
				item[i] = translated;
			} else {
				await handleItem(nestedItem);
			}
		}
	} else if (typeof item === 'object' && typeof item.GenericSpan.contents !== 'string') {
		await handleItem(item.GenericSpan.contents);
	} else if (typeof item.GenericSpan.contents === 'string') {
		const translated = getTranslation(item.GenericSpan.contents);
		item.GenericSpan.contents = ` ${translated} `;
	}
};

const run = async () => {
	for (const key1 of Object.keys(xlif.resources)) {
		const resource = xlif.resources[key1];
		for (const key2 of Object.keys(resource)) {
			const item: { source: GenericSpan | ItemArray | string; target: any } = resource[key2];
			if (typeof item.source === 'string') {
				(item as any).target = getTranslation(item.source);
			} else {
				const target = cloneDeep(item.source);
				(item as any).target = target;
				await handleItem(item.target);
			}
		}
	}
	const translatedXliffUnfixed = await jsToXliff12(xlif);
	const translatedXliff = xlifHack(translatedXliffUnfixed);
	const outPath = './filesOut/xlif';
	if (!fs.existsSync(outPath)) fs.mkdirSync(outPath);
	fs.writeFileSync(`${outPath}/${contentName}-${languageName.toLowerCase()}.xlf`, translatedXliff);
	if (revisionPairs.length > 0)
		writeCsv(revisionPairs, contentName, languageName, 'xlif', 'revision');
	console.log('Need revision: ', count);
	console.log('Need revision words: ', wordCount);
};

run();
