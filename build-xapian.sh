#!/bin/bash
# This script is intended to be run from the zxs folder. Like bellow:
#
# cd zxs
# ./build-xapian.sh
#
# It will download and compile `xapian` relative to the path where the script is called.

THREADS=${THREADS:-2}
TAG=${TAG:-v1.4.19}
# Clone Xapian source
git clone https://github.com/xapian/xapian
cd xapian
git checkout $TAG -b $TAG 
# Bootstrap and configure build
./bootstrap
./configure CXXFLAGS=-O --disable-backend-honey --disable-backend-inmemory --disable-backend-remote
# Compile
make -j$THREADS
make -j$THREADS distclean
# Build xapian-core with emscripten
cd xapian-core
emconfigure ./configure CPPFLAGS='-DFLINTLOCK_USE_FLOCK' CXXFLAGS='-Oz -s USE_ZLIB=1 -fno-rtti' --disable-backend-inmemory --disable-shared --disable-backend-remote
emmake make -j$THREADS
cd ../..
