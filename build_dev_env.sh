#!/bin/bash

if [[ "$(docker images -q wxxie/node_mysql:ubuntu 2>/dev/null)" == "" ]]; then
    # This might take a long time... build the wxxie/node_mysql:ubuntu image
    sudo docker build - -t wxxie/node_mysql:ubuntu < Dockerfile-node
fi

# run db, rabbitmq, python worker, result service in background
WXXIE_MODE=dev docker-compose up -d db rabbitmq worker_stub rs_stub

# run webapp service
WXXIE_MODE=dev docker-compose up webapp
