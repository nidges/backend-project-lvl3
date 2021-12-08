import fs from 'fs';
import Source from './Source.js';

export default class ImageSource extends Source {
  // getSourceData() {
  //   fs.createReadStream(this.path);
  //   return new Promise((resolve, reject) => {
  //     on('end', () => {
  //       resolve();
  //     });
  //
  //     on('error', () => {
  //       reject();
  //     });
  //   });
  // }

  setSourceData(data) {
    data.pipe(fs.createWriteStream(this.path));
    return new Promise((resolve, reject) => {
      data.on('end', () => {
        resolve();
      });

      data.on('error', () => {
        reject();
      });
    });
  }
}
