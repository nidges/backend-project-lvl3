import path from 'path';
import fsp from 'fs/promises';
import { getFileName } from '../utils.js';

export default class Source {
  constructor(outputPath, url) {
    this.url = new URL(url);
    // this.url = url;
    this.name = getFileName(this.url);
    this.path = path.join(outputPath, this.name);
  }

  getSourceData() {
    return fsp.readFile(this.path, 'utf8');
  }

  setSourceData(data) {
    return fsp.writeFile(this.path, data, 'utf8');
  }

  // нужны все таки геттеры и сеттеры контента. подумать об абстракции вообще что мы создаем.
  // может нам нужна фабрика которая будет создавать нужный экземпляр с полиморфными методами?
  // нужно серьезно пересмотреть не сифонит ли абстракция

  // не должно ли быть получение response data внутри абстракции?
}
