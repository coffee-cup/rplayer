#!/bin/sh

if [ $(ps -e -o uid,cmd | grep $UID | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then

	APP_ENV="production"

       	echo "Stopping current forever process"
	forever stop build/bundle/main.js

	echo "Loading environment variables"
 	source config/"$APP_ENV"/env.sh

	echo "Starting forever process"
	forever -l logs/forever.log -o logs/out.log -e logs/error.log -a start build/bundle/main.js
fi
