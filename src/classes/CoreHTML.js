import cheerio from 'cheerio';
import prettier from 'prettier/standalone.js';
import parserHTML from 'prettier/parser-html.js';
import fsp from 'fs/promises';
import Source from './Source.js';
import { getExtension, getFileName, normalizeLink } from '../utils.js';

const mapping = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const tags = ['img', 'link', 'script'];

export default class CoreHTML extends Source {
  // static mapping = {
  //   img: 'src',
  //   link: 'href',
  //   script: 'src',
  // };
  //
  // static tags = ['img', 'link', 'script'];

  getAxiosConfig() {
    return {
      method: 'get',
      url: this.url.toString(),
    };
  }

  extractLocalLinks(html) {
    const links = [];
    const $ = cheerio.load(html);
    const { origin } = this.url;

    tags.forEach((tag) => {
      $(tag).each(function () {
        links.push($(this).attr(mapping[tag]));
      });
    });

    return links
      .filter(Boolean)
      .map((link) => normalizeLink(this.url, link))
      .filter((link) => link.origin === origin)
      .map((link) => link.toString());
  }

  setSourceData(html) {
    const $ = cheerio.load(html);
    const { origin } = this.url;
    const coreUrl = this.url;
    const folderName = `${this.name}_files`;

    // rewriting all links to core page's sources in HTML attributes
    // only links to the same third level domain pages are rewritten
    tags.forEach((tag) => {
      $(tag).each(function () {
        const relativeLink = $(this).attr(mapping[tag]);
        if (relativeLink) {
          const absoluteLink = normalizeLink(coreUrl, relativeLink);
          let resultingLink = '';

          if (absoluteLink.origin === origin) {
            resultingLink = `${folderName}/${getFileName(absoluteLink)}${getExtension(absoluteLink)}`;
          } else {
            resultingLink = absoluteLink.toString();
          }

          $(this).attr(mapping[tag], resultingLink);
        }
      });
    });

    // already rewritten HTML goes into the file so this method is polymorphic
    const prettierHTML = prettier.format($.html(), { parser: 'html', plugins: [parserHTML] });
    return fsp.writeFile(this.path, prettierHTML, 'utf8');
  }
}
