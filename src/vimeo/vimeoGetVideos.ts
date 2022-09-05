import { apiBase, downloadPath, headers } from './vimeoTasks.js';
import fetch from 'node-fetch';
import fs from 'fs';

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

export default getVideos;
