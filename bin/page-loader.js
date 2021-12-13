#!/usr/bin/env node

import { Command } from 'commander/esm.mjs';
import pageLoader from '../src/index.js';

const program = new Command();

program
  .description('Page loader utility.')
  .version('0.0.1', '-V, --version', 'output the version number')
  .helpOption('-h, --help', 'display help for command')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .showHelpAfterError('(add --help for additional information)')
  .argument('<url>')
  .action((url) => {
    Promise.resolve(pageLoader(program.opts().output, url))
      .then((data) => console.log(`Page was successfully downloaded into '${data}'`))
      .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    });
  });

program.parse();
