import path from 'path';

// export function getAxiosConfig(source) {
//     const defaultConfig = {
//         method: 'get',
//         url: source.url.toString(),
//     };
//
//     if (source.getExtension() === '.png' || source.getExtension() === '.jpg') {
//         return Object.assign(defaultConfig, { responseType: 'stream' });
//     }
//     return defaultConfig;
// }

// export function getFileName(source) {
//     const urlFullPath = `${source.url.host}${source.url.pathname}`;
//
//     // removing extension
//     const urlPathNoExtension = `${path.parse(urlFullPath).dir}/${path.parse(urlFullPath).name}`;
//     const regJustSymbols = /\W/;
//     const urlPathNoSymbols = urlPathNoExtension
//         .split('')
//         .map((letter) => {
//             if (regJustSymbols.test(letter)) return '-';
//             return letter;
//         })
//         .join('');
//
//     return `${urlPathNoSymbols}${source.getExtension()}`;
// }

export function getExtension(urlInstance) {
  const extension = path.parse(urlInstance.pathname).ext;
  return extension || '.html';
}

export function getAxiosConfig(urlInstance) {
  const defaultConfig = {
    method: 'get',
    url: urlInstance.toString(),
  };

  if (getExtension(urlInstance) === '.png' || getExtension(urlInstance) === '.jpg') {
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
