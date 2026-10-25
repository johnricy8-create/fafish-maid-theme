import fs from 'node:fs';
import path from 'node:path';
import { removeBackground } from '@imgly/background-removal-node';

const input = process.argv[2];
const output = process.argv[3];
const t0 = Date.now();
const buf = fs.readFileSync(input);
const blob = new Blob([buf], { type: 'image/webp' });
const out = await removeBackground(blob, {
  model: 'medium',
  output: { format: 'image/png', quality: 1 },
  debug: false,
});
fs.writeFileSync(output, Buffer.from(await out.arrayBuffer()));
console.log(JSON.stringify({ input: path.basename(input), output: path.basename(output), ms: Date.now() - t0, bytes: fs.statSync(output).size }));
