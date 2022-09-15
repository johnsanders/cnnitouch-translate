const replaceString = '<xliff xmlns:xhtml="http://www.w3.org/1999/xhtml"';
const xlifHack = (xlif: string) => xlif.replace('<xliff', replaceString);

export default xlifHack;
