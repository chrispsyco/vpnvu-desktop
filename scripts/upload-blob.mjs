// PSYCO: upload a file to the Vercel Blob store using only BLOB_RW_TOKEN.
// Unlike `vercel blob put` (the CLI), the @vercel/blob SDK does NOT require a
// logged-in Vercel account — just the read-write token — so it works in CI.
// Usage: node scripts/upload-blob.mjs <localFile> <blobPathname>
import { put } from '@vercel/blob';
import { readFileSync } from 'node:fs';

const [file, pathname] = process.argv.slice(2);
if (!file || !pathname) {
  console.error('usage: node upload-blob.mjs <localFile> <blobPathname>');
  process.exit(2);
}

const blob = await put(pathname, readFileSync(file), {
  access: 'public',
  token: process.env.BLOB_RW_TOKEN,
  allowOverwrite: true,
  addRandomSuffix: false,
});
console.log('Uploaded:', blob.url);
