ARG EMSDK_TAG=1.39.19
FROM emscripten/emsdk:$EMSDK_TAG AS builder
ARG EMSDK_TAG

WORKDIR /zxs
COPY . ./

ARG XAPIAN_VERSION=v1.4.19
ENV XAPIAN_SRC /zxs/xapian

# Install xapian base packages
RUN apt-get update && \
    apt-get -y install \
    build-essential \
    m4 \
    perl \
    python \
    zlib1g-dev \
    uuid-dev \
    wget \
    bison \
    tcl \
    git \
    file \
    doxygen \
    graphviz \
    help2man \
    python-docutils \
    python-pygments \
    pngcrush \
    libpcre3 \
    libpcre3-dev \
    libmagic-dev

RUN echo "-- Installing Xapian" \
    && git clone https://github.com/xapian/xapian \
    && cd ${XAPIAN_SRC} \
    && git checkout ${XAPIAN_VERSION} -b ${XAPIAN_VERSION} \
    && ./bootstrap xapian-core \
    && ./configure CXXFLAGS=-O0 --disable-backend-honey --disable-backend-inmemory --disable-backend-remote \
    && make -j2 \
    && make -j2 distclean

RUN echo "-- Compiling xapian-core using emscripten" \
    && cd ${XAPIAN_SRC}/xapian-core \
    && emconfigure ./configure CPPFLAGS='-DFLINTLOCK_USE_FLOCK' CXXFLAGS='-Oz -s USE_ZLIB=1 -fno-rtti' --disable-backend-inmemory --disable-shared --disable-backend-remote \
    && emmake make -j2

RUN apt-get -y clean \
    && apt-get -y autoclean \
    && apt-get -y autoremove \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/debconf/*-old \
    && rm -rf /usr/share/doc/* \
    && rm -rf /usr/share/man/?? \
    && rm -rf /usr/share/man/??_* 

WORKDIR /zxs

FROM emscripten/emsdk:$EMSDK_TAG

RUN  chown -R emscripten:emscripten /emsdk

# ensure emsdk env variables
# FIXME: do not use node hardcoded version
ENV EMSDK=/emsdk \
    EM_CONFIG=/emsdk/.emscripten \
    EMSDK_NODE=/emsdk/node/12.18.1_64bit/bin/node \
    PATH="/emsdk:/emsdk/upstream/emscripten:/emsdk/upstream/bin:/emsdk/node/12.18.1_64bit/bin:${PATH}"

RUN mkdir -p /home/emscripten/zxs
COPY --from=builder /zxs /home/emscripten/zxs/

RUN mkdir -p /home/emscripten/zxs/xapian
COPY --from=builder /zxs/xapian /home/emscripten/zxs/xapian

RUN  chown -R emscripten:emscripten /home/emscripten/zxs

# Install zim xapian indexer
USER emscripten
WORKDIR /home/emscripten/zxs

RUN echo "-- Installing ZIM Xapian Searchindex" \
    && npm install
