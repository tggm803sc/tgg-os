#!/usr/bin/env node
/**
 * Refreshes src/apk-meta.json from the published studio APK.
 *
 * Runs before `npm run build` (prebuild) so the Downloads panel can never show
 * stale version or size numbers. No dependencies: it unzips the APK with zlib
 * and walks the binary AndroidManifest.xml itself.
 *
 * Override the source with APK_URL=... or `node scripts/apk-meta.mjs <url>`.
 * On any failure it warns and keeps the cached JSON, so offline builds still work.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'src/apk-meta.json');
const DEFAULT_URL =
  'https://site-363c68e932f2463e9a132c0126332b2a.freebuff.page/TGG-World-Studio.apk';

const url = process.env.APK_URL ?? process.argv[2] ?? DEFAULT_URL;

const EMPTY = {
  versionName: '',
  versionCode: 0,
  package: '',
  bytes: 0,
  sizeLabel: '—',
  sha256: '',
  source: url,
  fetchedAt: '',
};

async function readCached() {
  if (!existsSync(OUT)) return null;
  try {
    return JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    return null;
  }
}

/** Everything except fetchedAt, so an unchanged APK never dirties the cache file. */
function fingerprint(meta) {
  return JSON.stringify({
    versionName: meta.versionName,
    versionCode: meta.versionCode,
    package: meta.package,
    bytes: meta.bytes,
    sizeLabel: meta.sizeLabel,
    sha256: meta.sha256,
    source: meta.source,
  });
}

async function keepCached(message) {
  console.warn(`[apk-meta] could not refresh metadata: ${message}`);
  if (existsSync(OUT)) {
    const cached = JSON.parse(await readFile(OUT, 'utf8'));
    console.warn(
      `[apk-meta] keeping cached ${cached.versionName ? `v${cached.versionName}` : 'values'} from src/apk-meta.json`,
    );
  } else {
    await writeFile(OUT, `${JSON.stringify(EMPTY, null, 2)}\n`);
    console.warn('[apk-meta] wrote empty metadata so the build can continue');
  }
}

function findEocd(buffer) {
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 66_000); i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) return i;
  }
  return -1;
}

/** Pulls AndroidManifest.xml out of the APK ZIP container. */
function extractManifest(zip) {
  const eocd = findEocd(zip);
  if (eocd < 0) throw new Error('ZIP end-of-central-directory not found');
  const entries = zip.readUInt16LE(eocd + 10);
  let cursor = zip.readUInt32LE(eocd + 16);

  for (let i = 0; i < entries; i += 1) {
    if (zip.readUInt32LE(cursor) !== 0x02014b50) throw new Error('bad central directory entry');
    const method = zip.readUInt16LE(cursor + 10);
    const compressedSize = zip.readUInt32LE(cursor + 20);
    const nameLength = zip.readUInt16LE(cursor + 28);
    const extraLength = zip.readUInt16LE(cursor + 30);
    const commentLength = zip.readUInt16LE(cursor + 32);
    const localOffset = zip.readUInt32LE(cursor + 42);
    const name = zip.toString('utf8', cursor + 46, cursor + 46 + nameLength);

    if (name === 'AndroidManifest.xml') {
      if (zip.readUInt32LE(localOffset) !== 0x04034b50) throw new Error('bad local header');
      const localName = zip.readUInt16LE(localOffset + 26);
      const localExtra = zip.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localName + localExtra;
      const payload = zip.subarray(start, start + compressedSize);
      if (method === 0) return Buffer.from(payload);
      if (method === 8) return inflateRawSync(payload);
      throw new Error(`unsupported ZIP compression method ${method}`);
    }

    cursor += 46 + nameLength + extraLength + commentLength;
  }

  throw new Error('AndroidManifest.xml not found in APK');
}

