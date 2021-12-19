import path from 'path';
import fsp from 'fs/promises';
import { getFileName, getExtension } from '../utils.js';
import fs from 'fs';

export default class Source {
  constructor(outputPath, url) {
    this.url = new URL(url);
    this.name = getFileName(this.url);
    this.extension = getExtension(this.url);
    this.path = path.join(outputPath, `${this.name}${this.extension}`);
  }

  // getSourceData() {
  //   return fsp.readFile(this.path, 'utf8');
  // }

  setSourceData(data) {
    // if (this.extension === '.css') {
    //   const newData = prettier.format(data, { parser: 'css'});
    //   return fsp.writeFile(this.path, newData, 'utf8');
    // }
    // return fsp.writeFile(this.path, data);
    data.pipe(fs.createWriteStream(this.path));
    return new Promise((resolve, reject) => {
      data.on('end', () => resolve());
      data.on('error', () => reject());
    });
  }

}
