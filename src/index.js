import path from 'path';
import axios from 'axios';
import fsp from 'fs/promises';
import fs from 'fs';
import debug from 'debug';
import Listr from 'listr';
import CoreHTML from './classes/CoreHTML.js';
import { getAxiosConfig } from './utils.js';
import SourceFactory from './classes/SourceFactory.js';

const logger = debug('page-loader');

export default function pageLoader(url, outputPath) {
  // CoreHTML is a class for the HTML file that can be opened locally later
  const coreHTML = new CoreHTML(outputPath, url);
  const folderName = `${coreHTML.name}_files`;
  const coreAxiosConfig = getAxiosConfig(coreHTML.url);
  let localLinks = [];

  return fsp.access(outputPath, fs.constants.R_OK || fs.constants.W_OK)
    .then(() => axios(coreAxiosConfig))
    .then((response) => {
      logger(`Request to ${url} responded with status ${response.status}.`);
      // this is a list of links with the same third level domain as the CoreHTML link
      // all of them lead to Sources that should be downloaded into the folder
      localLinks = coreHTML.extractLocalLinks(response.data);
      return coreHTML.setSourceData(response.data);
    })
    .then(() => {
      logger(`Core HTML "${coreHTML.name}${coreHTML.extension}" has been saved to "${outputPath}"`);
    })
    .then(() => fsp.mkdir(path.join(outputPath, folderName)))
    .then(() => {
      const newOutputPath = path.join(outputPath, folderName);

      const listrTasksPromises = localLinks
        .map((link) => {
          // creating Source objects depending on their type (text or image)
          // these Source files are stored in the folder and are connected to CoreHTML file
          const SourceConstructor = SourceFactory.factory(link);
          const source = new SourceConstructor(newOutputPath, link);
          // const axiosConfig = getAxiosConfig(source.url);

          const axiosConfig = {
            method: 'get',
            url: link,
            responseType: 'stream',
          };

          // we are creating an array of objects correlating with Listr signature
          return {
            title: link,
            task: (ctx, task) => axios(axiosConfig)
              .then((response) => {
                logger(`Request to ${link} responded with status ${response.status}.`);
                return source.setSourceData(response.data);
              })
              .then(() => {
                logger(`File "${source.name}${source.extension}" has been saved to "${newOutputPath}"`);
              })
              .catch((error) => {
                logger(`Warning! Unable to download source from ${error.config.url}. Skipping. Error: ${error.message}`);
                task.skip(`Warning! Unable to download source from ${error.config.url}. Skipping. Error: ${error.message}`);
              }),
          };
        });
      // all Listr tasks will be performed simultaneously due to "concurrent: true" flag
      const tasks = new Listr(listrTasksPromises, { concurrent: true });
      return Promise.resolve(tasks.run());
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
