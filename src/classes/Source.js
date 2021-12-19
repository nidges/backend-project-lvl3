import path from 'path';
import fsp from 'fs/promises';
import { getFileName, getExtension } from '../utils.js';

export default class Source {
  constructor(outputPath, url) {
    this.url = new URL(url);
    this.name = getFileName(this.url);
    this.extension = getExtension(this.url);
    this.path = path.join(outputPath, `${this.name}${this.extension}`);
  }

  getSourceData() {
    return fsp.readFile(this.path, 'utf8');
  }

  setSourceData(data) {
    return fsp.writeFile(this.path, data, 'utf8');
  }
}