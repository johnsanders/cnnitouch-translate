import { Pair } from './types.js';
import VttParser from 'webvtt-parser';
import fs from 'fs';
import normalizeWhitespace from './normalizeWhitespace.js';
import { csv as parseCsvArgs } from './parseArgs.js';
import readCsv from './readCsv.js';

const type = 'vtt';
const { contentName, languageName } = parseCsvArgs();
const vttInPath = `./filesIn/vtt/${contentName}`;
const vttOutPath = `./filesOut/vtt/${contentName}-${languageName.toLowerCase()}`;
const csvPath = './filesIn/csv';
const serializer = new VttParser.WebVTTSerializer();
const filenames = fs.readdirSync(vttInPath);

const handleFile = async (filename: string, pairs: Pair[]) => {
	console.log('File:', filename);
	const vtt = fs.readFileSync(`${vttInPath}/${filename}`);
	const parser = new VttParser.WebVTTParser();
	const tree = parser.parse(vtt.toString(), 'metadata');
	for (const cue of tree.cues) {
		if (cue.tree.children.length === 0) continue;
		const text = normalizeWhitespace(cue.tree.children[0].value);
		const translated = pairs.find((pair) => pair[0] === text);
		if (!translated) console.log('Could not translate', text);
		cue.tree.children[0].value = cue.text = translated ? translated[1] : text;
	}
	const serialized = serializer.serialize(tree.cues);
	const filePath = `${vttOutPath}/${filename}`;
	fs.writeFileSync(filePath, serialized);
	console.log(`Wrote ${filePath}`);
};

const run = async () => {
	if (!fs.existsSync(vttOutPath)) fs.mkdirSync(vttOutPath);
	const pairs = (await readCsv(
		`${csvPath}/${contentName}-${languageName.toLowerCase()}-${type}.csv`,
	)) as [string, string][];
	for (const filename of filenames) await handleFile(filename, pairs);
};
run();
