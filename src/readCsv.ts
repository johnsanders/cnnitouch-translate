import CsvReadableStream from 'csv-reader';
import fs from 'fs';

const readCsv = (filePath: string) =>
	new Promise((resolve, reject) => {
		const inputStream = fs.createReadStream(filePath, 'utf8');
		const rows: any[] = [];
		inputStream
			.pipe(new CsvReadableStream())
			.on('error', (e) => reject(e))
			.on('data', (row) => rows.push(row))
			.on('end', () => resolve(rows));
	});

export default readCsv;
