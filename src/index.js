import fsp from 'fs/promises';
import path from 'path';
import axios from 'axios';

function getFileNameFromUrl(url) {
  const myUrl = new URL(url);
  const urlStrNoProtocol = myUrl.toString().slice(myUrl.protocol.length + 2);
  const regNoSymbols = /\W/;
  const urlStrNoSymbols = urlStrNoProtocol
    .split('')
    .map((letter) => {
      if (regNoSymbols.test(letter)) return '-';
      return letter;
    })
    .join('');
  return `${urlStrNoSymbols}.html`;
}

// const outputPath = '/Users/mariastepanova/WebstormProjects/backend-project-lvl3';
// const myUrl = 'https://ru.hexlet.io/courses';

export default function pageLoader(outputPath, url) {
  const fileName = getFileNameFromUrl(url);
  const filePath = path.join(outputPath, fileName);

  return axios.get(url)
    .then((response) => fsp.writeFile(filePath, response.data))
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

// pageLoader(outputPath, myUrl);
