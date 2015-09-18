#!/bin/bash

export PATH=/usr/local/bin:$PATH
export ROOT_URL='http://boomz.xyz'
export PORT=7000
export METEOR_SETTINGS="$(cat config/settings.json)"
export MONGO_URL='mongodb://localhost:27017/rplayer'
