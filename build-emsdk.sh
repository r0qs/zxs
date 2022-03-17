#!/bin/bash
# This script is intended to be run from the zxs folder. Like bellow:
#
# cd zxs
# ./build-emsdk.sh
#
# It will download and compile `emsdk` relative to the path where the script is called.

git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install 1.39.19
./emsdk activate 1.39.19
cd ..
