import path from 'path';
import fs from 'fs';
import { getFileName, getExtension } from '../utils.js';

export default class Source {
  constructor(outputPath, url) {
    this.url = new URL(url);
    this.name = getFileName(this.url);
    this.extension = getExtension(this.url);
    this.path = path.join(outputPath, `${this.name}${this.extension}`);
  }

  getAxiosConfig() {
    return {
      method: 'get',
      url: this.url.toString(),
      responseType: 'stream',
    };
  }

  setSourceData(data) {
    // return fsp.writeFile(this.path, data);
    data.pipe(fs.createWriteStream(this.path));
    return new Promise((resolve, reject) => {
      data.on('end', () => resolve());
      data.on('error', () => reject());
    });
  }
}
