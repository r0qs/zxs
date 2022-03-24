Zim Xapian Searchindex
======================

ZXS enables the search of [ZIM](https://wiki.openzim.org/wiki/OpenZIM) indexed data in your browser using the Xapian database that is [already embedded in the Zim files]((https://wiki.openzim.org/wiki/Search_indexes)) without interacting with a server.
It is a WebAssembly library and javascript search tool that can read the indexes in the Xapian format extracted from ZIM files under `X/fulltext/xapian` and `X/title/xapian`.

This project is based on an Open Source Search Engine Library called [Xapian](https://xapian.org/), released under the [GPL v2+](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html) and written in C++.
We compiled it for WebAssembly using the [Emscripten](https://emscripten.org/) compiler.

It is mainly used by [Beezim](https://github.com/r0qs/beezim), a set of tools to mirror websites on [Swarm](https://www.ethswarm.org/).
However, ZXS can also be used to allow users to search content without an internet connection,
embedding the javascript search tool and the WebAssembly engine directly in the ZIM files.

## How to build

This project depends on Xapian and that you have built it using Emscripten as described [here](https://github.com/xapian/xapian/blob/master/xapian-core/emscripten/README.md).
You can build it yourself or use our scripts or docker image if you wish.

### DIY from source

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
XAPIAN=your_xapian_core_location npm run build
```

You can preload the Xapian database if you wish, by providing the `PRELOAD` environment variable pointing
to the location of your Xapian indexes directory.

```
PRELOAD=$(pwd)/demo/X npm run build
```

By default ZXS *does not preload* the Xapian indexes files to the emscripten virtual file system, allowing them to be loaded on runtime from the javascript code, like it is done by our [demo application](https://github.com/r0qs/zxs/blob/master/demo/index.html#L23).
But if you would like to do so, please check the emscripten [documentation](https://emscripten.org/docs/porting/files/packaging_files.html?#preloading-files) for more details on preloading files.

### Using docker

If you don't want to install ZXS in your host machine, you can pull our official image:

```
docker pull ghcr.io/r0qs/zxs:latest
```

Then run:
```
npm run docker:genasm ghcr.io/r0qs/zxs:latest
```

The `dist` and `build` directories will be mounted in the docker container.
The generated webassembly code and bindings will be placed in the `dist` directory, and are ready to use.

You can now pack it together with your website or build try our demo, by running:
```
npm run make-demo
cd demo
python3 -m http.server
```

#### Building the docker image yourself

Run:
```
npm run docker:build
```

The image compiles xapian using the emscripten compiler and install the dependencies for ZXS.
It does not build ZXS or generate the WebAssembly library yet.
To build the ZXS using the xapian from the docker image, run:
```
npm run docker:genasm
```

##### Important notes when build the image yourself

Preload is not enable by default. Put your xapian index database in the `preload` directory of your choice (it is mounted readonly) before run `docker:genasm` and define the `PRELOAD` **if you want to preload the indexes**.
If you do not set the `PRELOAD` environment variable the indexes will not be packed in the generated code but you *will* be able to load them on runtime.
The path for the preloaded indexes DB will be: `./X/fulltext/xapian` and `./X/title/xapian` and they are packed as `xapianasm.data`.

To generate the code, run:
```
npm run docker:genasm
```

Or, with preload:
```
PRELOAD=$(pwd)/demo/X npm run docker:genasm
```

The `demo/X`, `dist` and `build` directories are mounted in the docker container.
The generated webassembly code and bindings will be placed in the `dist` directory, and are ready to use.

You can now pack it together with your website or build our demo, by running:
```
npm run make-demo
cd demo
python3 -m http.server
```

## Running tests

Run:
```
npm run test
```

## Acknowledgments

This project is based on the [work](https://github.com/runbox/runbox-searchindex) of [Peter Salomonsen](https://github.com/petersalomonsen) and [Tadeusz Sośnierz](https://github.com/tadzik) licensed under the terms of GNU General Public License.
