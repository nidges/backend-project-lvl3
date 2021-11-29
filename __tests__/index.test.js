import nock from 'nock';
import path from 'path';
import os from 'os';
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import pageLoader from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

let tempDirPath;
let fakeResponseBody;
let expectedHTML;
let pathToPNG;
let expectedPNG;

beforeAll(async () => {
  fakeResponseBody = await fsp.readFile(getFixturePath('HTML-response.html'), 'utf8');
  expectedHTML = await fsp.readFile(getFixturePath('expectedHTML.html'), 'utf8');
  expectedPNG = await fsp.readFile(getFixturePath('expectedPNG.png'), 'base64');
  nock.disableNetConnect();
});

beforeEach(async () => {
  // /var/folders/q2/cr_939816rzc8dsxp9bb8g5m0000gn/T/ cmd+shift+G in finder to access
  tempDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  pathToPNG = path.join(tempDirPath, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png');
});

test('correct run: folder, files and their contents', async () => {
  nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .reply(200, fakeResponseBody);

  const filePath = await pageLoader(tempDirPath, 'https://ru.hexlet.io/courses');
  expect(filePath).toBe(path.join(tempDirPath, 'ru-hexlet-io-courses.html'));

  const loadedHTML = await fsp.readFile(filePath, 'utf8');
  expect(loadedHTML).toEqual(expectedHTML);

  pathToPNG = path.join(tempDirPath, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png');
  //возможно, это надо получать из функции, но кажется достаточно проверить просто совпадение содержимого
  const loadedPNG = await fsp.readFile(pathToPNG, 'base64');
  expect(loadedPNG).toEqual(expectedPNG);
});

test('errors', async () => {
  nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .reply(400, '');

  expect.assertions(1);
  await expect(pageLoader(tempDirPath, 'https://ru.hexlet.io/courses')).rejects.toThrow('error! responded with code 400');
  // return pageLoader(tempDirPath, 'https://ru.hexlet.io/courses').catch((e) => expect(e.message).toEqual('error! responded with code 400'));
  // линтер ругается что expect в коллбеке
});
