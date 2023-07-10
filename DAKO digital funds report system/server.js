const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function calculateMD5(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      const md5Hash = hash.digest('hex');
      resolve(md5Hash);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

function processDirectory(directoryPath) {
  let totalSize = 0;
  let fileCount = 0;
  let tifCount = 0;

  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      totalSize += stats.size;
      fileCount++;
      if (file.endsWith('.tif')) {
        tifCount++;
      }
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

function processArchives(zipDirectoryPath, allDirectoryName) {
  const archives = fs.readdirSync(zipDirectoryPath);

  archives.forEach((archive) => {
    const archivePath = path.join(zipDirectoryPath, archive);
    const stats = fs.statSync(archivePath);

    if (stats.isFile()) {
      const folderName = archive.split('.')[0];

      if (folderName === allDirectoryName) {
        calculateMD5(archivePath)
          .then((md5Hash) => {
            console.log('Архів:', archivePath);
            console.log('MD5 геш-значення:', md5Hash);
            console.log('---');
          })
          .catch((error) => {
            console.error('Помилка обчислення MD5 геш-значення для архіву', archivePath);
            console.error('Помилка:', error);
            console.log('---');
          });
      }
    }
  });
}

async function processDirectories(directoryPath, zipDirectoryPath) {
  const directories = fs.readdirSync(directoryPath);

  for (const dir of directories) {
    const dirPath = path.join(directoryPath, dir);
    const folderInfo = processDirectory(dirPath);
    const folderName = path.basename(dirPath);
    const zipFilePath = path.join(zipDirectoryPath, folderName + '.zip');
    let md5Hash = ''; 

    if (fs.existsSync(zipFilePath)) {
      try {
        md5Hash = await calculateMD5(zipFilePath); 
      } catch (error) {
        console.error('Помилка обчислення MD5 геш-значення для архіву', zipFilePath);
        console.error('Помилка:', error);
        console.log('---');
      }
    }

    console.log('{"№№\\nз/п": "",');
    console.log('"№ фонду": "' + getFundNumber(folderName) + '",');
    console.log('"№ опису": "' + getDescriptionNumber(folderName) + '",');
    console.log('"№ справи": "' + getCaseNumber(folderName) + '",');
    console.log('"Розмір в байтах": "' + folderInfo.totalSize + '",');
    console.log('"Кількість файлів": "' + folderInfo.fileCount + '",');
    console.log('"Кількість слайдів": "' + folderInfo.tifCount + '",');
    console.log('"Геш-значення файла (MD5)": "' + md5Hash + '",');
    console.log('"Примітка": ""');
    console.log('},');
  }
}

const zipDirectoryPath = path.join(__dirname, 'allInZip'); // шлях до теки з архівованими у zip фондами
const directoryPath = path.join(__dirname, 'all'); // шлях до теки з фондами

(async () => {
  await processArchives(zipDirectoryPath);
  await processDirectories(directoryPath, zipDirectoryPath);
})();


