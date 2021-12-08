import path from 'path';
import axios from 'axios';
import fsp from 'fs/promises';
// import nock from 'nock';
import fs from 'fs';
import prettier from 'prettier/standalone.js';
import parserHTML from 'prettier/parser-html.js';
import Source from './Source.js';

// const html = '<!DOCTYPE html>\n' +
//     '<html lang="ru">\n' +
//     '<head>\n' +
//     '    <meta charset="utf-8">\n' +
//     '    <title>Курсы по программированию Хекслет</title>\n' +
//     '</head>\n' +
//     '<body>\n' +
//     '<img src="/assets/professions/nodejs.png" alt="Иконка профессии Node.js-программист" />\n' +
//     '<img src="/assets/professions/nodejs.jpg" alt="Иконка профессии Node.js-программист" />\n' +
//
//     '<h3>\n' +
//     '    <a href="/professions.js">Node.js-программист</a>\n' +
//     '    <a href="/professions/nodejs">Node.js-программист</a>\n' +
//     '</h3>\n' +
//     '</body>\n' +
//     '</html>';

function getAxiosConfig(source) {
  const defaultConfig = {
    method: 'get',
    url: source.url.toString(),
  };

  if (source.getExtension() === '.png' || source.getExtension() === '.jpg') {
    return Object.assign(defaultConfig, { responseType: 'stream' });
  }
  return defaultConfig;
}

export default function pageLoader(outputPath, url, options = {}) {
  const source = new Source(url, options); // переименовать в coreHTML?
  const fileName = source.getFileName();
  const filePath = path.join(outputPath, fileName);
  const axiosConfig = getAxiosConfig(source);
  const { origin } = source.url;
  const folder = new Source(url, { isFolder: true });
  const folderName = folder.getFileName();
  let absoluteLinks = [];

  return axios(axiosConfig).then((response) => {
    const linksFromHtml = source.extractLinks(response.data);
    if (linksFromHtml.length === 0) {
      if (source.getExtension() === '.png' || source.getExtension() === '.jpg') {
        response.data.pipe(fs.createWriteStream(filePath));
        // тут возможно надо переписать как промис возвращается
        // https://gist.github.com/senthilmpro/072f5e69bdef4baffc8442c7e696f4eb
        return new Promise((resolve, reject) => {
          response.data.on('end', () => {
            resolve();
          });

          response.data.on('error', () => {
            reject();
          });
        });
      }
      return fsp.writeFile(filePath, response.data, 'utf8');
    }
    absoluteLinks = linksFromHtml.map((link) => `${origin}${link}`);
    const newResponseData = source.reWriteLinks(response.data, origin, folderName);
    const newResponseDataPrettier = prettier.format(newResponseData, { parser: 'html', plugins: [parserHTML] });
    return fsp.writeFile(filePath, newResponseDataPrettier, 'utf8');
  })
    .then(() => (absoluteLinks.length === 0 ? null : fsp.mkdir(path.join(outputPath, folderName))))
    .then(() => {
      if (absoluteLinks.length === 0) return null;
      const newOutputPath = path.join(outputPath, folderName);
      const promises = absoluteLinks
        .map((link) => pageLoader(newOutputPath, link, { isCore: false }));
      return Promise.all(promises);
    })
    .then(() => filePath)
    .catch((error) => {
      if (error.response) {
        console.log('error! responded with code', error.response.status);
        throw new Error(`error! responded with code ${error.response.status}`);
      } else {
        console.log('error!', error.message);
        throw new Error(`error! ${error.message}`);
      }
    });
}

// const outputPath = '/Users/mariastepanova/WebstormProjects/backend-project-lvl3';
// const myUrl = 'https://ru.hexlet.io/courses';

// nock.disableNetConnect();
// nock(/ru\.hexlet\.io/)
//     .persist()
//     .get(/\/assets\/professions\/nodejs\./)
//     // для запуска из этого файла:
//     // .reply(200, fs.createReadStream('../__fixtures__/expectedPNG.png'))
//     // для запуска через консольную утилиту page-loader из папки page-loader
//     .reply(200, fs.createReadStream('../__fixtures__/expectedPNG.png'))
//     .get(/\/courses/)
//     .reply(200, html)
//     .get(/\/professions\/nodejs/)
//     .reply(200, 'this is professions.nodejs - must be html')
//     .get(/\/professions\.js/)
//     .reply(200, 'this is script from professions.js');

// pageLoader(outputPath, myUrl, {  });
