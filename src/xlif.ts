import { jsToXliff12, xliff12ToJs } from 'xliff';
import { cloneDeep } from 'lodash-es';
import fs from 'fs';
import translateText from './translateText.js';
import translatedCacheFile from './translatedCache.json' assert { type: 'json' };

const translatedCache = cloneDeep(translatedCacheFile) as [string, string][];

type ItemArray = (string | GenericSpan | ItemArray)[];
interface GenericSpan {
	GenericSpan: {
		contents: string | GenericSpan;
		ctype: string;
		id: string;
	};
}

const handleItem = async (item: GenericSpan | ItemArray) => {
	if (Array.isArray(item)) {
		for (let i = 0; i < item.length; i += 1) {
			const nestedItem = item[i];
			if (typeof nestedItem === 'string') {
				const translated = await translateText(nestedItem, translatedCache);
				item[i] = translated;
				console.log(item[i]);
			} else {
				await handleItem(nestedItem);
			}
		}
	} else if (typeof item === 'object' && typeof item.GenericSpan.contents !== 'string') {
		await handleItem(item.GenericSpan.contents);
	} else if (typeof item.GenericSpan.contents === 'string') {
		const translated = await translateText(item.GenericSpan.contents, translatedCache);
		item.GenericSpan.contents = translated;
	}
};

const run = async () => {
	const xml = fs.readFileSync('./filesIn/ethics.xlf');
	const js = await xliff12ToJs(xml.toString());
	let count = 0;
	for (const key1 of Object.keys(js.resources)) {
		const resource = js.resources[key1];
		for (const key2 of Object.keys(resource)) {
			count += 1;
			console.log(`Item number ${count}`);
			const item: { source: GenericSpan | ItemArray | string; target: any } = resource[key2];
			if (typeof item.source === 'string') {
				const translated = await translateText(item.source, translatedCache);
				(item as any).target = translated;
			} else {
				const target = cloneDeep(item.source);
				(item as any).target = target;
				await handleItem(item.target);
			}
		}
	}
	fs.writeFileSync('./out.json', JSON.stringify(js, null, 1));
	// fs.writeFileSync('./src/translatedCache.json', JSON.stringify(translatedCache, null, 1));
	const translatedXliff = await jsToXliff12(js);
	fs.writeFileSync('./filesOut/ethicsTranslated.xlf', translatedXliff);
};

run();
