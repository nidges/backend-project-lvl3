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
let pathToActualScript;
let expectedScript;
let pathToActualCSS;
let expectedCSS;

const scope = nock('https://ru.hexlet.io');

beforeAll(async () => {
  // /var/folders/q2/cr_939816rzc8dsxp9bb8g5m0000gn/T/ cmd+shift+G in finder to access
  tempDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  fakeHTML = await fsp.readFile(getFixturePath('fakeHTML.html'), 'utf8');
  expectedHTML = await fsp.readFile(getFixturePath('expectedHTML.html'), 'utf8');

  expectedPNG = await fsp.readFile(getFixturePath('expectedPNG.png'));
  pathToActualPNG = path.join(tempDirPath, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png');

  pathToActualScript = path.join(tempDirPath, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-packs-js-runtime.js');
  expectedScript = await fsp.readFile(getFixturePath('expectedScript.js'));

  pathToActualCSS = path.join(tempDirPath, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-application.css');
  expectedCSS = await fsp.readFile(getFixturePath('expectedCSS.css'));

  nock.disableNetConnect();
  scope
    .get('/courses')
    .times(2)
    .reply(200, fakeHTML)
    .get('/professions/nodejs')
    .reply(200, 'this is professions.nodejs - must be html')
    .get('/assets/professions/nodejs.png')
    .replyWithFile(200, getFixturePath('expectedPNG.png'))
    .get('/packs/js/runtime.js')
    .replyWithFile(200, getFixturePath('expectedScript.js'))
    // .reply(200, 'console.log("I\'m the coolest script!");')
    .get('/assets/application.css')
    .reply(200, 'a {\n'
      + '    color: red;\n'
      + '}\n');
});

afterEach(() => {
  nock.cleanAll();
});

test('correct run: folder, files and their contents', async () => {
  const coreHTMLPath = await pageLoader(tempDirPath, 'https://ru.hexlet.io/courses');
  expect(coreHTMLPath).toBe(path.join(tempDirPath, 'ru-hexlet-io-courses.html'));

  const actualCoreHTML = await fsp.readFile(coreHTMLPath, 'utf8');
  expect(actualCoreHTML).toEqual(expectedHTML);

  const actualPNG = await fsp.readFile(pathToActualPNG);
  expect(actualPNG).toEqual(expectedPNG);

  const actualScript = await fsp.readFile(pathToActualScript);
  expect(actualScript).toEqual(expectedScript);

  const actualCSS = await fsp.readFile(pathToActualCSS);
  expect(actualCSS).toEqual(expectedCSS);
});

test('errors', async () => {
  scope
    .get('/courses')
    .reply(400, '');

  expect.assertions(1);
  await expect(pageLoader(tempDirPath, 'https://ru.hexlet.io/courses')).rejects.toThrow('Error! Request to https://ru.hexlet.io/courses responded with code 400');
  // return pageLoader(tempDirPath, 'https://ru.hexlet.io/courses').catch((e) => expect(e.message).toEqual('error! responded with code 400'));
  // линтер ругается что expect в коллбеке
});
