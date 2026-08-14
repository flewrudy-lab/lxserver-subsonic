const fs = require('fs');
const path = require('path');

const outDir = path.resolve('server');

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js')) rewrite(p);
  }
}

function rewrite(file) {
  let s = fs.readFileSync(file, 'utf8');
  const re = /(['"])((?:\@\/|\@common\/|\@renderer\/)[^'"]*)\1/g;
  let changed = false;
  s = s.replace(re, (m, q, spec) => {
    let target;
    if (spec.startsWith('@/')) target = path.join('src', spec.slice(2));
    else if (spec.startsWith('@common/')) target = path.join('src/common', spec.slice(9));
    else if (spec.startsWith('@renderer/')) target = path.join('src/modules', spec.slice(11));
    else return m;
    const outTarget = path.join(outDir, path.relative('src', target));
    let rel = path.relative(path.dirname(file), outTarget);
    if (!rel.startsWith('.')) rel = './' + rel;
    rel = rel.split(path.sep).join('/');
    changed = true;
    return q + rel + q;
  });
  if (changed) fs.writeFileSync(file, s);
}

walk(outDir);
console.log('alias rewrite done');
