FROM centos:centos6
MAINTAINER alana.anderson@appdynamics.com

# Install Oracle Java JDK 8
# Download the Oracle JDK from http://www.oracle.com/technetwork/java/javase/downloads
# Download the 64-bit Linux RPM distribution, copy to the directory containing this file and set the version below
#ENV JDK8_VERSION 92
#ADD jdk-8u${JDK8_VERSION}-linux-x64.rpm /jdk-linux-x64.rpm
#RUN yum install -y jdk-linux-x64.rpm
#RUN rm jdk-linux-x64.rpm
#ENV JAVA_HOME /usr/java/jdk1.8.0_${JDK8_VERSION}
#ENV PATH $JAVA_HOME/bin:$PATH

# Install OpenJDK 8
RUN yum install -y java-1.8.0-openjdk-devel
ENV JAVA_HOME /usr/lib/jvm/jre-1.8.0-openjdk.x86_64
ENV PATH $JAVA_HOME/bin:$PATH

# set timezone to UTC
RUN mv /etc/localtime /etc/localtime.bak
RUN ln -s /usr/share/zoneinfo/Etc/UTC /etc/localtime

# Install OS packages
RUN yum install -y wget unzip rsyslog

# Environment vars: Tomcat
ENV TOMCAT_MAJOR_VERSION 8
ENV TOMCAT_MINOR_VERSION 8.0.14
ENV CATALINA_HOME /tomcat

# Install Tomcat
RUN curl -O -k https://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_MAJOR_VERSION}/v${TOMCAT_MINOR_VERSION}/bin/apache-tomcat-${TOMCAT_MINOR_VERSION}.tar.gz \
    && curl -O -k https://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_MAJOR_VERSION}/v${TOMCAT_MINOR_VERSION}/bin/apache-tomcat-${TOMCAT_MINOR_VERSION}.tar.gz.md5 \
    && md5sum apache-tomcat-${TOMCAT_MINOR_VERSION}.tar.gz.md5 \
    && tar zxf apache-tomcat-*.tar.gz \
    && rm apache-tomcat-*.tar.gz* \
    && mv apache-tomcat-${TOMCAT_MINOR_VERSION} tomcat
RUN cd ${CATALINA_HOME}/bin;chmod +x *.sh
RUN rm -rf ${CATALINA_HOME}/webapps/*

# Install Maven
RUN wget http://repos.fedorapeople.org/repos/dchen/apache-maven/epel-apache-maven.repo -O /etc/yum.repos.d/epel-apache-maven.repo
RUN sed -i s/\$releasever/6/g /etc/yum.repos.d/epel-apache-maven.repo
RUN yum install -y apache-maven
RUN mvn --version

# Build sample project
ENV PROJECT_NAME SampleApp
ENV APP_NAME SampleApp
RUN mkdir ${APP_NAME}
ADD pom.xml /${APP_NAME}/
ADD src /${APP_NAME}/src/
RUN cd /${APP_NAME}; mvn clean install

# Copy war file to Tomcat
RUN cp ${PROJECT_NAME}/target/${APP_NAME}.war ${CATALINA_HOME}/webapps/
RUN yum install -y unzip

# Scripts to install AppDynamics Agents
ADD install-appdynamics.sh /usr/local/bin/install-appdynamics
RUN chmod +x /usr/local/bin/install-appdynamics

ENV MACHINE_AGENT_HOME /machineagent
ENV MACHINE_AGENT_OUTPUT ${MACHINE_AGENT_HOME}/machine-agent.out
ENV DB_AGENT_HOME /dbagent
ENV DB_AGENT_OUTPUT ${DB_AGENT_HOME}/dbagent.out

# Scripts to start Tomcat and AppDynamics Database/Machine Agents
ADD start-db-agent.sh /usr/local/bin/start-db-agent
ADD start-machine-agent.sh /usr/local/bin/start-machine-agent
ADD start-tomcat.sh /usr/local/bin/start-tomcat
ADD start-all.sh /usr/local/bin/start-all

RUN chmod +x /usr/local/bin/start-db-agent
RUN chmod +x /usr/local/bin/start-machine-agent
RUN chmod +x /usr/local/bin/start-tomcat
RUN chmod +x /usr/local/bin/start-all

# Scripts to tail log file output from AppDynamics Agents
ADD tail-db-agent.sh /usr/local/bin/tail-db-agent
ADD tail-machine-agent.sh /usr/local/bin/tail-machine-agent
ADD tail-java-agent.sh /usr/local/bin/tail-java-agent

RUN chmod +x /usr/local/bin/tail-db-agent
RUN chmod +x /usr/local/bin/tail-machine-agent
RUN chmod +x /usr/local/bin/tail-java-agent

# AppDynamics Agent configuration
RUN touch /env.sh
RUN chmod +x /env.sh

# Tail syslog to keep container running
CMD  tail -f /var/log/messages

# Tomcat listen port
EXPOSE 8080
