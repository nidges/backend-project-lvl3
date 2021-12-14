import path from 'path';
import axios from 'axios';
// import axiosDebug from 'axios-debug-log';
import fsp from 'fs/promises';
import fs from 'fs';
// import nock from 'nock';
import debug from 'debug';
import CoreHTML from './classes/CoreHTML.js';
import { getAxiosConfig } from './utils.js';
import SourceFactory from './classes/SourceFactory.js';

const logger = debug('page-loader');

export default function pageLoader(outputPath, url) {
  const coreHTML = new CoreHTML(outputPath, url);
  const folderName = `${coreHTML.name}_files`;
  const coreAxiosConfig = getAxiosConfig(coreHTML.url);
  let localLinks = [];

  return fsp.access(outputPath, fs.constants.R_OK || fs.constants.W_OK)
    .then(() => axios(coreAxiosConfig))
    .then((response) => {
      logger(`Request to ${url} responded with status ${response.status}.`);
      localLinks = coreHTML.extractLocalLinks(response.data);
      return coreHTML.setSourceData(response.data);
    })
    .then(() => {
      logger(`Core HTML "${coreHTML.name}${coreHTML.extension}" has been saved to "${outputPath}"`);
    })
    .then(() => fsp.mkdir(path.join(outputPath, folderName)))
    .then(() => {
      const newOutputPath = path.join(outputPath, folderName);
      const promises = localLinks
        .map((link) => {
          const SourceConstructor = SourceFactory.factory(link);
          const source = new SourceConstructor(newOutputPath, link);
          const axiosConfig = getAxiosConfig(source.url);

          return axios(axiosConfig)
            .then((response) => {
              logger(`Request to ${link} responded with status ${response.status}.`);
              return source.setSourceData(response.data);
            })
            .then(() => {
              logger(`File "${source.name}${source.extension}" has been saved to "${newOutputPath}"`);
            })
            .catch((error) => {
              logger(`Warning! Unable to download source from ${error.config.url}. Skipping. Error: ${error.message}`);
              console.log(`Warning! Unable to download source from ${error.config.url}. Skipping. Error: ${error.message}`);
              return Promise.resolve();
            });
        });
      return Promise.all(promises);
    })
    .then(() => coreHTML.path)
    .catch((error) => {
      if (error.response) {
        logger(`Error! Request to ${error.response.config.url} responded with code ${error.response.status}`);
        throw new Error(`Error! Request to ${error.response.config.url} responded with code ${error.response.status}`);
      } else if (error.request) {
        logger(`Error! Request to ${error.config.url} was made but no response was received`);
        throw new Error(`Error! Request to ${error.config.url} was made but no response was received`);
      } else if (error.code === 'EEXIST') {
        logger(`The directory "${path.join(outputPath, folderName)}" can't be created, because it already exists`);
        throw new Error(`The directory "${path.join(outputPath, folderName)}" can't be created, because it already exists`);
      } else if (error.code === 'EACCES') {
        logger(`Error! You can't access folder ${outputPath}`);
        throw new Error(`Error! You can't access folder ${outputPath}`);
      } else {
        logger(`error! ${error.message}`);
        throw error;
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

// все пашет:
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

// nock.disableNetConnect();
// nock(/ru\.hexlet\.io/)
//   .get('/courses')
//   .reply(400, '');

// проблемы с внутренними ресурсами (не ошибки, предупреждения)
// nock.disableNetConnect();
// nock(/ru\.hexlet\.io/)
//   .get('/courses')
//   .times(2)
//   .reply(200, html)
//   .get('/assets/application.css')
//   .reply(200, 'a {\n'
//     + '    color: red;\n'
//     + '}\n')
//   .get('/professions/nodejs')
//   .reply(200, 'this is professions.nodejs - must be html')
//   .get('/assets/professions/nodejs.png')
//   .replyWithError('request error')
//   .get('/packs/js/runtime.js')
//   .reply(400, '');

// pageLoader(outputPath, myUrl, {  });
