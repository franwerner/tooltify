import path from 'path';
import { fileURLToPath } from 'url';
export * from './server'
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CLIENT_BUNDLE = path.resolve(__dirname, "./client/client.iife.js");
