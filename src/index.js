import fsp from 'fs/promises';
import path from 'path';
import axios from 'axios';
import cheerio from "cheerio";

function getFileNameFromUrl(url, ext = 'html') {
  const myUrl = new URL(url);
  const urlStrNoProtocol = myUrl.toString().slice(myUrl.protocol.length + 2);
  // console.log('urlStrNoProtocol', urlStrNoProtocol);
  // console.log(path.parse(urlStrNoProtocol).ext);
  const regNoSymbols = /\W/;
  // или лучше вырезать расширение?
  // ext = path.parse(urlStrNoProtocol).ext??
  const urlStrNoSymbols = urlStrNoProtocol
    .split('')
    .map((letter) => {
      if (regNoSymbols.test(letter)) return '-';
      return letter;
    })
    .join('');
  // console.log('urlStrNoSymbols', urlStrNoSymbols);
  return `${urlStrNoSymbols}.${ext}`;
}

const outputPath = '/Users/mariastepanova/WebstormProjects/backend-project-lvl3';
const myUrl = 'https://ru.hexlet.io/courses';

const mapping = {
  a: 'href',
  img: 'src',
}
const tags = ['a', 'img'];

function extractLinks(html) {
  const $ = cheerio.load(html);
  tags.map((tag) => {
    $(tag).each(function() {
      $(this).attr(mapping[tag], 'hohohaha');
    })
  });
  return $.html();
}

export default function pageLoader(outputPath, url) {
  const fileExt = path.parse(url).ext ?? '.html';
  console.log('--->fileExt', fileExt);
  //надо добавить конфиг с опциями для аксиоса??
  const fileName = getFileNameFromUrl(url);
  const filePath = path.join(outputPath, fileName);

  return axios.get(url)
    .then((response) => {
        //вытянуть ссылки и переделать их
        fsp.writeFile(filePath, response.data) //сюда надо будет писать уже с переделанными ссылками
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

pageLoader(outputPath, myUrl);



