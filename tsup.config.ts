import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./**/*.ts', '!node_modules', '!./*.ts'],
  bundle: false,
});