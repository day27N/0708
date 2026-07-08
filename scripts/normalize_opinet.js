const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../src/data/국제_원유가격20080706_20260707.csv');
const dst = path.resolve(__dirname, '../public/data/opinet_full.csv');

function normalizeDate(s) {
  if (!s) return null;
  const parts = (''+s).match(/\d+/g);
  if (!parts || parts.length < 3) return null;
  let [y, m, d] = parts;
  if (y.length === 2) {
    const ny = Number(y);
    y = (ny >= 50 ? 1900 + ny : 2000 + ny).toString();
  }
  // pad
  m = m.padStart(2, '0');
  d = d.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const raw = fs.readFileSync(src, { encoding: 'utf8' });
const lines = raw.split(/\r?\n/).filter(Boolean);
if (lines.length === 0) {
  console.error('source CSV empty');
  process.exit(1);
}

// create header
const outLines = [];
outLines.push('date,Dubai,Brent,WTI');
let skipped = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // split on comma, but some fields may be empty. This is simple CSV handling.
  const cols = line.split(',');
  const rawDate = cols[0];
  const date = normalizeDate(rawDate);
  if (!date) { skipped++; continue; }
  // take next 3 columns as values (if missing, keep empty)
  const dubai = cols[1] ? cols[1].trim() : '';
  const brent = cols[2] ? cols[2].trim() : '';
  const wti = cols[3] ? cols[3].trim() : '';
  outLines.push(`${date},${dubai},${brent},${wti}`);
}
fs.writeFileSync(dst, outLines.join('\n'), { encoding: 'utf8' });
console.log('wrote', dst, 'rows', outLines.length - 1, 'skipped', skipped);
