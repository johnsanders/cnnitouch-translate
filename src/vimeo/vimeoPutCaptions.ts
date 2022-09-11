import { apiBase, headers } from './vimeoTasks.js';
import { LanguageName } from '../types.js';
import fetch from 'node-fetch';
import fs from 'fs';
import languageCodes from '../languageCodes.js';

const getTextTrackUri = async (id: string) => {
	const infoRes = await fetch(`${apiBase}/videos/${id}`, { headers });
	const fileInfo = (await infoRes.json()) as any;
	return fileInfo.metadata.connections.texttracks.uri;
};
const createUploadLink = async (trackUri: string, languageName: LanguageName) => {
	if (!languageCodes[languageName]) {
		console.log(`No language code for ${languageName}`);
		process.exit(1);
	}
	const res = await fetch(apiBase + trackUri, {
		body: JSON.stringify({
			language: languageCodes[languageName],
			name: `Captions-${languageName}`,
			type: 'subtitles',
		}),
		headers: {
			...headers,
			'Content-Type': 'application/json',
		},
		method: 'POST',
	});
	const json = (await res.json()) as any;
	return json.link;
};

const putCaptions = async (contentName: string, languageName: LanguageName) => {
	const localPath = `./filesOut/vtt/${contentName}-${languageName}`;
	const filenames = fs.readdirSync(localPath).filter((filename) => filename.match(/\.vtt$/));
	for (const filename of filenames) {
		console.log('File: ', filename);
		const fileContents = fs.readFileSync(`${localPath}/${filename}`).toString();
		const id = filename.replace('.vtt', '');
		const textTrackUri = await getTextTrackUri(id);
		const uploadLink = await createUploadLink(textTrackUri, languageName);
		const res = await fetch(uploadLink, {
			body: fileContents,
			headers: { Accept: headers.Accept, 'Content-Type': 'text/plain' },
			method: 'PUT',
		});
		const text = await res.text();
		console.log(res.status, res.statusText, text);
	}
};

export default putCaptions;
