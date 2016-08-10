#! /bin/bash

APPD_LOGIN_URL=https://login.appdynamics.com/sso/login/
VERSION=4.2.2.2
APPD_TEMP_DIR=.appd

# Beta Portal 
APPD_DOWNLOAD_URL=https://aperture.appdynamics.com/download/prox/download-file
APPD_AGENTS=(
  "sun-jvm/${VERSION}/AppServerAgent-${VERSION}.zip"
  "db/${VERSION}/dbagent-${VERSION}.zip"
  "machine/${VERSION}/MachineAgent-${VERSION}.zip"
)

# Public Portal
#APPD_DOWNLOAD_URL=https://download.appdynamics.com/onpremise/public/latest
#APPD_AGENTS=(
# "AppServerAgent.zip"
# "dbagent.zip"
# "MachineAgent.zip"
#)

APP_AGENT_ZIP=$(basename ${APPD_AGENTS[0]%-*}).zip
DB_AGENT_ZIP=$(basename ${APPD_AGENTS[1]%-*}).zip
MACHINE_AGENT_ZIP=$(basename ${APPD_AGENTS[2]%-*}).zip

APPD_CONTROLLER=$1
APPD_PORT=$2
APPD_ACCOUNT_NAME=$3
APPD_ACCESS_KEY=$4
USER_NAME="test@test.com"
PASSWORD="WjeFm8Qz3y"

APPD_SSL="false"
APPD_APP_NAME="SampleApp"
APPD_TIER_NAME="RestServices"
APPD_NODE_NAME="RestNode"

checkSSL() {
  if [ "$APPD_PORT" == "443" ]; then
    echo "Turning on SSL"
    APPD_SSL="true"
  else
    echo "SSL is off"
  fi
}

downloadInstallers() {
  #echo "Please enter your AppDynamics Portal login to download Agents"
  #echo -n "Email ID/UserName: "
  #read USER_NAME

  #stty -echo
  #echo -n "Password: "
  #read PASSWORD
  #stty echo
  echo

  mkdir -p ${APPD_TEMP_DIR}

  if [ "$USER_NAME" != "" ] && [ "$PASSWORD" != "" ];
  then
    wget --quiet \
         --save-cookies \
         ${APPD_TEMP_DIR}/cookies.txt \
         --post-data "username=$USER_NAME&password=$PASSWORD" \
         --no-check-certificate \
         -O ${APPD_TEMP_DIR}/index.html \
         ${APPD_LOGIN_URL} 

    SSO_SESSIONID=`grep "sso-sessionid" ${APPD_TEMP_DIR}/cookies.txt`
    if [ ! "$SSO_SESSIONID" ]; then
      echo "Incorrect Login/Password"
      exit
    fi

    for i in ${!APPD_AGENTS[@]}; do
      echo "Downloading $APPD_DOWNLOAD_URL/${APPD_AGENTS[$i]}"
      wget --quiet \
           --load-cookies ${APPD_TEMP_DIR}/cookies.txt \
           -O $(basename ${APPD_AGENTS[$i]%-*}).zip \
           ${APPD_DOWNLOAD_URL}/${APPD_AGENTS[$i]}
      if [ $? -ne 0 ]; then
        echo "Error: unable to download $APPD_DOWNLOAD_URL/${APPD_AGENTS[$i]}"
        exit 
      fi
    done

  else
    echo "Username or Password missing"
  fi
}

installAppServerAgent() {
  echo "Installing App Server Agent to ${CATALINA_HOME}/appagent..."
  unzip -q ${APP_AGENT_ZIP} -d ${CATALINA_HOME}/appagent && rm ${APP_AGENT_ZIP}
}

installDatabaseAgent() {
  echo "Installing Database Agent to ${DB_AGENT_HOME}..."
  unzip -q ${DB_AGENT_ZIP} -d ${DB_AGENT_HOME} && rm ${DB_AGENT_ZIP}
}

installMachineAgent() {
  echo "Installing Machine Agent to ${MACHINE_AGENT_HOME}..."
  unzip -q ${MACHINE_AGENT_ZIP} -d ${MACHINE_AGENT_HOME} && rm ${MACHINE_AGENT_ZIP}
}

# Populate environment setup script with AppDynamics agent system properties
# This file should be included in all agent startup command scripts
setupAppdEnv() {
  echo "#! /bin/bash" > /env.sh

  echo export JAVA_AGENT_LOG_PATH="\"/tomcat/appagent/ver${VERSION}/logs/${APPD_NODE_NAME}"\" >> /env.sh

  echo export APP_SERVER_AGENT_JAVA_OPTS="\"-Dappdynamics.controller.hostName=${APPD_CONTROLLER} -Dappdynamics.controller.port=${APPD_PORT} -Dappdynamics.controller.ssl.enabled=${APPD_SSL} -Dappdynamics.agent.applicationName=${APPD_APP_NAME} -Dappdynamics.agent.tierName=${APPD_TIER_NAME} -Dappdynamics.agent.nodeName=${APPD_NODE_NAME} -Dappdynamics.agent.accountName=${APPD_ACCOUNT_NAME} -Dappdynamics.agent.accountAccessKey=${APPD_ACCESS_KEY}"\" >> /env.sh

  echo export DB_AGENT_JAVA_OPTS="\"-Dappdynamics.controller.hostName=${APPD_CONTROLLER} -Dappdynamics.controller.port=${APPD_PORT} -Dappdynamics.controller.ssl.enabled=${APPD_SSL} -Dappdynamics.agent.accountName= ${APPD_ACCOUNT_NAME} -Dappdynamics.agent.accountAccessKey=${APPD_ACCESS_KEY}"\" >> /env.sh

  echo export MACHINE_AGENT_JAVA_OPTS="\"-Dappdynamics.controller.hostName=${APPD_CONTROLLER} -Dappdynamics.controller.port=${APPD_PORT} -Dappdynamics.controller.ssl.enabled=${APPD_SSL} -Dappdynamics.agent.applicationName=${APPD_APP_NAME} -Dappdynamics.agent.tierName=${APPD_TIER_NAME} -Dappdynamics.agent.nodeName=${APPD_NODE_NAME} -Dappdynamics.agent.accountName=${APPD_ACCOUNT_NAME} -Dappdynamics.agent.accountAccessKey=${APPD_ACCESS_KEY}"\" >> /env.sh

  echo "AppDynamics Agent configuration saved to /env.sh"
}

cleanup() {
  rm -rf .appd
} 
trap cleanup EXIT

downloadInstallers; echo
checkSSL
installAppServerAgent
installDatabaseAgent
installMachineAgent
setupAppdEnv; echo
