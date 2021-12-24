import path from 'path';
import cheerio from 'cheerio';
import prettier from 'prettier/standalone.js';
import parserHTML from 'prettier/parser-html.js';
import fsp from 'fs/promises';
import fs from 'fs';

const sourceExtensions = ['.png', 'jpeg', '.jpg', '.css', '.js', '.html'];

const mapping = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const tags = ['img', 'link', 'script'];

export const getExtension = (urlInstance) => {
  const extension = path.parse(urlInstance.pathname).ext;
  return sourceExtensions.includes(extension) ? extension : '.html';
};

export const getFileName = (urlInstance) => {
  // normalizing
  let urlFullPath = `${urlInstance.host}${urlInstance.pathname}`;
  if (urlFullPath[urlFullPath.length - 1] === '/') {
    urlFullPath = urlFullPath.slice(0, -1);
  }

  // removing extension if there is one
  const parsedUrlPath = path.parse(urlFullPath);
  const extension = parsedUrlPath.ext;
  if (sourceExtensions.includes(extension)) {
    urlFullPath = `${parsedUrlPath.dir}/${parsedUrlPath.name}`;
  }

  // changing all not word symbols to dashes
  const regJustSymbols = /\W/;
  return urlFullPath
    .split('')
    .map((letter) => {
      if (regJustSymbols.test(letter)) return '-';
      return letter;
    })
    .join('');
};

// transforming absolute and two types of relative links
// (from root and from current folder) to absolute links with correct [base]
export const normalizeLink = (link, coreUrl) => {
  const { origin } = coreUrl;

  let normalizedLink;

  if (link.includes(origin) || link[0] === '/') {
    normalizedLink = new URL(link, origin);
  } else if (link.includes('http')) {
    normalizedLink = new URL(link);
  } else {
    normalizedLink = new URL(`${path.parse(coreUrl.toString()).dir}/${link}`);
  }

  return normalizedLink;
};

export const extractLocalLinks = (html, coreUrl) => {
  const links = [];
  const $ = cheerio.load(html);
  const { origin } = coreUrl;

  tags.forEach((tag) => {
    $(tag).each(function () {
      links.push($(this).attr(mapping[tag]));
    });
  });

  return links
    .filter(Boolean)
    .map((link) => normalizeLink(link, coreUrl))
    .filter((link) => link.origin === origin)
    .map((link) => link.toString());
};
export const writeCoreHTML = (html, coreHTML) => {
  const $ = cheerio.load(html);
  const { origin } = coreHTML.coreUrl;
  const folderName = `${coreHTML.name}_files`;

  // rewriting all links to core page's sources in HTML attributes
  // only links to the same third level domain pages are rewritten
  tags.forEach((tag) => {
    $(tag).each(function () {
      const relativeLink = $(this).attr(mapping[tag]);
      if (relativeLink) {
        const absoluteLink = normalizeLink(relativeLink, coreHTML.coreUrl);
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

  // already rewritten HTML goes into the file
  const prettierHTML = prettier.format($.html(), { parser: 'html', plugins: [parserHTML] });
  return fsp.writeFile(coreHTML.path, prettierHTML, 'utf8');
};

export const writeSource = (data, source) => data.pipe(fs.createWriteStream(source.path));
// return new Promise((resolve, reject) => {
//   data.pipe(fs.createWriteStream(source.path));
//   data.on('end', () => resolve());
//   data.on('error', () => reject());
// });
