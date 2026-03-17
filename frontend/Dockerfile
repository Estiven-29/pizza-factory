# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copiamos la configuracion de nginx (opcional, pero buena practica para SPA) si la hubiera, 
# sino el default de nginx servirá para el root.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
