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

  setSourceData(data) {
    return new Promise((resolve, reject) => {
      data.pipe(fs.createWriteStream(this.path));
      data.on('end', () => resolve());
      data.on('error', () => reject());
    });
  }
}
