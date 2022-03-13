ZIM Xapian searchindex
======================

This project is based on the [work](https://github.com/runbox/runbox-searchindex) of [Peter Salomonsen](https://github.com/petersalomonsen) and [Tadeusz Sośnierz](https://github.com/tadzik) licensed under the terms of GNU General Public License.

We reuse the xapian loader logic to deploy a wasm module that can read the indexes in the Xapian format extracted from ZIM files under `X/fulltext/xapian` and `X/title/xapian`.

## How to build
This project depends on [Xapian](https://github.com/xapian/xapian) and that you have built it using [Emscripten](https://emscripten.org/) as described [here](https://github.com/xapian/xapian/blob/master/xapian-core/emscripten/README.md).

To build the web assembly binaries you will have to set the `XAPIAN` environment variable to
the location of the `xapian-core` folder of your Xapian emscripten build.

See [build-xapian.sh](build-xapian.sh) for more information.
The script will download and install xapian using emscripten in the root directory of this project.

You may then build it using:
```
./build-xapian.sh
npm install
npm run build
```

Or if you already have Xapian compiled using Emscripten:
```
XAPIAN=xapian_core_location npm run build
```

### Using docker

Build docker image with the required build environment:
```
npm run docker:build
```

Build the zim indexer using the xapian from the docker image:
```
npm run docker:genidx
```

The `X`, `dist` and `build` directories are mounted in the docker container.
Put your xapian index database in the `X` directory (it is mounted readonly) before run `docker:genidx`.
The generated webassembly code and bindings will be placed in the `dist` directory, and are ready to use.
The path for the preloaded indexes DB will be: `./X/fulltext/xapian` and `./X/title/xapian` and they are embedded in `xapianasm.data`.

You can now embed it in your site or build the demo, by running locally:
```
npm run make-demo
```

## Running tests

Run:
```
npm run test
```

Or:
```
npm run test-no-watch
```

## Run Demo

```
PRELOAD=./X npm run build
npm run make-demo
cd demo
python3 -m http.server
```
