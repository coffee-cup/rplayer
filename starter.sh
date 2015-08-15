#!/bin/sh

if [ $(ps -e -o uid,cmd | grep $UID | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then

	APP_ENV="production"
	SRC_DIR="/var/www/rplayer/"

       	echo "Stopping current forever process"
	forever stop "$SRC_DIR"build/bundle/main.js

	echo "Loading environment variables"
 	source config/"$APP_ENV"/env.sh

	echo "Starting forever process"
	forever --sourceDir "$SRC_DIR" -l "$SRC_DIR"logs/forever.log -o "$SRC_DIR"logs/out.log -e "$SRC_DIR"logs/error.log -a start build/bundle/main.js
fi