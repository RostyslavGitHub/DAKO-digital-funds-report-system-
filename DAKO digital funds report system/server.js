const fs = require('fs');
const path = require('path');

function processDirectories(directoryPath) {
    const directories = fs.readdirSync(directoryPath);

    directories.forEach(dir => {
        const dirPath = path.join(directoryPath, dir);
        const folderInfo = processDirectory(dirPath);
        const folderName = path.basename(dirPath);

        const fundNumber = getFundNumber(folderName);
        const descriptionNumber = getDescriptionNumber(folderName);
        const caseNumber = getCaseNumber(folderName);

        console.log('{"№№\\nз/п": "",');
        console.log('"№ фонду": "' + fundNumber + '",');
        console.log('"№ опису": "' + descriptionNumber + '",');
        console.log('"№ справи": "' + caseNumber + '",');
        console.log('"Розмір в байтах": "' + folderInfo.totalSize + '",');
        console.log('"Кількість файлів": "' + folderInfo.fileCount + '",');
        console.log('"Кількість слайдів": "' + folderInfo.tifCount + '",');
        console.log('"Геш-значення файла (найменування алгоритму криптографічного гешування)": "",');
        console.log('"Примітка": ""');
        console.log('},');
    });
}

function processDirectory(directoryPath) {
    let totalSize = 0;
    let fileCount = 0;
    let tifCount = 0;

    const files = fs.readdirSync(directoryPath);

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            totalSize += stats.size;
            fileCount++;
            if (file.endsWith('.tif')) {
                tifCount++;
            }
        } else if (stats.isDirectory()) {
            const subFolderInfo = processDirectory(filePath);
            totalSize += subFolderInfo.totalSize;
            fileCount += subFolderInfo.fileCount;
            tifCount += subFolderInfo.tifCount;
        }
    });

    return { totalSize, fileCount, tifCount };
}

function getFundNumber(folderName) {
    const startIndex = folderName.indexOf('DAKO-') + 5;
    const endIndex = folderName.indexOf('-', startIndex);
    return folderName.substring(startIndex, endIndex).trim();
}

function getDescriptionNumber(folderName) {
    const startIndex = folderName.indexOf('-', folderName.indexOf('DAKO-')) + 1;
    const endIndex = folderName.lastIndexOf('-');
    const descriptionPart = folderName.substring(startIndex, endIndex).trim();
    const descriptionParts = descriptionPart.split('-');
    if (descriptionParts.length > 1) {
        return descriptionParts[1].trim();
    }
    return '';
}

function getCaseNumber(folderName) {
    const parts = folderName.split('-');
    return parts[parts.length - 1].trim();
}

const directoryPath = path.join(__dirname, '/all'); // шлях до теки з фондами
processDirectories(directoryPath);
