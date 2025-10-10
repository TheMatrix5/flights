# Quick Start Guide

## Opción 1: Ejecutar con Docker (Recomendado)

### En Windows (PowerShell):

```powershell
.\start.ps1
```

### En Linux/Mac/WSL:

```bash
chmod +x start.sh
./start.sh
```

### Manualmente:

```bash
docker-compose up --build
```

## Opción 2: Desarrollo Local

### 1. Base de Datos (PostgreSQL)

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=flights_db \
  -p 5432:5432 \
  -v $(pwd)/database/init.sql:/docker-entrypoint-initdb.d/init.sql \
  postgres:16-alpine
```

### 2. Backend (FastAPI)

```bash
cd backend
cp .env.example .env
# Editar .env si es necesario (cambiar DB_HOST a localhost)
uv sync
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend (React)

```bash
cd frontend
bun install
bun dev
```

## Acceder a la Aplicación

Una vez iniciada, accede a:

- **Frontend**: http://localhost:3000 (o http://localhost:5173 en dev)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

## Páginas del Dashboard

1. **Overview** (`/`) - Vista general con estadísticas
2. **Flights** (`/flights`) - Lista completa de vuelos
3. **Airlines** (`/airlines`) - Estadísticas por aerolínea
4. **Routes** (`/routes`) - Análisis por rutas

## Comandos Útiles

### Docker

```bash
# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Reconstruir y reiniciar
docker-compose up --build
```

### Base de Datos

```bash
# Conectarse a PostgreSQL
docker exec -it flights-postgres psql -U postgres -d flights_db

# Ver vuelos
SELECT * FROM flights LIMIT 10;

# Ver estadísticas
SELECT airline, COUNT(*) as total FROM flights GROUP BY airline;
```

## Solución de Problemas

### Error: "Puerto ya en uso"

Si recibes un error de puerto en uso:

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Error: "No se puede conectar a la base de datos"

1. Verifica que PostgreSQL esté corriendo:
```bash
docker ps | grep postgres
```

2. Revisa las variables de entorno en `backend/.env`

3. Espera unos segundos después de iniciar Docker

### Error: "CORS" en el frontend

Verifica que el backend esté configurado para aceptar peticiones del frontend:
- En desarrollo: http://localhost:5173 o http://localhost:3000
- En producción: Ajusta el CORS en `backend/src/main.py`

## Arquitectura

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Tailwind
│   (Port 3000)   │  Recharts para gráficos
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Backend       │  FastAPI + Python
│   (Port 8000)   │  Arquitectura Onion
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│   PostgreSQL    │  Base de datos
│   (Port 5432)   │  Sin ORM (psycopg2)
└─────────────────┘
```

## Datos de Ejemplo

La base de datos se inicializa automáticamente con 40 vuelos de ejemplo incluyendo:
- 4 aerolíneas principales (American, United, Delta, Southwest)
- Múltiples rutas entre ciudades de EE.UU.
- Estados variados (on_time, delayed, cancelled)
- Fechas de enero 2024

## Siguiente Pasos

1. Explora los dashboards en http://localhost:3000
2. Prueba la API interactiva en http://localhost:8000/docs
3. Revisa el código para entender la arquitectura
4. Agrega tus propios datos o modifica los existentes

## Soporte

Para más información, revisa el README.md principal del proyecto.
