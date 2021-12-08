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
let fakeHTML;
let expectedHTML;
let pathToActualPNG;
let expectedPNG;

beforeAll(async () => {
  // /var/folders/q2/cr_939816rzc8dsxp9bb8g5m0000gn/T/ cmd+shift+G in finder to access
  fakeHTML = await fsp.readFile(getFixturePath('fakeHTML.html'), 'utf8');
  expectedHTML = await fsp.readFile(getFixturePath('expectedHTML.html'), 'utf8');
  expectedPNG = await fsp.readFile(getFixturePath('expectedPNG.png'));
  tempDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  pathToActualPNG = path.join(tempDirPath, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png');

  nock.disableNetConnect();
});

beforeEach(async () => {

});

test('correct run: folder, files and their contents', async () => {
  nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .reply(200, fakeHTML)
    .get(/\/assets\/professions\/nodejs\./)
    .replyWithFile(200, getFixturePath('expectedPNG.png'))
    .get(/\/professions\/nodejs/)
    .reply(200, 'this is professions.nodejs - must be html');

  const coreHTMLPath = await pageLoader(tempDirPath, 'https://ru.hexlet.io/courses');
  expect(coreHTMLPath).toBe(path.join(tempDirPath, 'ru-hexlet-io-courses.html'));

  const actualCoreHTML = await fsp.readFile(coreHTMLPath, 'utf8');
  expect(actualCoreHTML).toEqual(expectedHTML);

  const actualPNG = await fsp.readFile(pathToActualPNG);
  expect(actualPNG).toEqual(expectedPNG);
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
