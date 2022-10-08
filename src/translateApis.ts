import AWS from 'aws-sdk';
import { LanguageName } from './types.js';
import apiKeys from './translateApiKeys_disbableGit.js';
import fetch from 'node-fetch';
import languageCodes from './languageCodes.js';
import qs from 'qs';

const awsTranslate = new AWS.Translate({ region: 'us-east-1' });
const azureEndpoint = 'https://api.cognitive.microsofttranslator.com/translate';
const azureRegion = 'eastus';

export const getTranslationAzure = async (text: string, lang: LanguageName) => {
	const queryString = qs.stringify(
		{
			'api-version': '3.0',
			from: 'en',
			textType: 'html',
			to: [languageCodes[lang]],
		},
		{ addQueryPrefix: true },
	);
	const res = await fetch(azureEndpoint + queryString, {
		body: JSON.stringify([{ text }]),
		headers: {
			'Content-Type': 'application/json',
			'Ocp-Apim-Subscription-Key': apiKeys.azure,
			'Ocp-Apim-Subscription-Region': azureRegion,
		},
		method: 'POST',
	});
	const json = (await res.json()) as any;
	if (!json[0]?.translations[0]?.text) {
		console.log(json);
		process.exit();
	}
	const translatedText = json[0].translations[0].text;
	return translatedText;
};
export const getTranslationAws = async (text: string, lang: LanguageName) => {
	const res = await awsTranslate
		.translateText({
			SourceLanguageCode: 'en',
			TargetLanguageCode: languageCodes[lang],
			Text: text,
		})
		.promise();
	return res.TranslatedText;
};
