#!/bin/bash
set -e  # Exit on error

echo "🚀 Bootstrapping Pizza Factory Frontend..."

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
cd pizza-factory/frontend

# Inyectando URL del ALB interno al entorno de Vite antes del build
# Asegurando que el frontend dirija llamadas API al Internal ALB en el puerto 8080
echo "VITE_API_URL=http://${backend_url}:8080/api" > .env
echo "VITE_API_URL=http://${backend_url}:8080/api" > .env.production

echo "Compiling Frontend Docker Image..."
docker build -t pizza-frontend .

echo "Starting Frontend Container on Port 80 (ALB Public target) -> 5173 (Vite/Nginx Port)"
# Asumiendo que el Dockerfile del frontend de Vite expone el 5173 o NGINX en 80.
# Mappeamos el puerto 80 de la instancia (donde escucha el public TG) al 5173 que usa vite por defecto.
# Si frontend usa Nginx en puerto 80, cambiamos a -p 80:80.
docker run -d \
  --name frontend \
  --restart always \
  -p 80:5173 \
  -p 8080:80 \
  pizza-frontend

echo "✅ Pizza Factory Frontend Ready!"
