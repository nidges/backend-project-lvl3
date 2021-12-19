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
  fakeHTML = await fsp.readFile(getFixturePath('fakeHTML.html'), 'utf8');
  expectedHTML = await fsp.readFile(getFixturePath('expectedHTML.html'), 'utf8');

  expectedPNG = await fsp.readFile(getFixturePath('expectedPNG.png'));

  expectedScript = await fsp.readFile(getFixturePath('expectedScript.js'), 'utf8');

  expectedCSS = await fsp.readFile(getFixturePath('expectedCSS.css'), 'utf8');

  nock.disableNetConnect();
});

beforeEach(async () => {
  // /var/folders/q2/cr_939816rzc8dsxp9bb8g5m0000gn/T/ cmd+shift+G in finder to access
  tempDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  pathToActualPNG = path.join(tempDirPath, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png');
  pathToActualScript = path.join(tempDirPath, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-packs-js-runtime.js');
  pathToActualCSS = path.join(tempDirPath, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-application.css');
});

afterEach(() => {
  nock.cleanAll();
});

test('correct run: folder, files and their contents', async () => {
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
    .get('/assets/application.css')
    .reply(200, 'a {\n'
      + '    color: red;\n'
      + '}\n');

  const coreHTMLPath = await pageLoader('https://ru.hexlet.io/courses', tempDirPath);

  expect(coreHTMLPath).toBe(path.join(tempDirPath, 'ru-hexlet-io-courses.html'));

  const actualCoreHTML = await fsp.readFile(coreHTMLPath, 'utf8');
  expect(actualCoreHTML).toEqual(expectedHTML);

  const actualPNG = await fsp.readFile(pathToActualPNG);
  expect(actualPNG).toEqual(expectedPNG);

  const actualScript = await fsp.readFile(pathToActualScript, 'utf8');
  console.log('actualScript', actualScript);
  expect(actualScript).toEqual(expectedScript);

  const actualCSS = await fsp.readFile(pathToActualCSS, 'utf8');
  console.log('actualCSS', actualCSS);
  expect(actualCSS).toEqual(expectedCSS);
});

test('axios error with 400 response code', async () => {
  scope
    .get('/courses')
    .reply(400, '');

  expect.assertions(1);
  await expect(pageLoader('https://ru.hexlet.io/courses', tempDirPath)).rejects.toThrow('Error! Request to https://ru.hexlet.io/courses responded with code 400');
});

test('axios request error', async () => {
  scope
    .get('/courses')
    .replyWithError('request error');

  expect.assertions(1);
  await expect(pageLoader('https://ru.hexlet.io/courses', tempDirPath)).rejects.toThrow('Error! Request to https://ru.hexlet.io/courses was made but no response was received');
});

test("errors while downloading additional resources don't stop the program", async () => {
  scope
    .get('/courses')
    .times(2)
    .reply(200, fakeHTML)
    .get('/assets/application.css')
    .reply(200, 'a {\n'
      + '    color: red;\n'
      + '}\n')
    .get('/professions/nodejs')
    .reply(200, 'this is professions.nodejs - must be html')
    .get('/assets/professions/nodejs.png')
    .replyWithError('request error')
    .get('/packs/js/runtime.js')
    .reply(400, '');

  await expect(pageLoader('https://ru.hexlet.io/courses', tempDirPath)).resolves.toBeTruthy();
});

test('directory already exists', async () => {
  scope
    .get('/courses')
    .reply(200, fakeHTML);

  await fsp.mkdir(path.join(tempDirPath, 'ru-hexlet-io-courses_files'));

  expect.assertions(1);
  await expect(pageLoader('https://ru.hexlet.io/courses', tempDirPath)).rejects.toThrow(`The directory "${path.join(tempDirPath, 'ru-hexlet-io-courses_files')}" can't be created, because it already exists`);
});

test('no access to directory', async () => {
  scope
    .get('/courses')
    .reply(200, fakeHTML);

  await fsp.chmod(tempDirPath, 0o000);
  await expect(pageLoader('https://ru.hexlet.io/courses', tempDirPath)).rejects.toThrow(`Error! You can't access folder ${tempDirPath}`);
  await fsp.chmod(tempDirPath, 0o666);
});
