#!/bin/bash
set -e

DOCKER_IMAGE=${1:-zxs}
CONTAINER_HOME=/home/emscripten/zxs
XAPIAN=${CONTAINER_HOME}/xapian/xapian-core

function zxs_build_preload() {
	docker run -it --rm --name zxs-0 \
		--user $(id -u):$(id -g) \
		--mount "type=bind,src=${PRELOAD},dst=/X,readonly" \
		--mount "type=bind,src=$(pwd)/dist,dst=${CONTAINER_HOME}/dist" \
		--mount "type=bind,src=$(pwd)/build,dst=${CONTAINER_HOME}/build" \
		-e "PRELOAD=/X" \
		-e "XAPIAN=${XAPIAN}" ${DOCKER_IMAGE} npm run build
}

function zxs_build() {
	docker run -it --rm --name zxs-0 \
		--user $(id -u):$(id -g) \
		--mount "type=bind,src=$(pwd)/dist,dst=${CONTAINER_HOME}/dist" \
		--mount "type=bind,src=$(pwd)/build,dst=${CONTAINER_HOME}/build" \
		-e "XAPIAN=${XAPIAN}" ${DOCKER_IMAGE} npm run build
}

function zxs_prepare_lib() {
	docker run -it --rm --name zxs-0 \
		--user $(id -u):$(id -g) \
		--mount "type=bind,src=$(pwd)/dist,dst=${CONTAINER_HOME}/dist" \
		--mount "type=bind,src=$(pwd)/build,dst=${CONTAINER_HOME}/build" \
		${DOCKER_IMAGE} npm run prepare-lib
}

if [ -z "$(docker images ${DOCKER_IMAGE} -q 2> /dev/null)" ]; then
	echo "zxs image not found locally, please run: npm run docker:build or: docker pull ghcr.io/r0qs/zxs:latest"
else
	mkdir -p {dist,build}
	if [ -z "${PRELOAD}" ]; then
		zxs_build
	else 
		zxs_build_preload
	fi
	zxs_prepare_lib  
fi


