import path from 'path';

const sourceExtensions = ['.png', 'jpeg', '.jpg', '.css', '.js', '.html'];

export const getExtension = (urlInstance) => {
  const extension = path.parse(urlInstance.pathname).ext;
  return sourceExtensions.includes(extension) ? extension : '.html';
}

export const getFileName = (urlInstance) => {
  // normalizing
  let urlFullPath = `${urlInstance.host}${urlInstance.pathname}`;
  if (urlFullPath[urlFullPath.length - 1] === '/') {
    urlFullPath = urlFullPath.slice(0, -1);
  }

  // removing extension if there is one
  const extension = path.parse(urlInstance.pathname).ext;
  if (sourceExtensions.includes(extension)) {
    urlFullPath = `${path.parse(urlFullPath).dir}/${path.parse(urlFullPath).name}`;
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
}

// transforming absolute and two types of relative links
// (from root and from current folder) to absolute links with correct [base]

export const normalizeLink = (coreUrl, link) => {
  const { origin } = coreUrl;

  if (link.includes(origin) || link[0] === '/') {
    return new URL(link, origin);
  } if (link.includes('http')) {
    return new URL(link);
  }
  return new URL(`${path.parse(coreUrl.toString()).dir}/${link}`);
}
