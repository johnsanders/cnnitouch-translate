import fetch from 'node-fetch';
import fs from 'fs';
import { captions as parseArgs } from './parseArgs.js';
import vimeoKey from './vimeoKey_disableGit.js';

const apiBase = 'https://api.vimeo.com';
const headers = { Authorization: `Bearer ${vimeoKey}` };
const downloadPath = '/Users/jsanders/Downloads';

const getIdUrl = (id: string) => `${apiBase}/videos/${id}/texttracks`;
let count = 0;

const download = async (id: string, language: string, files: any[]) => {
	const fileFullPath = `${downloadPath}/${id}.vtt`;
	if (fs.existsSync(fileFullPath)) {
		console.log('File already exists', id);
		return true;
	}
	const englishFile = files.find((file: any) => file.active && file.language === language);
	if (!englishFile) return false;
	else {
		const downloadRes = await fetch(englishFile.link);
		const captionContents = await downloadRes.text();
		fs.writeFileSync(`/Users/jsanders/Downloads/${id}.vtt`, captionContents);
		console.log('Downloaded', id);
		return true;
	}
};

const deleteInactive = async (files: any[]) => {
	const toDelete = files.find((file: any) => file.active === false);
	if (toDelete) {
		console.log('Deleting', toDelete.uri);
		await fetch(apiBase + toDelete.uri, {
			headers,
			method: 'DELETE',
		});
		console.log('Deleted', toDelete.name);
	} else console.log('No inactive captions to delete');
};

const run = async () => {
	const args = parseArgs();
	const idsString = fs.readFileSync('./src/captionsIdList.txt').toString();
	const ids = idsString.split(/\s+/).filter((id) => id !== '');
	for (const id of ids) {
		count += 1;
		if (count > 40) break;
		const infoRes = await fetch(getIdUrl(id), {
			headers,
			method: 'GET',
		});
		const files = (await infoRes.json()) as any;
		if (args.deleteInactive) await deleteInactive(files);
		const downloaded = await download(id, args.languageName, files.data);
		if (!downloaded) {
			console.log('Failed to download', id);
			break;
		}
	}
};

run();
