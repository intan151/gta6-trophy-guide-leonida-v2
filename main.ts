// Leonida Ledger v2 — hand-in program (Node 22, standard library only).
//
// The guide is plain static files under app/ (index.html, ES modules, CSS
// and JSON data) that any browser can open with the network off. This file
// is the program that hands it in: it copies app/ and screenshots/ from
// next to this file into /output (or $MAKEFUN_OUTPUT_DIR when set, for
// local runs) and writes /output/dossier.json, the summary the judge
// reads, using buildDossier from the vendored make.fun library. Do not
// edit vendor/makefun-frontend.ts: the scorer rebuilds the dossier with
// its own copy of that file and compares the two byte for byte.
//
// Local run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps: only text_max_bytes shapes the bytes; the rest refuse
// an entry the scorer would refuse anyway (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of
// app files — app/ shares /output's own 1000-entry cap with screenshots/
// and dossier.json, so leave them room).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
