🤖 Stratos Scout - FRC Analysis Platform
Stratos Scout es una plataforma integral para el análisis de datos de FRC (FIRST Robotics Competition). Permite visualizar métricas de rendimiento, fiabilidad y tendencias de los equipos mediante una arquitectura moderna de microservicios.

🏗️ Arquitectura del Proyecto
El proyecto está dividido en dos servicios principales orquestados por Docker:

Frontend (Puerto 3000): React + Vite + TailwindCSS (Servido por Nginx en producción).

Backend (Puerto 8000): Python Flask + Pandas (API REST).

Plaintext
/ (Raíz)
├── backend/            # API en Python (Flask)
│   ├── data/           # 📂 ¡IMPORTANTE! Aquí van tus archivos .csv
│   ├── app.py          # Punto de entrada del servidor
│   └── Dockerfile      # Configuración de imagen Backend
├── frontend/           # Interfaz de Usuario (React)
│   ├── src/            # Código fuente TSX
│   ├── nginx.conf      # Configuración del servidor web
│   └── Dockerfile      # Configuración de imagen Frontend
└── docker-compose.yml  # Orquestador de contenedores
🚀 Opción 1: Ejecución Rápida con Docker (Recomendado)
Esta es la forma más sencilla de probar la aplicación en cualquier computadora. No necesitas instalar Python ni Node.js, solo Docker.

Requisitos
Docker Desktop instalado y corriendo.

Pasos
Coloca tus datos: Asegúrate de que exista al menos un archivo .csv con datos de scouting en la carpeta backend/data/.

Ejecuta el comando maestro:

Bash
```
docker-compose up --build
```
Accede a la App:

🖥️ Frontend: http://localhost:3000

🔌 Backend (API): http://localhost:8000

(Para detenerlo, presiona Ctrl + C en la terminal).