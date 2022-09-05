import fs from 'fs';
import getCaptions from './vimeoGetCaptions.js';
import getVideos from './vimeoGetVideos.js';
import { vimeo as parseArgs } from '../parseArgs.js';
import putCaptions from './vimeoPutCaptions.js';
import vimeoKey from './vimeoKey_disableGit.js';

export const downloadPath = '/Users/jsanders/Downloads';
export const apiBase = 'https://api.vimeo.com';
export const headers = {
	Accept: 'application/vnd.vimeo.*+json;version=3.4',
	Authorization: `Bearer ${vimeoKey}`,
};

const getIds = () => {
	const idsString = fs.readFileSync('./src/vimeo/vimeoIdList.txt').toString();
	const ids = idsString.split(/\s+/).filter((id) => id !== '');
	return ids;
};

const run = async () => {
	const args = parseArgs();
	if (args.mode === 'captionsDown')
		await getCaptions(getIds(), args.contentName, args.languageName, args.deleteInactive || false);
	else if (args.mode === 'captionsUp') await putCaptions(args.contentName, args.languageName);
	else if (args.mode === 'videos') await getVideos(getIds());
};
run();
