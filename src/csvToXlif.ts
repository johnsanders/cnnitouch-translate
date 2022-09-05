import { jsToXliff12, xliff12ToJs } from 'xliff';
import { LanguageName } from './types.js';
import { cloneDeep } from 'lodash-es';
import fs from 'fs';
import { parseArgs } from 'node:util';
import readCsv from './readCsv.js';

const { values: args } = parseArgs({
	options: { input: { type: 'string' }, lang: { type: 'string' } },
});
if (!args.lang || !args.input) process.exit(1);

const type = 'xlif';
const pairsPath = './src/pairs';
const languageName = args.lang as LanguageName;
const contentName = args.input;
const whitespacePattern = /^\s+$/;

const pathToPairs = `${pairsPath}/${contentName}-${languageName.toLowerCase()}-${type}.json`;
let pairs: [string, string][] = [];
if (fs.existsSync(pathToPairs)) pairs = JSON.parse(fs.readFileSync(pathToPairs).toString());

type ItemArray = (string | GenericSpan | ItemArray)[];
interface GenericSpan {
	GenericSpan: {
		contents: string | GenericSpan;
		ctype: string;
		id: string;
	};
}

const getTranslation = (input: string, pairs: [string, string][]) => {
	if (input.match(whitespacePattern) || input.length === 0) return '';
	const inputTrimmed = input.replace(/\s+$/, '');
	const translated = pairs.find((pair) => pair[0] === input || pair[0] === inputTrimmed);
	if (!translated) {
		console.log(`Could not translate: "${input}"`);
		process.exit();
	}
	return translated[1];
};

const handleItem = async (item: GenericSpan | ItemArray) => {
	if (Array.isArray(item)) {
		for (let i = 0; i < item.length; i += 1) {
			const nestedItem = item[i];
			if (typeof nestedItem === 'string') {
				const translated = getTranslation(nestedItem, pairs);
				item[i] = translated;
				console.log(item[i]);
			} else {
				await handleItem(nestedItem);
			}
		}
	} else if (typeof item === 'object' && typeof item.GenericSpan.contents !== 'string') {
		await handleItem(item.GenericSpan.contents);
	} else if (typeof item.GenericSpan.contents === 'string') {
		const translated = getTranslation(item.GenericSpan.contents, pairs);
		item.GenericSpan.contents = translated;
	}
};

const run = async () => {
	const xml = fs.readFileSync(`./filesIn/${contentName}-${languageName.toLowerCase()}.xlf`);
	const xlif = await xliff12ToJs(xml.toString());
	const pairs = (await readCsv(
		`filesIn/${contentName}-${languageName.toLowerCase()}-${type}.csv`,
	)) as [string, string][];
	let count = 0;
	for (const key1 of Object.keys(xlif.resources)) {
		const resource = xlif.resources[key1];
		for (const key2 of Object.keys(resource)) {
			count += 1;
			console.log(`Item number ${count}`);
			const item: { source: GenericSpan | ItemArray | string; target: any } = resource[key2];
			if (typeof item.source === 'string') {
				(item as any).target = getTranslation(item.source, pairs);
			} else {
				const target = cloneDeep(item.source);
				(item as any).target = target;
				await handleItem(item.target);
			}
		}
	}
	const translatedXliff = await jsToXliff12(xlif);
	const outPath = './filesOut/xlif';
	if (!fs.existsSync(outPath)) fs.mkdirSync(outPath);
	fs.writeFileSync(`outPath/${contentName}-${languageName.toLowerCase()}.xlf`, translatedXliff);
};

run();
