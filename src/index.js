import path from 'path';
import axios from 'axios';
// import axiosDebug from 'axios-debug-log';
import fsp from 'fs/promises';
// import nock from 'nock';
import debug from 'debug';
import Source from './classes/Source.js';
import ImageSource from './classes/ImageSource.js';
import CoreHTML from './classes/CoreHTML.js';
import { getAxiosConfig, getExtension } from './utils.js';

const logger = debug('page-loader');

export default function pageLoader(outputPath, url) {
  const coreHTML = new CoreHTML(outputPath, url);
  const folderName = `${coreHTML.name.slice(0, -5)}_files`;
  const coreAxiosConfig = getAxiosConfig(coreHTML.url);
  let localLinks = [];

  return axios(coreAxiosConfig)
    .then((response) => {
      logger(`Request to ${url} responded with status ${response.status}.`);
      localLinks = coreHTML.extractLocalLinks(response.data);
      return coreHTML.reWriteLocalLinks(response.data, folderName);
    })
    .then(() => {
      logger(`Core HTML "${coreHTML.name}" has been saved to "${outputPath}"`);
    })
    .then(() => fsp.mkdir(path.join(outputPath, folderName)))
    .then(() => {
      const newOutputPath = path.join(outputPath, folderName);
      const promises = localLinks
        .map((link) => {
          const extension = getExtension(new URL(link));
          let source;

          if (['.png', '.jpg'].includes(extension)) {
            source = new ImageSource(newOutputPath, link);
          } else {
            source = new Source(newOutputPath, link);
          }

          const axiosConfig = getAxiosConfig(source.url);

          return axios(axiosConfig)
            .then((response) => {
              logger(`Request to ${link} responded with status ${response.status}.`);
              return source.setSourceData(response.data);
            })
            .then(() => {
              logger(`File "${source.name}" has been saved to "${newOutputPath}"`);
            });
        });
      return Promise.all(promises);
    })
    .then(() => coreHTML.path)
    .catch((error) => {
      if (error.response) {
        logger(`Error! Request to ${url} responded with status ${error.response.status}.`);
        console.log('error! responded with code', error.response.status);
        throw new Error(`error! responded with code ${error.response.status}`);
      } else {
        console.log('error!', error.message);
        throw new Error(`error! ${error.message}`);
      }
    });
}

// const html = '<!DOCTYPE html>\n' +
//   '<html lang="ru">\n' +
//   '<head>\n' +
//   '    <meta charset="utf-8">\n' +
//   '    <title>Курсы по программированию Хекслет</title>\n' +
//   '    <link rel="stylesheet" media="all" href="https://cdn2.hexlet.io/assets/menu.css">\n' +
//   '    <link rel="stylesheet" media="all" href="/assets/application.css" />\n' +
//   '    <link href="/courses" rel="canonical">\n' +
//   '</head>\n' +
//   '<body>\n' +
//   '<img src="/assets/professions/nodejs.png" alt="Иконка профессии Node.js-программист" />\n' +
//   '<h3>\n' +
//   '    <a href="/professions/nodejs">Node.js-программист</a>\n' +
//   '</h3>\n' +
//   '<script src="https://js.stripe.com/v3/"></script>\n' +
//   '<script src="https://ru.hexlet.io/packs/js/runtime.js"></script>\n' +
//   '</body>\n' +
//   '</html>\n';

// const outputPath = '/Users/mariastepanova/WebstormProjects/backend-project-lvl3';
// const myUrl = 'https://ru.hexlet.io/courses';

// nock.disableNetConnect();
// nock(/ru\.hexlet\.io/)
//   .persist()
//   .get('/courses')
//   .times(2)
//   .reply(200, html)
//   .get('/professions/nodejs')
//   .reply(200, 'this is professions.nodejs - must be html')
//   .get('/assets/professions/nodejs.png')
//   .replyWithFile(200, '../__fixtures__/expectedPNG.png')
//   .get('/packs/js/runtime.js')
//   .replyWithFile(200, '../__fixtures__/expectedScript.js')
//   // .reply(200, 'console.log("I\'m the coolest script!");')
//   .get('/assets/application.css')
//   .reply(200, 'a {\n' +
//     '    color: red;\n' +
//     '}\n');

// pageLoader(outputPath, myUrl, {  });
