#!/bin/sh

meteor build build_tmp
cd build_tmp
tar -zxf rplayer.tar.gz
cd bundle/programs/server/
npm install
cd ../../../..
rm -rf build/
mv build_tmp build/
