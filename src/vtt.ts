import VttParser from 'webvtt-parser';
import fs from 'fs';
// import translateText from './translateText.js';
// import translatedCacheFile from './translatedCache.json' assert { type: 'json' };

const run = async () => {
	const vtt = fs.readFileSync('./filesIn/622526721.vtt');
	const parser = new VttParser.WebVTTParser();
	const tree = parser.parse(vtt.toString(), 'metadata');
	for (const cue of tree.cues) {
		cue.tree.children[0].value = 'fjdskalfjd';
	}
	const serializer = new VttParser.WebVTTSerializer();
	const serialized = serializer.serialize(tree.cues);
	console.log(serialized);
};

run();
