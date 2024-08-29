import fs from 'node:fs';

const srtFolder = './srt-files';
const translateFileName = '1.srt';

main();

function main() {
    const dirContent = fs.readdirSync(srtFolder);

    const fileNames = dirContent
        .filter(name => name.slice(-4) === '.srt' && name.slice(-1 * translateFileName.length) !== translateFileName);

    console.log(fileNames);

    const srtFileName = fileNames[0];

    const srtFileText = fs.readFileSync(srtFolder + '/' + srtFileName, 'utf8');
    const srtFileTranslationText = fs.readFileSync(srtFolder + '/' + translateFileName, 'utf8');

    console.log(srtFileTranslationText);

}