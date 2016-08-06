#! /bin/bash 
source /env.sh
tail -f ${JAVA_AGENT_LOG_PATH}/agent*.log
