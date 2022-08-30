import { LanguageName } from 'aws-sdk/clients/polly';
import { createArrayCsvWriter } from 'csv-writer';

const writeCsv = async (
	pairs: [string, string][],
	contentName: string,
	languageName: LanguageName,
	type: 'xlif' | 'vtt',
) => {
	const csvWriter = createArrayCsvWriter({
		header: ['English', languageName],
		path: `./filesOut/${contentName}-${languageName.toLowerCase()}-${type}.csv`,
	});

	await csvWriter.writeRecords(pairs);
};
export default writeCsv;
