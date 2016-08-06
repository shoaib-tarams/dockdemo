#! /bin/bash
source /env.sh

echo "Starting Database Agent with system properties: ${DB_AGENT_JAVA_OPTS}"
nohup java ${DB_AGENT_JAVA_OPTS} -jar ${DB_AGENT_HOME}/db-agent.jar </dev/null &>/dev/null &
echo "To view Database Agent log output: docker exec -it rest tail-db-agent"

exit 0
