import { Pair } from './types.js';
import VttParser from 'webvtt-parser';
import fs from 'fs';
import normalizeWhitespace from './normalizeWhitespace.js';
import parseCsvArgs from './parseCsvArgs.js';
import readCsv from './readCsv.js';

const type = 'vtt';
const { contentName, languageName } = parseCsvArgs();
const vttInPath = `./filesIn/vtt-${contentName}`;
const vttOutPath = `./filesOut/vtt-${contentName}`;
const csvPath = './filesIn';
const serializer = new VttParser.WebVTTSerializer();

const handleFile = async (filename: string, pairs: Pair[]) => {
	console.log('File:', filename);
	const vtt = fs.readFileSync(`${vttInPath}/${filename}`);
	const parser = new VttParser.WebVTTParser();
	const tree = parser.parse(vtt.toString(), 'metadata');
	for (const cue of tree.cues) {
		const text = normalizeWhitespace(cue.tree.children[0].value);
		const translated = pairs.find((pair) => pair[0] === text);
		cue.tree.children[0].value = cue.text = translated ? translated[1] : text;
	}
	const serialized = serializer.serialize(tree.cues);
	fs.writeFileSync(`${vttOutPath}/${filename}`, serialized);
};

const run = async () => {
	const pairs = (await readCsv(`${csvPath}/${contentName}-${languageName}-${type}.csv`)) as [
		string,
		string,
	][];
	const filenames = fs.readdirSync(vttInPath);
	for (const filename of filenames) {
		await handleFile(filename, pairs);
	}
};
run();
