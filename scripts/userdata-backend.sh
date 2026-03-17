#!/bin/bash
set -e  # Exit on error

echo "🚀 Bootstrapping Pizza Factory Backend..."

# Update and install Docker & Git
yum update -y
yum install -y docker git
systemctl enable docker --now
usermod -aG docker ec2-user

# Deploy App
cd /home/ec2-user
if [ ! -d "pizza-factory" ]; then
  git clone https://github.com/Estiven-29/pizza-factory.git
fi
cd pizza-factory/backend

echo "Compiling Backend Docker Image..."
docker build -t pizza-backend .

echo "Starting Backend Container on Port 8080 (Target Group Port) -> 8000 (FastAPI Port)"
docker run -d \
  --name backend \
  --restart always \
  -p 8080:8000 \
  -e DATABASE_URL="postgresql://${db_user}:${db_pass}@${db_endpoint}/${db_name}" \
  pizza-backend

echo "✅ Pizza Factory Backend Ready!"
