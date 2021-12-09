import path from 'path';

export function getExtension(urlInstance) {
  const extension = path.parse(urlInstance.pathname).ext;
  return extension || '.html';
}

export function getAxiosConfig(urlInstance) {
  const defaultConfig = {
    method: 'get',
    url: urlInstance.toString(),
  };

  if (['.png', '.jpg'].includes(getExtension(urlInstance))) {
    return Object.assign(defaultConfig, { responseType: 'stream' });
  }
  return defaultConfig;
}

export function getFileName(urlInstance) {
  const urlFullPath = `${urlInstance.host}${urlInstance.pathname}`;

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

  return `${urlPathNoSymbols}${getExtension(urlInstance)}`;
}
