#!/bin/bash
set -e

mvn -q -f common-security/pom.xml clean install -DskipTests

modules=(eureka-server config-server user-service job-service application-service resume-service notification-service search-service api-gateway)
for module in "${modules[@]}"; do
  echo "Packaging $module..."
  mvn -q -f "$module/pom.xml" clean package -DskipTests
  echo "Building Docker image for $module..."
done

docker build -t siddhantsingh/jobportal-eureka-server:latest ./eureka-server
docker build -t siddhantsingh/jobportal-config-server:latest ./config-server
docker build -t siddhantsingh/jobportal-user-service:latest ./user-service
docker build -t siddhantsingh/jobportal-job-service:latest ./job-service
docker build -t siddhantsingh/jobportal-application-service:latest ./application-service
docker build -t siddhantsingh/jobportal-resume-service:latest ./resume-service
docker build -t siddhantsingh/jobportal-notification-service:latest ./notification-service
docker build -t siddhantsingh/jobportal-search-service:latest ./search-service
docker build -t siddhantsingh/jobportal-api-gateway:latest ./api-gateway

docker push siddhantsingh/jobportal-eureka-server:latest
docker push siddhantsingh/jobportal-config-server:latest
docker push siddhantsingh/jobportal-user-service:latest
docker push siddhantsingh/jobportal-job-service:latest
docker push siddhantsingh/jobportal-application-service:latest
docker push siddhantsingh/jobportal-resume-service:latest
docker push siddhantsingh/jobportal-notification-service:latest
docker push siddhantsingh/jobportal-search-service:latest
docker push siddhantsingh/jobportal-api-gateway:latest
