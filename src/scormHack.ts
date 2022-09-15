import * as text from './scormText.js';
import AdmZip from 'adm-zip';
import fs from 'fs';
import { scorm as parseArgs } from './parseArgs.js';

const inPath = './filesIn/scorm';
const outPath = './filesOut/scorm';
const pathToScormIndex = 'scormcontent/index.html';

const run = () => {
	const { file: filename } = parseArgs();
	const zipIn = new AdmZip(`${inPath}/${filename}.zip`);
	const destination = `${outPath}/${filename}`;
	zipIn.extractAllTo(destination);
	const indexString = fs
		.readFileSync(`${outPath}/${filename}/${pathToScormIndex}`)
		.toString()
		.replace(/<html lang="en" class="">/, text.html)
		.replace(/<head>/, '<head>' + text.head);
	fs.writeFileSync(`${destination}/${pathToScormIndex}`, indexString);
	const zipOut = new AdmZip();
	zipOut.addLocalFolder(destination);
	zipOut.writeZip(`${destination}.zip`);
	fs.rmSync(destination, { force: true, recursive: true });
};

run();
