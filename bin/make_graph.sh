#!/usr/bin/env bash

src=$1;
base=${src##*/};
base=${base%.*};

type=${2-png};
cmd=${3-dot};

${cmd} -T${type} ${src} -o ${base}.${type};
