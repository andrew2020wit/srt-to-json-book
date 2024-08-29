import fs from 'node:fs';
import srtParser2 from "srt-parser-2";
import {convert} from "html-to-text";

const srtFolder = './srt-files';
const translateFileName = '1.srt';
const startTimeSeparator = ' ';
const noItemId = 10000000;

const convertHtmlToTextOption = {
    wordwrap: false,
    preserveNewlines: false
};

main();

function main() {
    const dirContent = fs.readdirSync(srtFolder);

    const fileNames = dirContent
        .filter(name => name.slice(-4) === '.srt' && name.slice(-1 * translateFileName.length) !== translateFileName);

    const srtFileName = fileNames[0];

    const srtFileText = fs.readFileSync(srtFolder + '/' + srtFileName, 'utf8');
    const srtFileTranslationText = fs.readFileSync(srtFolder + '/' + translateFileName, 'utf8');

    const srtParser = new srtParser2();

    const srtArray = srtParser.fromSrt(srtFileText);
    srtArray.forEach((srt, index) => {
        srt.id = index
    })

    const translationArray = srtParser.fromSrt(srtFileTranslationText);
    translationArray.forEach((x, index) => {
        x.id = index
    });

    const jsonBook = {
        id: Date.now(),
        title: srtFileName
    };

    jsonBook.content = srtArray.map((srtItem, index) => ({
        id: index,
        text: [srtItem.startTime + startTimeSeparator + convert(srtItem.text, convertHtmlToTextOption)]
    }));

    const translation = {};

    const srtArrayReversed = srtArray.toReversed();

    translationArray.forEach((translationItem, index) => {
        const nextItem = srtArray.find(item => item.startSeconds >= translationItem.startSeconds);

        const prevItem = srtArrayReversed.find(item => item.startSeconds <= translationItem.startSeconds);

        let itemId;

        if (!prevItem) {
            itemId = nextItem.id;
        } else if (!nextItem) {
            itemId = prevItem.id;
        } else if ((translationItem.startSeconds - prevItem.startSeconds) < (nextItem.startSeconds - translationItem.startSeconds) ) {
            itemId = prevItem.id;
        } else {
            itemId = nextItem.id;
        }

        translation[itemId + '-0'] = (translation[itemId + '-0'] || '') + convert(translationItem.text, convertHtmlToTextOption);
    });

    jsonBook.translation = translation;


    const fileNameWithoutExtension = srtFileName.slice(0, -1 * '.srt'.length);

    fs.writeFileSync(srtFolder + '/' + fileNameWithoutExtension + '.json', JSON.stringify({
        jsonContentDescription: "ForeignReaderBook",
        book: jsonBook
    }, null, 2));
}
