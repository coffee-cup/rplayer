#!/bin/sh

if [ $(ps -e -o uid,cmd | grep $UID | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then
        export PATH=/usr/local/bin:$PATH
        export ROOT_URL='http://rplayer.jakerunzer.me'
        export PORT=7000
        export METEOR_SETTINGS="$(cat config/settings.json)"
        NODE_ENV=production forever start /var/www/rplayer/build/bundle/main.js >> /var/log/rplayer.txt 2>&1
fi
