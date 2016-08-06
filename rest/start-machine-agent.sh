#! /bin/bash
source /env.sh

echo "Starting Machine Agent with system properties: ${MACHINE_AGENT_JAVA_OPTS}"
nohup java ${MACHINE_AGENT_JAVA_OPTS} -jar ${MACHINE_AGENT_HOME}/machineagent.jar </dev/null &>/dev/null &
echo "To view Machine Agent log output: docker exec -it rest tail-machine-agent"

exit 0
