const fs = require('fs')
const f = '/server/defaultConfig.js'
let s = fs.readFileSync(f, 'utf8')
const bad = "'https://lx.flewrudy.pp.ua',"
if (s.includes(bad)) {
  s = s.replace(bad, "'subsonic.publicUrl': 'https://lx.flewrudy.pp.ua',")
  fs.writeFileSync(f, s)
  console.log('FIXED')
} else {
  console.log('NOTFOUND (maybe already correct)')
}
