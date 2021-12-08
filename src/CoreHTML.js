import cheerio from 'cheerio';
import prettier from 'prettier/standalone.js';
import parserHTML from 'prettier/parser-html.js';
import Source from './Source.js';
import { getFileName } from './utils.js';

export default class CoreHTML extends Source {
  static mapping = {
    a: 'href',
    img: 'src',
  };

  static tags = ['a', 'img'];

  static extractLinks(html) {
    const links = [];
    const $ = cheerio.load(html);

    CoreHTML.tags.forEach((tag) => {
      $(tag).each(function () {
        links.push($(this).attr(CoreHTML.mapping[tag]));
      });
    });

    return links;
  }

  reWriteLinks(html, origin, folderName) {
    const $ = cheerio.load(html);

    CoreHTML.tags.forEach((tag) => {
      $(tag).each(function () {
        const link = `${origin}${$(this).attr(CoreHTML.mapping[tag])}`;
        const name = getFileName(new URL(link));
        const nameWithFolder = `${folderName}/${name}`;
        $(this).attr(CoreHTML.mapping[tag], nameWithFolder);
      });
    });
    const prettierHTML = prettier.format($.html(), { parser: 'html', plugins: [parserHTML] });
    // return $.html();
    return this.setSourceData(prettierHTML);
  }
}
