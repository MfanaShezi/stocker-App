#!/bin/bash
# filepath: /c:/Users/Student/Documents/git/stocker-App/publish.sh

# Set your Docker Hub username and repository
USERNAME="shezi321"
REPO="stocker-app"

# Exit on any error
set -e

echo "===== Logging out and logging back in to Docker Hub ====="
#docker logout
docker login

echo "===== Building Docker images ====="
docker-compose build --no-cache

echo "===== Tagging images for Docker Hub ====="
docker tag stocker-app-api ${USERNAME}/${REPO}:api
docker tag stocker-app-client ${USERNAME}/${REPO}:client

echo "===== Pushing images to Docker Hub ====="
# Try pushing with retries
for i in {1..3}; do
  echo "Attempt $i to push client image..."
  if docker push ${USERNAME}/${REPO}:client; then
    echo "Client image push successful!"
    break
  else
    echo "Client push failed, retrying in 5 seconds..."
    sleep 5
  fi
done

for i in {1..5}; do
  echo "Attempt $i to push API image..."
  if docker push ${USERNAME}/${REPO}:api; then
    echo "API image push successful!"
    break
  else
    echo "API push failed, retrying in 5 seconds..."
    sleep 5
  fi
done

echo "===== Deployment completed! ====="
echo "Docker images are now available at:"
echo "- ${USERNAME}/${REPO}:api"
echo "- ${USERNAME}/${REPO}:client"