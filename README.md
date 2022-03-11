ZIM Xapian searchindex
======================

This project is based on the [work](https://github.com/runbox/runbox-searchindex) of [Peter Salomonsen](https://github.com/petersalomonsen) and [Tadeusz Sośnierz](https://github.com/tadzik) licensed under the terms of GNU General Public License.

We reuse the xapian loader logic to deploy a wasm module that can read the indexes in the Xapian format extracted from ZIM files under `X/fultext/xapian` and `X/title/xapian`.

## How to build
This project depends on [Xapian](https://github.com/xapian/xapian) and that you have built it using [Emscripten](https://emscripten.org/) as described [here](https://github.com/xapian/xapian/blob/master/xapian-core/emscripten/README.md).

In order to build the web assembly binaries you will have to set the `XAPIAN` environment variable to
the location of the `xapian_core` folder of your Xapian emscripten build.
See [build-xapian.sh](build-xapian.sh) for more information.

You may then build it using:
```
XAPIAN=xapian_core_location npm run build`
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
npm run build
npm run make-demo
cd demo
python3 -m http.server
```

