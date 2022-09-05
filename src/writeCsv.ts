import { LanguageName } from 'aws-sdk/clients/polly';
import { createArrayCsvWriter } from 'csv-writer';
import fs from 'fs';

const writeCsv = async (
	pairs: [string, string][],
	contentName: string,
	languageName: LanguageName,
	type: 'xlif' | 'vtt',
) => {
	const path = `./filesOut/csv/${contentName}-${languageName.toLowerCase()}-${type}.csv`;
	if (!fs.existsSync(path)) fs.mkdirSync(path);
	const csvWriter = createArrayCsvWriter({
		header: ['English', languageName],
		path,
	});
	await csvWriter.writeRecords(pairs);
};
export default writeCsv;
