#!/bin/bash
set -e

mvn -q -f common-security/pom.xml clean install -DskipTests

modules=(eureka-server config-server user-service job-service application-service resume-service notification-service search-service api-gateway)
for module in "${modules[@]}"; do
  echo "Packaging $module..."
  mvn -q -f "$module/pom.xml" clean package -DskipTests
  echo "Building Docker image for $module..."
done

docker build -t madhavkolasani/jobportal-eureka-server:latest ./eureka-server
docker build -t madhavkolasani/jobportal-config-server:latest ./config-server
docker build -t madhavkolasani/jobportal-user-service:latest ./user-service
docker build -t madhavkolasani/jobportal-job-service:latest ./job-service
docker build -t madhavkolasani/jobportal-application-service:latest ./application-service
docker build -t madhavkolasani/jobportal-resume-service:latest ./resume-service
docker build -t madhavkolasani/jobportal-notification-service:latest ./notification-service
docker build -t madhavkolasani/jobportal-search-service:latest ./search-service
docker build -t madhavkolasani/jobportal-api-gateway:latest ./api-gateway

docker push madhavkolasani/jobportal-eureka-server:latest
docker push madhavkolasani/jobportal-config-server:latest
docker push madhavkolasani/jobportal-user-service:latest
docker push madhavkolasani/jobportal-job-service:latest
docker push madhavkolasani/jobportal-application-service:latest
docker push madhavkolasani/jobportal-resume-service:latest
docker push madhavkolasani/jobportal-notification-service:latest
docker push madhavkolasani/jobportal-search-service:latest
docker push madhavkolasani/jobportal-api-gateway:latest
