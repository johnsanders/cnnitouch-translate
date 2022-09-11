import * as handlePairs from './handlePairs.js';
import { GenericSpan, ItemArray, Pair } from './types.js';
import { cloneDeep } from 'lodash-es';
import fs from 'fs';
import { csv as parseCsvArgs } from './parseArgs.js';
import translateText from './translateText.js';
import writeCsv from './writeCsv.js';
import { xliff12ToJs } from 'xliff';

const type = 'xlif';
const { contentName, languageName, limit } = parseCsvArgs();
const cachePairs = handlePairs.get(contentName, languageName, type);

const handleItem = async (item: GenericSpan | ItemArray, outputPairs: Pair[]) => {
	if (Array.isArray(item)) {
		for (let i = 0; i < item.length; i += 1) {
			const nestedItem = item[i];
			if (typeof nestedItem === 'string') {
				const translated = await translateText(languageName, nestedItem, cachePairs);
				outputPairs.push([nestedItem, translated]);
			} else await handleItem(nestedItem, outputPairs);
		}
	} else if (typeof item === 'object' && typeof item.GenericSpan.contents !== 'string') {
		await handleItem(item.GenericSpan.contents, outputPairs);
	} else if (typeof item.GenericSpan.contents === 'string') {
		const inputString = item.GenericSpan.contents;
		if (inputString.length > 0) {
			const translated = await translateText(languageName, inputString, cachePairs);
			outputPairs.push([inputString, translated]);
		}
	}
};

const run = async () => {
	const outputPairs: Pair[] = [];
	const xml = fs.readFileSync(`./filesIn/${type}/${contentName}-${languageName.toLowerCase()}.xlf`);
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
				const translated = await translateText(languageName, item.source, cachePairs);
				outputPairs.push([item.source, translated]);
			} else {
				const target = cloneDeep(item.source);
				(item as any).target = target;
				await handleItem(item.target, outputPairs);
			}
		}
	}
	handlePairs.save(cachePairs, contentName, languageName, type);
	await writeCsv(outputPairs, contentName, languageName, type);
};

run();
