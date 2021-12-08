import path from 'path';
import cheerio from 'cheerio';

export default class Source {
  static mapping = {
    a: 'href',
    img: 'src',
  };

  static tags = ['a', 'img'];

  constructor(url, options = {}) {
    const defaultOptions = { isFolder: false, isCore: true };
    this.options = { ...defaultOptions, ...options };
    this.url = new URL(url);
  }

  getExtension() {
    if (this.options.isFolder) {
      return '_files';
    }
    const extension = path.parse(this.url.pathname).ext;
    return extension || '.html';
  }

  getFileName() {
    const urlFullPath = `${this.url.host}${this.url.pathname}`;

    // removing extension
    const urlPathNoExtension = `${path.parse(urlFullPath).dir}/${path.parse(urlFullPath).name}`;
    const regJustSymbols = /\W/;
    const urlPathNoSymbols = urlPathNoExtension
      .split('')
      .map((letter) => {
        if (regJustSymbols.test(letter)) return '-';
        return letter;
      })
      .join('');

    return `${urlPathNoSymbols}${this.getExtension()}`;
  }

  extractLinks(html) {
    const links = [];
    const $ = cheerio.load(html);

    if (this.options.isCore) {
      Source.tags.forEach((tag) => {
        $(tag).each(function () {
          links.push($(this).attr(Source.mapping[tag]));
        });
      });
    }
    return links;
  }

  reWriteLinks(html, origin, folderName) {
    const $ = cheerio.load(html);
    if (this.options.isCore) {
      Source.tags.forEach((tag) => {
        $(tag).each(function () {
          const link = `${origin}${$(this).attr(Source.mapping[tag])}`;
          const tempFile = new Source(link, { isCore: false });
          const name = tempFile.getFileName();
          const nameWithFolder = `${folderName}/${name}`;
          $(this).attr(Source.mapping[tag], nameWithFolder);
        });
      });
      return $.html();
    }

    return $.html();
  }

  // нужны все таки геттеры и сеттеры контента. подумать об абстракции вообще что мы создаем.
  // может нам нужна фабрика которая будет создавать нужный экземпляр с полиморфными методами?
  // нужно серьезно пересмотреть не сифонит ли абстракция

  // не должно ли быть получение response data внутри абстракции?

  // html файл должен быть наследником этого класса?
}
