#!/bin/bash

# Exit on any error
set -e

# Define colours for output
GREEN='\032[0;32m'
RED='\032[0;31m'
NC='\032[0m' # No Color

echo -e "${GREEN}Starting CityNet IoT Deployment...${NC}"

# 1. Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo -e "${RED}Docker is not installed!${NC}"
    echo "Please install Docker and Docker-Compose first."
    echo "Run: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
fi

# 2. Check if Docker Compose is available
if ! docker compose version &> /dev/null
then
    if ! docker-compose version &> /dev/null
    then
        echo -e "${RED}Docker Compose is not installed!${NC}"
        echo "Please install docker-compose plugin."
        exit 1
    else
        DOCKER_CMD="docker-compose"
    fi
else
    DOCKER_CMD="docker compose"
fi

echo -e "${GREEN}Using: $DOCKER_CMD${NC}"

# 3. Build and run the containers
echo -e "${GREEN}Building and starting the Docker containers...${NC}"
$DOCKER_CMD up -d --build

echo -e "${GREEN}------------------------------------------------------------${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "Your CityNet IoT platform is now running."
echo -e "Frontend Dashboard: http://YOUR_SERVER_IP:80"
echo -e "Backend API:        http://YOUR_SERVER_IP:3000"
echo -e "MQTT EMQX Broker:   http://YOUR_SERVER_IP:18083"
echo -e "The background simulator is running 10 devices automatically."
echo -e "${GREEN}------------------------------------------------------------${NC}"
