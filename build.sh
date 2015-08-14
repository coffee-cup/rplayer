#!/bin/sh

rm -rf build/
meteor build build
cd build
tar -zxf rplayer.tar.gz
cd bundle/programs/server
npm install
cd ../../../..
