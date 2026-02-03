# Usamos una imagen ligera de Python 3.9
FROM python:3.9-slim

# Evitamos archivos temporales de python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos requirements e instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el código del backend
COPY . .

# Exponemos el puerto
EXPOSE 8000

# Comando para iniciar. Asegúrate de que app.py use host='0.0.0.0'
CMD ["python", "app.py"]