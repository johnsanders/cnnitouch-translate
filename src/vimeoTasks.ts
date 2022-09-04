import fetch from 'node-fetch';
import fs from 'fs';
import { vimeo as parseArgs } from './parseArgs.js';
import vimeoKey from './vimeoKey_disableGit.js';

const apiBase = 'https://api.vimeo.com';
const headers = { Authorization: `Bearer ${vimeoKey}` };
const downloadPath = '/Users/jsanders/Downloads';

let count = 0;

const getVideos = async (ids: string[]) => {
	for (const id of ids) {
		const localFilePath = `${downloadPath}/${id}.mp4`;
		if (fs.existsSync(localFilePath)) {
			console.log('File already exists', id);
			continue;
		}
		const infoRes = await fetch(`${apiBase}/videos/${id}`, { headers });
		const json = (await infoRes.json()) as any;
		const lowestRez = json.download.reduce(
			(acc: any, dl: any) => (dl.width < acc.width ? dl : acc),
			json.download[0],
		);
		const downloadRes = await fetch(lowestRez.link, { headers });
		const buffer = await downloadRes.arrayBuffer();
		fs.writeFileSync(localFilePath, Buffer.from(buffer));
		console.log('Downloaded', id);
	}
};
const getCaptions = async (ids: string[], languageName: string, deleteInactive: boolean) => {
	for (const id of ids) {
		count += 1;
		if (count > 40) break;
		const res = await fetch(`${apiBase}/videos/${id}/texttracks`, { headers });
		const files = (await res.json()) as any;
		const downloaded = await downloadCaptionFile(id, languageName, files.data);
		if (deleteInactive) await deleteInactiveCaptions(files);
		if (!downloaded) {
			console.log('Failed to download', id);
			break;
		}
	}
};
const downloadCaptionFile = async (id: string, language: string, files: any[]) => {
	const localFilePath = `${downloadPath}/${id}.vtt`;
	if (fs.existsSync(localFilePath)) {
		console.log('File already exists', id);
		return true;
	}
	const file = files.find((file: any) => file.active && file.language === language);
	if (!file) return false;
	const res = await fetch(file.link);
	const captionContents = await res.text();
	fs.writeFileSync(`/Users/jsanders/Downloads/${id}.vtt`, captionContents);
	console.log('Downloaded', id);
	return true;
};
const deleteInactiveCaptions = async (files: any[]) => {
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
	const idsString = fs.readFileSync('./src/vimeoIdList.txt').toString();
	const ids = idsString.split(/\s+/).filter((id) => id !== '');
	if (args.mode === 'caption')
		await getCaptions(ids, args.languageName, args.deleteInactive || false);
	else if (args.mode === 'video') await getVideos(ids);
};
run();
