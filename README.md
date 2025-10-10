# Flights Dashboard Application

Una aplicación web completa para visualizar estadísticas de vuelos con dashboards interactivos.

## Arquitectura

### Backend (Python + FastAPI)
- **Arquitectura Onion (por capas)**:
  - **Capa de Dominio**: Entidades de negocio y interfaces de repositorios
  - **Capa de Aplicación**: Casos de uso y servicios
  - **Capa de Infraestructura**: Implementación de repositorios con PostgreSQL (sin ORM)
  - **Capa API**: Controllers y endpoints de FastAPI

### Frontend (React + TypeScript)
- **Bun**: Runtime y gestor de paquetes
- **React 18** con TypeScript
- **React Router**: Navegación entre páginas
- **Recharts**: Librería de gráficos interactivos
- **Tailwind CSS**: Framework de estilos utility-first
- **shadcn/ui**: Sistema de componentes UI (Card, Table, Badge, Button)

### Base de Datos
- **PostgreSQL 16**: Base de datos relacional
- Sin ORM, usando psycopg2 directamente
- Conexión mediante pool de conexiones

### Docker
- Toda la aplicación está contenerizada
- Docker Compose orquesta los servicios

## Estructura del Proyecto

```
flights/
├── backend/
│   ├── src/
│   │   ├── domain/          # Capa de Dominio
│   │   │   ├── entities.py
│   │   │   └── repositories.py
│   │   ├── application/     # Capa de Aplicación
│   │   │   └── services.py
│   │   ├── infrastructure/  # Capa de Infraestructura
│   │   │   ├── database.py
│   │   │   └── repositories.py
│   │   ├── api/            # Capa API
│   │   │   ├── routes.py
│   │   │   └── schemas.py
│   │   └── main.py         # Punto de entrada
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── pages/         # Páginas del dashboard
│   │   ├── services/      # Cliente API
│   │   ├── types/         # Tipos TypeScript
│   │   └── lib/           # Utilidades
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── database/
│   └── init.sql           # Script de inicialización
└── docker-compose.yml
```

## Características

### Dashboards Implementados

1. **Overview Dashboard** (`/`)
   - Estadísticas generales de vuelos
   - Total de vuelos, pasajeros, precio promedio
   - Tasa de puntualidad
   - Gráficos de distribución de estados

2. **Airlines Dashboard** (`/airlines`)
   - Estadísticas por aerolínea
   - Número de vuelos por aerolínea
   - Pasajeros transportados
   - Precios promedio
   - Rendimiento de puntualidad

3. **Routes Dashboard** (`/routes`)
   - Rutas más populares
   - Estadísticas por ruta (origen-destino)
   - Análisis de precios por ruta
   - Volumen de pasajeros

4. **Flights List** (`/flights`)
   - Lista completa de vuelos
   - Detalles de cada vuelo
   - Estados en tiempo real

## Requisitos

- Docker y Docker Compose
- Bun (para desarrollo local del frontend)
- Python 3.12+ con uv (para desarrollo local del backend)

## Instalación y Ejecución

### Configuración Actual del Proyecto

Este proyecto usa:
- **PostgreSQL**: En Docker (puerto 5433)
- **Backend**: Se ejecuta localmente con `uv` (no Docker)
- **Frontend**: Se ejecuta localmente con `bun` (no Docker)

---

### Cómo levantar el Backend

#### 1. Asegúrate que PostgreSQL esté corriendo

```bash
# Ver si PostgreSQL está corriendo
docker ps | grep postgres

# Si no está corriendo, levántalo:
docker run -d \
  --name flights-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=flights_db \
  -p 5433:5432 \
  -v $(pwd)/database/init.sql:/docker-entrypoint-initdb.d/init.sql \
  postgres:16-alpine
```

#### 2. Configurar variables de entorno (ya debería existir)

Verifica que `backend/.env` tenga:
```bash
DB_HOST=localhost
DB_PORT=5433
DB_NAME=flights_db
DB_USER=postgres
DB_PASSWORD=postgres
```

#### 3. Instalar dependencias (solo la primera vez)

```bash
cd backend
uv sync
```

#### 4. Ejecutar el backend

```bash
# Desde el directorio backend/
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en:
- **API**: http://localhost:8000
- **Documentación interactiva**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/health

---

### Cómo levantar el Frontend

```bash
cd frontend
bun install  # Solo la primera vez
bun dev
```

El frontend estará disponible en http://localhost:5173

---

### Verificar que todo funciona

```bash
# Health check del backend
curl http://localhost:8000/health

# Ver API root
curl http://localhost:8000/

# Probar endpoint de vuelos
curl http://localhost:8000/api/flights
```

---

### Alternativa: Con Docker Compose (Opcional)

Si prefieres usar Docker para todo:

```bash
docker-compose up --build
```

Esto levantará:
- PostgreSQL en puerto 5433
- Backend en puerto 8000
- Frontend en puerto 3000

## API Endpoints

### Flights
- `GET /api/flights` - Obtener todos los vuelos
- `GET /api/flights/{id}` - Obtener vuelo por ID
- `GET /api/flights/airline/{airline}` - Vuelos por aerolínea
- `GET /api/flights/route/{origin}/{destination}` - Vuelos por ruta

### Statistics
- `GET /api/stats/general` - Estadísticas generales
- `GET /api/stats/airlines` - Estadísticas por aerolínea
- `GET /api/stats/routes` - Estadísticas por ruta
- `GET /api/stats/date-range` - Estadísticas por rango de fechas

## Base de Datos

La base de datos incluye 40 vuelos de ejemplo con las siguientes aerolíneas:
- American Airlines
- United Airlines
- Delta Airlines
- Southwest Airlines

### Schema

```sql
flights (
  id SERIAL PRIMARY KEY,
  flight_number VARCHAR(20),
  origin VARCHAR(3),
  destination VARCHAR(3),
  departure_time TIMESTAMP,
  arrival_time TIMESTAMP,
  airline VARCHAR(100),
  status VARCHAR(20),
  price DECIMAL(10, 2),
  passengers INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Tecnologías Utilizadas

### Backend
- FastAPI
- Python 3.12
- uv (package manager)
- psycopg2 (PostgreSQL driver)
- pydantic (validación)
- python-dotenv

### Frontend
- React 18
- TypeScript
- Bun (runtime y package manager)
- Vite (build tool)
- React Router (navegación)
- Recharts (gráficos)
- Tailwind CSS (estilos)
- shadcn/ui (componentes UI)
- class-variance-authority (variantes de estilos)
- Lucide React (iconos)

### Infrastructure
- Docker
- Docker Compose
- PostgreSQL 16
- Nginx

## Variables de Entorno

### Backend (.env)
```
DB_HOST=postgres
DB_PORT=5432
DB_NAME=flights_db
DB_USER=postgres
DB_PASSWORD=postgres
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## Arquitectura Onion Explicada

La aplicación backend sigue el patrón de Arquitectura Onion:

1. **Dominio** (núcleo): Define las entidades de negocio y contratos (interfaces)
2. **Aplicación**: Implementa casos de uso usando los contratos del dominio
3. **Infraestructura**: Implementa los contratos con tecnologías específicas (PostgreSQL)
4. **API**: Expone la funcionalidad a través de HTTP endpoints

Las dependencias fluyen hacia adentro: API → Aplicación → Dominio ← Infraestructura

## Contribuir

Este es un proyecto de demostración. Siéntete libre de hacer fork y adaptarlo a tus necesidades.

## Licencia

MIT
