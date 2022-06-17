const execSync = require('child_process').execSync;
const { mkdirSync, existsSync } = require('fs');

const DEFAULT_XAPIAN_DIR = process.env.npm_package_config_xapiandir;

if (!process.env.XAPIAN) {
  console.warn("Environment variable XAPIAN must be set to the location of xapian-core source");
  console.log('Using default XAPIAN location:', DEFAULT_XAPIAN_DIR);
  process.env.XAPIAN = DEFAULT_XAPIAN_DIR;
}

let preloadCmd = ""
let preMsg = ""
try {
  if (process.env.XAPIAN !== DEFAULT_XAPIAN_DIR) {
    console.log('Using XAPIAN location:', process.env.XAPIAN);
  }
  if (process.env.PRELOAD) {
    console.log('Using PRELOAD location:', process.env.PRELOAD);
    preloadCmd = `--preload-file ${process.env.PRELOAD} `
  }
  console.log('Building Xapian webassembly library');
  if (!existsSync('dist')) {
    mkdirSync('dist');
  }
  execSync(`em++ -Oz -s DISABLE_EXCEPTION_CATCHING=0 -s USE_ZLIB=1 -s FORCE_FILESYSTEM=1 ` +
    `-s "EXPORTED_RUNTIME_METHODS=['FS','cwrap','stringToUTF8','UTF8ToString','getValue']" ` +
    `-std=c++11 -s DEMANGLE_SUPPORT=1 -s ALLOW_MEMORY_GROWTH=1 ` +
    `-I$XAPIAN/include -I$XAPIAN -I$XAPIAN/common xapianapi.cc $XAPIAN/.libs/libxapian.a ` +
    preloadCmd +
    `-o dist/xapianasm.js -lidbfs.js -lnodefs.js`, { stdio: 'inherit' });
  if (process.env.PRELOAD) {
    preMsg = " and pre-loading indexes"
  }
  console.log('Successful build of xapianasm.wasm and xapianasm.js' + preMsg);
} catch (e) {
  console.error('Compile failed', e);
}
