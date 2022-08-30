import * as handlePairs from './handlePairs.js';
import { GenericSpan, ItemArray } from './types.js';
import { cloneDeep } from 'lodash-es';
import fs from 'fs';
import parseToCsvArgs from './parseCsvArgs.js';
import translateText from './translateText.js';
import writeCsv from './writeCsv.js';
import { xliff12ToJs } from 'xliff';

const type = 'xlif';
const { contentName, languageName, limit } = parseToCsvArgs();
const pairs = handlePairs.get(contentName, languageName, type);

const handleItem = async (item: GenericSpan | ItemArray) => {
	if (Array.isArray(item)) {
		for (let i = 0; i < item.length; i += 1) {
			const nestedItem = item[i];
			if (typeof nestedItem === 'string') {
				await translateText(languageName, nestedItem, pairs);
			} else {
				await handleItem(nestedItem);
			}
		}
	} else if (typeof item === 'object' && typeof item.GenericSpan.contents !== 'string') {
		await handleItem(item.GenericSpan.contents);
	} else if (typeof item.GenericSpan.contents === 'string') {
		const translated = await translateText(languageName, item.GenericSpan.contents, pairs);
		item.GenericSpan.contents = translated;
	}
};

const run = async () => {
	const xml = fs.readFileSync(`./filesIn/${contentName}.xlf`);
	const js = await xliff12ToJs(xml.toString());
	let count = 0;
	for (const key1 of Object.keys(js.resources)) {
		const resource = js.resources[key1];
		for (const key2 of Object.keys(resource)) {
			count += 1;
			if (count > limit) break;
			console.log(`Item ${count}`);
			const item: { source: GenericSpan | ItemArray | string; target: any } = resource[key2];
			if (typeof item.source === 'string') {
				const translated = await translateText(languageName, item.source, pairs);
				(item as any).target = translated;
			} else {
				const target = cloneDeep(item.source);
				(item as any).target = target;
				await handleItem(item.target);
			}
		}
	}
	handlePairs.save(pairs, contentName, languageName, type);
	await writeCsv(pairs, contentName, languageName, type);
};

run();
