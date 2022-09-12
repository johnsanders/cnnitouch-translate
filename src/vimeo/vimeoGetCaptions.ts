import { apiBase, downloadPath, headers } from './vimeoTasks.js';
import fetch from 'node-fetch';
import fs from 'fs';

const downloadCaptionFile = async (
	id: string,
	contentName: string,
	languageName: string,
	files: any[],
) => {
	const localPath = `${downloadPath}/${contentName}-${languageName}`;
	const localFilePath = `${localPath}/${id}.vtt`;
	if (fs.existsSync(localFilePath)) {
		console.log('File already exists', id);
		return true;
	}
	if (!fs.existsSync(localPath)) fs.mkdirSync(localPath);
	const file = files.find((file: any) => file.active && file.language === languageName);
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
const getCaptions = async (
	ids: string[],
	contentName: string,
	languageName: string,
	deleteInactive: boolean,
	noDownload: boolean,
) => {
	let count = 0;
	for (const id of ids) {
		count += 1;
		if (count > 40) break;
		const res = await fetch(`${apiBase}/videos/${id}/texttracks`, { headers });
		const json: any = await res.json();
		const files = json.data;
		if (!noDownload) {
			const downloaded = await downloadCaptionFile(id, contentName, languageName, files.data);
			if (!downloaded) {
				console.log('Failed to download', id);
				break;
			}
		}
		if (deleteInactive) await deleteInactiveCaptions(files);
	}
};
export default getCaptions;
