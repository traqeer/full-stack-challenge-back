import { Config } from './interface/config';

let config: Config;

try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
  config = require('./config').config;
} catch {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Configuration file not found!');
  console.log(
    '\x1b[33m%s\x1b[0m',
    'Please create scripts/config.ts based on scripts/interface/config.example.ts',
  );
  process.exit(1);
}

export { config };
