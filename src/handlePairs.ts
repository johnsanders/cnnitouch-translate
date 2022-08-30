import { LanguageName } from './translateText';
import fs from 'fs';

const pairsPath = './src/pairs';
export const get = (
	contentName: string,
	languageName: LanguageName,
	type: 'xlif' | 'vtt',
): [string, string][] => {
	const pairsFilename = `${contentName}-${languageName.toLowerCase()}-${type}.json`;
	if (!fs.existsSync(`${pairsPath}/${pairsFilename}`)) return [];
	return JSON.parse(fs.readFileSync(`${pairsPath}/${pairsFilename}`).toString());
};

export const save = (
	pairs: [string, string][],
	contentName: string,
	languageName: LanguageName,
	type: 'xlif' | 'vtt',
) => {
	const pairsFilename = `${contentName}-${languageName.toLowerCase()}-${type}.json`;
	fs.writeFileSync(`${pairsPath}/${pairsFilename}`, JSON.stringify(pairs, null, 1));
};

export const removeComments = (pairs: [string, string][]) =>
	pairs.filter((pair: [string, string]) => pair[0].substring(0, 5) !== '--!--');
