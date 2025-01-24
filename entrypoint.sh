#!/bin/sh

rm /var/run/docker.pid

dockerd > /var/log/dockerd.log 2>&1 &

echo "Esperando a que Docker Daemon se inicie..."
until docker info > /dev/null 2>&1; do
    sleep 1
done
echo "Docker Daemon está listo."

docker load < /app/zotify.tar

exec python /app/app.py