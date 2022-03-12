const execSync = require('child_process').execSync;
const { mkdirSync, existsSync } = require('fs');

const xapianDirArgName = '--xapiandir=';
const xapianDirArg = process.argv.find(arg => arg.indexOf(xapianDirArgName) === 0);

if (xapianDirArg) {
  process.env.XAPIAN = xapianDirArg.substring(xapianDirArgName.length);
  console.log('XAPIAN', process.env.XAPIAN);
}

// generate one for nodejs and one for workerjs (browser)
if (!process.env.XAPIAN) {
  console.error("Environment variable XAPIAN must be set to the location of xapian_core");
} else {
  try {
    console.log('Building Xapian webassembly library');
    if (!existsSync('dist')) {
      mkdirSync('dist');
    }
    execSync(`em++ -Oz -s DISABLE_EXCEPTION_CATCHING=0 -s USE_ZLIB=1 -s FORCE_FILESYSTEM=1 ` +
      `-s "EXPORTED_RUNTIME_METHODS=['FS','cwrap','stringToUTF8','UTF8ToString','getValue']" ` +
      `-std=c++11 -s DEMANGLE_SUPPORT=1 -s ALLOW_MEMORY_GROWTH=1 -s -s ASSERTIONS=1 ` +
      `-I$XAPIAN/include -I$XAPIAN -I$XAPIAN/common rmmxapianapi.cc $XAPIAN/.libs/libxapian.a ` +
      `--preload-file ./X ` + // inside the X there must be the xapian db to be loaded (per page)
      `-o dist/xapianasm.js -lidbfs.js -lnodefs.js`, { stdio: 'inherit' });
    console.log('Successful build of xapianasm.wasm, xapianasm.js and pre-loading indexes');
  } catch (e) {
    console.error('Compile failed');
  }
}
