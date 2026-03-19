# Etapa 1: build de React con Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: servir estático con Nginx
FROM nginx:alpine

# Copiamos el build de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Config de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
