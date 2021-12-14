import path from 'path';

const sourceExtensions = ['.png', 'jpeg', '.jpg', '.css', '.js', '.html'];
export const imageExtensions = ['.png', '.jpeg', '.jpg'];

export function getExtension(urlInstance) {
  const extension = path.parse(urlInstance.pathname).ext;
  return sourceExtensions.includes(extension) ? extension : '.html';
}

export function getAxiosConfig(urlInstance) {
  const defaultConfig = {
    method: 'get',
    url: urlInstance.toString(),
  };

  if (imageExtensions.includes(getExtension(urlInstance))) {
    return Object.assign(defaultConfig, { responseType: 'stream' });
  }
  return defaultConfig;
}

export function getFileName(urlInstance) {
  let urlFullPath = `${urlInstance.host}${urlInstance.pathname}`;
  if (urlFullPath[urlFullPath.length - 1] === '/') {
    urlFullPath = urlFullPath.slice(0, -1);
  }

  // removing extension if there is one
  const extension = path.parse(urlInstance.pathname).ext;
  if (sourceExtensions.includes(extension)) {
    urlFullPath = `${path.parse(urlFullPath).dir}/${path.parse(urlFullPath).name}`;
  }

  const regJustSymbols = /\W/;
  return urlFullPath
    .split('')
    .map((letter) => {
      if (regJustSymbols.test(letter)) return '-';
      return letter;
    })
    .join('');
}

export function normalizeLink(coreUrl, link) {
  const { origin } = coreUrl;

  if (link.includes(origin) || link[0] === '/') {
    return new URL(link, origin);
  } if (link.includes('http')) {
    return new URL(link);
  }
  return new URL(`${path.parse(coreUrl.toString()).dir}/${link}`);
}