/** Reads attributes from the <manifest> element of a binary (AXML) manifest. */
function parseManifestAttributes(xml) {
  if (xml.readUInt16LE(0) !== 0x0003) throw new Error('not a binary Android manifest');

  const poolOffset = xml.readUInt16LE(2);
  if (xml.readUInt16LE(poolOffset) !== 0x0001) throw new Error('manifest string pool missing');

  const poolSize = xml.readUInt32LE(poolOffset + 4);
  const stringCount = xml.readUInt32LE(poolOffset + 8);
  const flags = xml.readUInt32LE(poolOffset + 16);
  const stringsStart = xml.readUInt32LE(poolOffset + 20);
  const utf8 = (flags & (1 << 8)) !== 0;
  const poolBase = poolOffset + stringsStart;

  const strings = [];
  for (let i = 0; i < stringCount; i += 1) {
    let p = poolBase + xml.readUInt32LE(poolOffset + 28 + i * 4);
    if (utf8) {
      let n = xml[p];
      p += 1;
      if (n & 0x80) p += 1;
      let length = xml[p];
      p += 1;
      if (length & 0x80) {
        length = ((length & 0x7f) << 8) | xml[p];
        p += 1;
      }
      strings.push(xml.toString('utf8', p, p + length));
    } else {
      let length = xml.readUInt16LE(p);
      p += 2;
      if (length & 0x8000) {
        length = ((length & 0x7fff) << 16) | xml.readUInt16LE(p);
        p += 2;
      }
      strings.push(xml.toString('utf16le', p, p + length * 2));
    }
  }

  let offset = poolOffset + poolSize;
  if (xml.readUInt16LE(offset) === 0x0180) offset += xml.readUInt32LE(offset + 4);

  while (offset + 8 <= xml.length) {
    const type = xml.readUInt16LE(offset);
    const size = xml.readUInt32LE(offset + 4);
    if (!size) break;

    if (type === 0x0102) {
      const element = strings[xml.readUInt32LE(offset + 20)] ?? '';
      if (element === 'manifest') {
        const attributeCount = xml.readUInt16LE(offset + 28);
        const attributeStart = xml.readUInt16LE(offset + 24);
        const attributeSize = xml.readUInt16LE(offset + 26);
        // attributeStart is relative to the extended header (node header + 16 bytes).
        const attributesOffset = offset + 16 + attributeStart;
        const attributes = {};

        for (let i = 0; i < attributeCount; i += 1) {
          const attr = attributesOffset + i * attributeSize;
          const name = strings[xml.readUInt32LE(attr + 4)] ?? '';
          const raw = xml.readUInt32LE(attr + 8);
          const typeCode = xml[attr + 15];
          const value = xml.readUInt32LE(attr + 16);

          if (raw !== 0xffffffff) attributes[name] = strings[raw];
          else if (typeCode === 0x10 || typeCode === 0x11) attributes[name] = value;
          else if (typeCode === 0x12) attributes[name] = value !== 0;
        }

        return attributes;
      }
    }

    offset += size;
  }

  throw new Error('<manifest> element not found');
}

function sizeLabel(bytes) {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb >= 10 ? Math.round(kb) : kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

try {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const apk = Buffer.from(await response.arrayBuffer());
  const attributes = parseManifestAttributes(extractManifest(apk));
  const meta = {
    versionName: String(attributes.versionName ?? ''),
    versionCode: Number(attributes.versionCode ?? 0),
    package: String(attributes.package ?? ''),
    bytes: apk.length,
    sizeLabel: sizeLabel(apk.length),
    sha256: createHash('sha256').update(apk).digest('hex'),
    source: url,
    fetchedAt: new Date().toISOString(),
  };

  if (!meta.versionName) throw new Error('versionName missing from manifest');

  const cached = await readCached();
  const unchanged = cached !== null && fingerprint(cached) === fingerprint(meta);
  if (!unchanged) await writeFile(OUT, `${JSON.stringify(meta, null, 2)}\n`);

  console.log(
    `[apk-meta] ${meta.package} v${meta.versionName} (build ${meta.versionCode}) · ${meta.sizeLabel}${unchanged ? ' (cache unchanged)' : ''}`,
  );
} catch (error) {
  await keepCached(error instanceof Error ? error.message : String(error));
  process.exit(0);
}
