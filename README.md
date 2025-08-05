# PROYECTO-BARBIERI-CIBERSEGURA

## API Endpoints

- `POST /api/responses` guarda las respuestas de los jugadores recibiendo `player_id`, `question_id` e `is_correct`.
- `GET /api/report/top-players` devuelve el ranking de jugadores por respuestas correctas.
- `GET /api/report/questions` entrega estadísticas de respuestas por pregunta.

## Ejecución

1. Frontend

   ```bash
   cd frontend
   npm install
   # Servidor de desarrollo
   npm run serve
   # ó construir para producción
   npm run build
   ```

2. Backend

   ```bash
   cd ../backend
   npm install
   npm start
   ```

   Al iniciar por primera vez se crea una base SQLite con el usuario
   administrador `admin` y contraseña `admin`.

## Posibles mejoras futuras

- Añadir pruebas automatizadas y verificación estática de código.
- Manejar variables de entorno para credenciales y puertos.
- Dockerizar el proyecto para facilitar despliegues.
- Ampliar documentación y validaciones en los endpoints.

