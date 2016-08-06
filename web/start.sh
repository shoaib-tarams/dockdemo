#! /bin/bash

echo "Starting Node.js web server"
nohup node SampleApp/src/server.js > nodejs.log 2>&1&

exit 0
