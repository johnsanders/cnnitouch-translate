export type ItemArray = (string | GenericSpan | ItemArray)[];
export interface GenericSpan {
	GenericSpan: {
		contents: string | GenericSpan;
		ctype: string;
		id: string;
	};
}
export type Pair = [string, string];
export type LanguageName = 'Arabic' | 'Kurdish' | 'Spanish';
