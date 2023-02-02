import { apiBase, headers } from './vimeoTasks.js';
import fetch from 'node-fetch';

const getPage = async (path?: string) => {
	const url = apiBase + (path || '/me/videos/794432347'); //?per_page=100&page=1');
	console.log(url);
	const res = await fetch(url, { headers });
	const json = await res.json();
	return json;
};

const listVideos = async () => {
	const results = [];
	let result = (await getPage()) as any;
	console.log(result.privacy);
	return;
	results.push(...result.data);
	while (result.paging?.next) {
		result = (await getPage(result.paging.next)) as any;
		results.push(...result.data);
	}
	console.log(results);
};

export default listVideos;
