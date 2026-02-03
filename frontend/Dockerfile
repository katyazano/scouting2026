# --- Etapa 1: Build (Node) ---
FROM node:18-alpine AS build-stage

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el código y construimos para producción
COPY . .
# IMPORTANTE: Aquí definimos la URL del backend para el momento del build
# Como el navegador del usuario es quien hace las peticiones, usamos localhost
ENV VITE_API_URL=http://localhost:8000
RUN npm run build

# --- Etapa 2: Producción (Nginx) ---
FROM nginx:alpine AS production-stage

# Copiamos los archivos construidos de la etapa anterior
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]