import { GenericSpan, ItemArray } from './types.js';
import { cloneDeep } from 'lodash-es';
import fs from 'fs';
import { csv as parseCsvArgs } from './parseArgs.js';
import { xliff12ToJs } from 'xliff';

const { contentName, languageName } = parseCsvArgs();
const xml = fs.readFileSync(`./filesIn/xlif/${contentName}-${languageName.toLowerCase()}.xlf`);
const js = await xliff12ToJs(xml.toString());
const outDir = './filesOut/xlifList';

const handleItem = async (item: GenericSpan | ItemArray, list: string[]) => {
	if (Array.isArray(item)) {
		for (let i = 0; i < item.length; i += 1) {
			const nestedItem = item[i];
			if (typeof nestedItem === 'string') list.push(nestedItem);
			else handleItem(nestedItem, list);
		}
	} else if (typeof item === 'object' && typeof item.GenericSpan.contents !== 'string') {
		await handleItem(item.GenericSpan.contents, list);
	} else if (typeof item.GenericSpan.contents === 'string') list.push(item.GenericSpan.contents);
};

const run = () => {
	const list: string[] = [];
	for (const key1 of Object.keys(js.resources)) {
		const resource = js.resources[key1];
		for (const key2 of Object.keys(resource)) {
			const item: { source: GenericSpan | ItemArray | string; target: any } = resource[key2];
			if (typeof item.source === 'string') list.push(item.source);
			else {
				const target = cloneDeep(item.source);
				(item as any).target = target;
				handleItem(item.target, list);
			}
		}
	}
	if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
	fs.writeFileSync(
		`./filesOut/xlifList/${contentName}-${languageName.toLowerCase()}.json`,
		JSON.stringify(list, null, 1),
	);
};

run();
