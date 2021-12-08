import path from 'path';
import axios from 'axios';
import fsp from 'fs/promises';
// import nock from 'nock';
// import fs from 'fs';
// import prettier from 'prettier/standalone.js';
// import parserHTML from 'prettier/parser-html.js';
import Source from './Source.js';
import ImageSource from './ImageSource.js';
import CoreHTML from './CoreHTML.js';
import { getAxiosConfig, getExtension } from './utils.js';

// полностью рабочая версия:
// export default function pageLoader(outputPath, url, options = {}) {
//   // const source = new Source(outputPath, url, options); // переименовать в coreHTML?
//   const source = new CoreHTML(outputPath, url, options); // переименовать в coreHTML?
//   const fileName = source.getFileName();
//   const filePath = path.join(outputPath, fileName);
//   const axiosConfig = getAxiosConfig(source);
//   const { origin } = source.url;
//   const folder = new Source(outputPath, url, { isFolder: true });
//   const folderName = folder.getFileName();
//   let absoluteLinks = [];
//
//   return axios(axiosConfig).then((response) => {
//     const linksFromHtml = source.extractLinks(response.data);
//     if (linksFromHtml.length === 0) {
//       if (source.getExtension() === '.png' || source.getExtension() === '.jpg') {
//         response.data.pipe(fs.createWriteStream(filePath));
//         // тут возможно надо переписать как промис возвращается
//         // https://gist.github.com/senthilmpro/072f5e69bdef4baffc8442c7e696f4eb
//         return new Promise((resolve, reject) => {
//           response.data.on('end', () => {
//             resolve();
//           });
//
//           response.data.on('error', () => {
//             reject();
//           });
//         });
//       }
//       return fsp.writeFile(filePath, response.data, 'utf8');
//     }
//     absoluteLinks = linksFromHtml.map((link) => `${origin}${link}`);
//     const newResponseData = source.reWriteLinks(response.data, origin, folderName);
//     const newResponseDataPrettier = prettier.format(newResponseData,
//     { parser: 'html', plugins: [parserHTML] });
//     return fsp.writeFile(filePath, newResponseDataPrettier, 'utf8');
//   })
//     .then(() => (absoluteLinks.length === 0 ? null :
//     fsp.mkdir(path.join(outputPath, folderName))))
//     .then(() => {
//       if (absoluteLinks.length === 0) return null;
//       const newOutputPath = path.join(outputPath, folderName);
//       const promises = absoluteLinks
//         .map((link) => pageLoader(newOutputPath, link, { isCore: false }));
//       return Promise.all(promises);
//     })
//     .then(() => filePath)
//     .catch((error) => {
//       if (error.response) {
//         console.log('error! responded with code', error.response.status);
//         throw new Error(`error! responded with code ${error.response.status}`);
//       } else {
//         console.log('error!', error.message);
//         throw new Error(`error! ${error.message}`);
//       }
//     });
// }

export default function pageLoader(outputPath, url, options = {}) {
  // избавиться от опций
  const coreHTML = new CoreHTML(outputPath, url, options);
  const folderName = `${coreHTML.name.slice(0, -5)}_files`;
  const coreAxiosConfig = getAxiosConfig(coreHTML.url);
  let absoluteLinks = [];

  return axios(coreAxiosConfig)
    .then((response) => {
      const linksFromHtml = CoreHTML.extractLinks(response.data);
      const { origin } = coreHTML.url;
      absoluteLinks = linksFromHtml.map((link) => `${origin}${link}`);
      // const newResponseData = coreHTML.reWriteLinks(response.data, origin, folderName);
      // const newResponseDataPrettier = prettier.format(newResponseData,
      // { parser: 'html', plugins: [parserHTML] });
      // return fsp.writeFile(coreHTML.path, newResponseDataPrettier, 'utf8');
      return coreHTML.reWriteLinks(response.data, origin, folderName);
    })
    .then(() => fsp.mkdir(path.join(outputPath, folderName)))
    .then(() => {
      const newOutputPath = path.join(outputPath, folderName);
      const promises = absoluteLinks
        .map((link) => {
          const extension = getExtension(new URL(link));
          let source;
          if (extension === '.png' || extension === '.jpg') {
            source = new ImageSource(newOutputPath, link, { isCore: false });
          } else {
            source = new Source(newOutputPath, link, { isCore: false });
          }

          const axiosConfig = getAxiosConfig(source.url);
          return axios(axiosConfig).then((response) => source.setSourceData(response.data));
        });
      return Promise.all(promises);
    })
    .then(() => coreHTML.path)
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
//     // '    <a href="/professions.js">Node.js-программист</a>\n' +
//     // '    <a href="/professions/nodejs">Node.js-программист</a>\n' +
//     '</h3>\n' +
//     '</body>\n' +
//     '</html>';

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
