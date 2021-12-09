import cheerio from 'cheerio';
import prettier from 'prettier/standalone.js';
import parserHTML from 'prettier/parser-html.js';
import Source from './Source.js';
import { getFileName } from '../utils.js';

export default class CoreHTML extends Source {
  static mapping = {
    img: 'src',
    link: 'href',
    script: 'src',
  };

  static tags = ['img', 'link', 'script'];

  extractLocalLinks(html) {
    const links = [];
    const $ = cheerio.load(html);
    const { origin } = this.url;

    CoreHTML.tags.forEach((tag) => {
      $(tag).each(function () {
        links.push($(this).attr(CoreHTML.mapping[tag]));
      });
    });

    return links
      .map((link) => new URL(link, origin))
      .filter((link) => link.origin === origin)
      .map((link) => link.toString());
  }

  reWriteLocalLinks(html, folderName) {
    const $ = cheerio.load(html);
    const { origin } = this.url;

    CoreHTML.tags.forEach((tag) => {
      $(tag).each(function () {
        const relativeLink = $(this).attr(CoreHTML.mapping[tag]);
        const absoluteLink = new URL(relativeLink, origin);
        let resultingLink = '';

        if (absoluteLink.origin === origin) {
          resultingLink = `${folderName}/${getFileName(absoluteLink)}`;
        } else {
          resultingLink = absoluteLink.toString();
        }

        $(this).attr(CoreHTML.mapping[tag], resultingLink);
      });
    });

    const prettierHTML = prettier.format($.html(), { parser: 'html', plugins: [parserHTML] });

    return this.setSourceData(prettierHTML);
  }
}
