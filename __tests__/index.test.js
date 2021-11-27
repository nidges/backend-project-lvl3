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
let fakeHtmlBody;

beforeAll(async () => {
  fakeHtmlBody = await fsp.readFile(getFixturePath('HTML-response.html'), 'utf8');
  nock.disableNetConnect();
});

beforeEach(async () => {
  // /var/folders/q2/cr_939816rzc8dsxp9bb8g5m0000gn/T/ cmd+shift+G in finder to access
  tempDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('correct run: new file name and contents', async () => {
  nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .reply(200, fakeHtmlBody);

  const filePath = await pageLoader(tempDirPath, 'https://ru.hexlet.io/courses');
  expect(filePath).toBe(path.join(tempDirPath, 'ru-hexlet-io-courses.html'));

  const loadedHTML = await fsp.readFile(filePath, 'utf8');
  expect(loadedHTML).toEqual(fakeHtmlBody);
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
