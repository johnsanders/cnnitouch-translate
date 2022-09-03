import fs from 'fs';

const run = async () => {
	const idsString = fs.readFileSync('./src/captionsIdList.txt').toString();
	const ids = idsString.split(/\s+/).filter((id) => id !== '');
	/*
		const toDelete = files.data.find((file: any) => file.active === false);
		if (toDelete) {
			console.log('Deleting', toDelete.uri);
			await fetch(apiBase + toDelete.uri, {
				headers,
				method: 'DELETE',
			});
			console.log('Deleted', toDelete.name);
		} else console.log('No inactive captions to delete');
		*/
};

run();
