import { LanguageName } from 'aws-sdk/clients/polly';
import { Pair } from './types';
import { createArrayCsvWriter } from 'csv-writer';
import fs from 'fs';

const csvPath = './filesOut/csv';

const writeCsv = async (
	pairs: Pair[] | [string, string, string][],
	contentName: string,
	languageName: LanguageName,
	type: 'xlif' | 'vtt',
	filenameTag?: string,
) => {
	if (!fs.existsSync(csvPath)) fs.mkdirSync(csvPath);
	const path = `${csvPath}/${contentName}-${languageName.toLowerCase()}-${type}${
		filenameTag ? `-${filenameTag}` : ''
	}.csv`;
	const csvWriter = createArrayCsvWriter({
		header: ['English', languageName],
		path,
	});
	await csvWriter.writeRecords(pairs);
};
export default writeCsv;
