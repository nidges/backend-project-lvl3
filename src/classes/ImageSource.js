import fs from 'fs';
import Source from './Source.js';

export default class ImageSource extends Source {
  getSourceData() {
    const reader = fs.createReadStream(this.path);
    return new Promise((resolve, reject) => {
      let data = '';

      reader.on('data', (chunk) => {
        data += chunk;
      });
      reader.on('end', () => resolve(data));
      reader.on('error', (error) => reject(error));
    });
  }

  setSourceData(data) {
    data.pipe(fs.createWriteStream(this.path));
    return new Promise((resolve, reject) => {
      data.on('end', () => resolve());
      data.on('error', () => reject());
    });
  }
}
