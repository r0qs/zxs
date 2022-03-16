#!/bin/bash

default_preload_dir=$(pwd)/X

function help(){
	echo "Usage : $0 [preload-directory] (default: ${default_preload_dir})"
}

if [ "$1" == "-h" ]; then
  help
	exit 0
fi

preload_dir=${1:-${default_preload_dir}}
container_home=/home/emscripten/zxs
XAPIAN=${container_home}/xapian/xapian-core

mkdir -p {dist,build}

docker run -it --rm --name zxs-0 \
	--user $(id -u):$(id -g) \
	--mount "type=bind,src=${preload_dir},dst=/X,readonly" \
	--mount "type=bind,src=$(pwd)/dist,dst=${container_home}/dist" \
	--mount "type=bind,src=$(pwd)/build,dst=${container_home}/build" \
	-e "PRELOAD=/X" \
	-e "XAPIAN=${XAPIAN}" zxs npm run build

docker run -it --rm --name zxs-0 \
	--user $(id -u):$(id -g) \
	--mount "type=bind,src=$(pwd)/dist,dst=${container_home}/dist" \
	--mount "type=bind,src=$(pwd)/build,dst=${container_home}/build" \
	zxs npm run preparelib
